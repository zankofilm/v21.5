
const APP_VERSION = 'V21.5.1';

const { app, BrowserWindow, ipcMain, shell, session } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

function ensureDir(p){ if(!fs.existsSync(p)) fs.mkdirSync(p,{recursive:true}); }

function dataDir(){
  const d = path.join(app.getPath('userData'),'data');
  ensureDir(d);
  return d;
}

function createWindow(){
  const win = new BrowserWindow({
    width: 1320,
    height: 860,
    webPreferences: {
      preload: path.join(__dirname,'preload.js'),
      contextIsolation:true
    }
  });

  win.loadFile(path.join(__dirname,'admin_ui','index.html'));
}

/* VERSION */
ipcMain.handle('native:getVersion', ()=>({ok:true,version:APP_VERSION}));

/* STATE */
function stateFile(k){
  return path.join(dataDir(), `${k||'admin'}_state.json`);
}

function readJson(f){
  try{return fs.existsSync(f)?JSON.parse(fs.readFileSync(f,'utf8')):null;}catch(e){return null;}
}

function writeJson(f,d){
  ensureDir(path.dirname(f));
  fs.writeFileSync(f,JSON.stringify(d||{},null,2));
}

ipcMain.handle('native:loadState',(_e,k)=>({ok:true,state:readJson(stateFile(k))}));
ipcMain.handle('native:saveState',(_e,k,s)=>{writeJson(stateFile(k),s);return {ok:true};});

/* AUDIT */
const auditFile = path.join(app.getPath('userData'),'audit_ledger.json');

function loadLedger(){
  if(!fs.existsSync(auditFile)) return [];
  try{return JSON.parse(fs.readFileSync(auditFile,'utf8'));}catch(e){return [];}
}

function saveLedger(l){fs.writeFileSync(auditFile,JSON.stringify(l,null,2));}

function hash(entry,prev){
  return crypto.createHash('sha256').update(JSON.stringify(entry)+(prev||'')).digest('hex');
}

function appendEvent(type,data){
  const ledger = loadLedger();
  const prev = ledger[ledger.length-1];

  const entry = {
    id: crypto.randomUUID(),
    type,
    data,
    time: Date.now(),
    prevHash: prev?prev.hash:null
  };

  entry.hash = hash(entry,entry.prevHash);
  ledger.push(entry);
  saveLedger(ledger);
}

ipcMain.handle('audit:append',(_e,t,d)=>{appendEvent(t,d);return {ok:true};});
ipcMain.handle('audit:timeline',()=>loadLedger());

/* ANALYTICS */
ipcMain.handle('audit:analytics',()=>{
  const logs = loadLedger();
  const stats = {
    total: logs.length,
    imports: logs.filter(l=>l.type==='import').length,
    resets: logs.filter(l=>l.type==='reset').length,
    duplicates: logs.filter(l=>l.type==='duplicate').length
  };

  const monthly = {};
  logs.forEach(l=>{
    const key = new Intl.DateTimeFormat('fa-IR-u-ca-persian',{year:'numeric',month:'numeric'}).format(new Date(l.time));
    monthly[key]=(monthly[key]||0)+1;
  });

  return {stats,monthly};
});

/* LETTER */
function ngo(){
  const f=path.join(app.getPath('userData'),'ngo_data.json');
  try{
    if(fs.existsSync(f)){
      const d=JSON.parse(fs.readFileSync(f,'utf8'));
      return d.name||'نامشخص';
    }
  }catch(e){}
  return 'نامشخص';
}

ipcMain.handle('letter:generate',(_e,p)=>{
  const jalali = new Intl.DateTimeFormat('fa-IR-u-ca-persian',{dateStyle:'full'}).format(new Date());

  const content = `
سربرگ رسمی

مدیر محترم سمن ${ngo()}

موضوع: ${p.title}

مغایرت‌ها:
${(p.issues||[]).map(i=>' - '+i).join('\n')}

تاریخ: ${jalali}
`;

  const dir = path.join(app.getPath('userData'),'letters');
  ensureDir(dir);

  const file = path.join(dir,Date.now()+'.txt');
  fs.writeFileSync(file,content,'utf8');

  return {ok:true,path:file};
});

app.whenReady().then(createWindow);
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
