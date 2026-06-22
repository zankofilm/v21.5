
const APP_VERSION = 'V21.0.0';
const { app, BrowserWindow, ipcMain, shell, session } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

let win;

function ensureDir(p){ if(!fs.existsSync(p)) fs.mkdirSync(p,{recursive:true}); }
function dataDir(){ const d=path.join(app.getPath('userData'),'data'); ensureDir(d); return d; }
function stateFile(key){ return path.join(dataDir(), String(key||'admin').replace(/[^a-zA-Z0-9_-]/g,'_') + '_state.json'); }
function readJson(file){ try{ return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file,'utf8')) : null; }catch(e){ return null; } }
function writeJson(file,obj){ ensureDir(path.dirname(file)); fs.writeFileSync(file, JSON.stringify(obj||{}, null, 2), 'utf8'); }

const CLIENT_ACTIVATION_SECRET = 'JAVANROOD_NGO_CLIENT_ACTIVATION_SECRET_V1';
function canonicalJson(obj){
  if(obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if(Array.isArray(obj)) return '[' + obj.map(canonicalJson).join(',') + ']';
  const keys = Object.keys(obj).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalJson(obj[k])).join(',') + '}';
}
function base64UrlFromBuffer(buf){
  return Buffer.from(buf).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function sha256Hex(text){
  return crypto.createHash('sha256').update(String(text || ''), 'utf8').digest('hex');
}
function signActivationPayload(payload){
  return base64UrlFromBuffer(crypto.createHmac('sha256', CLIENT_ACTIVATION_SECRET).update(canonicalJson(payload), 'utf8').digest());
}


function createWindow(){
  win = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 1100,
    minHeight: 700,
    title: 'پنل ادمین سامانه سمن‌های شهرستان جوانرود',
    autoHideMenuBar: true,
    backgroundColor: '#f6faff',
    icon: path.join(__dirname, 'build', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  win.loadFile(path.join(__dirname, 'admin_ui', 'index.html'));
  win.webContents.setWindowOpenHandler(({url}) => { shell.openExternal(url); return {action:'deny'}; });
}


  ipcMain.handle('native:getVersion', async () => { return { ok:true, version: APP_VERSION }; });

  ipcMain.handle('native:importPackage', async (_e, fileContent) => {
    try {
      // Accept raw JSON or string package
      let data = fileContent;
      if (typeof fileContent === 'string') {
        try { data = JSON.parse(fileContent); } catch(e) { data = { raw: fileContent }; }
      }

      // minimal duplicate/diff stub (to be expanded in next versions)
      return {
        ok:true,
        status:'received',
        hash: require('crypto').createHash('sha256').update(JSON.stringify(data)).digest('hex'),
        data
      };
    } catch (e) {
      return { ok:false, error: e.message };
    }
  });

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
    callback(['media','camera','microphone','display-capture'].includes(permission));
  });

  ipcMain.handle('native:loadState', async (_e,key) => {
    const f = stateFile(key || 'admin');
    return { ok:true, exists:fs.existsSync(f), state:readJson(f), path:f };
  });
  ipcMain.handle('native:saveState', async (_e,key,state) => {
    const f = stateFile(key || 'admin');
    writeJson(f,state||{});
    return { ok:true, path:f, updatedAt:new Date().toISOString() };
  });
  ipcMain.handle('native:backupState', async (_e,key,state) => {
    const dir = path.join(dataDir(),'backups'); ensureDir(dir);
    const f = path.join(dir, `${key||'admin'}_${new Date().toISOString().replace(/[:.]/g,'-')}.json`);
    writeJson(f,state||{});
    return { ok:true, path:f };
  });
  ipcMain.handle('native:openDataDir', async () => { shell.openPath(dataDir()); return {ok:true,path:dataDir()}; });
  ipcMain.handle('native:sha256Hex', async (_e, text) => sha256Hex(text));
  ipcMain.handle('native:signActivation', async (_e, payload) => signActivationPayload(payload || {}));
  ipcMain.handle('native:hashActivationPassword', async (_e, password, salt) => sha256Hex(String(salt || '') + '::' + String(password || '')));


  createWindow();
});

app.on('window-all-closed', () => { if(process.platform !== 'darwin') app.quit(); });


// ===== V21.0.0 IMPORT DATABASE =====
const dbPath = require('path').join(app.getPath('userData'), 'import_db.json');

function loadDB(){
  if(!fs.existsSync(dbPath)) return {};
  try{return JSON.parse(fs.readFileSync(dbPath,'utf-8'));}catch(e){return {};}
}

function saveDB(db){
  fs.writeFileSync(dbPath, JSON.stringify(db,null,2));
}

ipcMain.handle('native:checkDuplicatePackage', async (e, hash)=>{
  const db = loadDB();
  return { exists: !!db[hash], data: db[hash] || null };
});

ipcMain.handle('native:importPackageV2', async (e, filePath)=>{
  const raw = fs.readFileSync(filePath);
  const hash = require('crypto').createHash('sha256').update(raw).digest('hex');

  const db = loadDB();

  let status = 'new';
  if(db[hash]) status = 'duplicate';

  let parsed = null;
  try{ parsed = JSON.parse(raw.toString('utf-8')); }catch(e){}

  if(db[hash] && JSON.stringify(db[hash].data) !== JSON.stringify(parsed)){
    status = 'modified';
  }

  if(status === 'new'){
    db[hash] = { hash, data: parsed, createdAt: Date.now() };
    saveDB(db);
  }

  return { ok:true, status, hash };
});



// ===== V21.0.0 DATABASE RESET (PASSWORD PROTECTED) =====
const RESET_PASSWORD = '1234'; // TODO: move to secure config

ipcMain.handle('native:resetDatabase', async (e, password)=>{
  const path = require('path');
  const dbFile = path.join(app.getPath('userData'), 'import_db.json');

  if(password !== RESET_PASSWORD){
    return { ok:false, error:'wrong_password' };
  }

  try{
    if(fs.existsSync(dbFile)){
      fs.unlinkSync(dbFile);
    }
    return { ok:true, message:'database cleared (logged)' };
  }catch(err){
    return { ok:false, error: err.message };
  }
});


// ===== V21.0.0 AUDIT LOG SYSTEM =====
const auditPath = require('path').join(app.getPath('userData'),'audit_log.json');

function loadAudit(){
  if(!fs.existsSync(auditPath)) return [];
  try{return JSON.parse(fs.readFileSync(auditPath,'utf-8'));}catch(e){return [];}
}

function saveAudit(logs){
  fs.writeFileSync(auditPath, JSON.stringify(logs,null,2));
}

function addAudit(type, data){
  const logs = loadAudit();
  logs.push({
    type,
    data,
    time: Date.now()
  });
  saveAudit(logs);
}

ipcMain.handle('native:getAuditLogs', async ()=>{
  return loadAudit();
});

// ===== V21.0.0 AUDIT CENTER =====
const path = require('path');

const auditFile = path.join(app.getPath('userData'),'audit_log.json');

function readAudit(){
  if(!fs.existsSync(auditFile)) return [];
  try{return JSON.parse(fs.readFileSync(auditFile,'utf-8'));}catch(e){return [];}
}

// Dashboard stats
ipcMain.handle('audit:getDashboard', async ()=>{
  const logs = readAudit();
  return {
    total: logs.length,
    imports: logs.filter(l=>l.type==='import').length,
    deletes: logs.filter(l=>l.type==='reset').length,
    duplicates: logs.filter(l=>l.type==='duplicate').length
  };
});

// Filtered logs
ipcMain.handle('audit:getLogs', async (e, filter)=>{
  const logs = readAudit();
  if(!filter || !filter.type) return logs;
  return logs.filter(l=>l.type===filter.type);
});

// Export JSON (PDF/Excel stub)
ipcMain.handle('audit:export', async ()=>{
  const logs = readAudit();
  const out = path.join(app.getPath('userData'),'audit_export.json');
  fs.writeFileSync(out, JSON.stringify(logs,null,2));
  return { ok:true, path: out };
});

// ===== V21.0.0 PROFESSIONAL AUDIT SYSTEM =====
const path = require('path');
const crypto = require('crypto');

const auditFile = path.join(app.getPath('userData'),'audit_ledger.json');

// load ledger
function loadLedger(){
  if(!fs.existsSync(auditFile)) return [];
  try{return JSON.parse(fs.readFileSync(auditFile,'utf-8'));}catch(e){return [];}
}

// hash chain (tamper proof)
function createHash(entry, prevHash){
  return crypto.createHash('sha256')
    .update(JSON.stringify(entry) + (prevHash || ''))
    .digest('hex');
}

// append immutable event
function appendEvent(type, data){
  const ledger = loadLedger();
  const prev = ledger[ledger.length-1];

  const entry = {
    id: crypto.randomUUID(),
    type,
    data,
    time: Date.now(),
    prevHash: prev ? prev.hash : null
  };

  entry.hash = createHash(entry, entry.prevHash);

  ledger.push(entry);
  fs.writeFileSync(auditFile, JSON.stringify(ledger,null,2));
}

// verify integrity
function verifyLedger(){
  const ledger = loadLedger();
  for(let i=1;i<ledger.length;i++){
    const expected = createHash(ledger[i], ledger[i-1].hash);
    if(ledger[i].hash !== expected){
      return { ok:false, brokenAt:i };
    }
  }
  return { ok:true };
}

ipcMain.handle('audit:append', async (e,type,data)=>{
  appendEvent(type,data);
  return { ok:true };
});

ipcMain.handle('audit:verify', async ()=>{
  return verifyLedger();
});

ipcMain.handle('audit:timeline', async ()=>{
  return loadLedger();
});


// ===== V21.0.0 ANALYTICS ENGINE =====
const path = require('path');

function getLedger(){
  const file = path.join(app.getPath('userData'),'audit_ledger.json');
  if(!fs.existsSync(file)) return [];
  try{return JSON.parse(fs.readFileSync(file,'utf-8'));}catch(e){return [];}
}

// basic analytics
ipcMain.handle('audit:analytics', async ()=>{
  const logs = getLedger();

  const stats = {
    total: logs.length,
    imports: logs.filter(l=>l.type==='import').length,
    resets: logs.filter(l=>l.type==='reset').length,
    duplicates: logs.filter(l=>l.type==='duplicate').length
  };

  // monthly grouping
  const monthly = {};
  logs.forEach(l=>{
    const d = new Date(l.time);
    const key = d.getFullYear()+"-"+(d.getMonth()+1);
    monthly[key] = (monthly[key]||0)+1;
  });

  return { stats, monthly };
});

// roles system (simple)
const rolesFile = path.join(app.getPath('userData'),'roles.json');

function getRoles(){
  if(!fs.existsSync(rolesFile)) return {};
  try{return JSON.parse(fs.readFileSync(rolesFile,'utf-8'));}catch(e){return {};}
}

ipcMain.handle('auth:getRole', async (e,user)=>{
  const roles = getRoles();
  return roles[user] || "viewer";
});

// ===== V21.0.0 JALALI SUPPORT =====
function toJalali(ts){
  try{
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian',{
      year:'numeric',
      month:'2-digit',
      day:'2-digit'
    }).format(new Date(ts));
  }catch(e){
    return new Date(ts).toISOString();
  }
}

// override analytics formatting
ipcMain.handle('audit:analytics', async ()=>{
  const path = require('path');
  const file = path.join(app.getPath('userData'),'audit_ledger.json');
  let logs = [];
  try{ logs = JSON.parse(fs.readFileSync(file,'utf-8')); }catch(e){ logs=[]; }

  const stats = {
    total: logs.length,
    imports: logs.filter(l=>l.type==='import').length,
    resets: logs.filter(l=>l.type==='reset').length,
    duplicates: logs.filter(l=>l.type==='duplicate').length
  };

  const monthly = {};
  logs.forEach(l=>{
    const key = new Intl.DateTimeFormat('fa-IR-u-ca-persian',{
      year:'numeric',
      month:'numeric'
    }).format(new Date(l.time));

    monthly[key] = (monthly[key]||0)+1;
  });

  return { stats, monthly };
});

// ===== V21.0.0 OFFLINE LETTER ENGINE =====
const path = require('path');

const letterDir = path.join(app.getPath('userData'),'letters');
if(!fs.existsSync(letterDir)) fs.mkdirSync(letterDir,{recursive:true});

// NGO name resolver (offline)
function getNGOName(){
  const dbPath = path.join(app.getPath('userData'),'ngo_data.json');
  try{
    if(fs.existsSync(dbPath)){
      const d = JSON.parse(fs.readFileSync(dbPath,'utf-8'));
      return d.name || "نامشخص";
    }
  }catch(e){}
  return "نامشخص";
}

// letter generator
ipcMain.handle('letter:generate', async (e, payload)=>{
  const ngo = getNGOName();
  const jalali = new Intl.DateTimeFormat('fa-IR-u-ca-persian',{dateStyle:'full'}).format(new Date());

  const content = `
سربرگ رسمی

مدیر محترم سمن ${ngo}

موضوع: ${payload.title}

با احترام،
در بررسی حسابرسی سیستم، مغایرت‌های زیر مشاهده گردید:

${(payload.issues||[]).map(i=>" - "+i).join("\n")}

تاریخ: ${jalali}

امضاء فرماندار
`;

  const file = path.join(letterDir, Date.now()+'.txt');
  fs.writeFileSync(file, content,'utf-8');

  return { ok:true, path:file };
});

// trigger letter from audit mismatch
ipcMain.handle('audit:triggerLetter', async (e, issues)=>{
  return await ipcMain.invoke('letter:generate',{
    title:"ابلاغیه رفع مغایرت",
    issues
  });
});