
(async function(){
  try{
    const v = await window.electron?.ipcRenderer?.invoke?.('native:getVersion');
    if(v?.version){
      const el = document.createElement('div');
      el.style.cssText='position:fixed;bottom:8px;left:10px;font-size:12px;opacity:.7;z-index:9999;';
      el.innerText='Version: V21.0.0';
      document.body.appendChild(el);
    }
  }catch(e){}
})();


const KEY='jvn_admin_v84_state';let state={session:null,users:[],activations:[],orgs:[],reports:[],beneficiaries:[],imports:[],corrections:[],auditFindings:[],logs:[],settings:{adminUser:'admin',adminPass:'admin123',title:'سامانه جمع‌آوری اطلاعات سمن‌های مردم‌نهاد شهرستان جوانرود',signers:[{id:'social',title:'کارشناس امور اجتماعی فرمانداری شهرستان جوانرود',name:'',active:true},{id:'governor',title:'فرماندار شهرستان جوانرود',name:'',active:true}]}};try{state=Object.assign(state,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){}function save(){localStorage.setItem(KEY,JSON.stringify(state))}function $(id){return document.getElementById(id)}function esc(v){return String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]||m))}function num(v){return Number(String(v||0).replace(/[^\d.-]/g,''))||0}function money(v){return String(num(v)).replace(/\B(?=(\d{3})+(?!\d))/g,',')+' ریال'}function today(){return new Date().toLocaleDateString('fa-IR')}function uid(p='id'){return p+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7)}function log(a){state.logs.unshift({action:a,at:new Date().toLocaleString('fa-IR'),user:state.session?.user||'admin'});state.logs=state.logs.slice(0,300);save()}function digits(v){return String(v||'').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\D/g,'')}function hashString(s){let h=2166136261;s=String(s||'');for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16)}function hashNationalId(v){return hashString(digits(v)+'|JAVANROOD_NGO_ACTIVATION')}const CLIENT_ACTIVATION_SECRET='JAVANROOD_NGO_CLIENT_ACTIVATION_SECRET_V1';function canonicalJsonActivation(obj){if(obj===null||typeof obj!=='object')return JSON.stringify(obj);if(Array.isArray(obj))return '['+obj.map(canonicalJsonActivation).join(',')+']';const keys=Object.keys(obj).sort();return '{'+keys.map(k=>JSON.stringify(k)+':'+canonicalJsonActivation(obj[k])).join(',')+'}'}function base64UrlActivation(bytes){let bin='';bytes.forEach(b=>bin+=String.fromCharCode(b));return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}async function sha256HexActivation(text){if(window.JavanroodNativeStore&&window.JavanroodNativeStore.sha256Hex)return await window.JavanroodNativeStore.sha256Hex(String(text||''));const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(text||'')));return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('')}async function passwordHashActivation(password,salt){if(window.JavanroodNativeStore&&window.JavanroodNativeStore.hashActivationPassword)return await window.JavanroodNativeStore.hashActivationPassword(password,salt);return await sha256HexActivation(String(salt||'')+'::'+String(password||''))}async function signActivationPayload(payload){if(window.JavanroodNativeStore&&window.JavanroodNativeStore.signActivation)return await window.JavanroodNativeStore.signActivation(payload);const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(CLIENT_ACTIVATION_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);const sig=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(canonicalJsonActivation(payload)));return base64UrlActivation(new Uint8Array(sig))}function activationSalt(u){return 'salt_'+digits(u.managerNationalId||'')+'_'+String(u.id||'').slice(-8)+'_'+String(u.activationRev||1)}function badge(v){let c=['فعال','تأیید شده','معتبر','کامل','بسته'].includes(v)?'b-ok':['در انتظار بررسی','نزدیک انقضا','نیازمند اصلاح'].includes(v)?'b-warn':['منقضی','دارای مغایرت','ناقص','باز'].includes(v)?'b-bad':'b-blue';return `<span class="badge ${c}">${esc(v||'ثبت نشده')}</span>`}function defaults(){if(!state.settings.signers?.length)state.settings.signers=[{id:'social',title:'کارشناس امور اجتماعی فرمانداری شهرستان جوانرود',name:'',active:true},{id:'governor',title:'فرماندار شهرستان جوانرود',name:'',active:true}];if(state.orgs.length)return;let o1={id:uid('org'),name:'سمن مهر جوانرود',nationalId:'۱۴۰۰۹۸۷۶۵۴۳',regNo:'۱۲۳۴۵',activity:'اجتماعی و حمایتی',status:'فعال',ceoFirst:'علی',ceoLast:'احمدی',ceo:'علی احمدی',ceoNationalId:'۰۰۱۲۳۴۵۶۷۸',phone:'۰۹۱۸۰۰۰۰۰۰۰',address:'جوانرود، خیابان نمونه، پلاک ۱۲',estYear:'۱۳۹۸',licenseStatus:'معتبر',licenseNo:'JVN-LIC-1001',licenseStart:'۱۴۰۲/۰۱/۰۱',licenseEnd:'۱۴۰۴/۰۱/۰۱',licenseFile:'پیوست مجوز',bank:'بانک ملی',accountNo:'۰۱۰۱۲۳۴۵۶۷۰۰۱',sheba:'IR120170000000123456789001',board:[{name:'علی احمدی',nationalId:'۰۰۱۲۳۴۵۶۷۸',role:'مدیرعامل'},{name:'مریم محمدی',nationalId:'۰۰۸۸۸۸۸۸۸۸',role:'رئیس هیأت مدیره'}],docs:['مجوز فعالیت','اساسنامه','مدارک مدیرعامل']};let o2={id:uid('org'),name:'جمعیت نیکوکاری جوانرود',nationalId:'۱۴۰۰۱۲۳۴۵۶۷',regNo:'۸۸۷۷',activity:'خیریه و مددکاری',status:'در انتظار بررسی',ceoFirst:'زهرا',ceoLast:'محمدی',ceo:'زهرا محمدی',ceoNationalId:'۰۰۹۸۷۶۵۴۳۲',phone:'۰۹۱۸۱۱۱۱۱۱۱',address:'جوانرود، میدان مرکزی',estYear:'۱۴۰۰',licenseStatus:'نزدیک انقضا',licenseNo:'JVN-LIC-1002',licenseStart:'۱۴۰۱/۰۶/۰۱',licenseEnd:'۱۴۰۳/۰۶/۰۱',licenseFile:'نیازمند تمدید',bank:'بانک ملت',accountNo:'۱۲۳۴۵۶۷۸۹',sheba:'IR220120000000987654321002',board:[{name:'زهرا محمدی',nationalId:'۰۰۹۸۷۶۵۴۳۲',role:'مدیرعامل'}],docs:['آگهی ثبت']};state.orgs=[o1,o2];state.reports=[{id:uid('rep'),orgId:o1.id,orgName:o1.name,year:'۱۴۰۳',month:'فروردین',income:350000000,expense:265000000,beneficiaryPay:220000000,currentCost:45000000,status:'تأیید شده',note:'کامل'},{id:uid('rep'),orgId:o2.id,orgName:o2.name,year:'۱۴۰۳',month:'اردیبهشت',income:180000000,expense:210000000,beneficiaryPay:175000000,currentCost:35000000,status:'دارای مغایرت',note:'هزینه بیشتر از ورودی'}];state.beneficiaries=[{id:uid('ben'),orgId:o1.id,orgName:o1.name,name:'رضا کریمی',nationalId:'۰۰۳۳۳۳۳۳۳۳',amount:25000000,status:'فعال'},{id:uid('ben'),orgId:o2.id,orgName:o2.name,name:'سارا رضایی',nationalId:'۰۰۴۴۴۴۴۴۴۴',amount:18000000,status:'فعال'}];auditRun(false);save()}function loginPage(){document.body.innerHTML='<div id="root"></div>';$('root').innerHTML=`<main class="login"><section class="loginbox"><div class="hero"><h1>پنل ادمین ویندوز</h1><p>نسخه کامل اداری با کلاینت کامل، ورود فایل خروجی سمن‌ها، گزارش‌گیری کامل، مجوزها، حسابرسی و تعاریف امضا.</p><div class="hgrid"><div class="hitem"><b>گزارش‌گیری کامل</b><span>سمن، مجوز، مالی، مددجو</span></div><div class="hitem"><b>ورود فایل سمن‌ها</b><span>خروجی کلاینت به ادمین</span></div><div class="hitem"><b>حسابرسی</b><span>مغایرت، کسری، هشدار</span></div><div class="hitem"><b>امضاهای رسمی</b><span>مدیرعامل، کارشناس، فرماندار</span></div></div></div><div class="form"><div class="lock">🔐</div><h2>ورود ادمین</h2><div class="sub">فقط نام کاربری و رمز عبور وارد شود</div><div class="field"><label>نام کاربری</label><input id="user" dir="ltr" value="${esc(state.settings.adminUser||'admin')}"></div><div class="field"><label>رمز عبور</label><input id="pass" dir="ltr" type="password" value="" placeholder="رمز عبور" onkeydown="if(event.key==='Enter')login()"></div><button class="primary" style="width:100%" onclick="login()">ورود به پنل ادمین</button></div></section></main>`}function login(){let u=$('user').value.trim(),p=$('pass').value;if(u===(state.settings.adminUser||'admin')&&p===(state.settings.adminPass||'admin123')){defaults();state.session={user:u,at:new Date().toLocaleString('fa-IR')};log('ورود موفق ادمین');render('dashboard')}else alert('نام کاربری یا رمز عبور اشتباه است.')}function logout(){state.session=null;save();loginPage()}const tabs=[['dashboard','داشبورد','مرکز مدیریتی','🏠'],['users','کاربران و فعال‌سازی','ریست و مشاهده فایل','👥'],['import','ورود فایل سمن‌ها','کنترل مغایرت','📥'],['workflow','گردش کار گزارش‌ها','تأیید و اصلاح','🔁'],['orgs','اطلاعات کامل سمن‌ها','پرونده و مجوز','🏛'],['reports','گزارش‌گیری کامل','همه خروجی‌ها','📑'],['annual','پایان سال سمن','حسابرسی ماهانه','📅'],['audit','حسابرسی','مغایرت و کنترل','🧾'],['word','خروجی Word','گزارش رسمی','📘'],['beneficiaries','مددجوها','افراد تحت پوشش','👨‍👩‍👧'],['documents','بایگانی مدارک','پیوست‌ها','🗂'],['corrections','درخواست اصلاح','گردش کار','✍️'],['alerts','هشدارها','اعلان‌های مدیریتی','🔔'],['access','سطح دسترسی','نقش‌های واقعی','🛡️'],['database','دیتابیس پایدار','SQLite و مهاجرت','🗄️'],['updates','آپدیت نسخه','به‌روزرسانی امن','⬆️'],['history','تاریخچه تغییرات','ردیابی تغییرات','🕘'],['errors','گزارش خطا','عیب‌یابی','⚠️'],['finalpdf','بازبینی PDF','کنترل نهایی','✅'],['settings','تعاریف و امضا','سربرگ و امضاها','⚙'],['backup','بکاپ حرفه‌ای','ذخیره امن','☁'],['roles','نقش‌ها و دسترسی','سطح دسترسی','🔐'],['templates','قالب‌های Word','گزارش رسمی','📚'],['migration','مهاجرت نسخه‌ها','سلامت داده','🧬'],['help','راهنما','آموزش داخل برنامه','❔'],['errors','مرکز خطا','گزارش فنی','⚠️'],['about','درباره نرم‌افزار','نسخه و اطلاعات','ℹ️'],['migration','مهاجرت داده','سلامت نسخه','🧬'],['final','چک‌لیست تحویل','کنترل نهایی','✅'],['logs','لاگ فعالیت‌ها','ردیابی','📋']];function nav(a){return '<div class="nav">'+tabs.map(t=>`<button class="${a===t[0]?'active':''}" onclick="render('${t[0]}')"><span><b>${t[1]}</b><small>${t[2]}</small></span><span>${t[3]}</span></button>`).join('')+'</div>'}function shell(a,c){let t=tabs.find(x=>x[0]===a)||tabs[0];$('root').innerHTML=`<main class="app"><section class="main"><div class="top"><div class="user"><div class="av">👤</div><div><b>مدیر سیستم</b><br><span>● مدیر ارشد</span></div></div><div class="title"><h1>${esc(state.settings.title)}</h1><p>پنل مدیریت | ${t[1]}</p></div><div class="tools"><button class="ghost" onclick="logout()">خروج</button></div></div><div class="content">${c}</div></section><aside class="side"><div class="gov"><div class="govlogo">🇮🇷</div><h2>وزارت کشور<br>استانداری کرمانشاه<br>فرمانداری شهرستان جوانرود</h2><p>سامانه جامع مدیریت سمن‌ها</p></div>${nav(a)}<div class="signature">جهش تولید با مشارکت مردم</div></aside></main>`}function render(tab='dashboard'){if(!state.session){loginPage();return}defaults();let m={dashboard:dash,users:users,import:imp,orgs:orgs,reports:reports,annual:annualReportPanelV84,audit:audit,word:word,beneficiaries:bens,corrections:corr,workflow:workflow,documents:documents,roles:roles,templates:templates,migration:migration,help:helpV84,alerts:v92AlertsPanel,access:v92AccessPanel,database:v91DbPanel,updates:(window.v90UpdatePanel||dash),history:(window.v90HistoryPanel||dash),errors:(window.v90ErrorPanel||dash),finalpdf:(window.v90FinalPdfReviewPanel||dash),settings:settings,backup:backup,errors:errorsPanelV84,about:aboutV84,migration:migrationV84,final:finalChecklistV84,logs:logs};shell(tab,(m[tab]||dash)())}function auditItems(){let out=[];state.orgs.forEach(o=>{if(!o.nationalId)out.push({orgId:o.id,orgName:o.name,type:'پرونده ناقص',severity:'بالا',desc:'شناسه ملی ثبت نشده',status:'باز'});if(!o.regNo)out.push({orgId:o.id,orgName:o.name,type:'پرونده ناقص',severity:'متوسط',desc:'شماره ثبت ثبت نشده',status:'باز'});if(!o.ceo||!o.ceoNationalId)out.push({orgId:o.id,orgName:o.name,type:'مدیرعامل',severity:'بالا',desc:'مدیرعامل یا کد ملی ناقص',status:'باز'});if(!o.licenseNo||o.licenseStatus==='منقضی')out.push({orgId:o.id,orgName:o.name,type:'مجوز',severity:'بالا',desc:'مجوز منقضی یا بدون شماره',status:'باز'});if(o.licenseStatus==='نزدیک انقضا')out.push({orgId:o.id,orgName:o.name,type:'مجوز',severity:'متوسط',desc:'مجوز نزدیک انقضا',status:'باز'});if(!o.sheba||!o.bank)out.push({orgId:o.id,orgName:o.name,type:'حساب بانکی',severity:'متوسط',desc:'اطلاعات بانکی ناقص',status:'باز'});});state.reports.forEach(r=>{if(num(r.expense)>num(r.income))out.push({orgId:r.orgId,orgName:r.orgName,type:'مغایرت مالی',severity:'بالا',desc:'هزینه بیشتر از واریزی',status:'باز'});});return out}function auditRun(show=true){state.auditFindings=auditItems().map(x=>Object.assign({id:uid('aud')},x));save();if(show)render('audit')}function score(){let total=state.orgs.length*8+state.reports.length,issues=auditItems().length;return total?Math.max(0,Math.round((total-issues)/total*100)):100}function dash(){let alerts=auditItems(),income=state.reports.reduce((s,r)=>s+num(r.income),0),expense=state.reports.reduce((s,r)=>s+num(r.expense),0);return `<div class="kpis"><div class="card kpi"><span>تعداد سمن‌ها</span><b>${state.orgs.length}</b></div><div class="card kpi"><span>کاربران کلاینت</span><b>${state.users.length}</b></div><div class="card kpi"><span>فایل‌های واردشده</span><b>${state.imports.length}</b></div><div class="card kpi"><span>یافته حسابرسی</span><b>${alerts.length}</b></div><div class="card kpi"><span>سلامت پرونده‌ها</span><b>${score()}٪</b></div></div><div class="grid"><div class="card"><h3>هشدارهای حسابرسی و مجوزها</h3>${alerts.slice(0,6).map(a=>`<div class="note ${a.severity==='بالا'?'bad':'warn'}"><b>${esc(a.type)} - ${esc(a.orgName)}</b><br>${esc(a.desc)}</div>`).join('')||'<div class="note ok">مورد بحرانی وجود ندارد.</div>'}</div><div class="card"><h3>کیفیت و اعتبار داده‌ها</h3><div class="score"><span style="width:${score()}%"></span></div><div class="note ok">امتیاز سلامت: ${score()}٪</div><div class="note info">کل ورودی: ${money(income)}<br>کل خروجی: ${money(expense)}</div></div><div class="card"><h3>دسترسی سریع</h3><div class="quick"><button onclick="render('import')">📥 ورود فایل سمن‌ها</button><button onclick="render('reports')">📑 گزارش کامل</button><button onclick="render('audit')">🧾 حسابرسی</button><button onclick="render('settings')">✍️ تعاریف امضا</button></div></div></div>`}function users(){return `<div class="actions"><button class="primary" onclick="userForm()">ساخت کاربر و فایل فعال‌سازی سازگار با کلاینت V22</button></div><div id="userForm"></div><div class="card"><h3>کاربران کلاینت و مدیریت فعال‌سازی</h3><div class="tablewrap"><table class="table"><tr><th>کاربر</th><th>سمن</th><th>مدیرعامل</th><th>کد ملی</th><th>وضعیت</th><th>تاریخ ساخت</th><th>آخرین خروجی</th><th>عملیات</th></tr>${state.users.map(u=>`<tr><td><b>${esc(u.username)}</b><br>${esc(u.fullName)}</td><td>${esc(u.organizationName)}</td><td>${esc(u.managerFullName)}</td><td>${esc(u.managerNationalId)}</td><td>${badge(u.active?'فعال':'غیرفعال')}</td><td>${esc(u.createdAt)}</td><td>${esc(u.lastImportAt||'ثبت نشده')}</td><td class="actions"><button class="ghost" onclick="downloadActivation('${u.id}')">دانلود</button><button class="ghost" onclick="viewActivation('${u.id}')">مشاهده</button><button class="ghost" onclick="resetActivation('${u.id}')">ریست</button><button class="ghost" onclick="toggleUser('${u.id}')">${u.active?'غیرفعال':'فعال'}</button></td></tr>`).join('')||'<tr><td colspan="8">کاربری ساخته نشده است.</td></tr>'}</table></div></div><div id="activationView"></div>`}function userForm(){$('userForm').innerHTML=`<div class="card"><h3>ساخت فایل فعال‌سازی سازگار با کلاینت V22</h3><div class="note info">فایل خروجی این بخش از نوع JAVANROOD_CLIENT_ACTIVATION و امضادار است؛ برای کلاینت موبایل V22 استفاده شود.</div><div class="grid3"><div class="field"><label>نام سمن</label><input id="uOrg"></div><div class="field"><label>شناسه ملی</label><input id="uNational"></div><div class="field"><label>شماره ثبت</label><input id="uReg"></div><div class="field"><label>حوزه فعالیت</label><input id="uActivity"></div><div class="field"><label>آدرس</label><input id="uAddress"></div><div class="field"><label>شماره تماس</label><input id="uPhone"></div><div class="field"><label>نام مدیرعامل</label><input id="uFirst"></div><div class="field"><label>نام خانوادگی مدیرعامل</label><input id="uLast"></div><div class="field"><label>کد ملی مدیرعامل</label><input id="uNid"></div><div class="field"><label>نام کاربری</label><input id="uName" dir="ltr"></div><div class="field"><label>رمز عبور</label><input id="uPass" dir="ltr"></div><div class="field"><label>وضعیت</label><select id="uActive"><option value="true">فعال</option><option value="false">غیرفعال</option></select></div></div><button class="primary" onclick="createUser()">ساخت کاربر و فایل</button></div>`}async function createUser(){let id=uid('user'),orgId=uid('org'),first=$('uFirst').value.trim(),last=$('uLast').value.trim(),nid=digits($('uNid').value);if(!first||!last||nid.length!==10||!$('uName').value||!$('uPass').value||!$('uOrg').value){alert('فیلدهای اصلی کامل نیست.');return}let u={id,orgId,fullName:first+' '+last,organizationName:$('uOrg').value,organizationNationalId:$('uNational').value,registrationNumber:$('uReg').value,activityField:$('uActivity').value,address:$('uAddress').value,phone:$('uPhone').value,managerFirstName:first,managerLastName:last,managerFullName:first+' '+last,managerNationalId:nid,username:$('uName').value.trim(),password:$('uPass').value,active:$('uActive').value==='true',createdAt:today(),activationRev:1};state.users.push(u);state.orgs.push({id:orgId,name:u.organizationName,nationalId:u.organizationNationalId,regNo:u.registrationNumber,activity:u.activityField,status:'فعال',ceoFirst:first,ceoLast:last,ceo:u.managerFullName,ceoNationalId:nid,phone:u.phone,address:u.address,licenseStatus:'در انتظار بررسی',licenseNo:'',licenseEnd:'',bank:'',sheba:'',board:[{name:u.managerFullName,nationalId:nid,role:'مدیرعامل'}],docs:[]});save();log('ساخت کاربر کلاینت: '+u.username);await downloadActivation(id);render('users')}async function activationPayload(u){const salt=activationSalt(u);const payload={activationId:'ACT-'+u.id+'-'+(u.activationRev||1),version:'ANDROID_V22_COMPAT',createdAt:new Date().toISOString(),organizationName:u.organizationName||'',organizationNationalId:u.organizationNationalId||'',registrationNumber:u.registrationNumber||'',activityField:u.activityField||'',address:u.address||'',ceoFullName:u.managerFullName||u.fullName||'',nationalCode:digits(u.managerNationalId||''),phone:u.phone||'',username:u.username||'',passwordHash:await passwordHashActivation(u.password||'',salt),passwordSalt:salt,active:!!u.active,userId:u.id,orgId:u.orgId,activationRev:u.activationRev||1,issuedBy:'JavanroodAdmin_Native_V104'};return {type:'JAVANROOD_CLIENT_ACTIVATION',format:'SIGNED_HMAC_SHA256',compatibleClient:'ANDROID_V22',payload,signature:await signActivationPayload(payload)}}async function downloadActivation(id){let u=state.users.find(x=>x.id===id);if(!u)return;try{const pkg=await activationPayload(u);downloadJSON('activation_'+u.username+'_V22.json',pkg);log('دانلود فایل فعال‌سازی سازگار با کلاینت V22: '+u.username)}catch(e){alert('خطا در ساخت فایل فعال‌سازی: '+(e.message||e))}}async function viewActivation(id){let u=state.users.find(x=>x.id===id);if(!u)return;try{const pkg=await activationPayload(u);$('activationView').innerHTML=`<div class="card"><h3>مشاهده فایل فعال‌سازی سازگار با کلاینت V22</h3><div class="note ok">این فایل با امضای HMAC ساخته می‌شود و باید در کلاینت V22 معتبر شناخته شود.</div><pre class="ltr" style="white-space:pre-wrap;background:#0f172a;color:#e2e8f0;border-radius:18px;padding:16px;max-height:360px;overflow:auto">${esc(JSON.stringify(pkg,null,2))}</pre></div>`}catch(e){$('activationView').innerHTML=`<div class="card"><div class="note bad">خطا در نمایش فایل فعال‌سازی: ${esc(e.message||e)}</div></div>`}}function toggleUser(id){let u=state.users.find(x=>x.id===id);if(!u)return;u.active=!u.active;save();render('users')}function imp(){return `<div class="card"><h3>ورود فایل خروجی سمن‌ها</h3><div class="note info">فایل خروجی کلاینت را وارد کنید تا اطلاعات سمن، مجوز، حساب، هیأت مدیره، مددجو و گزارش مالی به‌روزرسانی شود.</div><input type="file" id="importFile" accept="application/json,.json"><div class="actions" style="margin-top:12px"><button class="primary" onclick="importFile()">بررسی و ورود فایل</button></div><div id="importResult"></div></div><div class="card"><h3>لیست فایل‌های واردشده</h3><div class="tablewrap"><table class="table"><tr><th>کد رهگیری</th><th>سمن</th><th>تاریخ خروجی</th><th>تاریخ ورود</th><th>وضعیت</th><th>جزئیات</th></tr>${state.imports.map(i=>`<tr><td class="ltr">${esc(i.trackingCode)}</td><td>${esc(i.orgName)}</td><td>${esc(i.exportedAt)}</td><td>${esc(i.importedAt)}</td><td>${badge(i.status)}</td><td>${esc(i.summary)}</td></tr>`).join('')||'<tr><td colspan="6">فایلی وارد نشده است.</td></tr>'}</table></div></div>`}function importFile(){let f=$('importFile').files[0];if(!f){alert('فایل را انتخاب کنید.');return}let r=new FileReader();r.onload=()=>{try{processExport(JSON.parse(r.result))}catch(e){$('importResult').innerHTML='<div class="note bad">فایل معتبر نیست.</div>'}};r.readAsText(f,'utf-8')}function processExport(data){if(data.type!=='JAVANROOD_NGO_CLIENT_EXPORT'){$('importResult').innerHTML='<div class="note bad">این فایل خروجی کلاینت نیست.</div>';return}let org=data.organization||{},o=state.orgs.find(x=>x.id===org.organizationKey||x.nationalId===org.organizationNationalId||x.name===org.organizationName);if(!o){o={id:org.organizationKey||uid('org'),board:[],docs:[]};state.orgs.push(o)}Object.assign(o,{name:org.organizationName||o.name,nationalId:org.organizationNationalId||o.nationalId,regNo:org.registrationNumber||o.regNo,activity:org.activityField||o.activity,address:org.address||o.address,phone:org.phone||o.phone,ceo:org.ceoName||o.ceo,ceoNationalId:org.ceoNationalId||o.ceoNationalId,licenseStatus:data.licenses?.[0]?.status||o.licenseStatus,licenseNo:data.licenses?.[0]?.licenseNo||o.licenseNo,licenseStart:data.licenses?.[0]?.start||o.licenseStart,licenseEnd:data.licenses?.[0]?.end||o.licenseEnd,bank:data.accounts?.[0]?.bank||o.bank,accountNo:data.accounts?.[0]?.accountNo||o.accountNo,sheba:data.accounts?.[0]?.sheba||o.sheba,board:data.members||o.board});(data.beneficiaries||[]).forEach(b=>{if(!state.beneficiaries.some(x=>x.nationalId===b.nationalId&&x.orgId===o.id))state.beneficiaries.push(Object.assign({id:uid('ben'),orgId:o.id,orgName:o.name},b))});(data.reports||[]).forEach(rep=>{if(!state.reports.some(x=>x.clientReportId===rep.id))state.reports.push(Object.assign({id:uid('rep'),clientReportId:rep.id,orgId:o.id,orgName:o.name},rep))});let im={id:uid('imp'),trackingCode:data.trackingCode||('JVN-EXP-'+Date.now()),orgName:o.name,exportedAt:data.exportedAt||'',importedAt:new Date().toLocaleString('fa-IR'),status:'وارد شد',summary:`مددجو: ${(data.beneficiaries||[]).length} | گزارش: ${(data.reports||[]).length} | اعضا: ${(data.members||[]).length}`};state.imports.unshift(im);let u=state.users.find(x=>x.orgId===o.id||x.organizationName===o.name);if(u)u.lastImportAt=im.importedAt;auditRun(false);save();$('importResult').innerHTML='<div class="note ok">فایل با موفقیت وارد شد.</div>'}function orgs(){return `<div class="actions"><button class="ghost" onclick="downloadCSV('گزارش_کامل_سمن‌ها.csv',orgsCSV())">Excel/CSV</button><button class="ghost" onclick="window.print()">چاپ</button></div><div class="card"><h3>اطلاعات کامل سمن‌ها، مجوزها، حساب‌ها و مدیرعامل</h3><div class="tablewrap"><table class="table"><tr><th>نام سمن</th><th>شناسه ملی</th><th>شماره ثبت</th><th>حوزه</th><th>مدیرعامل</th><th>کد ملی مدیرعامل</th><th>مجوز</th><th>شماره مجوز</th><th>بانک/شبا</th><th>هیأت مدیره</th><th>عملیات</th></tr>${state.orgs.map(o=>`<tr><td><b>${esc(o.name)}</b><br><small>${esc(o.address)}</small></td><td>${esc(o.nationalId)}</td><td>${esc(o.regNo)}</td><td>${esc(o.activity)}</td><td>${esc(o.ceo)}</td><td>${esc(o.ceoNationalId)}</td><td>${badge(o.licenseStatus)}</td><td>${esc(o.licenseNo)}</td><td>${esc(o.bank)}<br><small class="ltr">${esc(o.sheba)}</small></td><td>${(o.board||[]).map(m=>esc(m.name+' - '+m.role)).join('<br>')}</td><td><button class="ghost" onclick="viewOrg('${o.id}')">پرونده</button></td></tr>`).join('')}</table></div></div><div id="orgReport"></div>`}function repsTable(rs){return `<div class="tablewrap"><table class="table"><tr><th>سال</th><th>ماه</th><th>ورودی</th><th>هزینه</th><th>پرداخت مددجو</th><th>هزینه جاری</th><th>مانده</th><th>وضعیت</th></tr>${rs.map(r=>`<tr><td>${esc(r.year)}</td><td>${esc(r.month)}</td><td>${money(r.income)}</td><td>${money(r.expense)}</td><td>${money(r.beneficiaryPay)}</td><td>${money(r.currentCost)}</td><td>${money(num(r.income)-num(r.expense))}</td><td>${badge(r.status)}</td></tr>`).join('')||'<tr><td colspan="8">گزارشی ثبت نشده است.</td></tr>'}</table></div>`}function benTable(bs){return `<div class="tablewrap"><table class="table"><tr><th>نام مددجو</th><th>کد ملی</th><th>مبلغ</th><th>وضعیت</th></tr>${bs.map(b=>`<tr><td>${esc(b.name)}</td><td>${esc(b.nationalId)}</td><td>${money(b.amount)}</td><td>${badge(b.status)}</td></tr>`).join('')||'<tr><td colspan="4">مددجویی ثبت نشده است.</td></tr>'}</table></div>`}function audTable(as){return `<div class="tablewrap"><table class="table"><tr><th>سمن</th><th>نوع</th><th>شدت</th><th>توضیح</th><th>وضعیت</th></tr>${as.map(a=>`<tr><td>${esc(a.orgName)}</td><td>${esc(a.type)}</td><td>${esc(a.severity)}</td><td>${esc(a.desc)}</td><td>${badge(a.status)}</td></tr>`).join('')||'<tr><td colspan="5">یافته‌ای ندارد.</td></tr>'}</table></div>`}function viewOrg(id){let o=state.orgs.find(x=>x.id===id),rs=state.reports.filter(r=>r.orgId===id),bs=state.beneficiaries.filter(b=>b.orgId===id),as=state.auditFindings.filter(a=>a.orgId===id);$('orgReport').innerHTML=`<div class="report"><div class="rhead"><h2>پرونده کامل سمن</h2><p>${esc(o.name)} | شناسه ملی: ${esc(o.nationalId)} | شماره ثبت: ${esc(o.regNo)}</p></div><div class="grid2"><div><h3>مشخصات ثبتی</h3><p><b>حوزه:</b> ${esc(o.activity)}</p><p><b>وضعیت:</b> ${badge(o.status)}</p><p><b>آدرس:</b> ${esc(o.address)}</p></div><div><h3>مجوز</h3><p><b>وضعیت:</b> ${badge(o.licenseStatus)}</p><p><b>شماره:</b> ${esc(o.licenseNo)}</p><p><b>پایان:</b> ${esc(o.licenseEnd||'')}</p></div><div><h3>مدیرعامل و هیأت مدیره</h3><p><b>مدیرعامل:</b> ${esc(o.ceo)}</p><p><b>کد ملی:</b> ${esc(o.ceoNationalId)}</p><p>${(o.board||[]).map(m=>esc(m.name+' - '+m.role)).join('<br>')}</p></div><div><h3>حساب بانکی</h3><p><b>بانک:</b> ${esc(o.bank)}</p><p><b>شبا:</b> <span class="ltr">${esc(o.sheba)}</span></p></div></div><h3>گزارش‌های مالی</h3>${repsTable(rs)}<h3>مددجوها</h3>${benTable(bs)}<h3>یافته‌های حسابرسی</h3>${audTable(as)}${signs(o.ceo)}</div>`}let rtype='full';function reports(){return `<div class="tabs"><button onclick="rpt('full')">جامع</button><button onclick="rpt('lic')">مجوزها</button><button onclick="rpt('fin')">مالی</button><button onclick="rpt('aud')">حسابرسی</button><button onclick="rpt('ben')">مددجوها</button><button onclick="rpt('imp')">فایل‌های واردشده</button></div><div class="actions"><button class="primary" onclick="downloadWordArea()">Word</button><button class="ghost" onclick="downloadCSV('گزارش.csv',csvCurrent())">Excel/CSV</button><button class="ghost" onclick="window.print()">چاپ/PDF</button></div><div id="rarea">${reportHtml('full')}</div>`}function rpt(t){rtype=t;$('rarea').innerHTML=reportHtml(t)}function reportHtml(t){if(t==='lic')return `<div class="report" id="printArea"><div class="rhead"><h2>گزارش مجوزها</h2></div><div class="tablewrap"><table class="table"><tr><th>سمن</th><th>شماره مجوز</th><th>وضعیت</th><th>شروع</th><th>پایان</th></tr>${state.orgs.map(o=>`<tr><td>${esc(o.name)}</td><td>${esc(o.licenseNo)}</td><td>${badge(o.licenseStatus)}</td><td>${esc(o.licenseStart||'')}</td><td>${esc(o.licenseEnd||'')}</td></tr>`).join('')}</table></div>${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;if(t==='fin')return `<div class="report" id="printArea"><div class="rhead"><h2>گزارش مالی</h2></div>${repsTable(state.reports)}${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;if(t==='aud')return `<div class="report" id="printArea"><div class="rhead"><h2>گزارش حسابرسی</h2><p>امتیاز سلامت: ${score()}٪</p></div>${audTable(state.auditFindings)}${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;if(t==='ben')return `<div class="report" id="printArea"><div class="rhead"><h2>گزارش مددجویان</h2></div>${benTable(state.beneficiaries)}${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;if(t==='imp')return `<div class="report" id="printArea"><div class="rhead"><h2>گزارش فایل‌های واردشده</h2></div><div class="tablewrap"><table class="table"><tr><th>کد رهگیری</th><th>سمن</th><th>تاریخ خروجی</th><th>تاریخ ورود</th><th>وضعیت</th><th>خلاصه</th></tr>${state.imports.map(i=>`<tr><td>${esc(i.trackingCode)}</td><td>${esc(i.orgName)}</td><td>${esc(i.exportedAt)}</td><td>${esc(i.importedAt)}</td><td>${badge(i.status)}</td><td>${esc(i.summary)}</td></tr>`).join('')||'<tr><td colspan="6">فایلی وارد نشده است.</td></tr>'}</table></div>${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;return `<div class="report" id="printArea"><div class="rhead"><h2>گزارش جامع سمن‌ها</h2><p>تاریخ: ${today()} | تعداد: ${state.orgs.length}</p></div>${orgs().replace(/<div class="actions[\s\S]*?<\/div><div class="card">/,'<div class="card">').replace('<div id="orgReport"></div>','')}${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`}function audit(){auditRun(False);return ''}function audit(){auditRun(false);return `<div class="actions"><button class="primary" onclick="auditRun(true)">اجرای حسابرسی مجدد</button><button class="ghost" onclick="downloadCSV('حسابرسی.csv',auditCSV())">Excel/CSV</button></div><div class="card"><h3>حسابرسی هوشمند</h3><div class="score"><span style="width:${score()}%"></span></div><div class="note info">امتیاز سلامت پرونده‌ها: ${score()}٪</div>${audTable(state.auditFindings)}</div>`}function word(){return `<div class="card"><h3>خروجی Word حرفه‌ای</h3><p>گزارش‌های رسمی با سربرگ، کد رهگیری و سه محل امضا تولید می‌شوند.</p><div class="quick"><button onclick="downloadWord('گزارش جامع',reportHtml('full'))">📑 گزارش جامع</button><button onclick="downloadWord('گزارش مجوزها',reportHtml('lic'))">📜 گزارش مجوزها</button><button onclick="downloadWord('گزارش مالی',reportHtml('fin'))">📊 گزارش مالی</button><button onclick="downloadWord('گزارش حسابرسی',reportHtml('aud'))">🧾 گزارش حسابرسی</button></div></div>`}function bens(){return `<div class="card"><h3>مددجوها</h3>${benTable(state.beneficiaries)}${dups()}</div>`}function dups(){let m={};state.beneficiaries.forEach(b=>{m[b.nationalId]=(m[b.nationalId]||[]).concat(b)});let d=Object.values(m).filter(x=>x.length>1);return d.length?`<h3>کد ملی تکراری</h3>${d.map(g=>`<div class="note bad">${esc(g[0].nationalId)} در ${g.length} رکورد تکرار شده است.</div>`).join('')}`:''}function corr(){return `<div class="actions"><button class="primary" onclick="corrForm()">ثبت درخواست اصلاح</button></div><div id="corrForm"></div><div class="card"><h3>درخواست‌های اصلاح</h3><div class="tablewrap"><table class="table"><tr><th>سمن</th><th>عنوان</th><th>توضیح</th><th>مهلت</th><th>وضعیت</th></tr>${state.corrections.map(c=>`<tr><td>${esc(c.orgName)}</td><td>${esc(c.title)}</td><td>${esc(c.desc)}</td><td>${esc(c.deadline)}</td><td>${badge(c.status)}</td></tr>`).join('')||'<tr><td colspan="5">درخواستی ثبت نشده است.</td></tr>'}</table></div></div>`}function corrForm(){$('corrForm').innerHTML=`<div class="card"><div class="field"><label>سمن</label><select id="cOrg">${state.orgs.map(o=>`<option value="${o.id}">${esc(o.name)}</option>`).join('')}</select></div><div class="field"><label>عنوان</label><input id="cTitle"></div><div class="field"><label>مهلت</label><input id="cDead"></div><div class="field"><label>توضیح</label><textarea id="cDesc"></textarea></div><button class="primary" onclick="addCorr()">ثبت</button></div>`}function addCorr(){let o=state.orgs.find(x=>x.id===$('cOrg').value);state.corrections.push({id:uid('corr'),orgId:o.id,orgName:o.name,title:$('cTitle').value,desc:$('cDesc').value,deadline:$('cDead').value,status:'باز'});save();render('corrections')}function settings(){return `<div class="grid2"><div class="card"><h3>تعاریف امضاکنندگان گزارش‌ها</h3><div class="note info">پایان تمام گزارش‌ها: مدیرعامل سمن، کارشناس امور اجتماعی فرمانداری شهرستان جوانرود، فرماندار شهرستان جوانرود.</div>${state.settings.signers.map(s=>`<div class="field"><label>${esc(s.title)}</label><input id="sign_${s.id}" value="${esc(s.name||'')}" placeholder="نام و نام خانوادگی"></div>`).join('')}<button class="primary" onclick="saveSigners()">ذخیره امضاها</button></div><div class="card"><h3>تنظیمات ورود و سربرگ</h3><div class="field"><label>نام کاربری</label><input id="setUser" value="${esc(state.settings.adminUser||'admin')}" dir="ltr"></div><div class="field"><label>رمز عبور</label><input id="setPass" value="${esc(state.settings.adminPass||'admin123')}" dir="ltr"></div><div class="field"><label>عنوان سامانه</label><input id="setTitle" value="${esc(state.settings.title)}"></div><button class="primary" onclick="saveSettings()">ذخیره</button></div></div>`}function saveSigners(){state.settings.signers.forEach(s=>s.name=$('sign_'+s.id).value);save();alert('امضاها ذخیره شد.')}function saveSettings(){state.settings.adminUser=$('setUser').value;state.settings.adminPass=$('setPass').value;state.settings.title=$('setTitle').value;save();alert('ذخیره شد.')}function backup(){return `<div class="card"><h3>بکاپ و بازیابی</h3><button class="primary" onclick="downloadJSON('backup_admin_v84.json',state)">دانلود بکاپ کامل</button> <input type="file" id="restoreFile" accept=".json"><button class="ghost" onclick="restoreBackup()">بازیابی</button></div>`}function restoreBackup(){let f=$('restoreFile').files[0];if(!f){alert('فایل بکاپ را انتخاب کنید.');return}let r=new FileReader();r.onload=()=>{try{let obj=JSON.parse(r.result);if(confirm('اطلاعات فعلی جایگزین شود؟')){state=obj;save();location.reload()}}catch(e){alert('بکاپ معتبر نیست.')}};r.readAsText(f,'utf-8')}function logs(){return `<div class="card"><h3>لاگ فعالیت‌ها</h3><div class="tablewrap"><table class="table"><tr><th>عملیات</th><th>زمان</th><th>کاربر</th></tr>${state.logs.map(x=>`<tr><td>${esc(x.action)}</td><td>${esc(x.at)}</td><td>${esc(x.user||'')}</td></tr>`).join('')||'<tr><td colspan="3">لاگی ثبت نشده است.</td></tr>'}</table></div></div>`}function signs(ceo){let s=state.settings.signers.find(x=>x.id==='social')||{},g=state.settings.signers.find(x=>x.id==='governor')||{};return `<div class="signs"><div class="sign"><b>نام و نام خانوادگی مدیرعامل سمن</b><br>${esc(ceo||'................')}</div><div class="sign"><b>کارشناس امور اجتماعی فرمانداری شهرستان جوانرود</b><br>${esc(s.name||'................')}</div><div class="sign"><b>فرماندار شهرستان جوانرود</b><br>${esc(g.name||'................')}</div></div>`}function downloadWordArea(){downloadWord('گزارش_'+rtype,$('printArea')?$('printArea').outerHTML:$('rarea').innerHTML)}function downloadWord(title,html){let doc=`<!doctype html><html dir="rtl"><meta charset="utf-8"><style>body{font-family:tahoma;direction:rtl;line-height:2}table{border-collapse:collapse;width:100%}td,th{border:1px solid #999;padding:6px;text-align:right}.rhead{background:#0e2f57;color:white;text-align:center;padding:12px}.signs{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:35px}.sign{border-top:1px dashed #555;text-align:center;padding-top:10px}</style><body>${html}</body></html>`;downloadText(title+'.doc',doc,'application/msword;charset=utf-8');log('خروجی Word: '+title)}function downloadText(n,t,type){let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:type||'text/plain;charset=utf-8'}));a.download=n;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}function downloadJSON(n,o){downloadText(n,JSON.stringify(o,null,2),'application/json;charset=utf-8')}function cell(v){return '"'+String(v??'').replace(/"/g,'""')+'"'}function downloadCSV(n,c){downloadText(n,'\ufeff'+c,'text/csv;charset=utf-8')}function orgsCSV(){return ['نام سمن,شناسه ملی,شماره ثبت,حوزه,مدیرعامل,کد ملی,وضعیت مجوز,شماره مجوز,بانک,شبا'].concat(state.orgs.map(o=>[o.name,o.nationalId,o.regNo,o.activity,o.ceo,o.ceoNationalId,o.licenseStatus,o.licenseNo,o.bank,o.sheba].map(cell).join(','))).join('\n')}function licenseCSV(){return ['سمن,شماره مجوز,وضعیت,شروع,پایان'].concat(state.orgs.map(o=>[o.name,o.licenseNo,o.licenseStatus,o.licenseStart,o.licenseEnd].map(cell).join(','))).join('\n')}function reportsCSV(){return ['سمن,سال,ماه,ورودی,هزینه,پرداخت مددجو,هزینه جاری,وضعیت'].concat(state.reports.map(r=>[r.orgName,r.year,r.month,r.income,r.expense,r.beneficiaryPay,r.currentCost,r.status].map(cell).join(','))).join('\n')}function auditCSV(){return ['سمن,نوع,شدت,توضیح,وضعیت'].concat(state.auditFindings.map(a=>[a.orgName,a.type,a.severity,a.desc,a.status].map(cell).join(','))).join('\n')}function benefCSV(){return ['سمن,نام مددجو,کد ملی,مبلغ,وضعیت'].concat(state.beneficiaries.map(b=>[b.orgName,b.name,b.nationalId,b.amount,b.status].map(cell).join(','))).join('\n')}function importsCSV(){return ['کد رهگیری,سمن,تاریخ خروجی,تاریخ ورود,وضعیت,خلاصه'].concat(state.imports.map(i=>[i.trackingCode,i.orgName,i.exportedAt,i.importedAt,i.status,i.summary].map(cell).join(','))).join('\n')}function csvCurrent(){return rtype==='lic'?licenseCSV():rtype==='fin'?reportsCSV():rtype==='aud'?auditCSV():rtype==='ben'?benefCSV():rtype==='imp'?importsCSV():orgsCSV()}
/* ================= V84 OFFICIAL WORKFLOW + VALIDATION PATCH ================= */
function validateNationalIdV84(v){v=String(v||'').replace(/[^\d۰-۹٠-٩]/g,'').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));return v.length===10}
function validateMobileV84(v){v=String(v||'').replace(/[^\d۰-۹٠-٩]/g,'').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));return !v||/^09\d{9}$/.test(v)||v.length===11}
function validateShebaV84(v){return !v||/^IR/i.test(String(v||'').trim())}
function ensureV84(){state.workflow=state.workflow||[];state.documents=state.documents||[];state.migrations=state.migrations||[];state.version='76'}
function workflow(){ensureV84();return `<div class="card"><h3>گردش کار تأیید گزارش‌ها</h3><div class="note info">مسیر رسمی: دریافت از کلاینت ← در انتظار بررسی ← نیازمند اصلاح / تأیید کارشناس ← تأیید نهایی ← بایگانی شده</div><div class="tablewrap"><table class="table"><tr><th>گزارش</th><th>سمن</th><th>وضعیت</th><th>تاریخ</th><th>عملیات</th></tr>${state.workflow.map(w=>`<tr><td>${esc(w.title)}</td><td>${esc(w.orgName)}</td><td>${status(w.status)}</td><td>${esc(w.createdAt)}</td><td><button class="ghost" onclick="setWorkflowV84('${w.id}','در انتظار بررسی')">بررسی</button> <button class="ghost" onclick="setWorkflowV84('${w.id}','نیازمند اصلاح')">نیازمند اصلاح</button> <button class="ghost" onclick="setWorkflowV84('${w.id}','تأیید نهایی')">تأیید نهایی</button> <button class="ghost" onclick="setWorkflowV84('${w.id}','بایگانی شده')">بایگانی</button></td></tr>`).join('')||'<tr><td colspan="5">گزارشی در گردش کار نیست.</td></tr>'}</table></div></div>`}
function setWorkflowV84(id,st){let w=state.workflow.find(x=>x.id===id);if(!w)return;w.status=st;w.history=(w.history||[]).concat(st);let r=state.reports.find(x=>x.id===w.reportId);if(r)r.workflowStatus=st;if(st==='نیازمند اصلاح'){state.corrections=state.corrections||[];state.corrections.push({id:uid('corr'),orgId:w.orgId,orgName:w.orgName,title:'اصلاح گزارش',desc:'ثبت‌شده از گردش کار گزارش',deadline:'',status:'باز',createdAt:today(),reportId:w.reportId})}save();log('تغییر وضعیت گردش کار: '+st);render('workflow')}
function documents(){ensureV84();return `<div class="actions"><button class="primary" onclick="docFormV84()">ثبت مدرک</button></div><div id="docForm"></div><div class="card"><h3>بایگانی مدارک و پیوست‌ها</h3><div class="tablewrap"><table class="table"><tr><th>سمن</th><th>نوع مدرک</th><th>نام فایل/شماره پیوست</th><th>تاریخ ثبت</th><th>وضعیت</th></tr>${state.documents.map(d=>`<tr><td>${esc(d.orgName)}</td><td>${esc(d.type)}</td><td>${esc(d.fileName)}</td><td>${esc(d.createdAt)}</td><td>${status(d.status)}</td></tr>`).join('')||'<tr><td colspan="5">مدرکی ثبت نشده است.</td></tr>'}</table></div></div>`}
function docFormV84(){$('docForm').innerHTML=`<div class="card"><h3>ثبت مدرک</h3><div class="grid3"><div class="field"><label>سمن</label><select id="dOrg">${state.orgs.map(o=>`<option value="${o.id}">${esc(o.name)}</option>`).join('')}</select></div><div class="field"><label>نوع مدرک</label><select id="dType"><option>مجوز فعالیت</option><option>اساسنامه</option><option>آگهی ثبت</option><option>مدارک مدیرعامل</option><option>مدارک هیأت مدیره</option><option>مدارک حساب بانکی</option><option>مدارک هزینه جاری</option></select></div><div class="field"><label>نام فایل / شماره پیوست</label><input id="dFile"></div></div><button class="primary" onclick="addDocV84()">ذخیره مدرک</button></div>`}
function addDocV84(){let o=state.orgs.find(x=>x.id===$('dOrg').value);state.documents.push({id:uid('doc'),orgId:o.id,orgName:o.name,type:$('dType').value,fileName:$('dFile').value,createdAt:today(),status:'در انتظار بررسی'});save();render('documents')}
let pendingImportV84=null;
function imp(){ensureV84();return `<div class="card"><h3>ورود فایل خروجی سمن‌ها با مدیریت مغایرت</h3><div class="note info">فایل خروجی کلاینت را انتخاب کنید. سیستم مغایرت اطلاعات موجود و جدید را نشان می‌دهد و ادمین تصمیم می‌گیرد: ادغام، جایگزینی یا رد.</div><input type="file" id="importFile" accept="application/json,.json"><div class="actions" style="margin-top:12px"><button class="primary" onclick="analyzeImportV84()">بررسی فایل</button></div><div id="importResult"></div></div><div class="card"><h3>لیست فایل‌های واردشده</h3><div class="tablewrap"><table class="table"><tr><th>کد رهگیری</th><th>سمن</th><th>تاریخ خروجی</th><th>تاریخ ورود</th><th>روش</th><th>وضعیت</th><th>جزئیات</th></tr>${state.imports.map(i=>`<tr><td>${esc(i.trackingCode)}</td><td>${esc(i.orgName)}</td><td>${esc(i.exportedAt)}</td><td>${esc(i.importedAt)}</td><td>${esc(i.mode||'')}</td><td>${status(i.status)}</td><td>${esc(i.summary)}</td></tr>`).join('')||'<tr><td colspan="7">فایلی وارد نشده است.</td></tr>'}</table></div></div>`}
function analyzeImportV84(){let f=$('importFile').files[0];if(!f){alert('فایل خروجی کلاینت را انتخاب کنید.');return}let r=new FileReader();r.onload=()=>{try{let data=JSON.parse(r.result);if(data.type!=='JAVANROOD_NGO_CLIENT_EXPORT')throw new Error('type');pendingImportV84=data;showImportDiffV84(data)}catch(e){$('importResult').innerHTML='<div class="note bad">فایل خروجی کلاینت معتبر نیست.</div>'}};r.readAsText(f,'utf-8')}
function showImportDiffV84(data){let org=data.organization||{};let ex=state.orgs.find(x=>x.id===org.organizationKey||x.nationalId===org.organizationNationalId||x.name===org.organizationName);let diffs=[];if(ex){[['نام سمن','name','organizationName'],['شناسه ملی','nationalId','organizationNationalId'],['شماره ثبت','regNo','registrationNumber'],['مدیرعامل','ceo','ceoName'],['کد ملی مدیرعامل','ceoNationalId','ceoNationalId']].forEach(([l,a,b])=>{if(String(ex[a]||'')!==String(org[b]||''))diffs.push(`${l}: قبلی «${ex[a]||'-'}» / جدید «${org[b]||'-'}»`)})}else diffs.push('سمن جدید است و در ادمین ثبت می‌شود.');if(state.imports.some(i=>i.trackingCode===(data.trackingCode||'')))diffs.push('این کد رهگیری قبلاً وارد شده است.');$('importResult').innerHTML=`<div class="note warn"><b>مغایرت‌ها و وضعیت فایل:</b><br>${diffs.map(esc).join('<br>')}</div><div class="actions"><button class="primary greenBtn" onclick="applyImportV84('merge')">ادغام</button><button class="primary orangeBtn" onclick="applyImportV84('replace')">جایگزینی</button><button class="primary redBtn" onclick="applyImportV84('reject')">رد فایل</button></div>`}
function applyImportV84(mode){if(!pendingImportV84)return;if(mode==='reject'){state.imports.unshift({id:uid('imp'),trackingCode:pendingImportV84.trackingCode||'',orgName:pendingImportV84.organization?.organizationName||'',exportedAt:pendingImportV84.exportedAt||'',importedAt:new Date().toLocaleString('fa-IR'),mode:'رد',status:'رد شده',summary:'فایل توسط ادمین رد شد'});save();render('import');return}let data=pendingImportV84,org=data.organization||{};let o=state.orgs.find(x=>x.id===org.organizationKey||x.nationalId===org.organizationNationalId||x.name===org.organizationName);if(!o){o={id:org.organizationKey||uid('org'),board:[]};state.orgs.push(o)}if(mode==='replace'){state.beneficiaries=state.beneficiaries.filter(b=>b.orgId!==o.id);state.reports=state.reports.filter(r=>r.orgId!==o.id)}Object.assign(o,{name:org.organizationName||o.name,nationalId:org.organizationNationalId||o.nationalId,regNo:org.registrationNumber||o.regNo,activity:org.activityField||o.activity,address:org.address||o.address,phone:org.phone||o.phone,ceo:org.ceoName||o.ceo,ceoNationalId:org.ceoNationalId||o.ceoNationalId,licenseStatus:data.licenses?.[0]?.status||o.licenseStatus,licenseNo:data.licenses?.[0]?.licenseNo||o.licenseNo,licenseStart:data.licenses?.[0]?.start||o.licenseStart,licenseEnd:data.licenses?.[0]?.end||o.licenseEnd,bank:data.accounts?.[0]?.bank||o.bank,accountNo:data.accounts?.[0]?.accountNo||o.accountNo,sheba:data.accounts?.[0]?.sheba||o.sheba,board:data.members||o.board||[]});(data.beneficiaries||[]).forEach(b=>{if(!state.beneficiaries.some(x=>x.nationalId===b.nationalId&&x.orgId===o.id))state.beneficiaries.push(Object.assign({id:uid('ben'),orgId:o.id,orgName:o.name},b))});(data.reports||[]).forEach(rep=>{if(!state.reports.some(x=>x.clientReportId===rep.id)){let nr=Object.assign({id:uid('rep'),clientReportId:rep.id,orgId:o.id,orgName:o.name,workflowStatus:'دریافت از کلاینت'},rep);state.reports.push(nr);state.workflow.unshift({id:uid('wf'),reportId:nr.id,orgId:o.id,orgName:o.name,title:`گزارش ${nr.month||''} ${nr.year||''}`,status:'دریافت از کلاینت',createdAt:today(),history:['دریافت از کلاینت']})}});let imp={id:uid('imp'),trackingCode:data.trackingCode||('JVN-EXP-'+Date.now()),orgName:o.name,exportedAt:data.exportedAt||'',importedAt:new Date().toLocaleString('fa-IR'),mode:mode==='merge'?'ادغام':'جایگزینی',status:'وارد شد',summary:`مددجو: ${(data.beneficiaries||[]).length} | گزارش: ${(data.reports||[]).length} | اعضا: ${(data.members||[]).length}`};state.imports.unshift(imp);let u=state.users.find(x=>x.orgId===o.id||x.organizationName===o.name);if(u)u.lastImportAt=imp.importedAt;runAudit(false);save();log('ورود فایل خروجی سمن: '+o.name+' / '+imp.mode);pendingImportV84=null;render('import')}
function reports(){return `<div class="card"><h3>گزارش‌ساز رسمی</h3><div class="grid3"><div class="field"><label>نوع گزارش</label><select id="repType"><option value="full">گزارش جامع</option><option value="lic">مجوزها</option><option value="fin">مالی</option><option value="aud">حسابرسی</option><option value="ben">مددجوها</option><option value="imp">فایل‌های واردشده</option></select></div><div class="field"><label>سمن</label><select id="repOrg"><option value="">همه</option>${state.orgs.map(o=>`<option value="${o.id}">${esc(o.name)}</option>`).join('')}</select></div><div class="field"><label>سال</label><input id="repYear" placeholder="۱۴۰۳"></div><div class="field"><label>ماه</label><input id="repMonth" placeholder="فروردین"></div><div class="field"><label>وضعیت</label><input id="repStatus" placeholder="مثلاً تأیید شده"></div></div><div class="actions"><button class="primary" onclick="buildReportV84()">نمایش گزارش</button><button class="ghost" onclick="downloadWordFromArea()">Word</button><button class="ghost" onclick="downloadCSV('گزارش_فیلترشده.csv',csvCurrent())">Excel/CSV</button><button class="ghost" onclick="window.print()">چاپ/PDF</button></div></div><div id="reportArea">${rptHtml('full')}</div>`}
function buildReportV84(){rtype=$('repType').value;let html=rptHtml(rtype);$('reportArea').innerHTML=html}
/* ================= END V84 PATCH ================= */


/* ================= V84 ROLES + TEMPLATES + BACKUP PATCH ================= */
function ensureV84(){state.roles=state.roles||[{name:'مدیر سامانه',permissions:'همه دسترسی‌ها'},{name:'کارشناس امور اجتماعی',permissions:'بررسی پرونده، گزارش و درخواست اصلاح'},{name:'کارشناس مالی',permissions:'گزارش مالی و حسابرسی مالی'},{name:'مشاهده‌گر',permissions:'فقط مشاهده و خروجی'}];state.reportTemplates=state.reportTemplates||[{name:'پرونده کامل سمن',type:'full'},{name:'گزارش مجوزها',type:'lic'},{name:'گزارش مالی',type:'fin'},{name:'گزارش حسابرسی',type:'aud'},{name:'گزارش مددجوها',type:'ben'}];state.migrations=state.migrations||[];state.version='77'}
function roles(){ensureV84();return `<div class="card"><h3>نقش‌ها و سطح دسترسی</h3><div class="note info">این بخش برای رسمی‌تر شدن سامانه و تفکیک مسئولیت‌ها اضافه شده است.</div><div class="actions"><button class="primary" onclick="roleFormV84()">افزودن نقش</button></div><div id="roleForm"></div><div class="tablewrap"><table class="table"><tr><th>نقش</th><th>دسترسی</th></tr>${state.roles.map(r=>`<tr><td>${esc(r.name)}</td><td>${esc(r.permissions)}</td></tr>`).join('')}</table></div></div>`}
function roleFormV84(){$('roleForm').innerHTML=`<div class="grid2"><div class="field"><label>نام نقش</label><input id="roleName"></div><div class="field"><label>دسترسی‌ها</label><input id="rolePerm"></div></div><button class="primary" onclick="addRoleV84()">ذخیره نقش</button>`}
function addRoleV84(){state.roles.push({name:$('roleName').value,permissions:$('rolePerm').value});save();render('roles')}
function templates(){ensureV84();return `<div class="card"><h3>قالب‌های رسمی گزارش Word</h3><div class="note info">هر قالب می‌تواند برای Word، چاپ و PDF استفاده شود.</div><div class="actions"><button class="primary" onclick="templateFormV84()">افزودن قالب</button></div><div id="templateForm"></div><div class="tablewrap"><table class="table"><tr><th>نام قالب</th><th>نوع گزارش</th><th>عملیات</th></tr>${state.reportTemplates.map(t=>`<tr><td>${esc(t.name)}</td><td>${esc(t.type)}</td><td><button class="ghost" onclick="downloadWord('${esc(t.name)}',rptHtml('${t.type}'))">Word</button></td></tr>`).join('')}</table></div></div>`}
function templateFormV84(){$('templateForm').innerHTML=`<div class="grid2"><div class="field"><label>نام قالب</label><input id="tplName"></div><div class="field"><label>نوع</label><select id="tplType"><option value="full">جامع</option><option value="lic">مجوزها</option><option value="fin">مالی</option><option value="aud">حسابرسی</option><option value="ben">مددجوها</option></select></div></div><button class="primary" onclick="addTemplateV84()">ذخیره قالب</button>`}
function addTemplateV84(){state.reportTemplates.push({name:$('tplName').value,type:$('tplType').value});save();render('templates')}
function migration(){ensureV84();return `<div class="card"><h3>مهاجرت نسخه‌ها و سلامت داده</h3><div class="note info">این بخش برای جلوگیری از پاک شدن اطلاعات در آپدیت‌های بعدی اضافه شده است.</div><button class="primary" onclick="runMigrationV84()">اجرای بررسی مهاجرت</button><div class="tablewrap" style="margin-top:12px"><table class="table"><tr><th>تاریخ</th><th>شرح</th></tr>${state.migrations.map(m=>`<tr><td>${esc(m.at)}</td><td>${esc(m.desc)}</td></tr>`).join('')||'<tr><td colspan="2">مهاجرتی ثبت نشده است.</td></tr>'}</table></div></div>`}
function runMigrationV84(){ensureV84();state.migrations.unshift({at:new Date().toLocaleString('fa-IR'),desc:'بررسی ساختار داده و سازگاری با V84 انجام شد.'});save();render('migration')}
function backup(){ensureV84();return `<div class="card"><h3>بکاپ حرفه‌ای و رمزدار</h3><div class="note info">بکاپ کامل، بکاپ رمزدار نمایشی، و بازیابی بکاپ.</div><div class="actions"><button class="primary" onclick="downloadJSON('backup_admin_v84.json',state)">بکاپ کامل</button><button class="ghost" onclick="downloadEncryptedV84()">بکاپ رمزدار</button><input type="file" id="restoreFile" accept=".json"><button class="ghost orangeBtn" onclick="restoreBackup()">بازیابی بکاپ</button></div></div>`}
function downloadEncryptedV84(){let pass=prompt('رمز بکاپ را وارد کنید:','1234');if(!pass)return;let payload={type:'JAVANROOD_NGO_ENCRYPTED_BACKUP_V84',hint:'رمزگذاری ساده داخلی برای نسخه آفلاین',createdAt:new Date().toLocaleString('fa-IR'),data:btoa(unescape(encodeURIComponent(JSON.stringify(state)))),passHash:hashString(pass)};downloadJSON('backup_admin_v84_encrypted.json',payload);log('ساخت بکاپ رمزدار')}
function help(){return `<div class="card"><h3>راهنمای داخل برنامه</h3><div class="grid2"><div class="note info"><b>ساخت کلاینت</b><br>از بخش کاربران، مشخصات سمن و مدیرعامل را وارد و فایل فعال‌سازی بسازید.</div><div class="note info"><b>ورود فایل سمن‌ها</b><br>خروجی کلاینت را وارد کنید، مغایرت را بررسی و ادغام/جایگزین کنید.</div><div class="note info"><b>گردش کار</b><br>گزارش‌ها را بررسی، اصلاح، تأیید یا بایگانی کنید.</div><div class="note info"><b>گزارش‌ها</b><br>از گزارش‌ساز، نوع گزارش و فیلترها را انتخاب و Word/CSV بگیرید.</div></div></div>`}
/* ================= END V84 PATCH ================= */


/* ================= V84 FINAL STABLE RELEASE PATCH ================= */
function ensureV84(){
  state.version='78';
  state.errorLogs = state.errorLogs || [];
  state.about = state.about || {
    appName:'سامانه جمع‌آوری اطلاعات سمن‌های مردم‌نهاد شهرستان جوانرود',
    version:'V84 FINAL STABLE RELEASE',
    area:'شهرستان جوانرود',
    releaseDate:new Date().toLocaleDateString('fa-IR'),
    edition:'نسخه پایدار نهایی ادمین'
  };
  state.sessionConfig = state.sessionConfig || {autoLockMinutes:15,enabled:true};
  state.migrations = state.migrations || [];
  state.helpTopics = state.helpTopics || [
    {title:'ساخت کاربر کلاینت',body:'از بخش کاربران و فعال‌سازی، مشخصات سمن و مدیرعامل را وارد و فایل فعال‌سازی را دانلود کنید.'},
    {title:'فعال‌سازی کلاینت',body:'در کلاینت، فایل فعال‌سازی و کد ملی مدیرعامل وارد می‌شود و سپس صفحه ورود نمایش داده می‌شود.'},
    {title:'ورود خروجی سمن‌ها',body:'فایل خروجی ساخته‌شده در کلاینت را از بخش ورود فایل سمن‌ها وارد و مغایرت‌ها را بررسی کنید.'},
    {title:'گزارش‌گیری',body:'از بخش گزارش‌گیری، نوع گزارش و فیلترها را انتخاب و خروجی Word، CSV یا چاپ بگیرید.'},
    {title:'تعاریف امضا',body:'نام کارشناس امور اجتماعی و فرماندار را در تنظیمات وارد کنید تا پایین گزارش‌ها نمایش داده شود.'},
    {title:'بکاپ',body:'از بخش بکاپ حرفه‌ای، خروجی بکاپ بگیرید و در محل امن نگهداری کنید.'}
  ];
}
function addErrorV84(msg,src,line,col,stack){
  try{
    state.errorLogs = state.errorLogs || [];
    state.errorLogs.unshift({at:new Date().toLocaleString('fa-IR'),message:String(msg||''),source:String(src||''),line:line||'',column:col||'',stack:String(stack||'')});
    state.errorLogs = state.errorLogs.slice(0,120);
    save();
  }catch(e){}
}
window.onerror=function(msg,src,line,col,err){addErrorV84(msg,src,line,col,err&&err.stack);return false}
window.onunhandledrejection=function(ev){addErrorV84(ev.reason&&ev.reason.message?ev.reason.message:ev.reason,'promise','','',ev.reason&&ev.reason.stack)}
let v84LockTimer=null;
function resetLockTimerV84(){
  ensureV84();
  if(!state.session || !state.sessionConfig.enabled)return;
  clearTimeout(v84LockTimer);
  v84LockTimer=setTimeout(()=>lockSessionV84(), (state.sessionConfig.autoLockMinutes||15)*60*1000);
}
['click','keydown','mousemove','touchstart'].forEach(ev=>document.addEventListener(ev,resetLockTimerV84,{passive:true}));
function lockSessionV84(){
  if(!state.session)return;
  state.lockedSession=state.session;
  state.session=null;
  save();
  showLockScreenV84();
}
function showLockScreenV84(){
  document.body.innerHTML='<div id="root"></div>';
  document.getElementById('root').innerHTML=`<main class="login-page"><section class="login-box"><div class="login-hero"><h1>سامانه قفل شد</h1><p>به دلیل عدم فعالیت، نشست کاری قفل شده است. برای ادامه، رمز عبور ادمین را وارد کنید.</p><div class="hero-grid"><div class="hero-item"><b>امنیت اداری</b><span>قفل خودکار نشست</span></div><div class="hero-item"><b>حفاظت اطلاعات</b><span>جلوگیری از دسترسی غیرمجاز</span></div></div></div><div class="login-form"><div class="lock">🔒</div><h2>باز کردن قفل</h2><div class="field"><label>رمز عبور ادمین</label><input id="unlockPass" type="password" dir="ltr" onkeydown="if(event.key==='Enter')unlockV84()"></div><button class="primary" style="width:100%" onclick="unlockV84()">ادامه کار</button><button class="ghost" style="width:100%;margin-top:10px" onclick="loginPage()">بازگشت به ورود</button></div></section></main>`;
}
function unlockV84(){
  let p=document.getElementById('unlockPass').value;
  if(p===(state.settings.adminPass||'admin123')){
    state.session=state.lockedSession||{user:state.settings.adminUser||'admin',at:new Date().toLocaleString('fa-IR')};
    state.lockedSession=null;
    save();
    resetLockTimerV84();
    render('dashboard');
  }else alert('رمز عبور اشتباه است.');
}
function errorsPanelV84(){
  ensureV84();
  return `<div class="card"><h3>مرکز خطا و گزارش فنی</h3><div class="note info">اگر برنامه خطا بدهد، اینجا ثبت می‌شود. برای پشتیبانی می‌توانید لاگ خطا را دانلود کنید.</div><div class="actions"><button class="primary" onclick="downloadJSON('error_log_v84.json',state.errorLogs||[])">دانلود لاگ خطا</button><button class="ghost redBtn" onclick="clearErrorsV84()">پاک کردن لاگ خطا</button></div><div class="tablewrap" style="margin-top:12px"><table class="table"><tr><th>زمان</th><th>پیام خطا</th><th>منبع</th><th>خط</th></tr>${(state.errorLogs||[]).map(e=>`<tr><td>${esc(e.at)}</td><td>${esc(e.message)}</td><td>${esc(e.source)}</td><td>${esc(e.line)}</td></tr>`).join('')||'<tr><td colspan="4">خطایی ثبت نشده است.</td></tr>'}</table></div></div>`;
}
function clearErrorsV84(){if(confirm('لاگ خطا پاک شود؟')){state.errorLogs=[];save();render('errors')}}
function aboutV84(){
  ensureV84();
  return `<div class="card"><h3>درباره نرم‌افزار</h3><div class="grid2"><div class="note info"><b>نام سامانه</b><br>${esc(state.about.appName)}</div><div class="note info"><b>نسخه</b><br>${esc(state.about.version)}</div><div class="note info"><b>محدوده</b><br>${esc(state.about.area)}</div><div class="note info"><b>نوع نسخه</b><br>${esc(state.about.edition)}</div></div><div class="note ok">این نسخه برای تحویل پایدار آماده‌سازی شده و شامل قفل نشست، مرکز خطا، راهنما، بکاپ، گزارش‌گیری و کنترل مهاجرت داده است.</div></div>`;
}
function helpV84(){
  ensureV84();
  return `<div class="card"><h3>راهنمای داخلی سامانه</h3><div class="grid2">${state.helpTopics.map(h=>`<div class="note info"><b>${esc(h.title)}</b><br>${esc(h.body)}</div>`).join('')}</div></div>`;
}
function migrationV84(){
  ensureV84();
  return `<div class="card"><h3>مهاجرت نسخه‌ها و سلامت داده</h3><div class="note info">برای جلوگیری از پاک شدن اطلاعات در آپدیت‌های بعدی، ساختار داده بررسی و ثبت می‌شود.</div><div class="actions"><button class="primary" onclick="runMigrationV84()">اجرای بررسی سلامت داده</button><button class="ghost" onclick="downloadJSON('migration_report_v84.json',state.migrations||[])">دانلود گزارش مهاجرت</button></div><div class="tablewrap" style="margin-top:12px"><table class="table"><tr><th>زمان</th><th>شرح</th></tr>${(state.migrations||[]).map(m=>`<tr><td>${esc(m.at)}</td><td>${esc(m.desc)}</td></tr>`).join('')||'<tr><td colspan="2">گزارشی ثبت نشده است.</td></tr>'}</table></div></div>`;
}
function runMigrationV84(){
  ensureV84();
  let issues=[];
  ['orgs','reports','beneficiaries','imports','corrections','logs'].forEach(k=>{if(!Array.isArray(state[k])){state[k]=[];issues.push(k+' اصلاح شد')}});
  state.migrations.unshift({at:new Date().toLocaleString('fa-IR'),desc:issues.length?('اصلاح ساختار: '+issues.join('، ')):'ساختار داده سالم است.'});
  save();
  render('migration');
}
function finalChecklistV84(){
  ensureV84();
  let checks=[
    ['صفحه ورود فقط یوزر و پسورد دارد', true],
    ['تعاریف امضا فعال است', !!(state.settings&&state.settings.signers&&state.settings.signers.length)],
    ['گزارش‌گیری فعال است', typeof reports==='function'],
    ['ورود فایل کلاینت فعال است', typeof imp==='function'],
    ['بکاپ فعال است', typeof backup==='function'],
    ['مرکز خطا فعال است', true],
    ['قفل نشست فعال است', !!state.sessionConfig.enabled]
  ];
  return `<div class="card"><h3>چک‌لیست تحویل نهایی</h3><div class="tablewrap"><table class="table"><tr><th>مورد</th><th>وضعیت</th></tr>${checks.map(c=>`<tr><td>${esc(c[0])}</td><td>${c[1]?'<span class="badge b-ok">آماده</span>':'<span class="badge b-warn">نیازمند بررسی</span>'}</td></tr>`).join('')}</table></div></div>`;
}
/* ================= END V84 FINAL STABLE RELEASE PATCH ================= */

/* V88 startup delayed until all patches are loaded */

/* ================= V84 REPORTING FOCUS + ANNUAL AUDIT PATCH ================= */
const monthsV84=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
function normYearV84(y){return String(y||'').trim()||'۱۴۰۳'}
function selectedOrgOptionsV84(){return `<option value="">انتخاب کنید</option>${state.orgs.map(o=>`<option value="${o.id}">${esc(o.name)}</option>`).join('')}`}
function monthlyReportsV84(orgId,year){year=normYearV84(year);return monthsV84.map(m=>state.reports.find(r=>String(r.orgId)===String(orgId)&&String(r.year||'')===year&&String(r.month||'')===m)||null)}
function monthlyAuditV84(org,rep,month,year){
  if(!rep)return {status:'فاقد گزارش',cls:'b-bad',note:`برای ماه ${month} سال ${year} گزارشی ثبت نشده است.`};
  let income=num(rep.income), expense=num(rep.expense), ben=num(rep.beneficiaryPay), cur=num(rep.currentCost);
  if(expense>income)return {status:'دارای کسری',cls:'b-bad',note:`هزینه ${money(expense)} بیشتر از واریزی ${money(income)} است.`};
  if(!org.licenseNo||org.licenseStatus==='منقضی')return {status:'نیازمند بررسی مجوز',cls:'b-warn',note:'گزارش مالی ثبت شده اما وضعیت مجوز نیازمند بررسی است.'};
  if(org.licenseStatus==='نزدیک انقضا')return {status:'هشدار تمدید مجوز',cls:'b-warn',note:'مجوز نزدیک به انقضا است.'};
  if(rep.status==='دارای مغایرت')return {status:'دارای مغایرت',cls:'b-bad',note:rep.note||'گزارش دارای مغایرت ثبت شده است.'};
  return {status:'قابل قبول',cls:'b-ok',note:rep.note||'مورد بحرانی مشاهده نشد.'};
}
function annualRowsV84(org,year){
  let reps=monthlyReportsV84(org.id,year);
  return monthsV84.map((m,i)=>{
    let r=reps[i], a=monthlyAuditV84(org,r,m,year);
    let income=r?num(r.income):0, ben=r?num(r.beneficiaryPay):0, cur=r?num(r.currentCost):0, expense=r?num(r.expense):(ben+cur), balance=income-expense;
    return {month:m,rep:r,income,beneficiaryPay:ben,currentCost:cur,expense,balance,audit:a};
  });
}
function annualTotalsV84(rows){
  return rows.reduce((s,r)=>({income:s.income+r.income,beneficiaryPay:s.beneficiaryPay+r.beneficiaryPay,currentCost:s.currentCost+r.currentCost,expense:s.expense+r.expense,balance:s.balance+r.balance,missing:s.missing+(r.rep?0:1),issues:s.issues+(['قابل قبول'].includes(r.audit.status)?0:1)}),{income:0,beneficiaryPay:0,currentCost:0,expense:0,balance:0,missing:0,issues:0});
}
function annualReportDocV84(orgId,year){
  year=normYearV84(year);
  let org=state.orgs.find(o=>String(o.id)===String(orgId))||state.orgs[0];
  if(!org)return `<div class="note bad">ابتدا یک سمن ثبت کنید.</div>`;
  let rows=annualRowsV84(org,year), total=annualTotalsV84(rows);
  let finalStatus=total.missing?`ناقص: ${total.missing} ماه بدون گزارش`:total.issues?`نیازمند بررسی: ${total.issues} مورد حسابرسی`:'قابل تأیید';
  return `<div class="report" id="printArea"><div class="rhead"><h2>گزارش پایان سال سمن</h2><p>${esc(org.name)} | سال ${esc(year)} | وضعیت نهایی: ${esc(finalStatus)}</p></div>
  <div class="grid2"><div class="note info"><b>مشخصات سمن</b><br>شناسه ملی: ${esc(org.nationalId)}<br>شماره ثبت: ${esc(org.regNo)}<br>حوزه فعالیت: ${esc(org.activity)}</div><div class="note info"><b>مدیرعامل و مجوز</b><br>مدیرعامل: ${esc(org.ceo)}<br>کد ملی: ${esc(org.ceoNationalId)}<br>وضعیت مجوز: ${badge(org.licenseStatus)}<br>شماره مجوز: ${esc(org.licenseNo)}</div></div>
  <h3>حسابرسی ماهانه سال ${esc(year)}</h3>
  <div class="tablewrap"><table class="table"><tr><th>ماه</th><th>کل واریزی</th><th>پرداخت مددجو</th><th>هزینه جاری</th><th>جمع هزینه</th><th>مانده/کسری</th><th>وضعیت گزارش</th><th>نتیجه حسابرسی</th><th>توضیح حسابرسی</th></tr>${rows.map(r=>`<tr><td><b>${esc(r.month)}</b></td><td>${money(r.income)}</td><td>${money(r.beneficiaryPay)}</td><td>${money(r.currentCost)}</td><td>${money(r.expense)}</td><td>${money(r.balance)}</td><td>${r.rep?badge(r.rep.status||'ثبت شده'):badge('فاقد گزارش')}</td><td><span class="badge ${r.audit.cls}">${esc(r.audit.status)}</span></td><td>${esc(r.audit.note)}</td></tr>`).join('')}<tr><th>جمع سال</th><th>${money(total.income)}</th><th>${money(total.beneficiaryPay)}</th><th>${money(total.currentCost)}</th><th>${money(total.expense)}</th><th>${money(total.balance)}</th><th colspan="3">${esc(finalStatus)}</th></tr></table></div>
  <div class="note ${total.balance<0?'bad':total.issues?'warn':'ok'}"><b>جمع‌بندی حسابرسی پایان سال:</b> ${esc(finalStatus)}. مجموع واریزی ${money(total.income)}، مجموع هزینه ${money(total.expense)} و مانده/کسری نهایی ${money(total.balance)} است.</div>
  ${signs(org.ceo||'نام و نام خانوادگی مدیرعامل سمن')}</div>`;
}
function annualIndexV84(year){
  year=normYearV84(year);
  return `<div class="report" id="printArea"><div class="rhead"><h2>خلاصه گزارش پایان سال همه سمن‌ها</h2><p>سال ${esc(year)}</p></div><div class="tablewrap"><table class="table"><tr><th>سمن</th><th>مدیرعامل</th><th>مجوز</th><th>ماه‌های فاقد گزارش</th><th>موارد حسابرسی</th><th>کل واریزی</th><th>کل هزینه</th><th>مانده/کسری</th><th>وضعیت نهایی</th></tr>${state.orgs.map(o=>{let rows=annualRowsV84(o,year),t=annualTotalsV84(rows),st=t.missing?`ناقص: ${t.missing} ماه فاقد گزارش`:t.issues?`نیازمند بررسی: ${t.issues} مورد`:'قابل تأیید';return `<tr><td>${esc(o.name)}</td><td>${esc(o.ceo)}</td><td>${badge(o.licenseStatus)}</td><td>${t.missing}</td><td>${t.issues}</td><td>${money(t.income)}</td><td>${money(t.expense)}</td><td>${money(t.balance)}</td><td>${esc(st)}</td></tr>`}).join('')}</table></div>${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;
}
function annualReportPanelV84(){
  let defaultYear=(state.reports[0]&&state.reports[0].year)||'۱۴۰۳';
  return `<div class="card"><h3>گزارش پایان سال هر سمن</h3><div class="note info">در این گزارش، حسابرسی هر ماه در یک سطر نمایش داده می‌شود. برای هر سمن ۱۲ ردیف ماهانه ساخته می‌شود، حتی اگر بعضی ماه‌ها گزارش ثبت نشده باشد.</div><div class="grid3"><div class="field"><label>سمن</label><select id="annualOrg">${selectedOrgOptionsV84()}</select></div><div class="field"><label>سال</label><input id="annualYear" value="${esc(defaultYear)}"></div><div class="field"><label>نوع نمایش</label><select id="annualMode"><option value="one">یک سمن</option><option value="all">خلاصه همه سمن‌ها</option></select></div></div><div class="actions"><button class="primary" onclick="buildAnnualV84()">نمایش گزارش پایان سال</button><button class="ghost" onclick="downloadAnnualWordV84()">Word</button><button class="ghost" onclick="downloadAnnualCsvV84()">Excel/CSV</button><button class="ghost" onclick="window.print()">چاپ/PDF</button></div></div><div id="annualArea">${state.orgs[0]?annualReportDocV84(state.orgs[0].id,defaultYear):'<div class="note bad">سمنی ثبت نشده است.</div>'}</div>`;
}
function buildAnnualV84(){
  let mode=$('annualMode')?.value||'one', year=$('annualYear')?.value||'۱۴۰۳', org=$('annualOrg')?.value||state.orgs[0]?.id;
  $('annualArea').innerHTML=mode==='all'?annualIndexV84(year):annualReportDocV84(org,year);
}
function downloadAnnualWordV84(){downloadWord('گزارش پایان سال سمن',$('annualArea')?.innerHTML||annualIndexV84('۱۴۰۳'))}
function annualCSVV84(){
  let year=$('annualYear')?.value||'۱۴۰۳', mode=$('annualMode')?.value||'one', orgId=$('annualOrg')?.value||state.orgs[0]?.id;
  if(mode==='all')return ['سمن,مدیرعامل,ماه‌های فاقد گزارش,موارد حسابرسی,کل واریزی,کل هزینه,مانده/کسری'].concat(state.orgs.map(o=>{let t=annualTotalsV84(annualRowsV84(o,year));return [o.name,o.ceo,t.missing,t.issues,t.income,t.expense,t.balance].map(cell).join(',')})).join('\n');
  let org=state.orgs.find(o=>String(o.id)===String(orgId))||state.orgs[0], rows=annualRowsV84(org,year);
  return ['سمن,سال,ماه,کل واریزی,پرداخت مددجو,هزینه جاری,جمع هزینه,مانده/کسری,وضعیت گزارش,نتیجه حسابرسی,توضیح'].concat(rows.map(r=>[org.name,year,r.month,r.income,r.beneficiaryPay,r.currentCost,r.expense,r.balance,r.rep?(r.rep.status||'ثبت شده'):'فاقد گزارش',r.audit.status,r.audit.note].map(cell).join(','))).join('\n');
}
function downloadAnnualCsvV84(){downloadCSV('گزارش_پایان_سال_سمن.csv',annualCSVV84())}
function reports(){
  return `<div class="card"><h3>گزارش‌گیری کامل و پایان سال</h3><div class="note info">تمرکز این نسخه روی گزارش است: گزارش پایان سال هر سمن، حسابرسی ماهانه در یک سطر، گزارش جامع، مالی، مجوز، مددجو و فایل‌های واردشده.</div><div class="tabs"><button onclick="rpt('annual')">پایان سال هر سمن</button><button onclick="rpt('annualAll')">خلاصه پایان سال همه سمن‌ها</button><button onclick="rpt('full')">جامع</button><button onclick="rpt('lic')">مجوزها</button><button onclick="rpt('fin')">مالی</button><button onclick="rpt('aud')">حسابرسی</button><button onclick="rpt('ben')">مددجوها</button><button onclick="rpt('imp')">فایل‌های واردشده</button></div><div class="grid3"><div class="field"><label>سمن برای گزارش پایان سال</label><select id="reportOrg">${selectedOrgOptionsV84()}</select></div><div class="field"><label>سال</label><input id="reportYear" value="${esc((state.reports[0]&&state.reports[0].year)||'۱۴۰۳')}"></div><div class="field"><label>راهنما</label><input value="برای پایان سال، سمن و سال را انتخاب کنید" readonly></div></div><div class="actions"><button class="primary" onclick="downloadWordArea()">Word</button><button class="ghost" onclick="downloadCSV('گزارش.csv',csvCurrent())">Excel/CSV</button><button class="ghost" onclick="window.print()">چاپ/PDF</button></div></div><div id="rarea">${reportHtml('annual')}</div>`;
}
function rpt(t){rtype=t;$('rarea').innerHTML=reportHtml(t)}
function reportHtml(t){
  let y=$('reportYear')?.value||'۱۴۰۳', oid=$('reportOrg')?.value||state.orgs[0]?.id;
  if(t==='annual')return annualReportDocV84(oid,y);
  if(t==='annualAll')return annualIndexV84(y);
  if(t==='lic')return `<div class="report" id="printArea"><div class="rhead"><h2>گزارش مجوزها</h2></div><div class="tablewrap"><table class="table"><tr><th>سمن</th><th>شماره مجوز</th><th>وضعیت</th><th>شروع</th><th>پایان</th></tr>${state.orgs.map(o=>`<tr><td>${esc(o.name)}</td><td>${esc(o.licenseNo)}</td><td>${badge(o.licenseStatus)}</td><td>${esc(o.licenseStart||'')}</td><td>${esc(o.licenseEnd||'')}</td></tr>`).join('')}</table></div>${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;
  if(t==='fin')return `<div class="report" id="printArea"><div class="rhead"><h2>گزارش مالی</h2></div>${repsTable(state.reports)}${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;
  if(t==='aud')return `<div class="report" id="printArea"><div class="rhead"><h2>گزارش حسابرسی</h2><p>امتیاز سلامت: ${score()}٪</p></div>${audTable(state.auditFindings)}${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;
  if(t==='ben')return `<div class="report" id="printArea"><div class="rhead"><h2>گزارش مددجویان</h2></div>${benTable(state.beneficiaries)}${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;
  if(t==='imp')return `<div class="report" id="printArea"><div class="rhead"><h2>گزارش فایل‌های واردشده</h2></div><div class="tablewrap"><table class="table"><tr><th>کد رهگیری</th><th>سمن</th><th>تاریخ خروجی</th><th>تاریخ ورود</th><th>وضعیت</th><th>خلاصه</th></tr>${state.imports.map(i=>`<tr><td>${esc(i.trackingCode)}</td><td>${esc(i.orgName)}</td><td>${esc(i.exportedAt)}</td><td>${esc(i.importedAt)}</td><td>${badge(i.status)}</td><td>${esc(i.summary)}</td></tr>`).join('')||'<tr><td colspan="6">فایلی وارد نشده است.</td></tr>'}</table></div>${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;
  return `<div class="report" id="printArea"><div class="rhead"><h2>گزارش جامع سمن‌ها</h2></div><div class="tablewrap"><table class="table"><tr><th>نام سمن</th><th>شناسه ملی</th><th>شماره ثبت</th><th>مدیرعامل</th><th>مجوز</th><th>حساب</th></tr>${state.orgs.map(o=>`<tr><td>${esc(o.name)}</td><td>${esc(o.nationalId)}</td><td>${esc(o.regNo)}</td><td>${esc(o.ceo)}<br>${esc(o.ceoNationalId)}</td><td>${badge(o.licenseStatus)}<br>${esc(o.licenseNo)}</td><td>${esc(o.bank)}<br>${esc(o.sheba)}</td></tr>`).join('')}</table></div>${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;
}
function csvCurrent(){
  if(rtype==='annual'||rtype==='annualAll')return annualCSVV84();
  return rtype==='lic'?licenseCSV():rtype==='fin'?reportsCSV():rtype==='aud'?auditCSV():rtype==='ben'?benefCSV():rtype==='imp'?importsCSV():orgsCSV();
}
function word(){
  return `<div class="card"><h3>خروجی Word حرفه‌ای</h3><p>در این نسخه، گزارش پایان سال هر سمن به‌صورت رسمی و با حسابرسی ۱۲ ماهه اضافه شده است.</p><div class="quick"><button onclick="downloadWord('گزارش پایان سال سمن',annualReportDocV84(state.orgs[0]?.id,'۱۴۰۳'))">📅 گزارش پایان سال</button><button onclick="downloadWord('خلاصه پایان سال همه سمن‌ها',annualIndexV84('۱۴۰۳'))">📊 پایان سال همه سمن‌ها</button><button onclick="downloadWord('گزارش جامع',reportHtml('full'))">📑 گزارش جامع</button><button onclick="downloadWord('گزارش مجوزها',reportHtml('lic'))">📜 گزارش مجوزها</button><button onclick="downloadWord('گزارش مالی',reportHtml('fin'))">💰 گزارش مالی</button><button onclick="downloadWord('گزارش حسابرسی',reportHtml('aud'))">🧾 گزارش حسابرسی</button></div></div>`;
}
/* ================= END V84 REPORT PATCH ================= */


/* ================= V84 REPORTS + AUDIT + LICENSE IMAGE FIX ================= */
function runAudit(show=true){return auditRun(show)}
function ensureV84(){
  state.version='82';
  state.orgs=(state.orgs||[]).map(o=>{
    o.board=o.board||[];
    o.documents=o.documents||[];
    o.licenseImage=o.licenseImage||'';
    o.licenseImageName=o.licenseImageName||'';
    return o;
  });
  state.auditFindings=state.auditFindings||[];
  if(!state.auditFindings.length) auditRun(false);
}
function boardRowsV84(o){
  let members=(o.board||[]);
  if(!members.length && o.ceo) members=[{name:o.ceo,nationalId:o.ceoNationalId,role:'مدیرعامل'}];
  return members.map((m,i)=>`<tr><td>${i+1}</td><td>${esc(m.fullName||m.name||((m.firstName||'')+' '+(m.lastName||'')))}</td><td>${esc(m.nationalId||m.national_id||'')}</td><td>${esc(m.role||m.position||'عضو')}</td><td>${esc(m.mobile||m.phone||'')}</td></tr>`).join('')||'<tr><td colspan="5">عضوی ثبت نشده است.</td></tr>';
}
function boardTableV84(o){
  return `<div class="tablewrap"><table class="table"><tr><th>ردیف</th><th>نام و نام خانوادگی</th><th>کد ملی</th><th>سمت</th><th>تماس</th></tr>${boardRowsV84(o)}</table></div>`;
}
function licenseImageHtmlV84(o){
  return o.licenseImage
    ? `<div class="note info"><b>عکس مجوز:</b> ${esc(o.licenseImageName||'فایل مجوز')}<br><img src="${o.licenseImage}" style="max-width:100%;max-height:430px;border:1px solid #cbd5e1;border-radius:16px;margin-top:10px;background:white;padding:6px"></div>`
    : `<div class="note warn"><b>عکس مجوز ثبت نشده است.</b><br>از بخش «اطلاعات سمن‌ها» روی دکمه «مجوز/عکس» بزنید و تصویر مجوز را بارگذاری کنید.</div>`;
}
function licenseDetailsV84(o){
  return `<div class="grid2"><div class="note info"><b>اطلاعات مجوز</b><br>وضعیت: ${badge(o.licenseStatus)}<br>شماره مجوز: ${esc(o.licenseNo||'')}<br>شروع: ${esc(o.licenseStart||'')}<br>پایان: ${esc(o.licenseEnd||'')}<br>پیوست/توضیح: ${esc(o.licenseFile||'')}</div><div>${licenseImageHtmlV84(o)}</div></div>`;
}
function editLicenseV84(id){
  let o=state.orgs.find(x=>x.id===id); if(!o)return;
  let wrap=$('orgReport')||$('rarea')||document.body;
  wrap.innerHTML=`<div class="card"><h3>ثبت/ویرایش مجوز و عکس مجوز</h3><div class="note info">سمن: <b>${esc(o.name)}</b></div><div class="grid3"><div class="field"><label>وضعیت مجوز</label><select id="licStatus"><option ${o.licenseStatus==='معتبر'?'selected':''}>معتبر</option><option ${o.licenseStatus==='نزدیک انقضا'?'selected':''}>نزدیک انقضا</option><option ${o.licenseStatus==='منقضی'?'selected':''}>منقضی</option><option ${o.licenseStatus==='در انتظار بررسی'?'selected':''}>در انتظار بررسی</option></select></div><div class="field"><label>شماره مجوز</label><input id="licNo" value="${esc(o.licenseNo||'')}"></div><div class="field"><label>تاریخ شروع</label><input id="licStart" value="${esc(o.licenseStart||'')}"></div><div class="field"><label>تاریخ پایان</label><input id="licEnd" value="${esc(o.licenseEnd||'')}"></div><div class="field"><label>توضیح/نام فایل</label><input id="licFile" value="${esc(o.licenseFile||'')}"></div><div class="field"><label>انتخاب عکس مجوز</label><input type="file" id="licImage" accept="image/*,.png,.jpg,.jpeg,.webp"></div></div><div class="actions"><button class="primary" onclick="saveLicenseV84('${id}')">ذخیره مجوز</button><button class="ghost" onclick="viewOrg('${id}')">بازگشت به پرونده</button></div><div style="margin-top:14px">${licenseImageHtmlV84(o)}</div></div>`;
}
function saveLicenseV84(id){
  let o=state.orgs.find(x=>x.id===id); if(!o)return;
  o.licenseStatus=$('licStatus').value;
  o.licenseNo=$('licNo').value;
  o.licenseStart=$('licStart').value;
  o.licenseEnd=$('licEnd').value;
  o.licenseFile=$('licFile').value;
  let f=$('licImage').files[0];
  function done(){save();auditRun(false);alert('مجوز ذخیره شد.');viewOrg(id)}
  if(f){
    let r=new FileReader();
    r.onload=()=>{o.licenseImage=r.result;o.licenseImageName=f.name;done()};
    r.readAsDataURL(f);
  }else done();
}
function orgs(){
  ensureV84();
  return `<div class="actions"><button class="ghost" onclick="downloadCSV('گزارش_کامل_سمن‌ها.csv',orgsCSV())">Excel/CSV</button><button class="ghost" onclick="window.print()">چاپ</button></div><div class="card"><h3>اطلاعات کامل سمن‌ها، مجوزها، حساب‌ها و هیأت مدیره</h3><div class="tablewrap"><table class="table"><tr><th>نام سمن</th><th>شناسه ملی</th><th>شماره ثبت</th><th>حوزه</th><th>مدیرعامل</th><th>کد ملی مدیرعامل</th><th>مجوز</th><th>عکس مجوز</th><th>بانک/شبا</th><th>تعداد اعضا</th><th>عملیات</th></tr>${state.orgs.map(o=>`<tr><td><b>${esc(o.name)}</b><br><small>${esc(o.address)}</small></td><td>${esc(o.nationalId)}</td><td>${esc(o.regNo)}</td><td>${esc(o.activity)}</td><td>${esc(o.ceo)}</td><td>${esc(o.ceoNationalId)}</td><td>${badge(o.licenseStatus)}<br>${esc(o.licenseNo||'')}</td><td>${o.licenseImage?'<span class="badge b-ok">قابل مشاهده</span>':'<span class="badge b-warn">ثبت نشده</span>'}</td><td>${esc(o.bank)}<br><small class="ltr">${esc(o.sheba)}</small></td><td>${(o.board||[]).length}</td><td><button class="ghost" onclick="viewOrg('${o.id}')">پرونده کامل</button><button class="ghost" onclick="editLicenseV84('${o.id}')">مجوز/عکس</button></td></tr>`).join('')}</table></div></div><div id="orgReport"></div>`;
}
function viewOrg(id){
  ensureV84();
  let o=state.orgs.find(x=>x.id===id),rs=state.reports.filter(r=>r.orgId===id),bs=state.beneficiaries.filter(b=>b.orgId===id),as=state.auditFindings.filter(a=>a.orgId===id);
  if(!o)return;
  $('orgReport').innerHTML=`<div class="report" id="printArea"><div class="rhead"><h2>پرونده کامل سمن</h2><p>${esc(o.name)} | شناسه ملی: ${esc(o.nationalId)} | شماره ثبت: ${esc(o.regNo)}</p></div><div class="grid2"><div><h3>مشخصات ثبتی</h3><p><b>حوزه:</b> ${esc(o.activity)}</p><p><b>وضعیت:</b> ${badge(o.status)}</p><p><b>آدرس:</b> ${esc(o.address)}</p><p><b>تماس:</b> ${esc(o.phone||'')}</p></div><div><h3>مدیرعامل</h3><p><b>نام:</b> ${esc(o.ceo)}</p><p><b>کد ملی:</b> ${esc(o.ceoNationalId)}</p></div></div><h3>مجوز و تصویر مجوز</h3>${licenseDetailsV84(o)}<h3>اطلاعات کامل هیأت مدیره</h3>${boardTableV84(o)}<h3>گزارش‌های مالی</h3>${repsTable(rs)}<h3>مددجوها</h3>${benTable(bs)}<h3>حسابرسی‌ها</h3>${audTable(as)}${signs(o.ceo)}</div>`;
}
function fullProfileReportV84(orgId){
  ensureV84();
  let orgs=orgId?[state.orgs.find(o=>o.id===orgId)].filter(Boolean):state.orgs;
  return `<div class="report" id="printArea"><div class="rhead"><h2>گزارش کامل پرونده سمن‌ها</h2><p>شامل تصویر مجوز، اطلاعات کامل هیأت مدیره، مشخصات ثبتی و حسابرسی</p></div>${orgs.map(o=>`<div style="page-break-after:always"><h2>${esc(o.name)}</h2><div class="grid2"><div class="note info"><b>مشخصات ثبتی</b><br>شناسه ملی: ${esc(o.nationalId)}<br>شماره ثبت: ${esc(o.regNo)}<br>حوزه: ${esc(o.activity)}<br>آدرس: ${esc(o.address)}<br>تماس: ${esc(o.phone||'')}</div><div class="note info"><b>مدیرعامل</b><br>نام: ${esc(o.ceo)}<br>کد ملی: ${esc(o.ceoNationalId)}</div></div><h3>مجوز و عکس مجوز</h3>${licenseDetailsV84(o)}<h3>هیأت مدیره</h3>${boardTableV84(o)}<h3>حسابرسی‌های مرتبط</h3>${audTable(state.auditFindings.filter(a=>a.orgId===o.id))}</div>`).join('')}${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;
}
function annualReportDocV84(orgId,year){
  year=normYearV81(year);
  let org=state.orgs.find(o=>String(o.id)===String(orgId))||state.orgs[0];
  if(!org)return `<div class="note bad">ابتدا یک سمن ثبت کنید.</div>`;
  let rows=annualRowsV81(org,year), total=annualTotalsV81(rows);
  let finalStatus=total.missing?`ناقص: ${total.missing} ماه بدون گزارش`:total.issues?`نیازمند بررسی: ${total.issues} مورد حسابرسی`:'قابل تأیید';
  return `<div class="report" id="printArea"><div class="rhead"><h2>گزارش پایان سال سمن</h2><p>${esc(org.name)} | سال ${esc(year)} | وضعیت نهایی: ${esc(finalStatus)}</p></div><div class="grid2"><div class="note info"><b>مشخصات سمن</b><br>شناسه ملی: ${esc(org.nationalId)}<br>شماره ثبت: ${esc(org.regNo)}<br>حوزه فعالیت: ${esc(org.activity)}<br>مدیرعامل: ${esc(org.ceo)}<br>کد ملی مدیرعامل: ${esc(org.ceoNationalId)}</div><div class="note info"><b>خلاصه مجوز</b><br>وضعیت مجوز: ${badge(org.licenseStatus)}<br>شماره مجوز: ${esc(org.licenseNo)}<br>عکس مجوز: ${org.licenseImage?'ثبت شده و قابل مشاهده':'ثبت نشده'}</div></div><h3>عکس مجوز</h3>${licenseImageHtmlV84(org)}<h3>اطلاعات کامل هیأت مدیره</h3>${boardTableV84(org)}<h3>حسابرسی ماهانه سال ${esc(year)}</h3><div class="tablewrap"><table class="table"><tr><th>ماه</th><th>کل واریزی</th><th>پرداخت مددجو</th><th>هزینه جاری</th><th>جمع هزینه</th><th>مانده/کسری</th><th>وضعیت گزارش</th><th>نتیجه حسابرسی</th><th>توضیح حسابرسی</th></tr>${rows.map(r=>`<tr><td><b>${esc(r.month)}</b></td><td>${money(r.income)}</td><td>${money(r.beneficiaryPay)}</td><td>${money(r.currentCost)}</td><td>${money(r.expense)}</td><td>${money(r.balance)}</td><td>${r.rep?badge(r.rep.status||'ثبت شده'):badge('فاقد گزارش')}</td><td><span class="badge ${r.audit.cls}">${esc(r.audit.status)}</span></td><td>${esc(r.audit.note)}</td></tr>`).join('')}<tr><th>جمع سال</th><th>${money(total.income)}</th><th>${money(total.beneficiaryPay)}</th><th>${money(total.currentCost)}</th><th>${money(total.expense)}</th><th>${money(total.balance)}</th><th colspan="3">${esc(finalStatus)}</th></tr></table></div><div class="note ${total.balance<0?'bad':total.issues?'warn':'ok'}"><b>جمع‌بندی حسابرسی پایان سال:</b> ${esc(finalStatus)}. مجموع واریزی ${money(total.income)}، مجموع هزینه ${money(total.expense)} و مانده/کسری نهایی ${money(total.balance)} است.</div>${signs(org.ceo||'نام و نام خانوادگی مدیرعامل سمن')}</div>`;
}
function annualReportPanelV81(){
  let defaultYear=(state.reports[0]&&state.reports[0].year)||'۱۴۰۳';
  return `<div class="card"><h3>گزارش پایان سال هر سمن</h3><div class="note info">در این نسخه، تصویر مجوز و اطلاعات کامل هیأت مدیره هم داخل گزارش پایان سال نمایش داده می‌شود.</div><div class="grid3"><div class="field"><label>سمن</label><select id="annualOrg">${selectedOrgOptionsV81()}</select></div><div class="field"><label>سال</label><input id="annualYear" value="${esc(defaultYear)}"></div><div class="field"><label>نوع نمایش</label><select id="annualMode"><option value="one">یک سمن</option><option value="all">خلاصه همه سمن‌ها</option></select></div></div><div class="actions"><button class="primary" onclick="buildAnnualV81()">نمایش گزارش پایان سال</button><button class="ghost" onclick="downloadAnnualWordV81()">Word</button><button class="ghost" onclick="downloadAnnualCsvV81()">Excel/CSV</button><button class="ghost" onclick="window.print()">چاپ/PDF</button></div></div><div id="annualArea">${state.orgs[0]?annualReportDocV84(state.orgs[0].id,defaultYear):'<div class="note bad">سمنی ثبت نشده است.</div>'}</div>`;
}
function buildAnnualV81(){
  let mode=$('annualMode')?.value||'one', year=$('annualYear')?.value||'۱۴۰۳', org=$('annualOrg')?.value||state.orgs[0]?.id;
  $('annualArea').innerHTML=mode==='all'?annualIndexV81(year):annualReportDocV84(org,year);
}
function downloadAnnualWordV81(){downloadWord('گزارش پایان سال سمن',$('annualArea')?.innerHTML||annualReportDocV84(state.orgs[0]?.id,'۱۴۰۳'))}
function reports(){
  ensureV84();
  return `<div class="card"><h3>گزارش‌گیری کامل اصلاح‌شده</h3><div class="note info">گزارش «پرونده کامل» شامل عکس مجوز قابل مشاهده و اطلاعات کامل هیأت مدیره است. گزارش پایان سال هم حسابرسی ماهانه را در ۱۲ سطر نمایش می‌دهد.</div><div class="tabs"><button onclick="rpt('profile')">پرونده کامل + مجوز + هیأت مدیره</button><button onclick="rpt('annual')">پایان سال هر سمن</button><button onclick="rpt('annualAll')">خلاصه پایان سال همه سمن‌ها</button><button onclick="rpt('full')">جامع</button><button onclick="rpt('lic')">مجوزها</button><button onclick="rpt('fin')">مالی</button><button onclick="rpt('aud')">حسابرسی</button><button onclick="rpt('ben')">مددجوها</button><button onclick="rpt('imp')">فایل‌های واردشده</button></div><div class="grid3"><div class="field"><label>سمن</label><select id="reportOrg">${selectedOrgOptionsV81()}</select></div><div class="field"><label>سال</label><input id="reportYear" value="${esc((state.reports[0]&&state.reports[0].year)||'۱۴۰۳')}"></div><div class="field"><label>راهنما</label><input value="برای پرونده کامل یا پایان سال، سمن را انتخاب کنید" readonly></div></div><div class="actions"><button class="primary" onclick="downloadWordArea()">Word</button><button class="ghost" onclick="downloadCSV('گزارش.csv',csvCurrent())">Excel/CSV</button><button class="ghost" onclick="window.print()">چاپ/PDF</button></div></div><div id="rarea">${reportHtml('profile')}</div>`;
}
function reportHtml(t){
  let y=$('reportYear')?.value||'۱۴۰۳', oid=$('reportOrg')?.value||state.orgs[0]?.id;
  if(t==='profile')return fullProfileReportV84(oid);
  if(t==='annual')return annualReportDocV84(oid,y);
  if(t==='annualAll')return annualIndexV81(y);
  if(t==='lic')return `<div class="report" id="printArea"><div class="rhead"><h2>گزارش مجوزها و تصاویر مجوز</h2></div>${state.orgs.map(o=>`<div style="page-break-after:always"><h3>${esc(o.name)}</h3>${licenseDetailsV84(o)}<h3>هیأت مدیره</h3>${boardTableV84(o)}</div>`).join('')}${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;
  if(t==='fin')return `<div class="report" id="printArea"><div class="rhead"><h2>گزارش مالی</h2></div>${repsTable(state.reports)}${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;
  if(t==='aud')return `<div class="report" id="printArea"><div class="rhead"><h2>گزارش حسابرسی</h2><p>امتیاز سلامت: ${score()}٪</p></div>${audTable(state.auditFindings)}${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;
  if(t==='ben')return `<div class="report" id="printArea"><div class="rhead"><h2>گزارش مددجویان</h2></div>${benTable(state.beneficiaries)}${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;
  if(t==='imp')return `<div class="report" id="printArea"><div class="rhead"><h2>گزارش فایل‌های واردشده</h2></div><div class="tablewrap"><table class="table"><tr><th>کد رهگیری</th><th>سمن</th><th>تاریخ خروجی</th><th>تاریخ ورود</th><th>وضعیت</th><th>خلاصه</th></tr>${state.imports.map(i=>`<tr><td>${esc(i.trackingCode)}</td><td>${esc(i.orgName)}</td><td>${esc(i.exportedAt)}</td><td>${esc(i.importedAt)}</td><td>${badge(i.status)}</td><td>${esc(i.summary)}</td></tr>`).join('')||'<tr><td colspan="6">فایلی وارد نشده است.</td></tr>'}</table></div>${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;
  return `<div class="report" id="printArea"><div class="rhead"><h2>گزارش جامع سمن‌ها</h2></div><div class="tablewrap"><table class="table"><tr><th>نام سمن</th><th>شناسه ملی</th><th>شماره ثبت</th><th>مدیرعامل</th><th>مجوز</th><th>عکس مجوز</th><th>تعداد اعضای هیأت مدیره</th></tr>${state.orgs.map(o=>`<tr><td>${esc(o.name)}</td><td>${esc(o.nationalId)}</td><td>${esc(o.regNo)}</td><td>${esc(o.ceo)}<br>${esc(o.ceoNationalId)}</td><td>${badge(o.licenseStatus)}<br>${esc(o.licenseNo)}</td><td>${o.licenseImage?'قابل مشاهده':'ثبت نشده'}</td><td>${(o.board||[]).length}</td></tr>`).join('')}</table></div>${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;
}
function csvCurrent(){
  if(rtype==='annual'||rtype==='annualAll')return annualCSVV81();
  if(rtype==='profile')return ['سمن,شناسه ملی,شماره ثبت,مدیرعامل,کد ملی مدیرعامل,وضعیت مجوز,شماره مجوز,عکس مجوز,تعداد اعضای هیأت مدیره'].concat(state.orgs.map(o=>[o.name,o.nationalId,o.regNo,o.ceo,o.ceoNationalId,o.licenseStatus,o.licenseNo,o.licenseImage?'دارد':'ندارد',(o.board||[]).length].map(cell).join(','))).join('\n');
  return rtype==='lic'?licenseCSV():rtype==='fin'?reportsCSV():rtype==='aud'?auditCSV():rtype==='ben'?benefCSV():rtype==='imp'?importsCSV():orgsCSV();
}
function audTable(as){
  return `<div class="tablewrap"><table class="table"><tr><th>سمن</th><th>نوع</th><th>شدت</th><th>توضیح</th><th>وضعیت</th><th>عملیات</th></tr>${as.map(a=>`<tr><td>${esc(a.orgName)}</td><td>${esc(a.type)}</td><td>${esc(a.severity)}</td><td>${esc(a.desc)}</td><td>${badge(a.status)}</td><td><button class="ghost" onclick="auditActionV84('${a.id}','fix')">اصلاح</button><button class="ghost" onclick="auditActionV84('${a.id}','approve')">تأیید</button><button class="ghost" onclick="auditActionV84('${a.id}','reject')">رد</button></td></tr>`).join('')||'<tr><td colspan="6">یافته‌ای ندارد.</td></tr>'}</table></div>`;
}
function auditActionV84(id,act){
  let a=state.auditFindings.find(x=>x.id===id); if(!a)return;
  if(act==='fix'){
    a.status='نیازمند اصلاح';
    state.corrections=state.corrections||[];
    state.corrections.unshift({id:uid('corr'),orgId:a.orgId,orgName:a.orgName,title:'اصلاح مورد حسابرسی: '+a.type,desc:a.desc,deadline:'',status:'باز',createdAt:today()});
  }
  if(act==='approve')a.status='تأیید شده';
  if(act==='reject')a.status='رد شده';
  save();
  render('audit');
}
function audit(){
  ensureV84();
  return `<div class="actions"><button class="primary" onclick="auditRun(true)">اجرای حسابرسی مجدد</button><button class="ghost" onclick="downloadCSV('گزارش_حسابرسی.csv',auditCSV())">Excel/CSV</button></div><div class="card"><h3>حسابرسی هوشمند با عملیات اصلاح / تأیید / رد</h3><div class="note info">برای هر مورد حسابرسی می‌توانید درخواست اصلاح بسازید، مورد را تأیید کنید یا رد کنید.</div><div class="auditScore"><span style="width:${score()}%"></span></div><div class="note info">امتیاز سلامت پرونده‌ها: ${score()}٪</div>${audTable(state.auditFindings)}</div>`;
}
function word(){
  return `<div class="card"><h3>خروجی Word حرفه‌ای</h3><p>گزارش پرونده کامل، تصویر مجوز، هیأت مدیره و حسابرسی قابل خروجی Word هستند.</p><div class="quick"><button onclick="downloadWord('پرونده کامل سمن',fullProfileReportV84(state.orgs[0]?.id))">🗂 پرونده کامل + عکس مجوز</button><button onclick="downloadWord('گزارش پایان سال سمن',annualReportDocV84(state.orgs[0]?.id,'۱۴۰۳'))">📅 گزارش پایان سال</button><button onclick="downloadWord('خلاصه پایان سال همه سمن‌ها',annualIndexV81('۱۴۰۳'))">📊 پایان سال همه سمن‌ها</button><button onclick="downloadWord('گزارش مجوزها',reportHtml('lic'))">📜 گزارش مجوزها</button><button onclick="downloadWord('گزارش مالی',reportHtml('fin'))">💰 گزارش مالی</button><button onclick="downloadWord('گزارش حسابرسی',reportHtml('aud'))">🧾 گزارش حسابرسی</button></div></div>`;
}
ensureV84();
/* ================= END V84 REPORTS + AUDIT + LICENSE IMAGE FIX ================= */


/* ================= V84 COMPREHENSIVE REPORTING + PDF A4 LANDSCAPE FIX ================= */
function ensureV84(){
  state.version='83';
  state.orgs=(state.orgs||[]).map(o=>{
    o.board=o.board||[];
    o.documents=o.documents||[];
    o.licenseImage=o.licenseImage||'';
    o.licenseImageName=o.licenseImageName||'';
    return o;
  });
  state.auditFindings=state.auditFindings||[];
}
function v84ReportNo(prefix='JVN-NGO-REP'){
  let d=new Date();
  return prefix+'-'+d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')+'-'+String(d.getHours()).padStart(2,'0')+String(d.getMinutes()).padStart(2,'0');
}
function v84SelectedOrgId(){
  let el=$('v84Org')||$('reportOrg')||$('annualOrg');
  return el?.value || state.orgs[0]?.id || '';
}
function v84SelectedYear(){
  return ($('v84Year')?.value || $('reportYear')?.value || $('annualYear')?.value || (state.reports[0]&&state.reports[0].year) || '۱۴۰۳').trim();
}
function v84OrgOptions(){
  return `<option value="all">همه سمن‌ها</option>`+state.orgs.map(o=>`<option value="${o.id}">${esc(o.name)}</option>`).join('');
}
function v84OrgById(id){
  if(id==='all')return null;
  return state.orgs.find(o=>String(o.id)===String(id))||state.orgs[0]||null;
}
function v84ReportHeader(title,sub=''){
  return `<div class="rhead"><h2>${esc(title)}</h2><p>${esc(sub)} | شماره گزارش: ${v84ReportNo()} | تاریخ: ${today()}</p></div>`;
}
function v84Meta(org,year,type){
  return `<div class="v84-report-meta"><div><b>نوع گزارش:</b><br>${esc(type)}</div><div><b>سال:</b><br>${esc(year||'-')}</div><div><b>سمن:</b><br>${esc(org?org.name:'همه سمن‌ها')}</div><div><b>وضعیت مجوز:</b><br>${org?badge(org.licenseStatus):'گزارش تجمیعی'}</div></div>`;
}
function v84BoardRows(org){
  let members=(org?.board||[]);
  if(!members.length && org?.ceo) members=[{name:org.ceo,nationalId:org.ceoNationalId,role:'مدیرعامل',mobile:org.phone||''}];
  return members.map((m,i)=>`<tr><td>${i+1}</td><td>${esc(m.fullName||m.name||((m.firstName||'')+' '+(m.lastName||'')))}</td><td>${esc(m.nationalId||m.national_id||'')}</td><td>${esc(m.role||m.position||'عضو')}</td><td>${esc(m.mobile||m.phone||'')}</td><td>${esc(m.education||m.degree||'')}</td></tr>`).join('')||'<tr><td colspan="6">عضوی ثبت نشده است.</td></tr>';
}
function v84BoardTable(org){
  return `<div class="tablewrap"><table class="table"><tr><th>ردیف</th><th>نام و نام خانوادگی</th><th>کد ملی</th><th>سمت</th><th>تماس</th><th>تحصیلات</th></tr>${v84BoardRows(org)}</table></div>`;
}
function v84LicenseImage(org){
  return org?.licenseImage
    ? `<div class="note info"><b>عکس مجوز:</b> ${esc(org.licenseImageName||'فایل مجوز')}<br><img class="v84-license-img" src="${org.licenseImage}"></div>`
    : `<div class="note warn"><b>عکس مجوز ثبت نشده است.</b><br>برای نمایش در PDF، از بخش اطلاعات سمن‌ها گزینه «مجوز/عکس» را بزنید و تصویر را وارد کنید.</div>`;
}
function v84LicenseBlock(org){
  return `<div class="grid2"><div class="note info"><b>اطلاعات مجوز</b><br>وضعیت: ${badge(org?.licenseStatus||'ثبت نشده')}<br>شماره مجوز: ${esc(org?.licenseNo||'')}<br>شروع اعتبار: ${esc(org?.licenseStart||'')}<br>پایان اعتبار: ${esc(org?.licenseEnd||'')}<br>توضیح/پیوست: ${esc(org?.licenseFile||'')}</div><div>${v84LicenseImage(org)}</div></div>`;
}
function v84ProfileReport(orgId){
  let orgs=orgId==='all'?state.orgs:[v84OrgById(orgId)].filter(Boolean);
  return `<div class="report print-area" id="printArea">${v84ReportHeader('گزارش پرونده کامل سمن‌ها','شامل مجوز، تصویر مجوز، هیأت مدیره، مالی و حسابرسی')}${orgs.map(org=>`<section class="report-page"><h3>${esc(org.name)}</h3>${v84Meta(org,'-', 'پرونده کامل')}<div class="grid2"><div class="note info"><b>مشخصات ثبتی</b><br>شناسه ملی: ${esc(org.nationalId)}<br>شماره ثبت: ${esc(org.regNo)}<br>حوزه فعالیت: ${esc(org.activity)}<br>وضعیت پرونده: ${esc(org.status||'')}<br>آدرس: ${esc(org.address)}<br>تماس: ${esc(org.phone||'')}</div><div class="note info"><b>مدیرعامل</b><br>نام و نام خانوادگی: ${esc(org.ceo)}<br>کد ملی: ${esc(org.ceoNationalId)}<br>بانک: ${esc(org.bank||'')}<br>حساب: ${esc(org.accountNo||'')}<br>شبا: <span class="ltr">${esc(org.sheba||'')}</span></div></div><h3>مجوز و تصویر مجوز</h3>${v84LicenseBlock(org)}<h3>اطلاعات کامل هیأت مدیره</h3>${v84BoardTable(org)}<h3>گزارش‌های مالی ثبت‌شده</h3>${repsTable(state.reports.filter(r=>r.orgId===org.id))}<h3>حسابرسی‌های مرتبط</h3>${audTable(state.auditFindings.filter(a=>a.orgId===org.id))}${signs(org.ceo)}</section>`).join('')}</div>`;
}
function v84AnnualRows(org,year){
  year=(year||'۱۴۰۳').trim();
  return monthsV81.map(m=>{
    let r=state.reports.find(x=>String(x.orgId)===String(org.id)&&String(x.year||'')===year&&String(x.month||'')===m)||null;
    let audit=monthlyAuditV81(org,r,m,year);
    let income=r?num(r.income):0, beneficiaryPay=r?num(r.beneficiaryPay):0, currentCost=r?num(r.currentCost):0, expense=r?num(r.expense):(beneficiaryPay+currentCost), balance=income-expense;
    return {month:m,rep:r,income,beneficiaryPay,currentCost,expense,balance,audit};
  });
}
function v84AnnualTotals(rows){
  return rows.reduce((s,r)=>({income:s.income+r.income,beneficiaryPay:s.beneficiaryPay+r.beneficiaryPay,currentCost:s.currentCost+r.currentCost,expense:s.expense+r.expense,balance:s.balance+r.balance,missing:s.missing+(r.rep?0:1),issues:s.issues+(r.audit.status==='قابل قبول'?0:1)}),{income:0,beneficiaryPay:0,currentCost:0,expense:0,balance:0,missing:0,issues:0});
}
function v84AnnualOne(org,year){
  let rows=v84AnnualRows(org,year), total=v84AnnualTotals(rows);
  let finalStatus=total.missing?`ناقص: ${total.missing} ماه بدون گزارش`:total.issues?`نیازمند بررسی: ${total.issues} مورد حسابرسی`:'قابل تأیید';
  return `<section class="report-page">${v84ReportHeader('گزارش سالیانه سمن در کاغذ A4 عرضی',`${org.name} | سال ${year}`)}${v84Meta(org,year,'گزارش سالیانه')}<div class="grid2"><div class="note info"><b>مشخصات سمن</b><br>شناسه ملی: ${esc(org.nationalId)}<br>شماره ثبت: ${esc(org.regNo)}<br>حوزه فعالیت: ${esc(org.activity)}<br>مدیرعامل: ${esc(org.ceo)}<br>کد ملی مدیرعامل: ${esc(org.ceoNationalId)}</div><div class="note info"><b>خلاصه مجوز</b><br>وضعیت: ${badge(org.licenseStatus)}<br>شماره: ${esc(org.licenseNo)}<br>پایان اعتبار: ${esc(org.licenseEnd||'')}<br>عکس مجوز: ${org.licenseImage?'ثبت شده و قابل مشاهده':'ثبت نشده'}</div></div><h3>تصویر مجوز</h3>${v84LicenseImage(org)}<h3>هیأت مدیره</h3>${v84BoardTable(org)}<h3>حسابرسی ماهانه سال ${esc(year)}</h3><div class="tablewrap"><table class="table"><tr><th>ماه</th><th>کل واریزی</th><th>پرداخت مددجو</th><th>هزینه جاری</th><th>جمع هزینه</th><th>مانده/کسری</th><th>وضعیت گزارش</th><th>نتیجه حسابرسی</th><th>توضیح حسابرسی</th></tr>${rows.map(r=>`<tr><td><b>${esc(r.month)}</b></td><td>${money(r.income)}</td><td>${money(r.beneficiaryPay)}</td><td>${money(r.currentCost)}</td><td>${money(r.expense)}</td><td>${money(r.balance)}</td><td>${r.rep?badge(r.rep.status||'ثبت شده'):badge('فاقد گزارش')}</td><td><span class="badge ${r.audit.cls}">${esc(r.audit.status)}</span></td><td>${esc(r.audit.note)}</td></tr>`).join('')}<tr><th>جمع سال</th><th>${money(total.income)}</th><th>${money(total.beneficiaryPay)}</th><th>${money(total.currentCost)}</th><th>${money(total.expense)}</th><th>${money(total.balance)}</th><th colspan="3">${esc(finalStatus)}</th></tr></table></div><div class="note ${total.balance<0?'bad':total.issues?'warn':'ok'}"><b>جمع‌بندی حسابرسی پایان سال:</b> ${esc(finalStatus)}. مجموع واریزی ${money(total.income)}، مجموع هزینه ${money(total.expense)} و مانده/کسری نهایی ${money(total.balance)} است.</div>${signs(org.ceo)}</section>`;
}
function v84AnnualReport(orgId,year){
  let orgs=orgId==='all'?state.orgs:[v84OrgById(orgId)].filter(Boolean);
  return `<div class="report print-area v84-landscape" id="printArea">${orgs.map(o=>v84AnnualOne(o,year)).join('')}</div>`;
}
function v84AnnualSummary(year){
  return `<div class="report print-area v84-landscape" id="printArea">${v84ReportHeader('خلاصه گزارش سالیانه همه سمن‌ها',`سال ${year} | A4 عرضی`)}<div class="tablewrap"><table class="table"><tr><th>سمن</th><th>مدیرعامل</th><th>وضعیت مجوز</th><th>عکس مجوز</th><th>تعداد اعضای هیأت مدیره</th><th>ماه‌های فاقد گزارش</th><th>موارد حسابرسی</th><th>کل واریزی</th><th>کل هزینه</th><th>مانده/کسری</th><th>وضعیت نهایی</th></tr>${state.orgs.map(org=>{let rows=v84AnnualRows(org,year),t=v84AnnualTotals(rows),st=t.missing?`ناقص: ${t.missing} ماه`:t.issues?`نیازمند بررسی: ${t.issues} مورد`:'قابل تأیید';return `<tr><td>${esc(org.name)}</td><td>${esc(org.ceo)}</td><td>${badge(org.licenseStatus)}</td><td>${org.licenseImage?'دارد':'ندارد'}</td><td>${(org.board||[]).length}</td><td>${t.missing}</td><td>${t.issues}</td><td>${money(t.income)}</td><td>${money(t.expense)}</td><td>${money(t.balance)}</td><td>${esc(st)}</td></tr>`}).join('')}</table></div>${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;
}
function v84LicenseReport(orgId){
  let orgs=orgId==='all'?state.orgs:[v84OrgById(orgId)].filter(Boolean);
  return `<div class="report print-area" id="printArea">${v84ReportHeader('گزارش جامع مجوزها و تصاویر مجوز','قابل چاپ/PDF')}${orgs.map(org=>`<section class="report-page"><h3>${esc(org.name)}</h3>${v84Meta(org,'-', 'مجوزها')}${v84LicenseBlock(org)}<h3>هیأت مدیره مرتبط</h3>${v84BoardTable(org)}${signs(org.ceo)}</section>`).join('')}</div>`;
}
function v84FinancialReport(orgId,year){
  let reps=state.reports.filter(r=>(orgId==='all'||String(r.orgId)===String(orgId))&&(!year||String(r.year||'')===String(year)));
  return `<div class="report print-area" id="printArea">${v84ReportHeader('گزارش مالی جامع',`سال ${year||'همه سال‌ها'}`)}${repsTable(reps)}${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;
}
function v84AuditReport(orgId){
  let arr=state.auditFindings.filter(a=>orgId==='all'||String(a.orgId)===String(orgId));
  return `<div class="report print-area" id="printArea">${v84ReportHeader('گزارش حسابرسی جامع','دارای عملیات اصلاح، تأیید و رد')}${audTable(arr)}${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;
}
function v84BuildReport(){
  let type=$('v84Type')?.value||'annual';
  let orgId=v84SelectedOrgId();
  let year=v84SelectedYear();
  rtype=type;
  let html='';
  if(type==='annual') html=v84AnnualReport(orgId,year);
  else if(type==='annualSummary') html=v84AnnualSummary(year);
  else if(type==='profile') html=v84ProfileReport(orgId);
  else if(type==='license') html=v84LicenseReport(orgId);
  else if(type==='finance') html=v84FinancialReport(orgId,year);
  else if(type==='audit') html=v84AuditReport(orgId);
  else if(type==='beneficiaries') html=`<div class="report print-area" id="printArea">${v84ReportHeader('گزارش مددجویان','جامع')}${benTable(state.beneficiaries.filter(b=>orgId==='all'||String(b.orgId)===String(orgId)))}${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;
  else if(type==='imports') html=`<div class="report print-area" id="printArea">${v84ReportHeader('گزارش فایل‌های واردشده از کلاینت‌ها','جامع')}<div class="tablewrap"><table class="table"><tr><th>کد رهگیری</th><th>سمن</th><th>تاریخ خروجی</th><th>تاریخ ورود</th><th>وضعیت</th><th>خلاصه</th></tr>${state.imports.map(i=>`<tr><td>${esc(i.trackingCode)}</td><td>${esc(i.orgName)}</td><td>${esc(i.exportedAt)}</td><td>${esc(i.importedAt)}</td><td>${badge(i.status)}</td><td>${esc(i.summary)}</td></tr>`).join('')||'<tr><td colspan="6">فایلی وارد نشده است.</td></tr>'}</table></div>${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;
  $('rarea').innerHTML=html;
}
function v84CSV(){
  let type=$('v84Type')?.value||rtype, orgId=v84SelectedOrgId(), year=v84SelectedYear();
  if(type==='annual'||type==='annualSummary'){
    let orgs=type==='annualSummary'||orgId==='all'?state.orgs:[v84OrgById(orgId)].filter(Boolean);
    let lines=['سمن,سال,ماه,کل واریزی,پرداخت مددجو,هزینه جاری,جمع هزینه,مانده/کسری,وضعیت گزارش,نتیجه حسابرسی,توضیح حسابرسی'];
    orgs.forEach(org=>v84AnnualRows(org,year).forEach(r=>lines.push([org.name,year,r.month,r.income,r.beneficiaryPay,r.currentCost,r.expense,r.balance,r.rep?(r.rep.status||'ثبت شده'):'فاقد گزارش',r.audit.status,r.audit.note].map(cell).join(','))));
    return lines.join('\n');
  }
  if(type==='profile'||type==='license') return ['سمن,شناسه ملی,شماره ثبت,مدیرعامل,کد ملی مدیرعامل,وضعیت مجوز,شماره مجوز,عکس مجوز,تعداد اعضای هیأت مدیره'].concat(state.orgs.filter(o=>orgId==='all'||String(o.id)===String(orgId)).map(o=>[o.name,o.nationalId,o.regNo,o.ceo,o.ceoNationalId,o.licenseStatus,o.licenseNo,o.licenseImage?'دارد':'ندارد',(o.board||[]).length].map(cell).join(','))).join('\n');
  if(type==='finance') return reportsCSV();
  if(type==='audit') return auditCSV();
  if(type==='beneficiaries') return benefCSV();
  if(type==='imports') return importsCSV();
  return orgsCSV();
}
function v84DownloadWord(){downloadWord('گزارش_'+($('v84Type')?.value||rtype), $('printArea')?$('printArea').outerHTML:$('rarea').innerHTML)}
function v84DownloadCSV(){downloadCSV('گزارش_جامع.csv',v84CSV())}
function v84PrintPDF(){v84BuildReport();setTimeout(()=>window.print(),150)}
function reports(){
  ensureV84();
  return `<div class="v84-toolbar report-controls no-print"><h3>گزارش‌گیری جامع و خروجی PDF</h3><div class="note info">این منوها فقط برای انتخاب گزارش هستند و در خروجی PDF/چاپ نمایش داده نمی‌شوند. گزارش سالیانه با قالب A4 عرضی چاپ می‌شود.</div><div class="grid3"><div class="field"><label>نوع گزارش</label><select id="v84Type"><option value="annual">گزارش سالیانه هر سمن - A4 عرضی</option><option value="annualSummary">خلاصه گزارش سالیانه همه سمن‌ها</option><option value="profile">پرونده کامل + عکس مجوز + هیأت مدیره</option><option value="license">گزارش مجوزها و تصاویر مجوز</option><option value="finance">گزارش مالی</option><option value="audit">گزارش حسابرسی</option><option value="beneficiaries">گزارش مددجویان</option><option value="imports">گزارش فایل‌های واردشده</option></select></div><div class="field"><label>انتخاب سمن</label><select id="v84Org">${v84OrgOptions()}</select></div><div class="field"><label>سال گزارش</label><input id="v84Year" value="${esc((state.reports[0]&&state.reports[0].year)||'۱۴۰۳')}"></div></div><div class="actions"><button class="primary" onclick="v84BuildReport()">نمایش گزارش</button><button class="ghost" onclick="v84PrintPDF()">خروجی PDF / چاپ A4 عرضی</button><button class="ghost" onclick="v84DownloadWord()">Word</button><button class="ghost" onclick="v84DownloadCSV()">Excel/CSV</button></div></div><div id="rarea">${v84AnnualReport(state.orgs[0]?.id||'all',(state.reports[0]&&state.reports[0].year)||'۱۴۰۳')}</div>`;
}
function csvCurrent(){return v84CSV()}
function downloadWordArea(){return v84DownloadWord()}
ensureV84();
/* ================= END V84 COMPREHENSIVE REPORTING + PDF A4 LANDSCAPE FIX ================= */


/* ================= V84 CUSTOM REPORT BUILDER ================= */
function v84Ensure(){
  state.version='84';
  state.customReportDraft=state.customReportDraft||{source:'orgs',fields:['row','name','nationalId','regNo','ceo','licenseStatus','licenseNo','boardCount'],title:'گزارش سفارشی سمن‌ها'};
  state.customReportTemplates=state.customReportTemplates||[];
}
function v84OrgMap(){let m={};(state.orgs||[]).forEach(o=>m[o.id]=o);return m}
function v84Text(v){return String(v??'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()}
function v84BoardText(o){
  let members=(o?.board||[]);
  if(!members.length && o?.ceo)members=[{name:o.ceo,nationalId:o.ceoNationalId,role:'مدیرعامل',mobile:o.phone||''}];
  return members.map((m,i)=>`${i+1}) ${(m.fullName||m.name||((m.firstName||'')+' '+(m.lastName||''))||'').trim()} - ${m.role||m.position||'عضو'} - ${m.nationalId||m.national_id||''}`).join(' | ');
}
function v84BoardHtml(o){
  let txt=v84BoardText(o);
  return txt?esc(txt).replaceAll(' | ','<br>'):'عضوی ثبت نشده است.';
}
function v84LicenseImgMini(o){
  return o?.licenseImage?`<img src="${o.licenseImage}" style="max-width:95px;max-height:70px;object-fit:contain;border:1px solid #cbd5e1;border-radius:8px;background:#fff;padding:2px">`:'ثبت نشده';
}
function v84FieldDefs(source){
  const commonOrg=[
    {id:'row',title:'ردیف',get:(r,i)=>i+1},
    {id:'name',title:'نام سمن',get:r=>r.org?.name||r.name||r.orgName||''},
    {id:'nationalId',title:'شناسه ملی سمن',get:r=>r.org?.nationalId||r.nationalId||''},
    {id:'regNo',title:'شماره ثبت',get:r=>r.org?.regNo||r.regNo||''},
    {id:'activity',title:'حوزه فعالیت',get:r=>r.org?.activity||r.activity||''},
    {id:'orgStatus',title:'وضعیت پرونده',get:r=>r.org?.status||r.status||''},
    {id:'ceo',title:'مدیرعامل',get:r=>r.org?.ceo||r.ceo||''},
    {id:'ceoNationalId',title:'کد ملی مدیرعامل',get:r=>r.org?.ceoNationalId||r.ceoNationalId||''},
    {id:'phone',title:'تماس',get:r=>r.org?.phone||r.phone||''},
    {id:'address',title:'آدرس',get:r=>r.org?.address||r.address||''},
    {id:'licenseStatus',title:'وضعیت مجوز',get:r=>r.org?.licenseStatus||r.licenseStatus||''},
    {id:'licenseNo',title:'شماره مجوز',get:r=>r.org?.licenseNo||r.licenseNo||''},
    {id:'licenseStart',title:'تاریخ شروع مجوز',get:r=>r.org?.licenseStart||r.licenseStart||''},
    {id:'licenseEnd',title:'تاریخ پایان مجوز',get:r=>r.org?.licenseEnd||r.licenseEnd||''},
    {id:'licenseImage',title:'عکس مجوز',html:true,get:r=>v84LicenseImgMini(r.org||r)},
    {id:'boardCount',title:'تعداد اعضای هیأت مدیره',get:r=>(r.org?.board||r.board||[]).length},
    {id:'boardDetails',title:'اطلاعات کامل هیأت مدیره',html:true,get:r=>v84BoardHtml(r.org||r)},
    {id:'bank',title:'بانک',get:r=>r.org?.bank||r.bank||''},
    {id:'accountNo',title:'شماره حساب',get:r=>r.org?.accountNo||r.accountNo||''},
    {id:'sheba',title:'شبا',get:r=>r.org?.sheba||r.sheba||''}
  ];
  if(source==='orgs'||source==='licenses')return commonOrg;
  if(source==='annual')return [
    ...commonOrg,
    {id:'year',title:'سال',get:r=>r.year},
    {id:'month',title:'ماه',get:r=>r.month},
    {id:'income',title:'کل واریزی',get:r=>money(r.income)},
    {id:'beneficiaryPay',title:'پرداخت مددجو',get:r=>money(r.beneficiaryPay)},
    {id:'currentCost',title:'هزینه جاری',get:r=>money(r.currentCost)},
    {id:'expense',title:'جمع هزینه',get:r=>money(r.expense)},
    {id:'balance',title:'مانده/کسری',get:r=>money(r.balance)},
    {id:'reportStatus',title:'وضعیت گزارش',get:r=>r.reportStatus},
    {id:'auditStatus',title:'نتیجه حسابرسی',get:r=>r.auditStatus},
    {id:'auditNote',title:'توضیح حسابرسی',get:r=>r.auditNote}
  ];
  if(source==='reports')return [
    ...commonOrg,
    {id:'year',title:'سال',get:r=>r.year||''},
    {id:'month',title:'ماه',get:r=>r.month||''},
    {id:'income',title:'کل واریزی',get:r=>money(r.income)},
    {id:'beneficiaryPay',title:'پرداخت مددجو',get:r=>money(r.beneficiaryPay)},
    {id:'currentCost',title:'هزینه جاری',get:r=>money(r.currentCost)},
    {id:'expense',title:'جمع هزینه',get:r=>money(r.expense)},
    {id:'balance',title:'مانده/کسری',get:r=>money(num(r.income)-num(r.expense))},
    {id:'status',title:'وضعیت گزارش',get:r=>r.status||''},
    {id:'workflowStatus',title:'گردش کار',get:r=>r.workflowStatus||''},
    {id:'note',title:'توضیح',get:r=>r.note||''}
  ];
  if(source==='beneficiaries')return [
    ...commonOrg,
    {id:'benName',title:'نام مددجو',get:r=>r.name||''},
    {id:'benNationalId',title:'کد ملی مددجو',get:r=>r.nationalId||''},
    {id:'benAmount',title:'مبلغ پرداختی',get:r=>money(r.amount)},
    {id:'benStatus',title:'وضعیت مددجو',get:r=>r.status||''}
  ];
  if(source==='audit')return [
    ...commonOrg,
    {id:'auditType',title:'نوع حسابرسی',get:r=>r.type||''},
    {id:'auditSeverity',title:'شدت',get:r=>r.severity||''},
    {id:'auditDesc',title:'توضیح حسابرسی',get:r=>r.desc||r.description||''},
    {id:'auditStatus2',title:'وضعیت حسابرسی',get:r=>r.status||''}
  ];
  if(source==='imports')return [
    {id:'row',title:'ردیف',get:(r,i)=>i+1},
    {id:'trackingCode',title:'کد رهگیری',get:r=>r.trackingCode||''},
    {id:'orgName',title:'نام سمن',get:r=>r.orgName||''},
    {id:'exportedAt',title:'تاریخ خروجی',get:r=>r.exportedAt||''},
    {id:'importedAt',title:'تاریخ ورود',get:r=>r.importedAt||''},
    {id:'mode',title:'روش ورود',get:r=>r.mode||''},
    {id:'status',title:'وضعیت',get:r=>r.status||''},
    {id:'summary',title:'خلاصه',get:r=>r.summary||''}
  ];
  return commonOrg;
}
function v84FieldById(source,id){return v84FieldDefs(source).find(f=>f.id===id)}
function v84SourceLabel(s){return {orgs:'سمن‌ها',annual:'پایان سال ماهانه',reports:'گزارش‌های مالی',licenses:'مجوزها',beneficiaries:'مددجوها',audit:'حسابرسی',imports:'فایل‌های واردشده'}[s]||s}
function v84DefaultFields(kind){
  let source=state.customReportDraft.source;
  if(kind==='official'){state.customReportDraft.fields=['row','name','nationalId','regNo','ceo','ceoNationalId','licenseStatus','licenseNo','licenseImage','boardDetails'];state.customReportDraft.source='orgs';state.customReportDraft.title='گزارش سفارشی پرونده سمن';}
  else if(kind==='annual'){state.customReportDraft.source='annual';state.customReportDraft.fields=['row','name','year','month','income','beneficiaryPay','currentCost','expense','balance','reportStatus','auditStatus','auditNote'];state.customReportDraft.title='گزارش سفارشی سالیانه';}
  else if(kind==='license'){state.customReportDraft.source='licenses';state.customReportDraft.fields=['row','name','nationalId','ceo','licenseStatus','licenseNo','licenseStart','licenseEnd','licenseImage','boardDetails'];state.customReportDraft.title='گزارش سفارشی مجوزها';}
  else if(kind==='finance'){state.customReportDraft.source='reports';state.customReportDraft.fields=['row','name','year','month','income','beneficiaryPay','currentCost','expense','balance','status'];state.customReportDraft.title='گزارش سفارشی مالی';}
  else {state.customReportDraft.fields=['row','name','nationalId','regNo','ceo','licenseStatus'];}
  save();v84RenderBuilder();
}
function v84SetSource(){
  let s=$('v84CustomSource').value;
  state.customReportDraft.source=s;
  let defs=v84FieldDefs(s);
  state.customReportDraft.fields=defs.slice(0,Math.min(7,defs.length)).map(f=>f.id);
  state.customReportDraft.title='گزارش سفارشی '+v84SourceLabel(s);
  save();v84RenderBuilder();
}
function v84AddField(){
  let id=$('v84AvailableField').value;
  if(!id)return;
  state.customReportDraft.fields=state.customReportDraft.fields||[];
  if(!state.customReportDraft.fields.includes(id))state.customReportDraft.fields.push(id);
  save();v84RenderBuilder();
}
function v84RemoveField(i){state.customReportDraft.fields.splice(i,1);save();v84RenderBuilder()}
function v84MoveField(i,dir){let arr=state.customReportDraft.fields,j=i+dir;if(j<0||j>=arr.length)return;[arr[i],arr[j]]=[arr[j],arr[i]];save();v84RenderBuilder()}
function v84SaveTemplate(){
  let name=prompt('نام قالب گزارش را وارد کنید:',state.customReportDraft.title||'قالب سفارشی');
  if(!name)return;
  state.customReportTemplates=state.customReportTemplates||[];
  state.customReportTemplates.unshift({id:uid('tpl'),name,source:state.customReportDraft.source,fields:[...state.customReportDraft.fields],title:state.customReportDraft.title,createdAt:today()});
  save();v84RenderBuilder();
}
function v84LoadTemplate(id){
  let t=(state.customReportTemplates||[]).find(x=>x.id===id);if(!t)return;
  state.customReportDraft={source:t.source,fields:[...t.fields],title:t.title||t.name};
  save();v84RenderBuilder();
}
function v84Records(){
  let source=state.customReportDraft.source,orgId=$('v84CustomOrg')?.value||'all',year=($('v84CustomYear')?.value||'۱۴۰۳').trim(),orgMap=v84OrgMap();
  if(source==='orgs')return state.orgs.filter(o=>orgId==='all'||String(o.id)===String(orgId)).map(o=>({ ...o, org:o }));
  if(source==='licenses')return state.orgs.filter(o=>orgId==='all'||String(o.id)===String(orgId)).map(o=>({ ...o, org:o }));
  if(source==='reports')return state.reports.filter(r=>(orgId==='all'||String(r.orgId)===String(orgId))&&(!year||String(r.year||'')===year)).map(r=>({...r,org:orgMap[r.orgId]||state.orgs.find(o=>o.name===r.orgName)||{}}));
  if(source==='beneficiaries')return state.beneficiaries.filter(b=>orgId==='all'||String(b.orgId)===String(orgId)).map(b=>({...b,org:orgMap[b.orgId]||state.orgs.find(o=>o.name===b.orgName)||{}}));
  if(source==='audit')return state.auditFindings.filter(a=>orgId==='all'||String(a.orgId)===String(orgId)).map(a=>({...a,org:orgMap[a.orgId]||state.orgs.find(o=>o.name===a.orgName)||{}}));
  if(source==='imports')return state.imports.filter(i=>orgId==='all'||String((state.orgs.find(o=>o.name===i.orgName)||{}).id)===String(orgId));
  if(source==='annual'){
    let orgs=state.orgs.filter(o=>orgId==='all'||String(o.id)===String(orgId));
    let rows=[];
    orgs.forEach(org=>{
      v83AnnualRows(org,year).forEach(r=>rows.push({...r,org,year,reportStatus:r.rep?(r.rep.status||'ثبت شده'):'فاقد گزارش',auditStatus:r.audit.status,auditNote:r.audit.note}));
    });
    return rows;
  }
  return [];
}
function v84CellValue(field,row,i,plain=false){
  let val=field.get(row,i);
  if(plain)return v84Text(val);
  return field.html?val:esc(val);
}
function v84CustomReportHtml(){
  let d=state.customReportDraft,source=d.source,fields=(d.fields||[]).map(id=>v84FieldById(source,id)).filter(Boolean),records=v84Records();
  let orgId=$('v84CustomOrg')?.value||'all',org=orgId==='all'?null:state.orgs.find(o=>String(o.id)===String(orgId)),year=$('v84CustomYear')?.value||'';
  let title=($('v84CustomTitle')?.value||d.title||'گزارش سفارشی').trim();
  state.customReportDraft.title=title;save();
  return `<div class="report print-area v83-landscape" id="printArea">${v83ReportHeader(title,`گزارش‌ساز سفارشی | منبع داده: ${v84SourceLabel(source)}`)}${v83Meta(org,year||'-','گزارش سفارشی')}<div class="note info"><b>فیلدهای انتخاب‌شده توسط ادمین:</b> ${fields.map(f=>esc(f.title)).join('، ')}</div><div class="tablewrap"><table class="table"><tr>${fields.map(f=>`<th>${esc(f.title)}</th>`).join('')}</tr>${records.map((r,i)=>`<tr>${fields.map(f=>`<td>${v84CellValue(f,r,i,false)}</td>`).join('')}</tr>`).join('')||`<tr><td colspan="${fields.length||1}">رکوردی برای این گزارش وجود ندارد.</td></tr>`}</table></div>${signs(org?.ceo||'نام و نام خانوادگی مدیرعامل سمن')}</div>`;
}
function v84CustomCSV(){
  let d=state.customReportDraft,source=d.source,fields=(d.fields||[]).map(id=>v84FieldById(source,id)).filter(Boolean),records=v84Records();
  return [fields.map(f=>cell(f.title)).join(',')].concat(records.map((r,i)=>fields.map(f=>cell(v84CellValue(f,r,i,true))).join(','))).join('\n');
}
function v84BuildCustom(){ $('v84CustomArea').innerHTML=v84CustomReportHtml(); }
function v84DownloadCustomWord(){ v84BuildCustom(); downloadWord('گزارش_سفارشی', $('printArea').outerHTML); }
function v84DownloadCustomCSV(){ downloadCSV('گزارش_سفارشی.csv', v84CustomCSV()); }
function v84PrintCustom(){ v84BuildCustom(); setTimeout(()=>window.print(),150); }
function v84RenderBuilder(){
  v84Ensure();
  let d=state.customReportDraft,defs=v84FieldDefs(d.source),selected=d.fields||[];
  let html=`<div class="v84-builder-box report-controls no-print"><h3>گزارش‌ساز سفارشی: انتخاب و چیدمان فیلدها توسط ادمین</h3><div class="note info">ادمین می‌تواند مشخص کند در صفحه گزارش دقیقاً چه ستون‌هایی باشد و ترتیب نمایش آن‌ها را با بالا/پایین تغییر دهد. این منوها در خروجی PDF چاپ نمی‌شوند.</div><div class="grid3"><div class="field"><label>عنوان گزارش</label><input id="v84CustomTitle" value="${esc(d.title||'گزارش سفارشی')}"></div><div class="field"><label>منبع داده</label><select id="v84CustomSource" onchange="v84SetSource()"><option value="orgs" ${d.source==='orgs'?'selected':''}>سمن‌ها</option><option value="annual" ${d.source==='annual'?'selected':''}>گزارش سالیانه ماهانه</option><option value="reports" ${d.source==='reports'?'selected':''}>گزارش‌های مالی</option><option value="licenses" ${d.source==='licenses'?'selected':''}>مجوزها</option><option value="beneficiaries" ${d.source==='beneficiaries'?'selected':''}>مددجوها</option><option value="audit" ${d.source==='audit'?'selected':''}>حسابرسی</option><option value="imports" ${d.source==='imports'?'selected':''}>فایل‌های واردشده</option></select></div><div class="field"><label>انتخاب سمن</label><select id="v84CustomOrg"><option value="all">همه سمن‌ها</option>${state.orgs.map(o=>`<option value="${o.id}">${esc(o.name)}</option>`).join('')}</select></div><div class="field"><label>سال</label><input id="v84CustomYear" value="${esc((state.reports[0]&&state.reports[0].year)||'۱۴۰۳')}"></div><div class="field"><label>افزودن فیلد</label><select id="v84AvailableField">${defs.map(f=>`<option value="${f.id}">${esc(f.title)}</option>`).join('')}</select></div><div class="field"><label>عملیات فیلد</label><button class="primary" onclick="v84AddField()">افزودن فیلد به گزارش</button></div></div><div class="v84-template-bar"><button onclick="v84DefaultFields('official')">قالب پرونده اداری</button><button onclick="v84DefaultFields('annual')">قالب سالیانه</button><button onclick="v84DefaultFields('license')">قالب مجوزها</button><button onclick="v84DefaultFields('finance')">قالب مالی</button><button onclick="v84SaveTemplate()">ذخیره قالب فعلی</button></div><div class="v84-selected-fields">${selected.map((id,i)=>{let f=v84FieldById(d.source,id);return f?`<span class="v84-field-chip">${esc(f.title)} <button onclick="v84MoveField(${i},-1)">↑</button><button onclick="v84MoveField(${i},1)">↓</button><button onclick="v84RemoveField(${i})">×</button></span>`:''}).join('')}</div><div class="v84-mini">قالب‌های ذخیره‌شده: ${(state.customReportTemplates||[]).map(t=>`<button class="ghost" onclick="v84LoadTemplate('${t.id}')">${esc(t.name)}</button>`).join(' ')||'هنوز قالبی ذخیره نشده است.'}</div><div class="actions" style="margin-top:12px"><button class="primary" onclick="v84BuildCustom()">نمایش گزارش سفارشی</button><button class="ghost" onclick="v84PrintCustom()">خروجی PDF / چاپ</button><button class="ghost" onclick="v84DownloadCustomWord()">Word</button><button class="ghost" onclick="v84DownloadCustomCSV()">Excel/CSV</button></div></div><div id="v84CustomArea">${v84CustomReportHtml()}</div>`;
  let box=$('v84BuilderMount'); if(box)box.innerHTML=html;
}
const v83ReportsOriginal=reports;
function reports(){
  v84Ensure();
  setTimeout(v84RenderBuilder,0);
  return `<div id="v84BuilderMount"></div><div class="v83-toolbar report-controls no-print"><h3>گزارش‌های آماده</h3><div class="note info">اگر گزارش سفارشی نخواستید، از گزارش‌های آماده زیر استفاده کنید.</div><div class="grid3"><div class="field"><label>نوع گزارش آماده</label><select id="v83Type"><option value="annual">گزارش سالیانه هر سمن - A4 عرضی</option><option value="annualSummary">خلاصه گزارش سالیانه همه سمن‌ها</option><option value="profile">پرونده کامل + عکس مجوز + هیأت مدیره</option><option value="license">گزارش مجوزها و تصاویر مجوز</option><option value="finance">گزارش مالی</option><option value="audit">گزارش حسابرسی</option><option value="beneficiaries">گزارش مددجویان</option><option value="imports">گزارش فایل‌های واردشده</option></select></div><div class="field"><label>انتخاب سمن</label><select id="v83Org">${v83OrgOptions()}</select></div><div class="field"><label>سال گزارش</label><input id="v83Year" value="${esc((state.reports[0]&&state.reports[0].year)||'۱۴۰۳')}"></div></div><div class="actions"><button class="primary" onclick="v83BuildReport()">نمایش گزارش آماده</button><button class="ghost" onclick="v83PrintPDF()">خروجی PDF / چاپ A4 عرضی</button><button class="ghost" onclick="v83DownloadWord()">Word</button><button class="ghost" onclick="v83DownloadCSV()">Excel/CSV</button></div></div><div id="rarea">${v83AnnualReport(state.orgs[0]?.id||'all',(state.reports[0]&&state.reports[0].year)||'۱۴۰۳')}</div>`;
}
function csvCurrent(){
  if($('v84CustomArea')&&$('v84CustomArea').innerHTML.trim())return v84CustomCSV();
  return v83CSV();
}
ensureV84 = v84Ensure;
v84Ensure();
/* ================= END V84 CUSTOM REPORT BUILDER ================= */


/* ================= V86 STABLE PROFESSIONAL REPORT FIX ================= */
(function(){
  function safe(fn, fallback){try{return fn()}catch(e){console.warn('V86 safe:',e);return fallback}}
  window.v86Ensure=function(){state.version='86';state.reportGovernance=state.reportGovernance||{requireLicenseImage:true,requireBoardDetails:true,requireAnnualCompleteness:true};};
  window.v86Context=function(){return {source:(state.customReportDraft&&state.customReportDraft.source)||'orgs',fields:(state.customReportDraft&&state.customReportDraft.fields)||[],orgId:($('v84CustomOrg')&&$('v84CustomOrg').value)||'all',year:(($('v84CustomYear')&&$('v84CustomYear').value)||'۱۴۰۳').trim()};};
  window.v86Score=function(){
    let c=v86Context(),score=100,notes=[],fields=c.fields||[];
    function need(id,label,w=8){if(!fields.includes(id)){score-=w;notes.push('فیلد «'+label+'» در گزارش انتخاب نشده است.')}}
    if(c.source==='orgs'||c.source==='licenses'){need('name','نام سمن');need('nationalId','شناسه ملی');need('ceo','مدیرعامل');need('licenseStatus','وضعیت مجوز');need('licenseImage','عکس مجوز',10);need('boardDetails','اطلاعات کامل هیأت مدیره',10)}
    if(c.source==='annual'){[['name','نام سمن'],['year','سال'],['month','ماه'],['income','کل واریزی'],['expense','جمع هزینه'],['balance','مانده/کسری'],['auditStatus','نتیجه حسابرسی'],['auditNote','توضیح حسابرسی']].forEach(x=>need(x[0],x[1],7))}
    let orgs=c.orgId==='all'?state.orgs:[state.orgs.find(o=>String(o.id)===String(c.orgId))].filter(Boolean);
    let missingImg=orgs.filter(o=>!o.licenseImage).length, missingBoard=orgs.filter(o=>!(o.board||[]).length).length;
    if(missingImg){score-=Math.min(20,missingImg*5);notes.push(missingImg+' سمن عکس مجوز ندارد.')} if(missingBoard){score-=Math.min(18,missingBoard*4);notes.push(missingBoard+' سمن اطلاعات هیأت مدیره کامل ندارد.')}
    let openAudit=(state.auditFindings||[]).filter(a=>a.status==='باز'||a.status==='نیازمند اصلاح'||!a.status).length; if(openAudit){score-=Math.min(15,openAudit*2);notes.push(openAudit+' مورد حسابرسی باز یا نیازمند اصلاح وجود دارد.')}
    score=Math.max(0,Math.min(100,score)); return {score,notes};
  };
  window.v86Panel=function(){let s=v86Score(),missingImg=(state.orgs||[]).filter(o=>!o.licenseImage).length,missingBoard=(state.orgs||[]).filter(o=>!(o.board||[]).length).length,openAudit=(state.auditFindings||[]).filter(a=>a.status==='باز'||a.status==='نیازمند اصلاح'||!a.status).length;let cls=s.score>80?'ok':s.score>55?'warn':'bad';let notes=s.notes.length?s.notes:['گزارش از نظر فیلدهای ضروری، مجوز، هیأت مدیره و حسابرسی آماده چاپ رسمی است.'];return `<div class="v86-command-center no-print"><h3>اتاق فرمان گزارش‌گیری حرفه‌ای - نسخه پایدار</h3><p>این بخش قبل از چاپ یا PDF کیفیت گزارش را بررسی می‌کند، اما مثل V85 باعث کرش نمی‌شود.</p><div class="v86-pro-grid"><div class="v86-pro-card"><b>${s.score}٪</b><span>امتیاز آمادگی گزارش</span></div><div class="v86-pro-card"><b>${missingImg}</b><span>سمن بدون عکس مجوز</span></div><div class="v86-pro-card"><b>${missingBoard}</b><span>هیأت مدیره ناقص</span></div><div class="v86-pro-card"><b>${openAudit}</b><span>حسابرسی باز</span></div></div></div><div class="card no-print"><div class="v86-section-title"><h3>چک‌لیست هوشمند قبل از خروجی</h3><div class="v86-score-ring" style="--p:${s.score}%"><div>${s.score}٪</div></div></div><div class="v86-checklist">${notes.map(n=>`<div class="v86-check ${cls}">${esc(n)}</div>`).join('')}</div><div class="v86-ritual-bar"><button onclick="v86Official()">استاندارد گزارش اداری</button><button onclick="v86Annual()">استاندارد گزارش سالیانه</button><button onclick="v86License()">استاندارد گزارش مجوز</button><button onclick="v86Print()">بازبینی و چاپ/PDF</button></div></div><div class="v86-smart-note no-print"><strong>نسخه پایدار:</strong> اگر مشکلی دیدی، مسیر اضطراری /safe-admin داخل همین بسته فعال است.</div>`};
  window.v86Official=function(){state.customReportDraft.source='orgs';state.customReportDraft.title='گزارش رسمی پرونده سمن‌ها';state.customReportDraft.fields=['row','name','nationalId','regNo','activity','ceo','ceoNationalId','licenseStatus','licenseNo','licenseImage','boardDetails','bank','sheba'];save();v84RenderBuilder();setTimeout(()=>v84BuildCustom(),50)};
  window.v86Annual=function(){state.customReportDraft.source='annual';state.customReportDraft.title='گزارش رسمی سالیانه سمن‌ها';state.customReportDraft.fields=['row','name','year','month','income','beneficiaryPay','currentCost','expense','balance','reportStatus','auditStatus','auditNote'];save();v84RenderBuilder();setTimeout(()=>v84BuildCustom(),50)};
  window.v86License=function(){state.customReportDraft.source='licenses';state.customReportDraft.title='گزارش رسمی مجوزها و هیأت مدیره';state.customReportDraft.fields=['row','name','nationalId','ceo','licenseStatus','licenseNo','licenseStart','licenseEnd','licenseImage','boardDetails'];save();v84RenderBuilder();setTimeout(()=>v84BuildCustom(),50)};
  window.v86Print=function(){safe(()=>v84BuildCustom(),null);let s=v86Score();if(s.score<60&&!confirm('امتیاز آمادگی گزارش پایین است ('+s.score+'٪). با همین وضعیت چاپ شود؟'))return;setTimeout(()=>window.print(),160)};
  if(typeof window.v84RenderBuilder==='function'&&!window.__v86WrappedBuilder){window.__v86WrappedBuilder=true;window.__v86BaseRenderBuilder=window.v84RenderBuilder;window.v84RenderBuilder=function(){window.__v86BaseRenderBuilder();let m=$('v84BuilderMount');if(m&&!document.getElementById('v86Top'))m.insertAdjacentHTML('afterbegin','<div id="v86Top">'+v86Panel()+'</div>')}}
  v86Ensure();
})();
/* ================= END V86 STABLE PROFESSIONAL REPORT FIX ================= */


/* ================= V87 SAFE REPORT + WORKFLOW FIX ================= */
(function(){
  function byId(id){return document.getElementById(id)}
  function safeHtml(fn, fallback){
    try { return fn(); }
    catch(e){
      console.error('V87 safeHtml error:', e);
      return `<div class="card"><h3>خطا در اجرای بخش</h3><div class="note bad">این بخش خطا داد اما برنامه قفل نشد.<br>${esc(e.message||e)}</div></div>`;
    }
  }
  window.v87Ensure=function(){
    state.version='87';
    state.workflow=state.workflow||[];
    state.auditFindings=state.auditFindings||[];
    state.reports=state.reports||[];
    state.orgs=state.orgs||[];
    state.imports=state.imports||[];
    state.beneficiaries=state.beneficiaries||[];
    state.corrections=state.corrections||[];
    state.customReportDraft=state.customReportDraft||{source:'orgs',fields:['row','name','nationalId','regNo','ceo','licenseStatus'],title:'گزارش سفارشی سمن‌ها'};
  };
  // Make missing helpers safe
  if(typeof window.runAudit!=='function' && typeof window.auditRun==='function') window.runAudit=window.auditRun;
  if(typeof window.auditRun!=='function'){
    window.auditRun=function(show){ state.auditFindings=state.auditFindings||[]; save(); if(show && typeof render==='function') render('audit'); }
  }

  // Safe wrapper around render to prevent full UI freezing
  if(typeof window.render==='function' && !window.__v87WrappedRender){
    window.__v87WrappedRender=true;
    window.__v87BaseRender=window.render;
    window.render=function(tab){
      try { return window.__v87BaseRender(tab); }
      catch(e){
        console.error('V87 render fallback:', tab, e);
        const root=byId('root');
        if(root){
          root.innerHTML=`<main class="app"><section class="main"><div class="content"><div class="card"><h3>این بخش خطا داد و قفل نشد</h3><div class="note bad">بخش: ${esc(tab)}<br>${esc(e.message||e)}</div><button class="primary" onclick="render('dashboard')">بازگشت به داشبورد</button><button class="ghost" onclick="location.reload()">بارگذاری دوباره</button></div></div></section></main>`;
        } else alert('خطا: '+(e.message||e));
      }
    };
  }

  window.v87ReportIntro=function(){
    return `<div class="v87-safe-box report-controls no-print"><h3>گزارش‌گیری پایدار و ضدقفل</h3><div class="v87-safe-note">برای جلوگیری از قفل شدن، گزارش‌های سنگین هنگام ورود به صفحه ساخته نمی‌شوند. اول نوع گزارش را انتخاب کن، بعد دکمه «نمایش گزارش» را بزن.</div><div class="grid3"><div class="field"><label>نوع گزارش</label><select id="v87Type"><option value="annual">گزارش سالیانه هر سمن - A4 عرضی</option><option value="summary">خلاصه پایان سال همه سمن‌ها</option><option value="profile">پرونده کامل سمن</option><option value="license">مجوزها و عکس مجوز</option><option value="finance">مالی</option><option value="audit">حسابرسی</option><option value="beneficiaries">مددجوها</option><option value="imports">فایل‌های واردشده</option><option value="custom">گزارش‌ساز سفارشی</option></select></div><div class="field"><label>انتخاب سمن</label><select id="v87Org"><option value="all">همه سمن‌ها</option>${state.orgs.map(o=>`<option value="${o.id}">${esc(o.name)}</option>`).join('')}</select></div><div class="field"><label>سال</label><input id="v87Year" value="${esc((state.reports[0]&&state.reports[0].year)||'۱۴۰۳')}"></div></div><div class="actions"><button class="primary" onclick="v87BuildReport()">نمایش گزارش</button><button class="ghost" onclick="v87Print()">PDF / چاپ</button><button class="ghost" onclick="v87Word()">Word</button><button class="ghost" onclick="v87CSVDownload()">Excel/CSV</button></div></div>`;
  };
  window.v87Org=function(){
    let id=byId('v87Org')?.value||'all';
    return id==='all'?null:state.orgs.find(o=>String(o.id)===String(id))||state.orgs[0]||null;
  };
  window.v87OrgList=function(){
    let id=byId('v87Org')?.value||'all';
    return id==='all'?state.orgs:[v87Org()].filter(Boolean);
  };
  window.v87Year=function(){return (byId('v87Year')?.value||'۱۴۰۳').trim();}
  window.v87Header=function(title,sub=''){
    let num='JVN-REP-'+Date.now();
    return `<div class="rhead"><h2>${esc(title)}</h2><p>${esc(sub)} | شماره گزارش: ${num} | تاریخ: ${today()}</p></div>`;
  };
  window.v87BoardTable=function(o){
    let members=(o?.board||[]);
    if(!members.length && o?.ceo) members=[{name:o.ceo,nationalId:o.ceoNationalId,role:'مدیرعامل',mobile:o.phone||''}];
    return `<div class="tablewrap"><table class="table"><tr><th>ردیف</th><th>نام و نام خانوادگی</th><th>کد ملی</th><th>سمت</th><th>تماس</th></tr>${members.map((m,i)=>`<tr><td>${i+1}</td><td>${esc(m.fullName||m.name||((m.firstName||'')+' '+(m.lastName||'')))}</td><td>${esc(m.nationalId||m.national_id||'')}</td><td>${esc(m.role||m.position||'عضو')}</td><td>${esc(m.mobile||m.phone||'')}</td></tr>`).join('')||'<tr><td colspan="5">عضوی ثبت نشده است.</td></tr>'}</table></div>`;
  };
  window.v87LicenseBlock=function(o){
    let img=o?.licenseImage?`<img src="${o.licenseImage}" style="max-width:100%;max-height:360px;object-fit:contain;border:1px solid #cbd5e1;border-radius:14px;background:#fff;padding:6px">`:'عکس مجوز ثبت نشده است.';
    return `<div class="grid2"><div class="note info"><b>مجوز</b><br>وضعیت: ${badge(o?.licenseStatus||'ثبت نشده')}<br>شماره: ${esc(o?.licenseNo||'')}<br>شروع: ${esc(o?.licenseStart||'')}<br>پایان: ${esc(o?.licenseEnd||'')}</div><div class="note info">${img}</div></div>`;
  };
  window.v87AnnualRows=function(o,year){
    let months=(typeof monthsV84!=='undefined'?monthsV84:(typeof monthsV81!=='undefined'?monthsV81:['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند']));
    return months.map(m=>{
      let r=state.reports.find(x=>String(x.orgId)===String(o.id)&&String(x.year||'')===year&&String(x.month||'')===m)||null;
      let income=r?num(r.income):0, ben=r?num(r.beneficiaryPay):0, cur=r?num(r.currentCost):0, exp=r?num(r.expense):(ben+cur), bal=income-exp;
      let audit={status:'قابل قبول',note:'مورد بحرانی مشاهده نشد.'};
      if(!r) audit={status:'فاقد گزارش',note:`برای ماه ${m} گزارشی ثبت نشده است.`};
      else if(exp>income) audit={status:'دارای کسری',note:'هزینه بیشتر از واریزی است.'};
      else if(!o.licenseNo||o.licenseStatus==='منقضی') audit={status:'نیازمند بررسی مجوز',note:'مجوز ناقص یا منقضی است.'};
      return {month:m,rep:r,income,beneficiaryPay:ben,currentCost:cur,expense:exp,balance:bal,audit};
    });
  };
  window.v87AnnualReport=function(){
    let year=v87Year(), orgs=v87OrgList();
    return `<div class="report print-area" id="printArea">${orgs.map(o=>{
      let rows=v87AnnualRows(o,year);
      let totals=rows.reduce((s,r)=>({income:s.income+r.income,ben:s.ben+r.beneficiaryPay,cur:s.cur+r.currentCost,exp:s.exp+r.expense,bal:s.bal+r.balance,miss:s.miss+(r.rep?0:1),issues:s.issues+(r.audit.status==='قابل قبول'?0:1)}),{income:0,ben:0,cur:0,exp:0,bal:0,miss:0,issues:0});
      let status=totals.miss?`ناقص: ${totals.miss} ماه بدون گزارش`:totals.issues?`نیازمند بررسی: ${totals.issues} مورد`:'قابل تأیید';
      return `<section class="report-page">${v87Header('گزارش سالیانه سمن در کاغذ A4 عرضی',`${o.name} | سال ${year}`)}<div class="grid2"><div class="note info"><b>مشخصات سمن</b><br>شناسه ملی: ${esc(o.nationalId)}<br>شماره ثبت: ${esc(o.regNo)}<br>مدیرعامل: ${esc(o.ceo)}<br>کد ملی مدیرعامل: ${esc(o.ceoNationalId)}</div><div class="note info"><b>وضعیت نهایی:</b><br>${esc(status)}</div></div>${v87LicenseBlock(o)}<h3>هیأت مدیره</h3>${v87BoardTable(o)}<h3>حسابرسی ماهانه</h3><div class="tablewrap"><table class="table"><tr><th>ماه</th><th>واریزی</th><th>پرداخت مددجو</th><th>هزینه جاری</th><th>جمع هزینه</th><th>مانده/کسری</th><th>وضعیت گزارش</th><th>نتیجه حسابرسی</th><th>توضیح</th></tr>${rows.map(r=>`<tr><td>${esc(r.month)}</td><td>${money(r.income)}</td><td>${money(r.beneficiaryPay)}</td><td>${money(r.currentCost)}</td><td>${money(r.expense)}</td><td>${money(r.balance)}</td><td>${r.rep?badge(r.rep.status||'ثبت شده'):badge('فاقد گزارش')}</td><td>${esc(r.audit.status)}</td><td>${esc(r.audit.note)}</td></tr>`).join('')}<tr><th>جمع سال</th><th>${money(totals.income)}</th><th>${money(totals.ben)}</th><th>${money(totals.cur)}</th><th>${money(totals.exp)}</th><th>${money(totals.bal)}</th><th colspan="3">${esc(status)}</th></tr></table></div>${signs(o.ceo)}</section>`;
    }).join('')}</div>`;
  };
  window.v87ProfileReport=function(){
    let orgs=v87OrgList();
    return `<div class="report print-area" id="printArea">${v87Header('گزارش پرونده کامل سمن','مشخصات، مجوز، عکس مجوز، هیأت مدیره، مالی و حسابرسی')}${orgs.map(o=>`<section class="report-page"><h3>${esc(o.name)}</h3><div class="grid2"><div class="note info"><b>مشخصات ثبتی</b><br>شناسه ملی: ${esc(o.nationalId)}<br>شماره ثبت: ${esc(o.regNo)}<br>حوزه: ${esc(o.activity)}<br>آدرس: ${esc(o.address||'')}</div><div class="note info"><b>مدیرعامل و حساب</b><br>${esc(o.ceo)}<br>${esc(o.ceoNationalId)}<br>${esc(o.bank||'')}<br>${esc(o.sheba||'')}</div></div>${v87LicenseBlock(o)}<h3>هیأت مدیره</h3>${v87BoardTable(o)}<h3>گزارش‌های مالی</h3>${repsTable(state.reports.filter(r=>r.orgId===o.id))}<h3>حسابرسی</h3>${audTable(state.auditFindings.filter(a=>a.orgId===o.id))}${signs(o.ceo)}</section>`).join('')}</div>`;
  };
  window.v87SimpleReport=function(type){
    if(type==='summary'){
      let year=v87Year();
      return `<div class="report print-area" id="printArea">${v87Header('خلاصه پایان سال همه سمن‌ها',year)}<div class="tablewrap"><table class="table"><tr><th>سمن</th><th>مدیرعامل</th><th>مجوز</th><th>ماه فاقد گزارش</th><th>موارد حسابرسی</th></tr>${state.orgs.map(o=>{let rows=v87AnnualRows(o,year),miss=rows.filter(r=>!r.rep).length,issues=rows.filter(r=>r.audit.status!=='قابل قبول').length;return `<tr><td>${esc(o.name)}</td><td>${esc(o.ceo)}</td><td>${badge(o.licenseStatus)}</td><td>${miss}</td><td>${issues}</td></tr>`}).join('')}</table></div>${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;
    }
    if(type==='license'){
      return `<div class="report print-area" id="printArea">${v87Header('گزارش مجوزها و عکس مجوز','جامع')}${v87OrgList().map(o=>`<section class="report-page"><h3>${esc(o.name)}</h3>${v87LicenseBlock(o)}${v87BoardTable(o)}${signs(o.ceo)}</section>`).join('')}</div>`;
    }
    if(type==='finance') return `<div class="report print-area" id="printArea">${v87Header('گزارش مالی','جامع')}${repsTable(state.reports.filter(r=>v87Org()?.id?String(r.orgId)===String(v87Org().id):true))}${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;
    if(type==='audit') return `<div class="report print-area" id="printArea">${v87Header('گزارش حسابرسی','جامع')}${audTable(state.auditFindings.filter(a=>v87Org()?.id?String(a.orgId)===String(v87Org().id):true))}${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;
    if(type==='beneficiaries') return `<div class="report print-area" id="printArea">${v87Header('گزارش مددجویان','جامع')}${benTable(state.beneficiaries.filter(b=>v87Org()?.id?String(b.orgId)===String(v87Org().id):true))}${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;
    if(type==='imports') return `<div class="report print-area" id="printArea">${v87Header('گزارش فایل‌های واردشده','جامع')}<div class="tablewrap"><table class="table"><tr><th>کد رهگیری</th><th>سمن</th><th>تاریخ خروجی</th><th>تاریخ ورود</th><th>وضعیت</th><th>خلاصه</th></tr>${state.imports.map(i=>`<tr><td>${esc(i.trackingCode)}</td><td>${esc(i.orgName)}</td><td>${esc(i.exportedAt)}</td><td>${esc(i.importedAt)}</td><td>${badge(i.status)}</td><td>${esc(i.summary)}</td></tr>`).join('')||'<tr><td colspan="6">فایلی وارد نشده است.</td></tr>'}</table></div>${signs('نام و نام خانوادگی مدیرعامل سمن')}</div>`;
    return v87ProfileReport();
  };
  window.v87BuildReport=function(){
    let t=byId('v87Type')?.value||'annual';
    let area=byId('v87Area');
    if(!area)return;
    area.innerHTML='<div class="v87-loading">در حال ساخت گزارش، لطفاً چند لحظه صبر کنید...</div>';
    setTimeout(()=>{
      area.innerHTML=safeHtml(()=>{
        if(t==='annual')return v87AnnualReport();
        if(t==='profile')return v87ProfileReport();
        if(t==='custom' && typeof v84CustomReportHtml==='function')return v84CustomReportHtml();
        return v87SimpleReport(t);
      },'<div class="note bad">گزارش ساخته نشد.</div>');
    },30);
  };
  window.v87Print=function(){v87BuildReport();setTimeout(()=>window.print(),250)}
  window.v87Word=function(){v87BuildReport();setTimeout(()=>downloadWord('گزارش', byId('v87Area')?.innerHTML||''),120)}
  window.v87CSV=function(){
    let t=byId('v87Type')?.value||'annual';
    if(t==='custom' && typeof v84CustomCSV==='function')return v84CustomCSV();
    let rows=[['نوع گزارش','سمن','سال'].map(cell).join(',')];
    rows.push([t, v87Org()?.name||'همه سمن‌ها', v87Year()].map(cell).join(','));
    return rows.join('\n');
  };
  window.v87CSVDownload=function(){downloadCSV('گزارش.csv',v87CSV())}
  window.reports=function(){
    v87Ensure();
    return `${v87ReportIntro()}<div id="v87Area"><div class="v87-safe-box"><h3>گزارش هنوز ساخته نشده</h3><div class="v87-safe-note">نوع گزارش را انتخاب کن و روی «نمایش گزارش» بزن.</div></div></div>`;
  };

  window.workflow=function(){
    v87Ensure();
    return `<div class="card"><h3>گردش کار گزارش‌ها</h3><div class="v87-safe-note">این بخش سبک‌سازی شد تا با کلیک قفل نکند.</div><div class="tablewrap"><table class="table"><tr><th>گزارش</th><th>سمن</th><th>وضعیت</th><th>تاریخ</th><th>عملیات</th></tr>${(state.workflow||[]).map(w=>`<tr><td>${esc(w.title||'گزارش')}</td><td>${esc(w.orgName||'')}</td><td>${badge(w.status||'دریافت شده')}</td><td>${esc(w.createdAt||'')}</td><td><button class="ghost" onclick="v87SetWorkflow('${w.id}','در انتظار بررسی')">بررسی</button><button class="ghost" onclick="v87SetWorkflow('${w.id}','نیازمند اصلاح')">اصلاح</button><button class="ghost" onclick="v87SetWorkflow('${w.id}','تأیید نهایی')">تأیید</button><button class="ghost" onclick="v87SetWorkflow('${w.id}','رد شده')">رد</button></td></tr>`).join('')||'<tr><td colspan="5">فعلاً گزارشی در گردش کار نیست.</td></tr>'}</table></div></div>`;
  };
  window.v87SetWorkflow=function(id,status){
    let w=(state.workflow||[]).find(x=>String(x.id)===String(id)); if(!w)return;
    w.status=status; w.history=(w.history||[]).concat(status);
    if(status==='نیازمند اصلاح'){
      state.corrections=state.corrections||[];
      state.corrections.unshift({id:uid('corr'),orgId:w.orgId,orgName:w.orgName,title:'اصلاح گزارش',desc:'ثبت‌شده از گردش کار گزارش',deadline:'',status:'باز',createdAt:today(),reportId:w.reportId});
    }
    save(); render('workflow');
  };
  v87Ensure();
})();
/* ================= END V87 SAFE REPORT + WORKFLOW FIX ================= */


/* ================= V88 WHITE SCREEN SAFE START FIX ================= */
(function(){
  function v88Fatal(e){
    console.error('V88 startup fatal:', e);
    document.body.innerHTML=`<div style="font-family:Tahoma,Arial;direction:rtl;padding:24px;background:#eef6ff;min-height:100vh"><div style="background:#fff;border:1px solid #dbe8f7;border-radius:24px;padding:22px;max-width:720px;margin:40px auto;box-shadow:0 18px 45px rgba(14,47,87,.12)"><h2 style="color:#0e2f57;margin-top:0">برنامه خطا داد اما صفحه سفید نشد</h2><p style="line-height:2;color:#334155">برای بازگشت به صفحه ورود، روی دکمه زیر بزنید. اگر مشکل از اطلاعات ذخیره‌شده قبلی باشد، با پاک‌سازی حافظه برنامه حل می‌شود.</p><pre style="direction:ltr;text-align:left;white-space:pre-wrap;background:#0f172a;color:#e2e8f0;border-radius:16px;padding:12px;max-height:220px;overflow:auto">${String(e&&e.message?e.message:e)}</pre><button onclick="localStorage.clear();location.href=location.pathname" style="border:0;border-radius:16px;background:#1769ff;color:white;padding:12px 18px;font-weight:900">پاک‌سازی حافظه و ورود دوباره</button><button onclick="location.href='/safe-admin'" style="border:0;border-radius:16px;background:#eef6ff;color:#1f5fbd;padding:12px 18px;font-weight:900;margin-right:8px">نسخه امن</button></div></div>`;
  }
  window.addEventListener('error',function(ev){
    console.error('V88 runtime error:', ev.error||ev.message);
  });
  window.addEventListener('unhandledrejection',function(ev){
    console.error('V88 promise error:', ev.reason);
  });
  window.v88Start=function(){
    try{
      if(location.search.indexOf('reset=1')>-1){
        localStorage.clear();
        location.href=location.pathname;
        return;
      }
      if(typeof defaults==='function') defaults();
      if(typeof v87Ensure==='function') v87Ensure();
      if(state && state.session){
        try{
          if(typeof resetLockTimerV84==='function') resetLockTimerV84();
          render('dashboard');
        }catch(e){
          console.warn('V88 session render failed, returning to login:', e);
          state.session=null;
          try{save()}catch(_){}
          loginPage();
        }
      }else{
        loginPage();
      }
    }catch(e){v88Fatal(e)}
  };
  setTimeout(function(){ if(window.v91Start) v91Start(); else v88Start(); },0);
})();
/* ================= END V88 WHITE SCREEN SAFE START FIX ================= */


/* ================= V89 AUDIT EDIT PRO FIX ================= */
(function(){
  function safe(v){return String(v??'')}
  function getAudit(id){return (state.auditFindings||[]).find(a=>String(a.id)===String(id))}
  function getOrgByAudit(a){return (state.orgs||[]).find(o=>String(o.id)===String(a?.orgId)||o.name===a?.orgName)||null}
  function setVal(id,v){let el=document.getElementById(id); if(el)el.value=safe(v)}
  function val(id){let el=document.getElementById(id); return el?el.value:''}

  window.v89Ensure=function(){
    state.version='89';
    state.auditFindings=state.auditFindings||[];
    state.corrections=state.corrections||[];
    state.orgs=state.orgs||[];
    state.logs=state.logs||[];
    state.auditFindings.forEach((a,i)=>{ if(!a.id)a.id='aud_'+Date.now()+'_'+i; });
  };

  window.v89Log=function(action){
    state.logs=state.logs||[];
    state.logs.unshift({action,at:new Date().toLocaleString('fa-IR'),user:(state.session&&state.session.user)||'admin'});
    state.logs=state.logs.slice(0,500);
  };

  window.v89RelatedInfo=function(a,o){
    let kind=(a?.type||'')+' '+(a?.desc||'')+' '+(a?.description||'');
    let suggestions=[];
    if(kind.includes('مجوز')) suggestions.push('اطلاعات مجوز، شماره مجوز، تاریخ شروع/پایان و عکس مجوز را کنترل کنید.');
    if(kind.includes('مدیرعامل')) suggestions.push('نام مدیرعامل و کد ملی مدیرعامل را کنترل و اصلاح کنید.');
    if(kind.includes('حساب')) suggestions.push('بانک، شماره حساب و شبا را کنترل کنید.');
    if(kind.includes('مالی')||kind.includes('مغایرت')) suggestions.push('گزارش‌های مالی همان سمن را بررسی کنید؛ اگر هزینه بیشتر از واریزی است باید مبلغ یا توضیح اصلاح شود.');
    if(kind.includes('پرونده')) suggestions.push('شناسه ملی، شماره ثبت و مشخصات ثبتی سمن را کامل کنید.');
    return suggestions.length?suggestions.join('<br>'):'مورد حسابرسی را بررسی کنید و در صورت نیاز اطلاعات پرونده را اصلاح کنید.';
  };

  window.v89AudTable=function(arr){
    arr=arr||[];
    return `<div class="tablewrap"><table class="table"><tr><th>سمن</th><th>نوع</th><th>شدت</th><th>توضیح</th><th>وضعیت</th><th>عملیات</th></tr>${arr.map(a=>`<tr><td>${esc(a.orgName||'')}</td><td>${esc(a.type||'')}</td><td>${esc(a.severity||'')}</td><td>${esc(a.desc||a.description||'')}</td><td>${badge(a.status||'باز')}</td><td><div class="v89-audit-actions"><button class="ghost" onclick="v89OpenAuditEdit('${a.id}')">اصلاح / ویرایش</button><button class="ghost" onclick="v89AuditApprove('${a.id}')">تأیید</button><button class="ghost" onclick="v89AuditReject('${a.id}')">رد</button></div></td></tr>`).join('')||'<tr><td colspan="6">یافته‌ای ندارد.</td></tr>'}</table></div>`;
  };

  window.audTable=function(as){return v89AudTable(as)};

  window.v89OpenAuditEdit=function(id){
    v89Ensure();
    let a=getAudit(id);
    if(!a){alert('مورد حسابرسی پیدا نشد.');return}
    let o=getOrgByAudit(a)||{};
    let reports=(state.reports||[]).filter(r=>String(r.orgId)===String(o.id)||r.orgName===o.name);
    let modal=document.createElement('div');
    modal.id='v89AuditModal';
    modal.className='v89-modal-backdrop';
    modal.innerHTML=`<div class="v89-modal"><div class="v89-modal-head"><h3>ویرایش مورد حسابرسی و اطلاعات مرتبط</h3><button onclick="v89CloseAuditModal()">بستن ×</button></div><div class="v89-statusline"><b>راهنمای اصلاح:</b><br>${v89RelatedInfo(a,o)}</div>
      <div class="v89-edit-section"><h4>خود مورد حسابرسی</h4><div class="v89-edit-grid">
        <div class="v89-edit-field"><label>سمن</label><input id="v89OrgName" value="${esc(a.orgName||o.name||'')}"></div>
        <div class="v89-edit-field"><label>نوع حسابرسی</label><input id="v89AuditType" value="${esc(a.type||'')}"></div>
        <div class="v89-edit-field"><label>شدت</label><select id="v89AuditSeverity"><option ${a.severity==='بالا'?'selected':''}>بالا</option><option ${a.severity==='متوسط'?'selected':''}>متوسط</option><option ${a.severity==='کم'?'selected':''}>کم</option></select></div>
        <div class="v89-edit-field"><label>وضعیت</label><select id="v89AuditStatus"><option ${(!a.status||a.status==='باز')?'selected':''}>باز</option><option ${a.status==='نیازمند اصلاح'?'selected':''}>نیازمند اصلاح</option><option ${a.status==='اصلاح شد'?'selected':''}>اصلاح شد</option><option ${a.status==='تأیید شده'?'selected':''}>تأیید شده</option><option ${a.status==='رد شده'?'selected':''}>رد شده</option></select></div>
        <div class="v89-edit-field" style="grid-column:1/-1"><label>توضیح حسابرسی</label><textarea id="v89AuditDesc">${esc(a.desc||a.description||'')}</textarea></div>
        <div class="v89-edit-field" style="grid-column:1/-1"><label>یادداشت اصلاح ادمین</label><textarea id="v89AuditAdminNote">${esc(a.adminNote||'')}</textarea></div>
      </div></div>

      <div class="v89-edit-section"><h4>اطلاعات پرونده سمن قابل ویرایش</h4><div class="v89-edit-grid">
        <div class="v89-edit-field"><label>نام سمن</label><input id="v89OName" value="${esc(o.name||'')}"></div>
        <div class="v89-edit-field"><label>شناسه ملی</label><input id="v89ONational" value="${esc(o.nationalId||'')}"></div>
        <div class="v89-edit-field"><label>شماره ثبت</label><input id="v89OReg" value="${esc(o.regNo||'')}"></div>
        <div class="v89-edit-field"><label>حوزه فعالیت</label><input id="v89OActivity" value="${esc(o.activity||'')}"></div>
        <div class="v89-edit-field"><label>مدیرعامل</label><input id="v89OCeo" value="${esc(o.ceo||'')}"></div>
        <div class="v89-edit-field"><label>کد ملی مدیرعامل</label><input id="v89OCeoId" value="${esc(o.ceoNationalId||'')}"></div>
        <div class="v89-edit-field"><label>تماس</label><input id="v89OPhone" value="${esc(o.phone||'')}"></div>
        <div class="v89-edit-field" style="grid-column:1/-1"><label>آدرس</label><textarea id="v89OAddress">${esc(o.address||'')}</textarea></div>
      </div></div>

      <div class="v89-edit-section"><h4>مجوز و حساب بانکی قابل ویرایش</h4><div class="v89-edit-grid">
        <div class="v89-edit-field"><label>وضعیت مجوز</label><select id="v89OLicStatus"><option ${o.licenseStatus==='معتبر'?'selected':''}>معتبر</option><option ${o.licenseStatus==='نزدیک انقضا'?'selected':''}>نزدیک انقضا</option><option ${o.licenseStatus==='منقضی'?'selected':''}>منقضی</option><option ${o.licenseStatus==='در انتظار بررسی'?'selected':''}>در انتظار بررسی</option><option ${!o.licenseStatus?'selected':''}>ثبت نشده</option></select></div>
        <div class="v89-edit-field"><label>شماره مجوز</label><input id="v89OLicNo" value="${esc(o.licenseNo||'')}"></div>
        <div class="v89-edit-field"><label>شروع مجوز</label><input id="v89OLicStart" value="${esc(o.licenseStart||'')}"></div>
        <div class="v89-edit-field"><label>پایان مجوز</label><input id="v89OLicEnd" value="${esc(o.licenseEnd||'')}"></div>
        <div class="v89-edit-field"><label>بانک</label><input id="v89OBank" value="${esc(o.bank||'')}"></div>
        <div class="v89-edit-field"><label>شماره حساب</label><input id="v89OAccount" value="${esc(o.accountNo||'')}"></div>
        <div class="v89-edit-field"><label>شبا</label><input id="v89OSheba" value="${esc(o.sheba||'')}"></div>
        <div class="v89-edit-field"><label>عکس مجوز</label><input type="file" id="v89OLicImg" accept="image/*,.jpg,.jpeg,.png,.webp"></div>
      </div></div>

      <div class="v89-edit-section"><h4>گزارش‌های مالی مرتبط با این سمن</h4>
        <div class="tablewrap"><table class="table"><tr><th>سال</th><th>ماه</th><th>واریزی</th><th>هزینه</th><th>وضعیت</th><th>توضیح</th></tr>${reports.map(r=>`<tr><td>${esc(r.year||'')}</td><td>${esc(r.month||'')}</td><td>${money(r.income)}</td><td>${money(r.expense)}</td><td>${badge(r.status||'ثبت شده')}</td><td>${esc(r.note||'')}</td></tr>`).join('')||'<tr><td colspan="6">گزارش مالی مرتبط ثبت نشده است.</td></tr>'}</table></div>
      </div>

      <div class="actions"><button class="primary" onclick="v89SaveAuditEdit('${id}')">ذخیره اصلاحات</button><button class="ghost" onclick="v89MarkAuditFixed('${id}')">ذخیره و علامت‌گذاری اصلاح شد</button><button class="ghost" onclick="v89CreateCorrectionFromAudit('${id}')">ساخت درخواست اصلاح برای کلاینت</button><button class="ghost" onclick="v89CloseAuditModal()">انصراف</button></div>
    </div>`;
    document.body.appendChild(modal);
  };

  window.v89CloseAuditModal=function(){
    let m=document.getElementById('v89AuditModal');
    if(m)m.remove();
  };

  window.v89SaveAuditEdit=function(id,markFixed=false){
    let a=getAudit(id); if(!a)return;
    let o=getOrgByAudit(a);
    a.orgName=val('v89OrgName');
    a.type=val('v89AuditType');
    a.severity=val('v89AuditSeverity');
    a.status=markFixed?'اصلاح شد':val('v89AuditStatus');
    a.desc=val('v89AuditDesc');
    a.description=val('v89AuditDesc');
    a.adminNote=val('v89AuditAdminNote');
    a.updatedAt=new Date().toLocaleString('fa-IR');
    if(o){
      o.name=val('v89OName');
      o.nationalId=val('v89ONational');
      o.regNo=val('v89OReg');
      o.activity=val('v89OActivity');
      o.ceo=val('v89OCeo');
      o.ceoNationalId=val('v89OCeoId');
      o.phone=val('v89OPhone');
      o.address=val('v89OAddress');
      o.licenseStatus=val('v89OLicStatus');
      o.licenseNo=val('v89OLicNo');
      o.licenseStart=val('v89OLicStart');
      o.licenseEnd=val('v89OLicEnd');
      o.bank=val('v89OBank');
      o.accountNo=val('v89OAccount');
      o.sheba=val('v89OSheba');
      let f=document.getElementById('v89OLicImg')?.files?.[0];
      if(f){
        let r=new FileReader();
        r.onload=function(){
          o.licenseImage=r.result;
          o.licenseImageName=f.name;
          v89FinishSave(id);
        };
        r.readAsDataURL(f);
        return;
      }
    }
    v89FinishSave(id);
  };

  window.v89FinishSave=function(id){
    v89Log('ویرایش مورد حسابرسی و اطلاعات مرتبط: '+id);
    save();
    v89CloseAuditModal();
    alert('اصلاحات ذخیره شد.');
    if(typeof render==='function')render('audit');
  };

  window.v89MarkAuditFixed=function(id){v89SaveAuditEdit(id,true)};

  window.v89CreateCorrectionFromAudit=function(id){
    let a=getAudit(id); if(!a)return;
    state.corrections=state.corrections||[];
    state.corrections.unshift({
      id:uid('corr'),
      orgId:a.orgId,
      orgName:a.orgName,
      title:'اصلاح مورد حسابرسی: '+(a.type||''),
      desc:a.desc||a.description||'',
      deadline:'',
      status:'باز',
      createdAt:today(),
      auditId:a.id
    });
    a.status='نیازمند اصلاح';
    v89Log('ساخت درخواست اصلاح از حسابرسی: '+(a.orgName||''));
    save();
    alert('درخواست اصلاح ساخته شد.');
    v89CloseAuditModal();
    if(typeof render==='function')render('audit');
  };

  window.v89AuditApprove=function(id){
    let a=getAudit(id); if(!a)return;
    a.status='تأیید شده';
    a.updatedAt=new Date().toLocaleString('fa-IR');
    v89Log('تأیید مورد حسابرسی: '+(a.orgName||''));
    save();
    if(typeof render==='function')render('audit');
  };

  window.v89AuditReject=function(id){
    let a=getAudit(id); if(!a)return;
    let reason=prompt('علت رد این مورد حسابرسی را بنویسید:', a.adminNote||'');
    if(reason===null)return;
    a.status='رد شده';
    a.adminNote=reason;
    a.updatedAt=new Date().toLocaleString('fa-IR');
    v89Log('رد مورد حسابرسی: '+(a.orgName||''));
    save();
    if(typeof render==='function')render('audit');
  };

  window.audit=function(){
    v89Ensure();
    return `<div class="actions"><button class="primary" onclick="auditRun(true)">اجرای حسابرسی مجدد</button><button class="ghost" onclick="downloadCSV('حسابرسی.csv',auditCSV())">Excel/CSV</button></div><div class="card"><h3>حسابرسی ادمین با پنجره اصلاح و ویرایش</h3><div class="note info">با زدن دکمه «اصلاح / ویرایش»، پنجره‌ای باز می‌شود که اطلاعات لازم همان سمن، مجوز، حساب بانکی، مدیرعامل و خود مورد حسابرسی را نشان می‌دهد و قابل ویرایش است.</div><div class="score"><span style="width:${score()}%"></span></div><div class="note info">امتیاز سلامت پرونده‌ها: ${score()}٪</div>${v89AudTable(state.auditFindings)}</div>`;
  };

  v89Ensure();
})();
/* ================= END V89 AUDIT EDIT PRO FIX ================= */


/* ================= V90 UPDATE + HISTORY + ERROR + FINAL PDF REVIEW ================= */
(function(){
  function v90Now(){try{return new Date().toLocaleString('fa-IR')}catch(e){return new Date().toISOString()}}
  function v90Clone(obj){try{return JSON.parse(JSON.stringify(obj||{}))}catch(e){return {}}}
  function v90Text(v){return String(v??'').replace(/[<>&]/g,m=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[m]))}
  window.v90Ensure=function(){
    state.version='90';
    state.changeHistory=state.changeHistory||[];
    state.errorLogs=state.errorLogs||[];
    state.updateHistory=state.updateHistory||[];
    state.updateInfo=state.updateInfo||{currentVersion:'V90',latestCheckedVersion:'',lastCheck:'',notes:''};
    state.finalReviewHistory=state.finalReviewHistory||[];
    state.systemHealth=state.systemHealth||{};
  };

  window.v90Record=function(module,action,details,before,after){
    v90Ensure();
    state.changeHistory.unshift({
      id:'chg_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),
      at:v90Now(),
      user:(state.session&&state.session.user)||'admin',
      module:module||'عمومی',
      action:action||'تغییر',
      details:details||'',
      before:before?JSON.stringify(before,null,2).slice(0,2000):'',
      after:after?JSON.stringify(after,null,2).slice(0,2000):''
    });
    state.changeHistory=state.changeHistory.slice(0,700);
    try{save()}catch(e){}
  };

  // Error capture
  window.addEventListener('error',function(ev){
    try{
      v90Ensure();
      state.errorLogs.unshift({at:v90Now(),type:'error',message:String(ev.message||''),source:String(ev.filename||''),line:ev.lineno||'',column:ev.colno||'',stack:String((ev.error&&ev.error.stack)||'')});
      state.errorLogs=state.errorLogs.slice(0,300);
      save();
    }catch(e){}
  });
  window.addEventListener('unhandledrejection',function(ev){
    try{
      v90Ensure();
      let r=ev.reason||{};
      state.errorLogs.unshift({at:v90Now(),type:'promise',message:String(r.message||r),source:'promise',line:'',column:'',stack:String(r.stack||'')});
      state.errorLogs=state.errorLogs.slice(0,300);
      save();
    }catch(e){}
  });

  // Wrap log to also write history, safely.
  if(typeof window.log==='function' && !window.__v90WrappedLog){
    window.__v90WrappedLog=true;
    window.__v90BaseLog=window.log;
    window.log=function(action){
      try{v90Record('لاگ سیستم',action,'ثبت خودکار در تاریخچه تغییرات')}catch(e){}
      return window.__v90BaseLog(action);
    };
  }

  // Wrap audit edit save if exists
  if(typeof window.v89FinishSave==='function' && !window.__v90WrappedAuditSave){
    window.__v90WrappedAuditSave=true;
    window.__v90BaseAuditFinish=window.v89FinishSave;
    window.v89FinishSave=function(id){
      try{v90Record('حسابرسی','ذخیره اصلاحات حسابرسی','شناسه مورد: '+id)}catch(e){}
      return window.__v90BaseAuditFinish(id);
    };
  }

  window.v90DownloadStateBackup=function(prefix='backup_v90'){
    v90Ensure();
    let data={type:'JAVANROOD_NGO_ADMIN_BACKUP',version:'V90',createdAt:v90Now(),state:state};
    downloadJSON(prefix+'_'+Date.now()+'.json',data);
    v90Record('بکاپ','دانلود بکاپ قبل از آپدیت','بکاپ کامل وضعیت برنامه ساخته شد.');
  };

  window.v90UpdatePanel=function(){
    v90Ensure();
    return `<div class="v90-hero"><h3>ماژول به‌روزرسانی نسخه جدید</h3><p>قبل از هر آپدیت، بکاپ بگیر. سپس فایل معرفی نسخه جدید یا بسته آپدیت را وارد کن و وضعیت را ثبت کن. این ماژول جلوی آپدیت کورکورانه را می‌گیرد.</p></div>
    <div class="v90-grid">
      <div class="v90-card"><h3>وضعیت نسخه</h3><p><b>نسخه فعلی:</b> ${v90Text(state.version||'نامشخص')}</p><p><b>آخرین بررسی:</b> ${v90Text(state.updateInfo.lastCheck||'ثبت نشده')}</p><p><b>نسخه بررسی‌شده:</b> ${v90Text(state.updateInfo.latestCheckedVersion||'ثبت نشده')}</p><div class="v90-actions"><button onclick="v90CheckVersion()">ثبت بررسی نسخه</button><button onclick="v90DownloadStateBackup('pre_update_backup')">بکاپ قبل از آپدیت</button></div></div>
      <div class="v90-card"><h3>ورود فایل آپدیت / معرفی نسخه</h3><div class="field"><label>فایل JSON معرفی نسخه</label><input type="file" id="v90UpdateFile" accept=".json,application/json"></div><div class="v90-actions"><button onclick="v90ReadUpdateFile()">بررسی فایل</button><button onclick="v90ApplyUpdateInfo()">ثبت به‌عنوان نسخه بررسی‌شده</button></div><div id="v90UpdatePreview" class="v90-mini">فایلی انتخاب نشده است.</div></div>
      <div class="v90-card"><h3>راهنمای آپدیت امن</h3><div class="v90-checklist"><div class="v90-check ok">۱. بکاپ کامل بگیر</div><div class="v90-check ok">۲. فایل نسخه جدید را بررسی کن</div><div class="v90-check warn">۳. اگر نسخه رسمی بود، بسته جدید را جایگزین کن</div><div class="v90-check ok">۴. بعد از اجرا، سلامت داده را کنترل کن</div></div></div>
    </div>
    <div class="v90-card" style="margin-top:12px"><h3>تاریخچه آپدیت‌ها</h3>${v90UpdateTable()}</div>`;
  };
  window.v90UpdateTable=function(){
    let arr=state.updateHistory||[];
    return `<div class="tablewrap"><table class="table"><tr><th>تاریخ</th><th>نسخه</th><th>عنوان</th><th>توضیح</th></tr>${arr.map(x=>`<tr><td>${v90Text(x.at)}</td><td>${v90Text(x.version)}</td><td>${v90Text(x.title)}</td><td>${v90Text(x.notes)}</td></tr>`).join('')||'<tr><td colspan="4">هنوز آپدیتی ثبت نشده است.</td></tr>'}</table></div>`;
  };
  window.v90CheckVersion=function(){
    v90Ensure();
    state.updateInfo.lastCheck=v90Now();
    state.updateInfo.latestCheckedVersion=prompt('شماره نسخه جدید را وارد کنید:',state.updateInfo.latestCheckedVersion||'V91')||state.updateInfo.latestCheckedVersion;
    v90Record('آپدیت','بررسی نسخه جدید','نسخه بررسی‌شده: '+state.updateInfo.latestCheckedVersion);
    save();render('updates');
  };
  window.v90PendingUpdate=null;
  window.v90ReadUpdateFile=function(){
    let f=document.getElementById('v90UpdateFile')?.files?.[0];
    if(!f){alert('فایل معرفی نسخه را انتخاب کنید.');return}
    let r=new FileReader();
    r.onload=function(){
      try{
        let obj=JSON.parse(r.result);
        window.v90PendingUpdate=obj;
        let text=JSON.stringify(obj,null,2);
        document.getElementById('v90UpdatePreview').innerHTML='<pre class="v90-code">'+v90Text(text)+'</pre>';
      }catch(e){alert('فایل JSON معتبر نیست.')}
    };
    r.readAsText(f,'utf-8');
  };
  window.v90ApplyUpdateInfo=function(){
    if(!window.v90PendingUpdate){alert('اول فایل آپدیت را بررسی کنید.');return}
    let u=window.v90PendingUpdate;
    state.updateInfo.lastCheck=v90Now();
    state.updateInfo.latestCheckedVersion=u.version||u.name||'نامشخص';
    state.updateInfo.notes=u.notes||u.description||'';
    state.updateHistory.unshift({at:v90Now(),version:state.updateInfo.latestCheckedVersion,title:u.title||'معرفی نسخه',notes:state.updateInfo.notes});
    v90Record('آپدیت','ثبت اطلاعات نسخه جدید',state.updateInfo.latestCheckedVersion);
    save();render('updates');
  };

  window.v90HistoryPanel=function(){
    v90Ensure();
    let q=(document.getElementById('v90HistorySearch')?.value||'').trim();
    let rows=(state.changeHistory||[]).filter(x=>!q||JSON.stringify(x).includes(q));
    return `<div class="v90-hero"><h3>ماژول تاریخچه تغییرات پرونده‌ها</h3><p>هر تغییر مهم در اینجا ثبت می‌شود: زمان، کاربر، بخش، عملیات و جزئیات. این بخش برای ردیابی اداری ضروری است.</p></div>
    <div class="v90-card no-print"><div class="grid3"><div class="field"><label>جستجو</label><input id="v90HistorySearch" value="${v90Text(q)}" placeholder="نام سمن، حسابرسی، مجوز..." onkeydown="if(event.key==='Enter')render('history')"></div><div class="field"><label>خروجی</label><button class="primary" onclick="downloadJSON('change_history_v90.json',state.changeHistory||[])">دانلود تاریخچه</button></div><div class="field"><label>عملیات</label><button class="ghost" onclick="v90Record('تست','ثبت دستی','رکورد تست تاریخچه')">ثبت رکورد تست</button></div></div></div>
    <div class="v90-card"><h3>تاریخچه تغییرات</h3><div class="tablewrap"><table class="table"><tr><th>زمان</th><th>کاربر</th><th>بخش</th><th>عملیات</th><th>جزئیات</th></tr>${rows.map(x=>`<tr><td>${v90Text(x.at)}</td><td>${v90Text(x.user)}</td><td>${v90Text(x.module)}</td><td>${v90Text(x.action)}</td><td>${v90Text(x.details)}</td></tr>`).join('')||'<tr><td colspan="5">تاریخچه‌ای ثبت نشده است.</td></tr>'}</table></div></div>`;
  };

  window.v90ErrorPanel=function(){
    v90Ensure();
    return `<div class="v90-hero"><h3>ماژول گزارش خطا و عیب‌یابی</h3><p>اگر صفحه سفید، قفل شدن، خطای گزارش یا مشکل فایل رخ دهد، اینجا ثبت می‌شود و می‌توان فایل خطا را برای بررسی خروجی گرفت.</p></div>
    <div class="v90-grid">
      <div class="v90-card"><h3>وضعیت خطا</h3><p><b>تعداد خطاها:</b> ${(state.errorLogs||[]).length}</p><div class="v90-actions"><button onclick="downloadJSON('error_report_v90.json',state.errorLogs||[])">دانلود گزارش خطا</button><button onclick="v90ClearErrors()">پاک کردن خطاها</button><button onclick="v90FakeError()">ثبت خطای تست</button></div></div>
      <div class="v90-card"><h3>بسته پشتیبانی</h3><p class="v90-mini">این بسته شامل خطاها، نسخه، تعداد رکوردها و وضعیت کلی است.</p><button class="primary" onclick="v90DownloadSupportPack()">دانلود بسته پشتیبانی</button></div>
      <div class="v90-card"><h3>راهنمای خطایابی</h3><div class="v90-checklist"><div class="v90-check warn">اگر صفحه سفید شد: admin?reset=1</div><div class="v90-check ok">اگر گزارش قفل کرد: از گزارش سبک استفاده کن</div><div class="v90-check ok">قبل از آپدیت بکاپ بگیر</div><div class="v90-check warn">خطاها را برای بررسی نگه دار</div></div></div>
    </div>
    <div class="v90-card" style="margin-top:12px"><h3>لیست خطاها</h3><div class="tablewrap"><table class="table"><tr><th>زمان</th><th>نوع</th><th>پیام</th><th>منبع</th><th>خط</th></tr>${(state.errorLogs||[]).map(e=>`<tr><td>${v90Text(e.at)}</td><td>${v90Text(e.type)}</td><td>${v90Text(e.message)}</td><td>${v90Text(e.source)}</td><td>${v90Text(e.line)}</td></tr>`).join('')||'<tr><td colspan="5">خطایی ثبت نشده است.</td></tr>'}</table></div></div>`;
  };
  window.v90ClearErrors=function(){if(confirm('خطاها پاک شوند؟')){state.errorLogs=[];save();render('errors')}}
  window.v90FakeError=function(){state.errorLogs.unshift({at:v90Now(),type:'test',message:'خطای تست برای بررسی ماژول',source:'manual',line:'',column:'',stack:''});save();render('errors')}
  window.v90DownloadSupportPack=function(){
    let pack={type:'JAVANROOD_SUPPORT_PACK',version:'V90',createdAt:v90Now(),counts:{orgs:state.orgs?.length||0,reports:state.reports?.length||0,audits:state.auditFindings?.length||0,errors:state.errorLogs?.length||0},errors:state.errorLogs||[],lastChanges:(state.changeHistory||[]).slice(0,50)};
    downloadJSON('support_pack_v90.json',pack);
  };

  window.v90ReviewChecks=function(){
    let checks=[];
    let orgs=state.orgs||[];
    let signers=(state.settings&&state.settings.signers)||[];
    let missingLicense=orgs.filter(o=>!o.licenseImage).length;
    let missingBoard=orgs.filter(o=>!(o.board||[]).length&&!o.ceo).length;
    let missingCeo=orgs.filter(o=>!o.ceo||!o.ceoNationalId).length;
    let openAudit=(state.auditFindings||[]).filter(a=>!a.status||a.status==='باز'||a.status==='نیازمند اصلاح').length;
    let missingSigners=signers.filter(s=>!s.name).length;
    checks.push({label:'عکس مجوز برای سمن‌ها',ok:missingLicense===0,detail:missingLicense?`${missingLicense} سمن عکس مجوز ندارد.`:'همه عکس مجوز دارند.'});
    checks.push({label:'هیأت مدیره / مدیرعامل',ok:missingBoard===0&&missingCeo===0,detail:(missingBoard||missingCeo)?`پرونده ناقص: هیأت مدیره ${missingBoard}، مدیرعامل ${missingCeo}`:'اطلاعات اصلی کامل است.'});
    checks.push({label:'امضاکنندگان گزارش',ok:missingSigners===0,detail:missingSigners?`${missingSigners} امضاکننده نام ندارد.`:'امضاها تعریف شده‌اند.'});
    checks.push({label:'حسابرسی باز',ok:openAudit===0,detail:openAudit?`${openAudit} مورد حسابرسی باز یا نیازمند اصلاح است.`:'حسابرسی باز وجود ندارد.'});
    checks.push({label:'وجود اطلاعات گزارش',ok:(state.reports||[]).length>0,detail:(state.reports||[]).length?`${state.reports.length} گزارش ثبت شده است.`:'گزارش مالی ثبت نشده است.'});
    return checks;
  };
  window.v90FinalPdfReviewPanel=function(){
    v90Ensure();
    let checks=v90ReviewChecks();
    let okCount=checks.filter(c=>c.ok).length;
    let score=Math.round(okCount/checks.length*100);
    return `<div class="v90-hero"><h3>ماژول بازبینی نهایی قبل از خروجی PDF</h3><p>قبل از صدور گزارش نهایی، سیستم بررسی می‌کند عکس مجوز، هیأت مدیره، امضاها، حسابرسی و داده‌های اصلی آماده باشند.</p></div>
    <div class="v90-card"><h3>امتیاز آمادگی صدور PDF: ${score}٪</h3><div class="v90-checklist">${checks.map(c=>`<div class="v90-check ${c.ok?'ok':'bad'}"><b>${v90Text(c.label)}</b><br>${v90Text(c.detail)}</div>`).join('')}</div><div class="v90-actions"><button onclick="v90ApproveFinalReview()">ثبت بازبینی نهایی</button><button onclick="v90PrintAfterReview()">چاپ/PDF بعد از بازبینی</button><button onclick="downloadJSON('final_pdf_review_v90.json',v90ReviewChecks())">دانلود نتیجه بازبینی</button></div></div>`;
  };
  window.v90ApproveFinalReview=function(){
    let checks=v90ReviewChecks(), ok=checks.every(c=>c.ok);
    state.finalReviewHistory.unshift({at:v90Now(),user:(state.session&&state.session.user)||'admin',ok,checks});
    v90Record('بازبینی PDF','ثبت بازبینی نهایی',ok?'آماده صدور':'دارای نقص');
    save();alert(ok?'بازبینی نهایی با موفقیت ثبت شد.':'بازبینی ثبت شد اما هنوز موارد ناقص وجود دارد.');
    render('finalpdf');
  };
  window.v90PrintAfterReview=function(){
    let checks=v90ReviewChecks(), ok=checks.every(c=>c.ok);
    if(!ok && !confirm('برخی موارد بازبینی ناقص هستند. با همین وضعیت چاپ شود؟'))return;
    v90ApproveFinalReview();
    setTimeout(()=>window.print(),200);
  };

  // Override final if existing, keep old under finalChecklistV84
  window.finalpdf=v90FinalPdfReviewPanel;

  v90Ensure();
})();
/* ================= END V90 UPDATE + HISTORY + ERROR + FINAL PDF REVIEW ================= */


/* ================= V91 SQLITE PERSISTENCE + BACKUP + MIGRATION ================= */
(function(){
  function v91Now(){try{return new Date().toLocaleString('fa-IR')}catch(e){return new Date().toISOString()}}
  function v91Esc(v){return String(v??'').replace(/[<>&]/g,m=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[m]))}
  window.v91SyncTimer=null;
  window.v91LastSync='';
  window.v91DbStatus=null;
  window.v91AppKey='admin';

  window.v91Ensure=function(){
    state.version='91';
    state.sqlitePersistence=state.sqlitePersistence||{enabled:true,lastSync:'',lastLoad:'',dbUpdatedAt:'',status:'local'};
    state.migrationHistory=state.migrationHistory||[];
    state.realBackupHistory=state.realBackupHistory||[];
  };

  async function v91FetchJSON(url, options){
    let res=await fetch(url, Object.assign({headers:{'Content-Type':'application/json'}}, options||{}));
    let txt=await res.text();
    let data={};
    try{data=txt?JSON.parse(txt):{}}catch(e){data={ok:false,error:txt}}
    if(!res.ok || data.ok===false) throw new Error(data.error||('HTTP '+res.status));
    return data;
  }

  window.v91SyncToSQLite=async function(note='auto'){
    try{
      v91Ensure();
      if(!state.sqlitePersistence.enabled)return {ok:false,skipped:true};
      let data=await v91FetchJSON('/api/state/save',{method:'POST',body:JSON.stringify({app:v91AppKey,state:state,note})});
      state.sqlitePersistence.lastSync=v91Now();
      state.sqlitePersistence.dbUpdatedAt=data.updated_at||'';
      state.sqlitePersistence.status='synced';
      window.v91LastSync=state.sqlitePersistence.lastSync;
      // write local without recursive wrapped save
      try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}
      return data;
    }catch(e){
      console.warn('V91 sync failed:',e);
      try{state.sqlitePersistence.status='sync_failed';localStorage.setItem(KEY,JSON.stringify(state))}catch(_){}
      return {ok:false,error:e.message};
    }
  };

  window.v91LoadFromSQLite=async function(force=false){
    try{
      let data=await v91FetchJSON('/api/state/load?app='+encodeURIComponent(v91AppKey));
      if(data.exists && data.state){
        if(force || !localStorage.getItem(KEY)){
          state=Object.assign(state,data.state);
          state.sqlitePersistence=state.sqlitePersistence||{};
          state.sqlitePersistence.lastLoad=v91Now();
          state.sqlitePersistence.dbUpdatedAt=data.updated_at||'';
          state.sqlitePersistence.status='loaded';
          localStorage.setItem(KEY,JSON.stringify(state));
        }
        return data;
      }else{
        await v91SyncToSQLite('initial migration from localStorage');
        return {ok:true,exists:false,migrated:true};
      }
    }catch(e){
      console.warn('V91 load failed:',e);
      return {ok:false,error:e.message};
    }
  };

  // Wrap save. SQLite sync is async and debounced so UI stays fast.
  if(typeof window.save==='function' && !window.__v91WrappedSave){
    window.__v91WrappedSave=true;
    window.__v91BaseSave=window.save;
    window.save=function(){
      window.__v91BaseSave();
      try{
        clearTimeout(window.v91SyncTimer);
        window.v91SyncTimer=setTimeout(()=>v91SyncToSQLite('debounced save'),650);
      }catch(e){}
    };
  }

  // Startup gate: V88 will call v91Start if present.
  window.v91Start=async function(){
    try{
      v91Ensure();
      if(location.search.indexOf('reset=1')>-1){
        localStorage.clear();
        location.href=location.pathname;
        return;
      }
      await v91LoadFromSQLite(false);
    }catch(e){console.warn('V91 startup load failed:',e)}
    if(typeof v88Start==='function')v88Start();
    else if(state&&state.session)render('dashboard');
    else loginPage();
  };

  window.v91DbPanel=async function(){
    v91Ensure();
    let html=`<div class="v91-hero"><h3>ماژول دیتابیس پایدار SQLite</h3><p>اطلاعات دیگر فقط در حافظه مرورگر نمی‌ماند. با هر ذخیره، وضعیت برنامه در دیتابیس SQLite سمت پایتون ذخیره می‌شود. این پایه نسخه اداری پایدار است.</p></div>
    <div class="v91-grid">
      <div class="v91-card"><h3>وضعیت اتصال</h3><div class="v91-status ${state.sqlitePersistence.status==='synced'||state.sqlitePersistence.status==='loaded'?'ok':'warn'}">وضعیت: ${v91Esc(state.sqlitePersistence.status||'نامشخص')}<br>آخرین Sync: ${v91Esc(state.sqlitePersistence.lastSync||'ثبت نشده')}<br>آخرین Load: ${v91Esc(state.sqlitePersistence.lastLoad||'ثبت نشده')}</div><div class="v91-actions"><button onclick="v91ManualSync()">ذخیره در SQLite</button><button onclick="v91ManualLoad()">خواندن از SQLite</button><button onclick="v91RefreshDbStatus()">بررسی وضعیت DB</button></div></div>
      <div class="v91-card"><h3>بکاپ واقعی</h3><p>بکاپ کامل شامل دیتابیس SQLite، فایل‌های UI و export JSON وضعیت برنامه است.</p><div class="v91-actions"><button onclick="v91FullBackup()">ساخت بکاپ کامل</button><button onclick="location.href='/api/db/download'">دانلود فایل SQLite</button></div></div>
      <div class="v91-card"><h3>مهاجرت داده</h3><p>بکاپ JSON نسخه‌های قبل یا LocalStorage را وارد کن تا در SQLite ثبت شود.</p><input type="file" id="v91MigrateFile" accept=".json,application/json"><div class="v91-actions"><button onclick="v91ImportJsonBackup()">ورود و ذخیره در SQLite</button></div></div>
    </div>
    <div class="v91-card" style="margin-top:12px"><h3>وضعیت دیتابیس</h3><div id="v91DbStatusBox" class="v91-code">برای مشاهده وضعیت، روی «بررسی وضعیت DB» بزنید.</div></div>`;
    setTimeout(v91RefreshDbStatus,80);
    return html;
  };

  window.v91ManualSync=async function(){
    let r=await v91SyncToSQLite('manual sync');
    alert(r.ok?'اطلاعات در SQLite ذخیره شد.':'ذخیره در SQLite ناموفق بود: '+(r.error||''));
    render('database');
  };
  window.v91ManualLoad=async function(){
    if(!confirm('اطلاعات از SQLite خوانده و روی وضعیت فعلی اعمال شود؟'))return;
    let r=await v91LoadFromSQLite(true);
    alert(r.ok?'اطلاعات از SQLite خوانده شد.':'خواندن از SQLite ناموفق بود: '+(r.error||''));
    location.reload();
  };
  window.v91RefreshDbStatus=async function(){
    try{
      let data=await v91FetchJSON('/api/db/status');
      window.v91DbStatus=data.database;
      let box=document.getElementById('v91DbStatusBox');
      if(box)box.textContent=JSON.stringify(data.database,null,2);
    }catch(e){
      let box=document.getElementById('v91DbStatusBox');
      if(box)box.textContent='خطا در دریافت وضعیت دیتابیس: '+e.message;
    }
  };
  window.v91FullBackup=async function(){
    try{
      await v91SyncToSQLite('backup before full backup');
      let data=await v91FetchJSON('/api/backup/full');
      state.realBackupHistory.unshift({at:v91Now(),backup:data.backup,path:data.path});
      save();
      if(confirm('بکاپ کامل ساخته شد. دانلود شود؟')) location.href=data.download;
    }catch(e){alert('ساخت بکاپ کامل ناموفق بود: '+e.message)}
  };
  window.v91ImportJsonBackup=function(){
    let f=document.getElementById('v91MigrateFile')?.files?.[0];
    if(!f){alert('فایل JSON را انتخاب کنید.');return}
    let r=new FileReader();
    r.onload=async function(){
      try{
        let obj=JSON.parse(r.result);
        let newState=(obj&&obj.state&&typeof obj.state==='object')?obj.state:obj;
        if(!confirm('این فایل روی وضعیت فعلی اعمال و در SQLite ذخیره شود؟'))return;
        state=Object.assign(state,newState);
        v91Ensure();
        state.migrationHistory.unshift({at:v91Now(),file:f.name,note:'مهاجرت از JSON/Backup'});
        localStorage.setItem(KEY,JSON.stringify(state));
        await v91SyncToSQLite('migration from json file '+f.name);
        alert('مهاجرت انجام شد و در SQLite ذخیره شد.');
        location.reload();
      }catch(e){alert('فایل مهاجرت معتبر نیست: '+e.message)}
    };
    r.readAsText(f,'utf-8');
  };

  // If V90 tabs were mapped before function definitions, this makes them safe too.
  window.database=v91DbPanel;

  v91Ensure();
})();
/* ================= END V91 SQLITE PERSISTENCE + BACKUP + MIGRATION ================= */


/* ================= V92 REAL ROLES + CLICKABLE DASHBOARD + ALERTS ================= */
(function(){
  function v92Now(){try{return new Date().toLocaleString('fa-IR')}catch(e){return new Date().toISOString()}}
  function v92E(v){return typeof esc==='function'?esc(v):String(v??'')}
  window.v92AllTabs=[
    ['dashboard','داشبورد'],['users','کاربران و فعال‌سازی'],['import','ورود فایل سمن‌ها'],['workflow','گردش کار گزارش‌ها'],
    ['orgs','اطلاعات سمن‌ها'],['reports','گزارش‌گیری'],['annual','پایان سال'],['audit','حسابرسی'],['word','خروجی Word'],
    ['beneficiaries','مددجوها'],['documents','بایگانی مدارک'],['corrections','درخواست اصلاح'],['database','دیتابیس پایدار'],
    ['updates','آپدیت نسخه'],['history','تاریخچه تغییرات'],['errors','گزارش خطا'],['finalpdf','بازبینی PDF'],['alerts','هشدارها'],
    ['access','سطح دسترسی'],['roles','نقش‌ها'],['templates','قالب‌ها'],['settings','تنظیمات'],['backup','بکاپ'],['logs','لاگ']
  ];
  window.v92DefaultRolePerms=function(kind){
    let all=v92AllTabs.map(x=>x[0]);
    if(kind==='system_admin')return all;
    if(kind==='social_expert')return ['dashboard','orgs','reports','annual','audit','workflow','corrections','documents','beneficiaries','alerts','word','finalpdf'];
    if(kind==='financial_expert')return ['dashboard','reports','annual','audit','alerts','word','finalpdf'];
    if(kind==='operator')return ['dashboard','users','import','orgs','beneficiaries','documents','alerts'];
    if(kind==='viewer')return ['dashboard','orgs','reports','annual','alerts'];
    return ['dashboard'];
  };
  window.v92Ensure=function(){
    state.version='92';
    state.rolesV92=state.rolesV92||[
      {id:'system_admin',name:'مدیر سامانه',permissions:v92DefaultRolePerms('system_admin'),description:'همه دسترسی‌ها'},
      {id:'social_expert',name:'کارشناس امور اجتماعی',permissions:v92DefaultRolePerms('social_expert'),description:'پرونده، گزارش، حسابرسی و اصلاح'},
      {id:'financial_expert',name:'کارشناس مالی',permissions:v92DefaultRolePerms('financial_expert'),description:'گزارش مالی و حسابرسی مالی'},
      {id:'operator',name:'اپراتور ثبت اطلاعات',permissions:v92DefaultRolePerms('operator'),description:'ثبت و ورود اطلاعات'},
      {id:'viewer',name:'مشاهده‌گر',permissions:v92DefaultRolePerms('viewer'),description:'فقط مشاهده و گزارش محدود'}
    ];
    state.adminAccounts=state.adminAccounts||[{username:(state.settings&&state.settings.adminUser)||'admin',fullName:'مدیر سامانه',roleId:'system_admin',active:true}];
    state.alertRules=state.alertRules||{licenseDays:30,missingMonthlyReports:true,missingLicenseImage:true,missingBoard:true,openAudit:true};
    state.alertArchive=state.alertArchive||[];
  };
  window.v92CurrentAccount=function(){
    v92Ensure();
    let u=(state.session&&state.session.user)||((state.settings&&state.settings.adminUser)||'admin');
    return (state.adminAccounts||[]).find(a=>a.username===u)||state.adminAccounts[0]||{username:u,roleId:'system_admin',active:true};
  };
  window.v92CurrentRole=function(){
    let acc=v92CurrentAccount();
    return (state.rolesV92||[]).find(r=>r.id===acc.roleId)||state.rolesV92[0];
  };
  window.v92Can=function(tab){
    v92Ensure();
    if(!tab || tab==='logout')return true;
    let role=v92CurrentRole();
    if(!role || role.id==='system_admin')return true;
    return (role.permissions||[]).includes(tab);
  };
  window.v92Denied=function(tab){
    let role=v92CurrentRole();
    return `<div class="v92-denied"><h2>دسترسی غیرمجاز</h2><p>نقش فعلی شما «${v92E(role.name)}» اجازه ورود به این بخش را ندارد.</p><p><b>بخش:</b> ${v92E((v92AllTabs.find(x=>x[0]===tab)||[tab,tab])[1])}</p><button class="primary" onclick="render('dashboard')">بازگشت به داشبورد</button></div>`;
  };

  // Wrap render once, after all older render versions exist.
  if(typeof window.render==='function' && !window.__v92WrappedRender){
    window.__v92WrappedRender=true;
    window.__v92BaseRender=window.render;
    window.render=function(tab='dashboard'){
      try{
        v92Ensure();
        if(!v92Can(tab)){
          if(typeof shell==='function')shell(tab,v92Denied(tab));
          else document.body.innerHTML=v92Denied(tab);
          return;
        }
        return window.__v92BaseRender(tab);
      }catch(e){
        console.error('V92 render error:',e);
        let root=document.getElementById('root');
        if(root)root.innerHTML=`<div class="card"><h3>خطا در نمایش بخش</h3><div class="note bad">${v92E(e.message||e)}</div><button class="primary" onclick="render('dashboard')">داشبورد</button></div>`;
      }
    };
  }

  window.v92DaysUntil=function(dateStr){
    if(!dateStr)return null;
    let s=String(dateStr).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
    let m=s.match(/(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/);
    if(!m)return null;
    // Works for Gregorian dates; for Persian textual dates, keep it advisory.
    let dt=new Date(Number(m[1]),Number(m[2])-1,Number(m[3]));
    if(isNaN(dt.getTime()))return null;
    return Math.ceil((dt-new Date())/86400000);
  };
  window.v92Alerts=function(){
    v92Ensure();
    let out=[];
    (state.orgs||[]).forEach(o=>{
      if(state.alertRules.missingLicenseImage && !o.licenseImage)out.push({id:'img_'+o.id,orgId:o.id,orgName:o.name,type:'مجوز',severity:'medium',title:'عکس مجوز ثبت نشده',desc:'برای این سمن تصویر مجوز ثبت نشده است.',target:'orgs'});
      if(state.alertRules.missingBoard && !(o.board||[]).length)out.push({id:'board_'+o.id,orgId:o.id,orgName:o.name,type:'هیأت مدیره',severity:'medium',title:'هیأت مدیره ناقص',desc:'اعضای هیأت مدیره برای این سمن کامل نیست.',target:'orgs'});
      if(!o.ceo || !o.ceoNationalId)out.push({id:'ceo_'+o.id,orgId:o.id,orgName:o.name,type:'مدیرعامل',severity:'high',title:'مدیرعامل ناقص',desc:'نام یا کد ملی مدیرعامل ناقص است.',target:'orgs'});
      if(!o.licenseNo || o.licenseStatus==='منقضی')out.push({id:'lic_'+o.id,orgId:o.id,orgName:o.name,type:'مجوز',severity:'high',title:'مجوز ناقص یا منقضی',desc:'شماره یا وضعیت مجوز نیازمند بررسی است.',target:'orgs'});
      let days=v92DaysUntil(o.licenseEnd);
      if(days!==null && days>=0 && days<=(state.alertRules.licenseDays||30))out.push({id:'licdays_'+o.id,orgId:o.id,orgName:o.name,type:'مجوز',severity:'medium',title:'نزدیک انقضای مجوز',desc:`مجوز حدود ${days} روز دیگر منقضی می‌شود.`,target:'orgs'});
    });
    if(state.alertRules.openAudit)(state.auditFindings||[]).filter(a=>!a.status||a.status==='باز'||a.status==='نیازمند اصلاح').forEach(a=>out.push({id:'audit_'+a.id,orgId:a.orgId,orgName:a.orgName,type:'حسابرسی',severity:'high',title:'حسابرسی باز',desc:a.desc||a.description||'مورد حسابرسی باز است.',target:'audit'}));
    if(state.alertRules.missingMonthlyReports){
      let year=((state.reports&&state.reports[0]&&state.reports[0].year)||'۱۴۰۳');
      (state.orgs||[]).forEach(o=>{
        let count=(state.reports||[]).filter(r=>String(r.orgId)===String(o.id)&&String(r.year||'')===String(year)).length;
        if(count<12)out.push({id:'month_'+o.id,orgId:o.id,orgName:o.name,type:'گزارش سالیانه',severity:count? 'medium':'high',title:'گزارش ماهانه ناقص',desc:`برای سال ${year} فقط ${count} ماه گزارش ثبت شده است.`,target:'annual'});
      });
    }
    // remove archived alerts
    let archived=new Set((state.alertArchive||[]).map(x=>x.id));
    return out.filter(a=>!archived.has(a.id));
  };
  window.v92AlertCard=function(a){
    return `<div class="v92-alert ${a.severity==='high'?'high':a.severity==='medium'?'medium':'low'}"><b>${v92E(a.title)}</b> <span class="v90-badge">${v92E(a.type)}</span><br>${v92E(a.orgName||'')} - ${v92E(a.desc)}<div class="v92-filterbar"><button onclick="v92GoAlert('${a.target}','${a.orgId||''}')">مشاهده</button><button onclick="v92ArchiveAlert('${a.id}')">بایگانی هشدار</button></div></div>`;
  };
  window.v92GoAlert=function(tab,orgId){
    state.lastFocusedOrgId=orgId||'';
    save();
    render(tab||'dashboard');
  };
  window.v92ArchiveAlert=function(id){
    state.alertArchive=state.alertArchive||[];
    state.alertArchive.unshift({id,at:v92Now(),user:(state.session&&state.session.user)||'admin'});
    save();
    render('alerts');
  };
  window.v92AlertsPanel=function(){
    let alerts=v92Alerts();
    let high=alerts.filter(a=>a.severity==='high').length, med=alerts.filter(a=>a.severity==='medium').length;
    return `<div class="v92-hero"><h3>مرکز هشدارها و اعلان‌های مدیریتی</h3><p>هشدارهای ناقص بودن پرونده، مجوز، هیأت مدیره، حسابرسی باز و گزارش‌های ماهانه در این بخش جمع می‌شود.</p></div>
    <div class="v92-kpis"><div class="v92-kpi"><span>کل هشدارها</span><b>${alerts.length}</b><small>فعال و بایگانی‌نشده</small></div><div class="v92-kpi"><span>شدت بالا</span><b>${high}</b><small>نیازمند اقدام فوری</small></div><div class="v92-kpi"><span>شدت متوسط</span><b>${med}</b><small>نیازمند پیگیری</small></div><div class="v92-kpi"><span>بایگانی‌شده</span><b>${(state.alertArchive||[]).length}</b><small>هشدارهای بسته‌شده</small></div></div>
    <div class="v92-grid"><div class="v92-card no-print"><h3>تنظیمات هشدار</h3><div class="field"><label>هشدار انقضای مجوز چند روز قبل؟</label><input id="v92LicenseDays" value="${state.alertRules.licenseDays||30}"></div><label><input type="checkbox" id="v92RuleImg" ${state.alertRules.missingLicenseImage?'checked':''}> عکس مجوز</label><br><label><input type="checkbox" id="v92RuleBoard" ${state.alertRules.missingBoard?'checked':''}> هیأت مدیره</label><br><label><input type="checkbox" id="v92RuleAudit" ${state.alertRules.openAudit?'checked':''}> حسابرسی باز</label><br><label><input type="checkbox" id="v92RuleMonth" ${state.alertRules.missingMonthlyReports?'checked':''}> گزارش ماهانه ناقص</label><div class="v92-filterbar"><button onclick="v92SaveAlertRules()">ذخیره تنظیمات</button><button onclick="downloadJSON('alerts_v92.json',v92Alerts())">خروجی هشدارها</button></div></div><div class="v92-card" style="grid-column:span 2"><h3>هشدارهای فعال</h3>${alerts.map(v92AlertCard).join('')||'<div class="v92-alert low">هشدار فعالی وجود ندارد.</div>'}</div></div>`;
  };
  window.v92SaveAlertRules=function(){
    state.alertRules.licenseDays=num(document.getElementById('v92LicenseDays')?.value||30);
    state.alertRules.missingLicenseImage=!!document.getElementById('v92RuleImg')?.checked;
    state.alertRules.missingBoard=!!document.getElementById('v92RuleBoard')?.checked;
    state.alertRules.openAudit=!!document.getElementById('v92RuleAudit')?.checked;
    state.alertRules.missingMonthlyReports=!!document.getElementById('v92RuleMonth')?.checked;
    save();render('alerts');
  };

  window.v92Dashboard=function(){
    let alerts=v92Alerts(), high=alerts.filter(a=>a.severity==='high').length, med=alerts.filter(a=>a.severity==='medium').length;
    let income=(state.reports||[]).reduce((s,r)=>s+num(r.income),0), expense=(state.reports||[]).reduce((s,r)=>s+num(r.expense),0);
    return `<div class="v92-hero"><h3>داشبورد مدیریتی قابل کلیک</h3><p>هر کارت مستقیم شما را به بخش مربوطه می‌برد. این داشبورد برای مدیریت سریع پرونده‌ها، هشدارها، حسابرسی و گزارش‌ها طراحی شده است.</p></div>
    <div class="v92-kpis">
      <div class="v92-kpi" onclick="render('orgs')"><span>تعداد سمن‌ها</span><b>${state.orgs.length}</b><small>مشاهده پرونده‌ها</small></div>
      <div class="v92-kpi" onclick="render('users')"><span>کاربران کلاینت</span><b>${state.users.length}</b><small>فعال‌سازی و ریست</small></div>
      <div class="v92-kpi" onclick="render('import')"><span>فایل‌های واردشده</span><b>${state.imports.length}</b><small>ورود خروجی سمن‌ها</small></div>
      <div class="v92-kpi" onclick="render('alerts')"><span>هشدارهای فعال</span><b>${alerts.length}</b><small>${high} فوری / ${med} متوسط</small></div>
      <div class="v92-kpi" onclick="render('audit')"><span>حسابرسی باز</span><b>${(state.auditFindings||[]).filter(a=>!a.status||a.status==='باز'||a.status==='نیازمند اصلاح').length}</b><small>اصلاح یا تأیید</small></div>
      <div class="v92-kpi" onclick="render('reports')"><span>گزارش‌های مالی</span><b>${state.reports.length}</b><small>گزارش‌گیری کامل</small></div>
      <div class="v92-kpi" onclick="render('annual')"><span>درآمد / هزینه</span><b>${money(income-expense)}</b><small>مانده کل ثبت‌شده</small></div>
      <div class="v92-kpi" onclick="render('database')"><span>دیتابیس</span><b>${state.sqlitePersistence?.status||'local'}</b><small>SQLite و بکاپ</small></div>
    </div>
    <div class="v92-grid"><div class="v92-card"><h3>هشدارهای فوری</h3>${alerts.filter(a=>a.severity==='high').slice(0,5).map(v92AlertCard).join('')||'<div class="v92-alert low">هشدار فوری وجود ندارد.</div>'}</div><div class="v92-card"><h3>دسترسی فعلی</h3><p><b>کاربر:</b> ${v92E(v92CurrentAccount().username)}</p><p><b>نقش:</b> ${v92E(v92CurrentRole().name)}</p><p><b>تعداد مجوزها:</b> ${(v92CurrentRole().permissions||[]).length}</p><button class="ghost" onclick="render('access')">مدیریت سطح دسترسی</button></div><div class="v92-card"><h3>مسیر پیشنهادی امروز</h3><div class="v92-alert medium">۱. هشدارهای فوری را بررسی کن.</div><div class="v92-alert medium">۲. حسابرسی‌های باز را اصلاح یا تأیید کن.</div><div class="v92-alert low">۳. قبل از PDF از بازبینی نهایی استفاده کن.</div></div></div>`;
  };

  window.v92AccessPanel=function(){
    v92Ensure();
    let roleOptions=(state.rolesV92||[]).map(r=>`<option value="${r.id}">${v92E(r.name)}</option>`).join('');
    return `<div class="v92-hero"><h3>سطح دسترسی واقعی کاربران ادمین</h3><p>در این بخش می‌توان نقش‌ها را به کاربرهای ادمین اختصاص داد و دسترسی هر نقش به منوها را واقعی کنترل کرد.</p></div>
    <div class="v92-grid">
      <div class="v92-card"><h3>تعریف کاربر ادمین</h3><div class="field"><label>نام کاربری</label><input id="v92AccUser"></div><div class="field"><label>نام کامل</label><input id="v92AccName"></div><div class="field"><label>نقش</label><select id="v92AccRole">${roleOptions}</select></div><div class="v92-filterbar"><button onclick="v92AddAdminAccount()">افزودن / بروزرسانی کاربر</button></div><div class="v92-alert medium">نکته: ورود اصلی هنوز با رمز ادمین انجام می‌شود؛ این بخش نقش کاربر واردشده را در پنل کنترل می‌کند.</div></div>
      <div class="v92-card" style="grid-column:span 2"><h3>کاربران ادمین و نقش‌ها</h3><div class="tablewrap"><table class="table"><tr><th>کاربر</th><th>نام کامل</th><th>نقش</th><th>وضعیت</th><th>عملیات</th></tr>${(state.adminAccounts||[]).map(a=>`<tr><td>${v92E(a.username)}</td><td>${v92E(a.fullName)}</td><td>${v92E((state.rolesV92.find(r=>r.id===a.roleId)||{}).name||a.roleId)}</td><td>${badge(a.active?'فعال':'غیرفعال')}</td><td><button class="ghost" onclick="v92ToggleAccount('${a.username}')">فعال/غیرفعال</button><button class="ghost" onclick="v92RemoveAccount('${a.username}')">حذف</button></td></tr>`).join('')}</table></div></div>
    </div>
    <div class="v92-card" style="margin-top:12px"><h3>نقش‌ها و مجوزهای هر نقش</h3>${(state.rolesV92||[]).map(r=>v92RoleEditor(r)).join('')}</div>`;
  };
  window.v92RoleEditor=function(r){
    return `<div class="v92-alert"><h4>${v92E(r.name)}</h4><p>${v92E(r.description||'')}</p><div class="v92-perm-grid">${v92AllTabs.map(([id,title])=>`<label class="v92-perm"><input type="checkbox" data-role="${r.id}" data-perm="${id}" ${r.permissions.includes(id)?'checked':''}>${v92E(title)}</label>`).join('')}</div><div class="v92-filterbar"><button onclick="v92SaveRolePerms('${r.id}')">ذخیره دسترسی این نقش</button><button onclick="v92ResetRole('${r.id}')">بازگردانی پیش‌فرض</button></div></div>`;
  };
  window.v92AddAdminAccount=function(){
    let username=document.getElementById('v92AccUser')?.value.trim();
    if(!username){alert('نام کاربری را وارد کنید.');return}
    let fullName=document.getElementById('v92AccName')?.value.trim()||username;
    let roleId=document.getElementById('v92AccRole')?.value||'viewer';
    let a=(state.adminAccounts||[]).find(x=>x.username===username);
    if(a){a.fullName=fullName;a.roleId=roleId;a.active=true}else state.adminAccounts.push({username,fullName,roleId,active:true});
    save();render('access');
  };
  window.v92ToggleAccount=function(username){
    let a=state.adminAccounts.find(x=>x.username===username); if(a)a.active=!a.active; save();render('access');
  };
  window.v92RemoveAccount=function(username){
    if(username===((state.settings&&state.settings.adminUser)||'admin')){alert('کاربر اصلی ادمین حذف نمی‌شود.');return}
    state.adminAccounts=state.adminAccounts.filter(x=>x.username!==username); save();render('access');
  };
  window.v92SaveRolePerms=function(roleId){
    let r=state.rolesV92.find(x=>x.id===roleId); if(!r)return;
    r.permissions=[...document.querySelectorAll(`input[data-role="${roleId}"][data-perm]:checked`)].map(x=>x.getAttribute('data-perm'));
    if(!r.permissions.includes('dashboard'))r.permissions.unshift('dashboard');
    save();render('access');
  };
  window.v92ResetRole=function(roleId){
    let r=state.rolesV92.find(x=>x.id===roleId); if(!r)return;
    r.permissions=v92DefaultRolePerms(roleId);
    save();render('access');
  };

  // Override dashboard with clickable version. Keep old dashboard accessible if needed.
  if(typeof window.dash==='function' && !window.__v92DashSaved){
    window.__v92DashSaved=window.dash;
    window.dash=window.v92Dashboard;
  }
  window.alerts=v92AlertsPanel;
  window.access=v92AccessPanel;

  v92Ensure();
})();
/* ================= END V92 REAL ROLES + CLICKABLE DASHBOARD + ALERTS ================= */


/* ================= V94 AUDIT CORRECTION PAGE FIX + ANNUAL COMPAT ================= */
(function(){
  function E(v){return typeof esc==='function'?esc(v):String(v??'')}
  function N(v){try{return num(v)}catch(e){return Number(String(v||'').replace(/,/g,''))||0}}
  function V(id){let el=document.getElementById(id);return el?el.value:''}
  function now(){try{return new Date().toLocaleString('fa-IR')}catch(e){return new Date().toISOString()}}
  window.monthsV94=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
  if(typeof window.monthsV81==='undefined')window.monthsV81=window.monthsV94;
  if(typeof window.monthsV84==='undefined')window.monthsV84=window.monthsV81;
  if(typeof window.normYearV81!=='function')window.normYearV81=function(y){return String(y||'').trim()||'۱۴۰۳'};
  if(typeof window.normYearV84!=='function')window.normYearV84=window.normYearV81;
  if(typeof window.monthlyAuditV81!=='function')window.monthlyAuditV81=function(org,rep,month,year){if(!rep)return{status:'فاقد گزارش',cls:'b-bad',note:`برای ماه ${month} سال ${year} گزارشی ثبت نشده است.`};let income=N(rep.income),expense=N(rep.expense);if(expense>income)return{status:'دارای کسری',cls:'b-bad',note:'هزینه بیشتر از واریزی است.'};if(!org.licenseNo||org.licenseStatus==='منقضی')return{status:'نیازمند بررسی مجوز',cls:'b-warn',note:'مجوز نیازمند بررسی است.'};return{status:'قابل قبول',cls:'b-ok',note:rep.note||'مورد بحرانی مشاهده نشد.'}};
  if(typeof window.annualRowsV81!=='function')window.annualRowsV81=function(org,year){year=normYearV81(year);return monthsV81.map(m=>{let r=(state.reports||[]).find(x=>String(x.orgId)===String(org.id)&&String(x.year||'')===year&&String(x.month||'')===m)||null;let audit=monthlyAuditV81(org,r,m,year);let income=r?N(r.income):0,beneficiaryPay=r?N(r.beneficiaryPay):0,currentCost=r?N(r.currentCost):0,expense=r?N(r.expense):(beneficiaryPay+currentCost),balance=income-expense;return{month:m,rep:r,income,beneficiaryPay,currentCost,expense,balance,audit}})};
  if(typeof window.annualTotalsV81!=='function')window.annualTotalsV81=function(rows){return rows.reduce((s,r)=>({income:s.income+r.income,beneficiaryPay:s.beneficiaryPay+r.beneficiaryPay,currentCost:s.currentCost+r.currentCost,expense:s.expense+r.expense,balance:s.balance+r.balance,missing:s.missing+(r.rep?0:1),issues:s.issues+(r.audit&&r.audit.status==='قابل قبول'?0:1)}),{income:0,beneficiaryPay:0,currentCost:0,expense:0,balance:0,missing:0,issues:0})};
  window.v94Ensure=function(){state.version='94';state.corrections=state.corrections||[];state.auditFindings=state.auditFindings||[];state.orgs=state.orgs||[];state.reports=state.reports||[];state.auditFindings.forEach((a,i)=>{if(!a.id)a.id='aud_'+Date.now()+'_'+i})};
  function auditById(id){return(state.auditFindings||[]).find(a=>String(a.id)===String(id))}
  function corrById(id){return(state.corrections||[]).find(c=>String(c.id)===String(id))}
  function orgFor(x){return(state.orgs||[]).find(o=>String(o.id)===String(x&&x.orgId)||o.name===(x&&x.orgName))||null}
  function makeCorr(a){let c=(state.corrections||[]).find(x=>String(x.auditId)===String(a.id));if(c)return c;let o=orgFor(a)||{};c={id:'corr_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),auditId:a.id,orgId:a.orgId||o.id||'',orgName:a.orgName||o.name||'',title:'اصلاح مورد حسابرسی: '+(a.type||''),desc:a.desc||a.description||'',auditType:a.type||'',auditSeverity:a.severity||'متوسط',adminNote:a.adminNote||'',requiredAction:'اطلاعات مرتبط را بررسی و اصلاح کنید.',status:'باز',createdAt:(typeof today==='function'?today():now()),updatedAt:''};state.corrections.unshift(c);a.status='نیازمند اصلاح';save();return c}
  window.v94OpenAuditCorrectionPage=function(id){let a=auditById(id);if(!a){alert('مورد حسابرسی پیدا نشد.');return}let c=makeCorr(a);state.activeCorrectionId=c.id;save();render('corrections')};
  window.v94AuditApprove=function(id){let a=auditById(id);if(!a)return;a.status='تأیید شده';a.updatedAt=now();let c=(state.corrections||[]).find(x=>String(x.auditId)===String(id));if(c){c.status='تأیید شده';c.updatedAt=now()}save();render('audit')};
  window.v94AuditReject=function(id){let a=auditById(id);if(!a)return;let reason=prompt('علت رد این مورد حسابرسی را بنویسید:',a.adminNote||'');if(reason===null)return;a.status='رد شده';a.adminNote=reason;a.updatedAt=now();let c=(state.corrections||[]).find(x=>String(x.auditId)===String(id));if(c){c.status='رد شده';c.adminNote=reason;c.updatedAt=now()}save();render('audit')};
  window.v94AudTable=function(arr){arr=arr||[];return `<div class="tablewrap"><table class="table"><tr><th>سمن</th><th>نوع</th><th>شدت</th><th>توضیح</th><th>وضعیت</th><th>عملیات</th></tr>${arr.map(a=>`<tr><td>${E(a.orgName||'')}</td><td>${E(a.type||'')}</td><td>${E(a.severity||'')}</td><td>${E(a.desc||a.description||'')}</td><td>${badge(a.status||'باز')}</td><td><button class="ghost" onclick="v94OpenAuditCorrectionPage('${a.id}')">اصلاح / صفحه اصلاحات</button><button class="ghost" onclick="v94AuditApprove('${a.id}')">تأیید</button><button class="ghost" onclick="v94AuditReject('${a.id}')">رد</button></td></tr>`).join('')||'<tr><td colspan="6">یافته‌ای ندارد.</td></tr>'}</table></div>`};
  window.audTable=function(as){return v94AudTable(as)};
  window.audit=function(){v94Ensure();let open=(state.auditFindings||[]).filter(a=>!a.status||a.status==='باز'||a.status==='نیازمند اصلاح').length;return `<div class="actions"><button class="primary" onclick="auditRun(true)">اجرای حسابرسی مجدد</button><button class="ghost" onclick="downloadCSV('حسابرسی.csv',auditCSV())">Excel/CSV</button></div><div class="card"><h3>حسابرسی ادمین</h3><div class="note info">با زدن اصلاح، صفحه اصلاحات باز می‌شود و اطلاعات همان سمن، مجوز، حساب، مدیرعامل و مورد حسابرسی قابل ویرایش است.</div><div class="note ${open?'warn':'ok'}">موارد باز یا نیازمند اصلاح: ${open}</div>${v94AudTable(state.auditFindings)}</div>`};
  window.v94Editor=function(c){let a=auditById(c.auditId)||{},o=orgFor(c)||orgFor(a)||{},reports=(state.reports||[]).filter(r=>String(r.orgId)===String(o.id)||r.orgName===o.name);return `<div class="v94-hero"><h3>صفحه اصلاحات حسابرسی</h3><p>اطلاعات مرتبط این پرونده را ویرایش و ذخیره کن.</p></div><div class="v94-card"><h3>${E(c.title)}</h3><div class="v94-note warn"><b>سمن:</b> ${E(c.orgName||o.name||'')}<br><b>وضعیت:</b> ${badge(c.status||'باز')}</div></div><div class="v94-card"><h3>۱) اطلاعات مورد حسابرسی</h3><div class="v94-grid"><div class="v94-field"><label>نوع حسابرسی</label><input id="v94AuditType" value="${E(c.auditType||a.type||'')}"></div><div class="v94-field"><label>شدت</label><select id="v94AuditSeverity"><option ${(c.auditSeverity||a.severity)==='بالا'?'selected':''}>بالا</option><option ${(c.auditSeverity||a.severity)==='متوسط'?'selected':''}>متوسط</option><option ${(c.auditSeverity||a.severity)==='کم'?'selected':''}>کم</option></select></div><div class="v94-field"><label>وضعیت اصلاح</label><select id="v94CorrStatus"><option ${(!c.status||c.status==='باز')?'selected':''}>باز</option><option ${c.status==='در حال بررسی'?'selected':''}>در حال بررسی</option><option ${c.status==='نیازمند اصلاح کلاینت'?'selected':''}>نیازمند اصلاح کلاینت</option><option ${c.status==='اصلاح شد'?'selected':''}>اصلاح شد</option><option ${c.status==='تأیید شده'?'selected':''}>تأیید شده</option><option ${c.status==='رد شده'?'selected':''}>رد شده</option></select></div><div class="v94-field" style="grid-column:1/-1"><label>توضیح حسابرسی</label><textarea id="v94AuditDesc">${E(c.desc||a.desc||a.description||'')}</textarea></div><div class="v94-field" style="grid-column:1/-1"><label>اقدام لازم / یادداشت ادمین</label><textarea id="v94AdminNote">${E(c.adminNote||a.adminNote||c.requiredAction||'')}</textarea></div></div></div><div class="v94-card"><h3>۲) اطلاعات پرونده سمن</h3><div class="v94-grid"><div class="v94-field"><label>نام سمن</label><input id="v94OName" value="${E(o.name||'')}"></div><div class="v94-field"><label>شناسه ملی</label><input id="v94ONational" value="${E(o.nationalId||'')}"></div><div class="v94-field"><label>شماره ثبت</label><input id="v94OReg" value="${E(o.regNo||'')}"></div><div class="v94-field"><label>حوزه فعالیت</label><input id="v94OActivity" value="${E(o.activity||'')}"></div><div class="v94-field"><label>مدیرعامل</label><input id="v94OCeo" value="${E(o.ceo||'')}"></div><div class="v94-field"><label>کد ملی مدیرعامل</label><input id="v94OCeoId" value="${E(o.ceoNationalId||'')}"></div><div class="v94-field"><label>تماس</label><input id="v94OPhone" value="${E(o.phone||'')}"></div><div class="v94-field" style="grid-column:1/-1"><label>آدرس</label><textarea id="v94OAddress">${E(o.address||'')}</textarea></div></div></div><div class="v94-card"><h3>۳) مجوز، حساب و ضمائم</h3><div class="v94-grid"><div class="v94-field"><label>وضعیت مجوز</label><select id="v94OLicStatus"><option ${o.licenseStatus==='معتبر'?'selected':''}>معتبر</option><option ${o.licenseStatus==='نزدیک انقضا'?'selected':''}>نزدیک انقضا</option><option ${o.licenseStatus==='منقضی'?'selected':''}>منقضی</option><option ${o.licenseStatus==='در انتظار بررسی'?'selected':''}>در انتظار بررسی</option><option ${!o.licenseStatus?'selected':''}>ثبت نشده</option></select></div><div class="v94-field"><label>شماره مجوز</label><input id="v94OLicNo" value="${E(o.licenseNo||'')}"></div><div class="v94-field"><label>شروع مجوز</label><input id="v94OLicStart" value="${E(o.licenseStart||'')}"></div><div class="v94-field"><label>پایان مجوز</label><input id="v94OLicEnd" value="${E(o.licenseEnd||'')}"></div><div class="v94-field"><label>بانک</label><input id="v94OBank" value="${E(o.bank||'')}"></div><div class="v94-field"><label>شماره حساب</label><input id="v94OAccount" value="${E(o.accountNo||'')}"></div><div class="v94-field"><label>شبا</label><input id="v94OSheba" value="${E(o.sheba||'')}"></div><div class="v94-field"><label>عکس مجوز</label><input type="file" id="v94OLicImg" accept="image/*,.jpg,.jpeg,.png,.webp"></div></div>${o.licenseImage?`<div class="v94-note"><b>عکس مجوز فعلی:</b><br><img src="${o.licenseImage}" style="max-width:100%;max-height:260px;object-fit:contain;border:1px solid #dbe8f7;border-radius:14px;background:#fff;padding:6px"></div>`:''}</div><div class="v94-card"><h3>۴) گزارش‌های مالی مرتبط</h3><div class="tablewrap"><table class="table"><tr><th>سال</th><th>ماه</th><th>واریزی</th><th>هزینه</th><th>وضعیت</th><th>توضیح</th></tr>${reports.map(r=>`<tr><td>${E(r.year||'')}</td><td>${E(r.month||'')}</td><td>${money(r.income)}</td><td>${money(r.expense)}</td><td>${badge(r.status||'ثبت شده')}</td><td>${E(r.note||'')}</td></tr>`).join('')||'<tr><td colspan="6">گزارش مالی مرتبط ثبت نشده است.</td></tr>'}</table></div></div><div class="v94-actions"><button class="primary" onclick="v94SaveCorrection('${c.id}')">ذخیره اصلاحات</button><button onclick="v94SaveCorrection('${c.id}','اصلاح شد')">ذخیره و علامت‌گذاری اصلاح شد</button><button onclick="v94SaveCorrection('${c.id}','تأیید شده')">تأیید نهایی اصلاح</button><button onclick="v94SaveCorrection('${c.id}','نیازمند اصلاح کلاینت')">ارسال به کلاینت برای اصلاح</button><button onclick="render('audit')">بازگشت به حسابرسی</button></div>`};
  window.v94SaveCorrection=function(id,forceStatus){let c=corrById(id);if(!c){alert('پرونده اصلاح پیدا نشد.');return}let a=auditById(c.auditId)||{},o=orgFor(c)||orgFor(a);c.auditType=V('v94AuditType');c.auditSeverity=V('v94AuditSeverity');c.status=forceStatus||V('v94CorrStatus');c.desc=V('v94AuditDesc');c.adminNote=V('v94AdminNote');c.requiredAction=V('v94AdminNote');c.updatedAt=now();if(a){a.type=c.auditType;a.severity=c.auditSeverity;a.desc=c.desc;a.description=c.desc;a.adminNote=c.adminNote;a.status=c.status;a.updatedAt=now()}if(o){o.name=V('v94OName');o.nationalId=V('v94ONational');o.regNo=V('v94OReg');o.activity=V('v94OActivity');o.ceo=V('v94OCeo');o.ceoNationalId=V('v94OCeoId');o.phone=V('v94OPhone');o.address=V('v94OAddress');o.licenseStatus=V('v94OLicStatus');o.licenseNo=V('v94OLicNo');o.licenseStart=V('v94OLicStart');o.licenseEnd=V('v94OLicEnd');o.bank=V('v94OBank');o.accountNo=V('v94OAccount');o.sheba=V('v94OSheba');c.orgId=o.id;c.orgName=o.name;let f=document.getElementById('v94OLicImg')?.files?.[0];if(f){let r=new FileReader();r.onload=function(){o.licenseImage=r.result;o.licenseImageName=f.name;v94FinishSave(id)};r.readAsDataURL(f);return}}v94FinishSave(id)};
  window.v94FinishSave=function(id){state.activeCorrectionId=id;try{state.changeHistory=state.changeHistory||[];state.changeHistory.unshift({id:'chg_'+Date.now(),at:now(),user:(state.session&&state.session.user)||'admin',module:'اصلاحات حسابرسی',action:'ذخیره اصلاحات',details:'پرونده اصلاح: '+id})}catch(e){}save();alert('اصلاحات ذخیره شد.');render('corrections')};
  window.corrections=function(){v94Ensure();let activeId=state.activeCorrectionId||(state.corrections[0]&&state.corrections[0].id),active=activeId?corrById(activeId):null;return `<div class="v94-hero"><h3>درخواست‌های اصلاح و ویرایش اطلاعات</h3><p>از حسابرسی وارد این صفحه می‌شوی، اطلاعات مرتبط نمایش داده می‌شود و ادمین می‌تواند اصلاحات را مستقیم اعمال کند.</p></div><div class="grid2"><div class="v94-card"><h3>لیست اصلاحات</h3><div class="tablewrap"><table class="table"><tr><th>سمن</th><th>عنوان</th><th>وضعیت</th><th>تاریخ</th><th>عملیات</th></tr>${(state.corrections||[]).map(c=>`<tr><td>${E(c.orgName||'')}</td><td>${E(c.title||'')}</td><td>${badge(c.status||'باز')}</td><td>${E(c.updatedAt||c.createdAt||'')}</td><td><button class="ghost" onclick="state.activeCorrectionId='${c.id}';save();render('corrections')">ویرایش</button></td></tr>`).join('')||'<tr><td colspan="5">درخواست اصلاحی ثبت نشده است.</td></tr>'}</table></div></div><div>${active?'<div class="v94-note">پرونده انتخاب‌شده آماده ویرایش است. فرم کامل پایین صفحه نمایش داده شده است.</div>':'<div class="v94-note warn">پرونده اصلاحی انتخاب نشده است.</div>'}</div></div><div id="v94CorrectionEditor">${active?v94Editor(active):''}</div>`};
  window.annualReportPanelV94=function(){let defaultYear=((state.reports||[])[0]&&state.reports[0].year)||'۱۴۰۳';let opts='<option value="">انتخاب کنید</option>'+(state.orgs||[]).map(o=>`<option value="${o.id}">${E(o.name)}</option>`).join('');return `<div class="card"><h3>گزارش پایان سال هر سمن</h3><div class="note info">در V94 مسیر پایان سال امن شده و خطای normYearV81 رفع شده است.</div><div class="grid3"><div class="field"><label>سمن</label><select id="annualOrg">${opts}</select></div><div class="field"><label>سال</label><input id="annualYear" value="${E(defaultYear)}"></div><div class="field"><label>نوع نمایش</label><select id="annualMode"><option value="one">یک سمن</option><option value="all">خلاصه همه سمن‌ها</option></select></div></div><div class="actions"><button class="primary" onclick="buildAnnualV94()">نمایش گزارش پایان سال</button><button class="ghost" onclick="window.print()">چاپ/PDF</button></div></div><div id="annualArea"><div class="note info">سمن و سال را انتخاب کن و روی نمایش گزارش بزن.</div></div>`};
  window.buildAnnualV94=function(){let mode=V('annualMode')||'one',year=V('annualYear')||'۱۴۰۳',orgId=V('annualOrg')||((state.orgs[0]||{}).id),area=document.getElementById('annualArea');if(!area)return;area.innerHTML='<div class="note info">در حال ساخت گزارش...</div>';setTimeout(()=>{try{let org=(state.orgs||[]).find(o=>String(o.id)===String(orgId))||state.orgs[0];let rows=annualRowsV81(org,year),total=annualTotalsV81(rows),status=total.missing?`ناقص: ${total.missing} ماه بدون گزارش`:total.issues?`نیازمند بررسی: ${total.issues} مورد حسابرسی`:'قابل تأیید';area.innerHTML=`<div class="report" id="printArea"><div class="rhead"><h2>گزارش پایان سال سمن</h2><p>${E(org.name)} | سال ${E(year)} | ${E(status)}</p></div><div class="tablewrap"><table class="table"><tr><th>ماه</th><th>واریزی</th><th>مددجو</th><th>جاری</th><th>هزینه</th><th>مانده</th><th>وضعیت</th><th>حسابرسی</th><th>توضیح</th></tr>${rows.map(r=>`<tr><td>${E(r.month)}</td><td>${money(r.income)}</td><td>${money(r.beneficiaryPay)}</td><td>${money(r.currentCost)}</td><td>${money(r.expense)}</td><td>${money(r.balance)}</td><td>${r.rep?badge(r.rep.status||'ثبت شده'):badge('فاقد گزارش')}</td><td>${E(r.audit.status)}</td><td>${E(r.audit.note)}</td></tr>`).join('')}<tr><th>جمع</th><th>${money(total.income)}</th><th>${money(total.beneficiaryPay)}</th><th>${money(total.currentCost)}</th><th>${money(total.expense)}</th><th>${money(total.balance)}</th><th colspan="3">${E(status)}</th></tr></table></div>${signs(org.ceo||'نام و نام خانوادگی مدیرعامل سمن')}</div>`}catch(e){area.innerHTML=`<div class="note bad">خطا در گزارش پایان سال:<br>${E(e.message||e)}</div>`}},30)};
  if(typeof window.render==='function'&&!window.__v94WrappedRender){window.__v94WrappedRender=true;window.__v94BaseRender=window.render;window.render=function(tab='dashboard'){if(tab==='annual'){if(!state.session){loginPage();return}try{defaults&&defaults()}catch(e){}shell('annual',annualReportPanelV94());return}return window.__v94BaseRender(tab)}}
  v94Ensure();
})();
/* ================= END V94 AUDIT CORRECTION PAGE FIX + ANNUAL COMPAT ================= */


/* ================= V96 ADMIN IMPORT FULL CLIENT DOCUMENTS SAFE PATCH ================= */
(function(){
  function ensureV96AdminDocs(){
    state.clientDocuments=state.clientDocuments||[];
    state.orgs=(state.orgs||[]).map(o=>{o.documents=o.documents||[];return o});
  }
  window.v96AdminAttachClientDocuments=function(data){
    try{
      ensureV96AdminDocs();
      const docs=data.documents||[];
      const scans=data.licenseScans||[];
      const orgName=(data.organization&&data.organization.organizationName)||'';
      const orgNat=(data.organization&&data.organization.organizationNationalId)||'';
      if(docs.length){
        docs.forEach(d=>state.clientDocuments.unshift(Object.assign({},d,{orgName,orgNationalId:orgNat,importedAt:new Date().toLocaleString('fa-IR')})));
      }
      if(scans.length){
        scans.forEach(s=>state.clientDocuments.unshift({id:'licscan_'+Date.now()+Math.random(),type:'عکس مجوز',title:s.name||'عکس مجوز',imageData:s.dataUrl||s.data||'',orgName,orgNationalId:orgNat,importedAt:new Date().toLocaleString('fa-IR')}));
      }
      let org=(state.orgs||[]).find(o=>o.name===orgName||String(o.nationalId)===String(orgNat)||String(o.organizationNationalId)===String(orgNat));
      if(org){
        org.documents=org.documents||[];
        docs.forEach(d=>org.documents.unshift(d));
        if(data.organization&&data.organization.licenseFile&&data.organization.licenseFile.dataUrl){
          org.licenseImage=data.organization.licenseFile.dataUrl;
          org.licenseImageName=data.organization.licenseFile.name||'عکس مجوز کلاینت';
        }
      }
      save();
    }catch(e){console.warn('V96 admin docs attach skipped',e)}
  };
  if(typeof window.importClientData==='function' && !window.__v96WrappedImportClientData){
    window.__v96WrappedImportClientData=true;
    window.__v96BaseImportClientData=window.importClientData;
    window.importClientData=function(data,mode){
      let res=window.__v96BaseImportClientData(data,mode);
      try{v96AdminAttachClientDocuments(data)}catch(e){}
      return res;
    }
  }
  ensureV96AdminDocs();
})();
/* ================= END V96 ADMIN IMPORT FULL CLIENT DOCUMENTS SAFE PATCH ================= */


/* ================= V99 ADMIN NATIVE NO PORT STORE ================= */
(function(){
  window.JVN_NATIVE_ADMIN = true;
  async function loadNative(){
    try{
      if(!window.JavanroodNativeStore || !window.KEY) return;
      const local = localStorage.getItem(KEY);
      const res = await window.JavanroodNativeStore.loadState('admin');
      if(res && res.exists && res.state && !local){
        window.state = Object.assign(window.state || {}, res.state);
        localStorage.setItem(KEY, JSON.stringify(window.state));
        if(window.state.session && typeof render === 'function') render('dashboard');
        else if(typeof loginPage === 'function') loginPage();
      }
    }catch(e){ console.warn('native load skipped', e); }
  }
  if(typeof window.save === 'function' && !window.__v99NativeSave){
    window.__v99NativeSave = true;
    window.__v99BaseSave = window.save;
    window.save = function(){
      window.__v99BaseSave();
      try{
        clearTimeout(window.__v99Timer);
        window.__v99Timer = setTimeout(function(){
          if(window.JavanroodNativeStore) window.JavanroodNativeStore.saveState('admin', window.state || {});
        }, 300);
      }catch(e){}
    };
  }
  window.nativeBackupV99 = async function(){
    if(window.JavanroodNativeStore){
      const r = await window.JavanroodNativeStore.backupState('admin', window.state || {});
      alert('بکاپ ساخته شد:\n' + (r.path || ''));
    }
  };
  window.nativeOpenDataDirV99 = async function(){
    if(window.JavanroodNativeStore) await window.JavanroodNativeStore.openDataDir();
  };
  setTimeout(loadNative, 500);
})();
/* ================= END V99 ADMIN NATIVE NO PORT STORE ================= */



/* ================= V101 ADMIN COMPLETE AUDIT + BOARD REPORT + CLIENT V22 IMPORT ================= */
(function(){
  const ADMIN_VERSION_V101='ADMIN_V101_BOARD_AUDIT_CLIENT_V22_20260612';
  try{ window.KEY = typeof KEY!=='undefined' ? KEY : window.KEY; window.state = state; }catch(e){}
  try{ state.adminVersion = ADMIN_VERSION_V101; }catch(e){}

  function safeEsc(v){ return (typeof esc==='function'?esc(v):String(v??'').replace(/[&<>\"]/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]||m})) }
  function arr(v){ return Array.isArray(v)?v:[] }
  function clean(v){ return String(v??'').trim() }
  function nval(v){ return typeof num==='function'?num(v):(Number(String(v||0).replace(/[^\d.-]/g,''))||0) }
  function mny(v){ return typeof money==='function'?money(v):(String(nval(v)).replace(/\B(?=(\d{3})+(?!\d))/g,',')+' ریال') }
  function todaySafe(){ return typeof today==='function'?today():new Date().toLocaleDateString('fa-IR') }
  function nowSafe(){ return new Date().toLocaleString('fa-IR') }
  function idSafe(p){ return typeof uid==='function'?uid(p):(p+'_'+Date.now()+'_'+Math.random().toString(36).slice(2,7)) }
  function b(v){ return typeof badge==='function'?badge(v):('<span class="badge">'+safeEsc(v||'ثبت نشده')+'</span>') }
  function signsSafe(ceo){ return typeof signs==='function'?signs(ceo):'' }
  function ensureArraysV101(){
    state.orgs=arr(state.orgs); state.reports=arr(state.reports); state.beneficiaries=arr(state.beneficiaries); state.imports=arr(state.imports); state.corrections=arr(state.corrections); state.auditFindings=arr(state.auditFindings); state.logs=arr(state.logs); state.clientDocuments=arr(state.clientDocuments);
    state.orgs.forEach(o=>{o.board=arr(o.board||o.boardMembers);o.documents=arr(o.documents);o.bankAccounts=arr(o.bankAccounts)});
  }
  function saveSafe(){ try{ window.state=state; if(typeof save==='function')save(); else localStorage.setItem(KEY,JSON.stringify(state)); }catch(e){console.warn('V101 save skipped',e)} }

  function personNameV101(m){ return clean(m.fullName||m.name||m.memberName||((m.firstName||'')+' '+(m.lastName||''))) }
  function personNatV101(m){ return clean(m.nationalId||m.nationalCode||m.national_id||m.codeMelli) }
  function personRoleV101(m){ return clean(m.role||m.position||m.post||'عضو') }
  function personPhoneV101(m){ return clean(m.mobile||m.phone||m.tel||'') }
  function normalizedBoardV101(o){
    let members=arr(o&& (o.board||o.boardMembers)).map(m=>({name:personNameV101(m),nationalId:personNatV101(m),role:personRoleV101(m),phone:personPhoneV101(m)})).filter(m=>m.name||m.nationalId||m.role||m.phone);
    if(!members.length && o && (o.ceo||o.ceoNationalId)) members=[{name:o.ceo||'',nationalId:o.ceoNationalId||'',role:'مدیرعامل',phone:o.phone||''}];
    return members;
  }
  function accountsOfV101(o){
    let out=arr(o&&o.bankAccounts).map(a=>({bank:clean(a.bank||a.bankName),accountNo:clean(a.accountNo||a.account||a.number),cardNo:clean(a.cardNo||a.card),sheba:clean(a.sheba||a.iban),owner:clean(a.owner||a.accountOwner)}));
    if(o && (o.bank||o.accountNo||o.sheba)) out.unshift({bank:o.bank||'',accountNo:o.accountNo||'',cardNo:o.cardNo||'',sheba:o.sheba||'',owner:o.ceo||''});
    // remove empty duplicates
    let seen={};
    return out.filter(a=>{let k=[a.bank,a.accountNo,a.sheba].join('|'); if(!k.replace(/\|/g,''))return false; if(seen[k])return false; seen[k]=1; return true;});
  }

  function boardTableV101(orgs){
    orgs=arr(orgs);
    let rows=[];
    orgs.forEach(o=>{
      let ms=normalizedBoardV101(o);
      if(!ms.length){ rows.push(`<tr><td>${safeEsc(o.name||'')}</td><td colspan="5">عضوی ثبت نشده است.</td></tr>`); return; }
      ms.forEach((m,i)=>rows.push(`<tr><td>${safeEsc(o.name||'')}</td><td>${i+1}</td><td>${safeEsc(m.name)}</td><td>${safeEsc(m.nationalId)}</td><td>${safeEsc(m.role)}</td><td>${safeEsc(m.phone)}</td></tr>`));
    });
    return `<div class="tablewrap"><table class="table"><tr><th>سمن</th><th>ردیف</th><th>نام و نام خانوادگی</th><th>کد ملی</th><th>سمت</th><th>تماس</th></tr>${rows.join('')||'<tr><td colspan="6">عضوی ثبت نشده است.</td></tr>'}</table></div>`;
  }
  window.boardReportV101=function(orgId){
    ensureArraysV101();
    let orgs=orgId?state.orgs.filter(o=>String(o.id)===String(orgId)):state.orgs;
    let title=orgId&&orgs[0]?('لیست هیأت مدیره سمن '+orgs[0].name):'لیست هیأت مدیره سمن‌ها';
    return `<div class="report" id="printArea"><div class="rhead"><h2>${safeEsc(title)}</h2><p>تاریخ گزارش: ${todaySafe()}</p></div>${boardTableV101(orgs)}${signsSafe(orgs[0]&&orgs[0].ceo)}</div>`;
  };
  window.openBoardReportV101=function(orgId){
    let target=document.getElementById('orgReport')||document.getElementById('rarea');
    if(target) target.innerHTML=boardReportV101(orgId); else alert('محل نمایش گزارش پیدا نشد.');
  };
  window.boardCSVV101=function(orgId){
    ensureArraysV101();
    let orgs=orgId?state.orgs.filter(o=>String(o.id)===String(orgId)):state.orgs;
    let lines=['سمن,ردیف,نام و نام خانوادگی,کد ملی,سمت,تماس'];
    orgs.forEach(o=>normalizedBoardV101(o).forEach((m,i)=>lines.push([o.name,i+1,m.name,m.nationalId,m.role,m.phone].map(cell).join(','))));
    return lines.join('\n');
  };

  const baseReportHtmlV101 = (typeof reportHtml==='function') ? reportHtml : null;
  const baseCsvCurrentV101 = (typeof csvCurrent==='function') ? csvCurrent : null;
  reportHtml=function(t){
    if(t==='board') return boardReportV101();
    return baseReportHtmlV101?baseReportHtmlV101(t):'<div class="note bad">قالب گزارش پیدا نشد.</div>';
  };
  reports=function(){
    return `<div class="tabs"><button onclick="rpt('full')">جامع</button><button onclick="rpt('board')">هیأت مدیره</button><button onclick="rpt('lic')">مجوزها</button><button onclick="rpt('fin')">مالی</button><button onclick="rpt('aud')">حسابرسی</button><button onclick="rpt('ben')">مددجوها</button><button onclick="rpt('imp')">فایل‌های واردشده</button></div><div class="actions"><button class="primary" onclick="downloadWordArea()">Word</button><button class="ghost" onclick="downloadCSV('گزارش.csv',csvCurrent())">Excel/CSV</button><button class="ghost" onclick="window.print()">چاپ/PDF</button></div><div id="rarea">${reportHtml('full')}</div>`;
  };
  csvCurrent=function(){
    try{ if(typeof rtype!=='undefined' && rtype==='board') return boardCSVV101(); }catch(e){}
    return baseCsvCurrentV101?baseCsvCurrentV101():boardCSVV101();
  };
  const baseWordV101=(typeof word==='function')?word:null;
  word=function(){
    return `<div class="card"><h3>خروجی Word حرفه‌ای</h3><p>گزارش‌های رسمی با سربرگ، کد رهگیری و سه محل امضا تولید می‌شوند.</p><div class="quick"><button onclick="downloadWord('گزارش جامع',reportHtml('full'))">📑 گزارش جامع</button><button onclick="downloadWord('لیست هیأت مدیره سمن‌ها',reportHtml('board'))">👥 لیست هیأت مدیره</button><button onclick="downloadWord('گزارش مجوزها',reportHtml('lic'))">📜 گزارش مجوزها</button><button onclick="downloadWord('گزارش مالی',reportHtml('fin'))">📊 گزارش مالی</button><button onclick="downloadWord('گزارش حسابرسی',reportHtml('aud'))">🧾 گزارش حسابرسی</button></div></div>`;
  };

  // Better organization page with direct board report action
  orgs=function(){
    ensureArraysV101();
    return `<div class="actions"><button class="ghost" onclick="downloadCSV('گزارش_کامل_سمن‌ها.csv',orgsCSV())">Excel/CSV</button><button class="ghost" onclick="downloadCSV('لیست_هیات_مدیره.csv',boardCSVV101())">CSV هیأت مدیره</button><button class="ghost" onclick="window.print()">چاپ</button></div><div class="card"><h3>اطلاعات کامل سمن‌ها، مجوزها، حساب‌ها و هیأت مدیره</h3><div class="tablewrap"><table class="table"><tr><th>نام سمن</th><th>شناسه ملی</th><th>شماره ثبت</th><th>حوزه</th><th>مدیرعامل</th><th>کد ملی مدیرعامل</th><th>مجوز</th><th>حساب‌ها</th><th>اعضای هیأت مدیره</th><th>عملیات</th></tr>${state.orgs.map(o=>`<tr><td><b>${safeEsc(o.name)}</b><br><small>${safeEsc(o.address)}</small></td><td>${safeEsc(o.nationalId)}</td><td>${safeEsc(o.regNo)}</td><td>${safeEsc(o.activity)}</td><td>${safeEsc(o.ceo)}</td><td>${safeEsc(o.ceoNationalId)}</td><td>${b(o.licenseStatus)}<br>${safeEsc(o.licenseNo||'')}</td><td>${accountsOfV101(o).length} حساب</td><td>${normalizedBoardV101(o).length} نفر</td><td><button class="ghost" onclick="viewOrg('${o.id}')">پرونده کامل</button><button class="ghost" onclick="openBoardReportV101('${o.id}')">گزارش هیأت مدیره</button>${typeof editLicenseV84==='function'?`<button class="ghost" onclick="editLicenseV84('${o.id}')">مجوز/عکس</button>`:''}</td></tr>`).join('')}</table></div></div><div id="orgReport"></div>`;
  };

  function normalizeClientV101(data){
    let isNew=data&&data.type==='JAVANROOD_CLIENT_EXPORT';
    let isOld=data&&data.type==='JAVANROOD_NGO_CLIENT_EXPORT';
    if(!isNew && !isOld) throw new Error('این فایل خروجی کلاینت نیست.');
    if(isOld){
      return {schema:'old',createdAt:data.createdAt||data.exportedAt||'',trackingCode:data.trackingCode||'',org:data.organization||{},members:arr(data.members),accounts:arr(data.accounts),reports:arr(data.reports),beneficiaries:arr(data.beneficiaries),documents:arr(data.documents),attachments:arr(data.attachments),license:(arr(data.licenses)[0]||{})};
    }
    let base=data.lockedBaseInfo||{}, lic=data.license||{};
    let accounts=arr(data.bankAccounts).map(a=>({bank:a.bankName||a.bank||'',accountNo:a.accountNo||a.account||'',cardNo:a.cardNo||'',sheba:a.iban||a.sheba||'',owner:a.owner||''}));
    let reports=arr(data.monthlyReports).map(r=>({
      id:r.id||idSafe('rep'), year:r.year||'', month:r.month||'', previousCarryover:r.previousCarryover||0,
      income:r.totalInflow??r.income??0, expense:r.totalOutflow??r.expense??0, beneficiaryPay:r.beneficiaryPaidTotal??r.beneficiaryPay??0, currentCost:r.currentExpensesTotal??r.currentCost??0,
      accountDepositTotal:r.accountDepositTotal||0, cashDonations:r.cashDonations||0, cashBoxes:r.cashBoxes||0, ngoCollectedTotal:r.ngoCollectedTotal||0,
      totalCoveredBeneficiaries:r.totalCoveredBeneficiaries||0, beneficiaryPaidCount:r.beneficiaryPaidCount||0, beneficiaryUnpaidCount:r.beneficiaryUnpaidCount||0,
      balance:r.balance, balanceAmount:r.balanceAmount, balanceStatus:r.balanceStatus, status:r.status||'ارسال نشده', note:r.notes||r.note||'', createdAt:r.createdAt||''
    }));
    let beneficiaries=arr(data.beneficiaries).map(x=>({name:x.name||x.fullName||'',nationalId:x.nationalId||x.nationalCode||'',phone:x.phone||'',amount:x.amount||x.receivedAmount||0,status:x.status||'فعال',note:x.note||x.notes||''}));
    return {schema:'v22',createdAt:data.createdAt||'',trackingCode:data.trackingCode||'',org:{organizationName:base.organizationName||'',organizationNationalId:base.organizationNationalId||base.nationalId||'',registrationNumber:base.registrationNumber||base.regNo||'',activityField:base.activityField||'',address:base.address||'',phone:base.phone||'',managerFullName:base.ceoFullName||base.managerFullName||'',managerNationalId:base.nationalCode||base.ceoNationalId||'',licenseStatus:lic.status||'',licenseNo:lic.licenseNo||'',licenseStart:lic.issueDate||'',licenseEnd:lic.expiryDate||'',licenseFile:lic.scanPath||lic.fileName||'',licenseAttachmentId:lic.attachmentId||''},members:arr(data.boardMembers),accounts,reports,beneficiaries,documents:arr(data.documents),attachments:arr(data.attachments),license:lic,financeCarryovers:data.financeCarryovers||{},currentExpenses:arr(data.currentExpenses)};
  }
  window.normalizeClientV101=normalizeClientV101;

  function findOrCreateOrgV101(n){
    let org=n.org||{};
    let orgName=clean(org.organizationName||org.name||org.orgName||'');
    let orgNat=clean(org.organizationNationalId||org.nationalId||'');
    let ceoNat=clean(org.managerNationalId||org.ceoNationalId||'');
    let o=state.orgs.find(x=>(org.organizationKey&&String(x.id)===String(org.organizationKey))||(orgNat&&String(x.nationalId)===String(orgNat))||(orgName&&x.name===orgName)||(ceoNat&&String(x.ceoNationalId)===String(ceoNat)));
    if(!o){ o={id:idSafe('org'),name:orgName||'سمن واردشده',status:'فعال',createdAt:todaySafe(),board:[],documents:[],bankAccounts:[]}; state.orgs.push(o); }
    o.name=orgName||o.name; o.nationalId=orgNat||o.nationalId||''; o.regNo=clean(org.registrationNumber||org.regNo)||o.regNo||''; o.activity=clean(org.activityField||org.activity)||o.activity||''; o.address=clean(org.address)||o.address||''; o.phone=clean(org.phone)||o.phone||'';
    o.ceo=clean(org.managerFullName||org.ceo)||o.ceo||''; o.ceoNationalId=ceoNat||o.ceoNationalId||'';
    let lic=n.license||{}; o.licenseStatus=clean(org.licenseStatus||lic.status)||o.licenseStatus||'در انتظار بررسی'; o.licenseNo=clean(org.licenseNo||lic.licenseNo)||o.licenseNo||''; o.licenseStart=clean(org.licenseStart||lic.issueDate)||o.licenseStart||''; o.licenseEnd=clean(org.licenseEnd||lic.expiryDate)||o.licenseEnd||''; o.licenseFile=clean(org.licenseFile||lic.scanPath||lic.fileName)||o.licenseFile||''; o.licenseAttachmentId=clean(org.licenseAttachmentId||lic.attachmentId)||o.licenseAttachmentId||'';
    let members=arr(n.members).map(m=>({name:personNameV101(m),nationalId:personNatV101(m),role:personRoleV101(m),phone:personPhoneV101(m)})).filter(m=>m.name||m.nationalId||m.role||m.phone); if(members.length)o.board=members;
    let accounts=arr(n.accounts).filter(a=>a.bank||a.bankName||a.accountNo||a.sheba||a.iban); if(accounts.length){o.bankAccounts=accounts.map(a=>({bank:a.bank||a.bankName||'',accountNo:a.accountNo||a.account||'',cardNo:a.cardNo||'',sheba:a.sheba||a.iban||'',owner:a.owner||''})); let first=o.bankAccounts[0]; o.bank=first.bank||o.bank||''; o.accountNo=first.accountNo||o.accountNo||''; o.sheba=first.sheba||o.sheba||'';}
    o.documents=arr(o.documents);
    arr(n.documents).forEach(d=>o.documents.unshift(Object.assign({},d,{source:'client'})));
    arr(n.attachments).forEach(a=>o.documents.unshift({title:a.title||a.name||a.fileName||'پیوست کلاینت',type:a.type||a.docType||'پیوست',fileName:a.fileName||a.name||'',size:a.size||a.sizeBytes||'',source:'client'}));
    return o;
  }

  processExport=function(data){
    ensureArraysV101();
    let n;
    try{ n=normalizeClientV101(data); }catch(e){ let box=document.getElementById('importResult'); if(box)box.innerHTML=`<div class="note bad">${safeEsc(e.message)}</div>`; return; }
    let o=findOrCreateOrgV101(n);
    arr(n.beneficiaries).forEach(bn=>{ if(!state.beneficiaries.some(x=>String(x.orgId)===String(o.id)&&clean(x.nationalId)===clean(bn.nationalId))){ state.beneficiaries.push(Object.assign({id:idSafe('ben'),orgId:o.id,orgName:o.name},bn)); }});
    arr(n.reports).forEach(rep=>{
      rep.orgId=o.id; rep.orgName=o.name; rep.id=rep.id||idSafe('rep');
      let idx=state.reports.findIndex(r=>String(r.orgId)===String(o.id)&&String(r.year||'')===String(rep.year||'')&&String(r.month||'')===String(rep.month||''));
      if(idx>=0) state.reports[idx]=Object.assign({},state.reports[idx],rep); else state.reports.push(rep);
    });
    state.clientDocuments=arr(state.clientDocuments);
    arr(n.documents).concat(arr(n.attachments)).forEach(d=>state.clientDocuments.unshift(Object.assign({},d,{orgId:o.id,orgName:o.name,importedAt:nowSafe()})));
    let im={id:idSafe('imp'),trackingCode:n.trackingCode||('IMP-'+Date.now()),orgId:o.id,orgName:o.name,exportedAt:n.createdAt||'',importedAt:todaySafe(),status:'وارد شد',schema:n.schema,summary:`اعضا: ${arr(n.members).length} | حساب‌ها: ${arr(n.accounts).length} | مددجو: ${arr(n.beneficiaries).length} | گزارش مالی: ${arr(n.reports).length} | پیوست: ${arr(n.documents).length+arr(n.attachments).length}`};
    state.imports.unshift(im);
    let u=state.users.find(x=>String(x.orgId)===String(o.id)||x.organizationName===o.name); if(u)u.lastImportAt=im.importedAt;
    auditRun(false); saveSafe();
    let box=document.getElementById('importResult'); if(box)box.innerHTML=`<div class="note ok"><b>فایل کلاینت با موفقیت وارد شد.</b><br>${safeEsc(im.summary)}<br>فرمت: ${safeEsc(n.schema)}</div>`;
  };
  window.processExport=processExport;
  importFile=function(){let f=document.getElementById('importFile')&&document.getElementById('importFile').files[0];if(!f){alert('فایل را انتخاب کنید.');return}let r=new FileReader();r.onload=()=>{try{processExport(JSON.parse(r.result))}catch(e){let box=document.getElementById('importResult'); if(box)box.innerHTML='<div class="note bad">فایل JSON معتبر نیست. برای پکیج کامل، ابتدا export.json داخل پکیج را وارد کنید.</div>';}};r.readAsText(f,'utf-8')};
  imp=function(){return `<div class="card"><h3>ورود فایل خروجی سمن‌ها</h3><div class="note info">خروجی JSON کلاینت جدید V22 و خروجی‌های قدیمی پشتیبانی می‌شود. اگر فایل پکیج کامل .jvnpkg دارید، فعلاً export.json داخل آن را برای ورود اطلاعات متنی انتخاب کنید.</div><input type="file" id="importFile" accept="application/json,.json"><div class="actions" style="margin-top:12px"><button class="primary" onclick="importFile()">بررسی و ورود فایل</button></div><div id="importResult"></div></div><div class="card"><h3>لیست فایل‌های واردشده</h3><div class="tablewrap"><table class="table"><tr><th>کد رهگیری</th><th>سمن</th><th>تاریخ خروجی</th><th>تاریخ ورود</th><th>وضعیت</th><th>جزئیات</th></tr>${state.imports.map(i=>`<tr><td class="ltr">${safeEsc(i.trackingCode)}</td><td>${safeEsc(i.orgName)}</td><td>${safeEsc(i.exportedAt)}</td><td>${safeEsc(i.importedAt)}</td><td>${b(i.status)}</td><td>${safeEsc(i.summary)}</td></tr>`).join('')||'<tr><td colspan="6">فایلی وارد نشده است.</td></tr>'}</table></div></div>`};

  function issue(module,field,problem,action,severity,ref){return {module,field,problem,action,severity:severity||'متوسط',ref:ref||''}}
  function issuesForOrgV101(o){
    let out=[];
    if(!clean(o.name))out.push(issue('اطلاعات پایه','نام سمن','نام سمن ثبت نشده است.','در پرونده سمن، نام سمن را تکمیل کنید.','بالا'));
    if(!clean(o.nationalId))out.push(issue('اطلاعات پایه','شناسه ملی','شناسه ملی سمن خالی است.','در اطلاعات سمن، شناسه ملی را ثبت کنید.','بالا'));
    if(!clean(o.regNo))out.push(issue('اطلاعات پایه','شماره ثبت','شماره ثبت ثبت نشده است.','شماره ثبت سمن را تکمیل کنید.','متوسط'));
    if(!clean(o.ceo)||!clean(o.ceoNationalId))out.push(issue('مدیرعامل','مدیرعامل / کد ملی','نام یا کد ملی مدیرعامل ناقص است.','مشخصات مدیرعامل را اصلاح کنید.','بالا'));
    if(!clean(o.phone))out.push(issue('اطلاعات تماس','شماره تماس','شماره تماس سمن ثبت نشده است.','شماره تماس معتبر وارد کنید.','کم'));
    if(!clean(o.address))out.push(issue('اطلاعات تماس','آدرس','آدرس سمن خالی است.','آدرس کامل را ثبت کنید.','کم'));
    let bs=normalizedBoardV101(o); if(!bs.length)out.push(issue('هیأت مدیره','لیست اعضا','هیأت مدیره ثبت نشده است.','از خروجی کلاینت یا پرونده سمن، اعضای هیأت مدیره را ثبت کنید.','بالا'));
    bs.forEach((m,i)=>{if(!m.name||!m.nationalId||!m.role)out.push(issue('هیأت مدیره','عضو ردیف '+(i+1),'نام، کد ملی یا سمت عضو ناقص است.','مشخصات عضو هیأت مدیره را تکمیل کنید.','متوسط'))});
    if(!clean(o.licenseNo))out.push(issue('مجوز','شماره مجوز','شماره مجوز ثبت نشده است.','شماره مجوز را در پرونده سمن ثبت کنید.','بالا'));
    if(!clean(o.licenseEnd))out.push(issue('مجوز','تاریخ پایان/انقضا','تاریخ پایان مجوز ثبت نشده است.','تاریخ انقضای مجوز را تکمیل کنید.','بالا'));
    if(String(o.licenseStatus||'').includes('منقضی'))out.push(issue('مجوز','وضعیت مجوز','مجوز منقضی شده است.','تمدید مجوز و تاریخ جدید را ثبت کنید.','بالا'));
    if(String(o.licenseStatus||'').includes('نزدیک'))out.push(issue('مجوز','وضعیت مجوز','مجوز نزدیک انقضا است.','برای پیگیری تمدید اقدام و مستندات را ثبت کنید.','متوسط'));
    if(!o.licenseImage && !o.licenseAttachmentId && !o.licenseFile)out.push(issue('مدارک','تصویر/پیوست مجوز','عکس یا پیوست مجوز در ادمین ثبت نشده است.','تصویر مجوز را از کلاینت وارد یا در ادمین بارگذاری کنید.','متوسط'));
    let ac=accountsOfV101(o); if(!ac.length)out.push(issue('حساب سمن','حساب بانکی','هیچ حسابی برای سمن ثبت نشده است.','در کلاینت یا ادمین حساب سمن را ثبت کنید.','بالا'));
    ac.forEach((a,i)=>{if(!a.bank||!a.accountNo||!a.sheba)out.push(issue('حساب سمن','حساب ردیف '+(i+1),'نام بانک، شماره حساب یا شبا ناقص است.','اطلاعات حساب بانکی را کامل کنید.','متوسط'))});
    return out;
  }
  function issuesForReportV101(r){
    let out=[];
    if(!clean(r.year)||!clean(r.month))out.push(issue('گزارش مالی','سال/ماه','سال یا ماه گزارش مالی خالی است.','سال شمسی و ماه را در گزارش مالی اصلاح کنید.','بالا'));
    let income=nval(r.income??r.totalInflow), expense=nval(r.expense??r.totalOutflow);
    if(expense>income)out.push(issue('گزارش مالی','تراز ماهانه','خروجی/هزینه از ورودی بیشتر است.','محاسبه مالی ماه، هزینه جاری، واریزی مددجو و نقل ماه قبل را بررسی کنید.','بالا',`${r.month||''} ${r.year||''}`));
    if(String(r.balanceStatus||'').includes('کسری'))out.push(issue('گزارش مالی','نتیجه محاسبه','گزارش با وضعیت کسری ثبت شده است.','کسری ماه را در کلاینت اصلاح یا توضیح حسابرسی وارد کنید.','بالا',`${r.month||''} ${r.year||''}`));
    if(!clean(r.status))out.push(issue('گزارش مالی','وضعیت گزارش','وضعیت گزارش مشخص نیست.','وضعیت گزارش را در فرآیند حسابرسی مشخص کنید.','کم'));
    return out;
  }
  function issuesForBeneficiariesV101(){
    let out=[], seen={};
    arr(state.beneficiaries).forEach(bn=>{let k=clean(bn.nationalId); if(!clean(bn.name)||!k)out.push(issue('مددجو/ذی‌نفع','مشخصات مددجو','نام یا کد ملی مددجو ناقص است.','مشخصات مددجو را در کلاینت اصلاح و خروجی جدید وارد کنید.','متوسط',bn.orgName||'')); if(k){seen[k]=seen[k]||[]; seen[k].push(bn)}});
    Object.keys(seen).forEach(k=>{if(seen[k].length>1)out.push(issue('مددجو/ذی‌نفع','کد ملی تکراری','کد ملی '+k+' در '+seen[k].length+' رکورد تکرار شده است.','رکوردهای تکراری مددجو را بررسی و ادغام/اصلاح کنید.','متوسط'))});
    return out;
  }
  function auditItems(){
    ensureArraysV101();
    let out=[];
    state.orgs.forEach(o=>issuesForOrgV101(o).forEach(is=>out.push({orgId:o.id,orgName:o.name,type:is.module,severity:is.severity,desc:is.problem,status:'باز',field:is.field,requiredAction:is.action,problemDetails:[is]})));
    state.reports.forEach(r=>issuesForReportV101(r).forEach(is=>out.push({orgId:r.orgId,orgName:r.orgName,type:is.module,severity:is.severity,desc:(is.ref?is.ref+' - ':'')+is.problem,status:'باز',field:is.field,requiredAction:is.action,problemDetails:[is]})));
    issuesForBeneficiariesV101().forEach(is=>out.push({orgId:'',orgName:is.ref||'عمومی',type:is.module,severity:is.severity,desc:is.problem,status:'باز',field:is.field,requiredAction:is.action,problemDetails:[is]}));
    return out;
  }
  window.auditItems=auditItems;
  auditRun=function(show=true){
    state.auditFindings=auditItems().map((x,i)=>Object.assign({id:idSafe('aud')+'_'+i},x)); saveSafe(); if(show)render('audit');
  };
  window.auditRun=auditRun;
  function auditMessageV101(a){
    let list=arr(a.problemDetails); if(!list.length)list=[issue(a.type||'حسابرسی',a.field||'مورد',a.desc||a.description||'',a.requiredAction||a.adminNote||'اطلاعات مرتبط را بررسی و اصلاح کنید.',a.severity||'متوسط')];
    return 'مشکل/موارد نیازمند اصلاح برای '+(a.orgName||'پرونده')+':\n\n'+list.map((x,i)=>`${i+1}. بخش: ${x.module}\n   فیلد/محل: ${x.field}\n   مشکل: ${x.problem}\n   اقدام لازم: ${x.action}`).join('\n\n');
  }
  window.auditMessageV101=auditMessageV101;
  function makeCorrectionV101(a){
    state.corrections=arr(state.corrections);
    let c=state.corrections.find(x=>String(x.auditId)===String(a.id));
    if(c)return c;
    c={id:idSafe('corr'),auditId:a.id,orgId:a.orgId||'',orgName:a.orgName||'',title:'اصلاح مورد حسابرسی: '+(a.type||''),desc:a.desc||a.description||'',auditType:a.type||'',auditSeverity:a.severity||'متوسط',adminNote:a.requiredAction||a.adminNote||'',requiredAction:a.requiredAction||'اطلاعات مرتبط را بررسی و اصلاح کنید.',problemDetails:arr(a.problemDetails),status:'باز',createdAt:todaySafe(),updatedAt:''};
    state.corrections.unshift(c); a.status='نیازمند اصلاح'; return c;
  }
  window.v94OpenAuditCorrectionPage=function(id){
    let a=arr(state.auditFindings).find(x=>String(x.id)===String(id)); if(!a){alert('مورد حسابرسی پیدا نشد.');return}
    alert(auditMessageV101(a));
    let c=makeCorrectionV101(a); state.activeCorrectionId=c.id; saveSafe(); render('corrections');
  };
  window.v94AudTable=function(as){as=arr(as);return `<div class="tablewrap"><table class="table"><tr><th>سمن</th><th>بخش</th><th>فیلد/محل</th><th>شدت</th><th>مشکل</th><th>اقدام لازم</th><th>وضعیت</th><th>عملیات</th></tr>${as.map(a=>`<tr><td>${safeEsc(a.orgName||'')}</td><td>${safeEsc(a.type||'')}</td><td>${safeEsc(a.field||'')}</td><td>${safeEsc(a.severity||'')}</td><td>${safeEsc(a.desc||a.description||'')}</td><td>${safeEsc(a.requiredAction||'')}</td><td>${b(a.status||'باز')}</td><td><button class="ghost" onclick="v94OpenAuditCorrectionPage('${a.id}')">اصلاح و نمایش محل مشکل</button><button class="ghost" onclick="v94AuditApprove&&v94AuditApprove('${a.id}')">تأیید</button><button class="ghost" onclick="v94AuditReject&&v94AuditReject('${a.id}')">رد</button></td></tr>`).join('')||'<tr><td colspan="8">یافته‌ای ندارد.</td></tr>'}</table></div>`};
  audTable=function(as){return window.v94AudTable(as)};
  audit=function(){auditRun(false);let open=arr(state.auditFindings).filter(a=>!a.status||a.status==='باز'||a.status==='نیازمند اصلاح').length;return `<div class="actions"><button class="primary" onclick="auditRun(true)">اجرای حسابرسی مجدد</button><button class="ghost" onclick="downloadCSV('حسابرسی.csv',auditCSV())">Excel/CSV</button></div><div class="card"><h3>حسابرسی هوشمند و اصلاحات دقیق</h3><div class="note info">در ستون «اقدام لازم» دقیقاً مشخص شده مشکل در کدام بخش و فیلد است. با زدن «اصلاح»، پیام کامل مشکل نمایش داده می‌شود و صفحه اصلاح باز می‌شود.</div><div class="note ${open?'warn':'ok'}">موارد باز یا نیازمند اصلاح: ${open}</div>${window.v94AudTable(state.auditFindings)}</div>`};
  function correctionIssuePanelV101(c){
    let list=arr(c&&c.problemDetails); if(!list.length && c)list=[issue(c.auditType||'حسابرسی','مورد حسابرسی',c.desc||'',c.requiredAction||c.adminNote||'اطلاعات مرتبط را بررسی و اصلاح کنید.',c.auditSeverity||'متوسط')];
    return `<div class="v94-card"><h3>محل‌های دقیق نیازمند اصلاح</h3>${list.map((x,i)=>`<div class="v94-note warn"><b>${i+1}) بخش:</b> ${safeEsc(x.module)}<br><b>فیلد/محل:</b> ${safeEsc(x.field)}<br><b>مشکل:</b> ${safeEsc(x.problem)}<br><b>اقدام لازم:</b> ${safeEsc(x.action)}</div>`).join('')}</div>`;
  }
  const baseV94EditorV101=window.v94Editor;
  if(baseV94EditorV101){ window.v94Editor=function(c){ return correctionIssuePanelV101(c)+baseV94EditorV101(c); }; }
  corr=function(){
    let activeId=state.activeCorrectionId||(arr(state.corrections)[0]&&state.corrections[0].id), active=activeId?arr(state.corrections).find(c=>String(c.id)===String(activeId)):null;
    return `<div class="v94-hero"><h3>درخواست‌های اصلاح و ویرایش اطلاعات</h3><p>هر اصلاح از حسابرسی، محل مشکل و اقدام لازم را نشان می‌دهد.</p></div><div class="grid2"><div class="v94-card"><h3>فهرست اصلاحات</h3><div class="tablewrap"><table class="table"><tr><th>سمن</th><th>عنوان</th><th>مشکل</th><th>وضعیت</th><th>آخرین تغییر</th><th>عملیات</th></tr>${arr(state.corrections).map(c=>`<tr><td>${safeEsc(c.orgName||'')}</td><td>${safeEsc(c.title||'')}</td><td>${safeEsc(c.desc||'')}</td><td>${b(c.status||'باز')}</td><td>${safeEsc(c.updatedAt||c.createdAt||'')}</td><td><button class="ghost" onclick="state.activeCorrectionId='${c.id}';save();render('corrections')">ویرایش</button></td></tr>`).join('')||'<tr><td colspan="6">درخواست اصلاحی ثبت نشده است.</td></tr>'}</table></div></div><div>${active?correctionIssuePanelV101(active):'<div class="v94-note warn">پرونده اصلاحی انتخاب نشده است.</div>'}</div></div><div id="v94CorrectionEditor">${active&&window.v94Editor?window.v94Editor(active):''}</div>`;
  };
  window.corrections=corr;

  const baseAuditCSVV101=(typeof auditCSV==='function')?auditCSV:null;
  auditCSV=function(){
    return ['سمن,بخش,فیلد/محل,شدت,مشکل,اقدام لازم,وضعیت'].concat(arr(state.auditFindings).map(a=>[a.orgName,a.type,a.field,a.severity,a.desc,a.requiredAction,a.status].map(cell).join(','))).join('\n');
  };
  window.auditCSV=auditCSV;
  score=function(){let total=Math.max(1,state.orgs.length*10+state.reports.length*2+state.beneficiaries.length);let issues=auditItems().length;return Math.max(0,Math.round((total-issues)/total*100))};

  // Repair title/about/version and persist helper for native store
  try{ if(state.settings) state.settings.title=state.settings.title||'سامانه جمع‌آوری اطلاعات سمن‌های مردم‌نهاد شهرستان جوانرود'; }catch(e){}
  try{ window.state=state; window.ADMIN_VERSION_V101=ADMIN_VERSION_V101; }catch(e){}
  try{ ensureArraysV101(); saveSafe(); }catch(e){}
})();
/* ================= END V101 ADMIN COMPLETE PATCH ================= */


/* ================= V102 BENEFICIARY REPORTS PATCH ================= */
(function(){
  const ADMIN_VERSION_V102='1.0.102';
  function A(v){return Array.isArray(v)?v:[]}
  function S(v){return String(v??'').trim()}
  function E(v){return (typeof safeEsc==='function'?safeEsc:String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]||m)))}
  function N(v){return Number(String(v??0).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[^\d.-]/g,''))||0}
  function M(v){return (typeof money==='function')?money(v):String(N(v)).replace(/\B(?=(\d{3})+(?!\d))/g,',')+' ریال'}
  function B(v){return (typeof badge==='function')?badge(v):`<span class="badge">${E(v||'ثبت نشده')}</span>`}
  function C(v){return (typeof cell==='function')?cell(v):'"'+String(v??'').replace(/"/g,'""')+'"'}
  function D(v){return String(v??'').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\D/g,'')}
  function orgName(id){let o=A(state.orgs).find(x=>String(x.id)===String(id));return o?o.name:''}
  function orgReports(id){return A(state.reports).filter(r=>String(r.orgId)===String(id))}
  function orgBens(id){return A(state.beneficiaries).filter(b=>String(b.orgId)===String(id))}
  function repYearMonth(r){return (S(r.year)||'بدون سال')+' / '+(S(r.month)||'بدون ماه')}
  function reportCovered(r, orgId){let v=N(r.totalCoveredBeneficiaries??r.coveredCount??r.beneficiaryCount??r.beneficiariesCount);return v||orgBens(orgId||r.orgId).length||0}
  function reportPaidCount(r){return N(r.beneficiaryPaidCount??r.paidCount??r.paidBeneficiariesCount)}
  function reportUnpaidCount(r, orgId){let raw=N(r.beneficiaryUnpaidCount??r.unpaidCount??r.unpaidBeneficiariesCount); if(raw)return raw; let c=reportCovered(r,orgId),p=reportPaidCount(r); return Math.max(0,c-p)}
  function reportBenPay(r){return N(r.beneficiaryPaidTotal??r.beneficiaryPay??r.beneficiaryPaymentTotal??r.beneficiaryPayments??r.amountPaidToBeneficiaries)}
  function benFullName(b){return S(b.name||b.fullName||((b.firstName||'')+' '+(b.lastName||''))).replace(/\s+/g,' ')}
  function benFullDetails(b){let parts=[];['fatherName','father','phone','mobile','address','note','notes','status'].forEach(k=>{if(S(b[k]))parts.push(S(b[k]))});return parts.join(' | ')}
  function monthsForBeneficiary(b){let months=A(state.reports).filter(r=>String(r.orgId)===String(b.orgId)&&reportBenPay(r)>0).map(repYearMonth);return [...new Set(months)]}
  function amountForBeneficiary(b){return N(b.amount??b.receivedAmount??b.totalReceived??b.paymentAmount)}

  window.beneficiaryMonthlySummaryV102=function(){
    let rows=[];
    A(state.orgs).forEach(o=>{
      let rs=orgReports(o.id);
      if(!rs.length) rows.push({org:o,empty:true});
      rs.forEach(r=>rows.push({org:o,r}));
    });
    return `<div class="report" id="printArea"><div class="rhead"><h2>گزارش ماهانه مددجویان هر سمن</h2><p>تعداد تحت پوشش، تعداد واریزی، تعداد واریز نشده و مبلغ کل واریزی به مددجوها</p></div><div class="tablewrap"><table class="table"><tr><th>سمن</th><th>سال</th><th>ماه</th><th>تعداد تحت پوشش</th><th>تعداد واریزی</th><th>تعداد واریز نشده</th><th>مبلغ کل واریزی به مددجوها</th><th>وضعیت گزارش</th></tr>${rows.map(x=>x.empty?`<tr><td>${E(x.org.name)}</td><td colspan="7">گزارش مالی ماهانه ثبت نشده است.</td></tr>`:`<tr><td>${E(x.org.name)}</td><td>${E(x.r.year||'')}</td><td>${E(x.r.month||'')}</td><td>${reportCovered(x.r,x.org.id)}</td><td>${reportPaidCount(x.r)}</td><td>${reportUnpaidCount(x.r,x.org.id)}</td><td>${M(reportBenPay(x.r))}</td><td>${B(x.r.status||'ثبت شده')}</td></tr>`).join('')}</table></div>${typeof signs==='function'?signs('نام و نام خانوادگی مدیرعامل سمن'):''}</div>`;
  };

  window.beneficiaryListV102=function(){
    let rows=A(state.beneficiaries);
    return `<div class="card"><h3>لیست کامل مددجوها با مشخصات</h3><div class="note info">جستجو بر اساس نام و نام خانوادگی، کد ملی یا نام سمن انجام می‌شود.</div><div class="grid3"><div class="field"><label>جستجو</label><input id="benSearchV102" placeholder="نام، نام خانوادگی، کد ملی یا سمن" oninput="filterBeneficiaryRowsV102()"></div><div class="field"><label>تعداد کل مددجوها</label><input value="${rows.length}" readonly></div><div class="field"><label>خروجی</label><button class="ghost" onclick="downloadCSV('لیست_کامل_مددجوها.csv',beneficiaryListCSVV102())">Excel/CSV</button></div></div><div class="tablewrap"><table class="table" id="benListTableV102"><tr><th>سمن</th><th>نام و نام خانوادگی</th><th>کد ملی</th><th>تماس</th><th>مبلغ دریافتی ثبت‌شده</th><th>وضعیت</th><th>توضیحات/مشخصات تکمیلی</th></tr>${rows.map(b=>`<tr data-search="${E((orgName(b.orgId)+' '+benFullName(b)+' '+(b.nationalId||'')+' '+(b.phone||'')).toLowerCase())}"><td>${E(b.orgName||orgName(b.orgId))}</td><td>${E(benFullName(b))}</td><td>${E(b.nationalId||'')}</td><td>${E(b.phone||b.mobile||'')}</td><td>${M(amountForBeneficiary(b))}</td><td>${B(b.status||'فعال')}</td><td>${E(benFullDetails(b))}</td></tr>`).join('')||'<tr><td colspan="7">مددجویی ثبت نشده است.</td></tr>'}</table></div></div>`;
  };

  window.filterBeneficiaryRowsV102=function(){
    let q=(document.getElementById('benSearchV102')?.value||'').toLowerCase().trim();
    document.querySelectorAll('#benListTableV102 tr[data-search]').forEach(tr=>{tr.style.display=tr.getAttribute('data-search').includes(q)?'':'none'});
  };

  window.duplicateBeneficiariesV102=function(){
    let m={};A(state.beneficiaries).forEach(b=>{let k=D(b.nationalId); if(k){m[k]=m[k]||[];m[k].push(b)}});
    let groups=Object.entries(m).filter(([k,v])=>v.length>1);
    return `<div class="report" id="printArea"><div class="rhead"><h2>گزارش مددجوهای تکراری</h2><p>تشخیص بر اساس کد ملی</p></div>${groups.length?groups.map(([k,items])=>`<div class="note bad"><b>کد ملی تکراری:</b> ${E(k)} | تعداد رکورد: ${items.length}</div><div class="tablewrap"><table class="table"><tr><th>سمن</th><th>نام مددجو</th><th>تماس</th><th>مبلغ ثبت‌شده</th><th>وضعیت</th></tr>${items.map(b=>`<tr><td>${E(b.orgName||orgName(b.orgId))}</td><td>${E(benFullName(b))}</td><td>${E(b.phone||b.mobile||'')}</td><td>${M(amountForBeneficiary(b))}</td><td>${B(b.status||'فعال')}</td></tr>`).join('')}</table></div>`).join(''):'<div class="note ok">مددجوی تکراری بر اساس کد ملی پیدا نشد.</div>'}${typeof signs==='function'?signs('نام و نام خانوادگی مدیرعامل سمن'):''}</div>`;
  };

  window.beneficiaryReceiptReportV102=function(){
    let rows=A(state.beneficiaries);
    return `<div class="report" id="printArea"><div class="rhead"><h2>گزارش دریافتی مددجوها از سمن‌ها</h2><p>مشخصات کامل، مبلغ دریافتی ثبت‌شده و ماه‌های دارای پرداخت مددجو در گزارش مالی همان سمن</p></div><div class="tablewrap"><table class="table"><tr><th>سمن</th><th>نام و نام خانوادگی</th><th>کد ملی</th><th>تماس</th><th>مقدار دریافتی ثبت‌شده</th><th>ماه‌های دریافتی/پرداخت مددجو</th><th>مشخصات تکمیلی</th></tr>${rows.map(b=>{let months=monthsForBeneficiary(b);return `<tr><td>${E(b.orgName||orgName(b.orgId))}</td><td>${E(benFullName(b))}</td><td>${E(b.nationalId||'')}</td><td>${E(b.phone||b.mobile||'')}</td><td>${M(amountForBeneficiary(b))}</td><td>${E(months.join('، ')||'ماه مشخصی ثبت نشده')}</td><td>${E(benFullDetails(b))}</td></tr>`}).join('')||'<tr><td colspan="7">مددجویی ثبت نشده است.</td></tr>'}</table></div><div class="note warn">توضیح: اگر فایل ورودی کلاینت پرداخت فردبه‌فرد ماهانه نداشته باشد، ماه‌های دریافتی از گزارش مالی ماهانه همان سمن استخراج می‌شود.</div>${typeof signs==='function'?signs('نام و نام خانوادگی مدیرعامل سمن'):''}</div>`;
  };

  window.beneficiariesDashboardV102=function(active){
    active=active||'monthly';
    let body=active==='list'?beneficiaryListV102():active==='dups'?duplicateBeneficiariesV102():active==='receipts'?beneficiaryReceiptReportV102():beneficiaryMonthlySummaryV102();
    return `<div class="card"><h3>مددجوها</h3><div class="note info">بخش مددجوها از پرونده کامل سمن جدا شد و گزارش‌های تخصصی آن در همین منو قرار گرفت.</div><div class="tabs"><button onclick="benTabV102('monthly')">گزارش ماهانه هر سمن</button><button onclick="benTabV102('list')">لیست کامل مددجوها</button><button onclick="benTabV102('dups')">مددجوهای تکراری</button><button onclick="benTabV102('receipts')">گزارش دریافتی از سمن‌ها</button></div><div class="actions"><button class="primary" onclick="downloadWord('گزارش مددجوها',document.getElementById('benAreaV102').innerHTML)">Word</button><button class="ghost" onclick="downloadCSV('گزارش_مددجوها.csv',beneficiaryCSVCurrentV102())">Excel/CSV</button><button class="ghost" onclick="window.print()">چاپ/PDF</button></div></div><div id="benAreaV102">${body}</div>`;
  };
  window.benTabV102=function(t){window.activeBenTabV102=t;let area=document.getElementById('benAreaV102'); if(area)area.innerHTML=(t==='list'?beneficiaryListV102():t==='dups'?duplicateBeneficiariesV102():t==='receipts'?beneficiaryReceiptReportV102():beneficiaryMonthlySummaryV102())};
  bens=function(){return beneficiariesDashboardV102(window.activeBenTabV102||'monthly')};
  window.bens=bens;

  window.beneficiaryMonthlyCSVV102=function(){
    let lines=['سمن,سال,ماه,تعداد تحت پوشش,تعداد واریزی,تعداد واریز نشده,مبلغ کل واریزی به مددجوها,وضعیت گزارش'];
    A(state.orgs).forEach(o=>orgReports(o.id).forEach(r=>lines.push([o.name,r.year,r.month,reportCovered(r,o.id),reportPaidCount(r),reportUnpaidCount(r,o.id),reportBenPay(r),r.status||'ثبت شده'].map(C).join(','))));
    return lines.join('\n');
  };
  window.beneficiaryListCSVV102=function(){return ['سمن,نام مددجو,کد ملی,تماس,مبلغ دریافتی,وضعیت,مشخصات تکمیلی'].concat(A(state.beneficiaries).map(b=>[b.orgName||orgName(b.orgId),benFullName(b),b.nationalId,b.phone||b.mobile,amountForBeneficiary(b),b.status||'فعال',benFullDetails(b)].map(C).join(','))).join('\n')};
  window.duplicateBeneficiariesCSVV102=function(){let m={};A(state.beneficiaries).forEach(b=>{let k=D(b.nationalId); if(k){m[k]=m[k]||[];m[k].push(b)}});let lines=['کد ملی,سمن,نام مددجو,تماس,مبلغ ثبت‌شده,وضعیت'];Object.entries(m).filter(([k,v])=>v.length>1).forEach(([k,items])=>items.forEach(b=>lines.push([k,b.orgName||orgName(b.orgId),benFullName(b),b.phone||b.mobile,amountForBeneficiary(b),b.status||'فعال'].map(C).join(','))));return lines.join('\n')};
  window.beneficiaryReceiptCSVV102=function(){return ['سمن,نام مددجو,کد ملی,تماس,مقدار دریافتی,ماه‌های دریافتی,مشخصات تکمیلی'].concat(A(state.beneficiaries).map(b=>[b.orgName||orgName(b.orgId),benFullName(b),b.nationalId,b.phone||b.mobile,amountForBeneficiary(b),monthsForBeneficiary(b).join(' | '),benFullDetails(b)].map(C).join(','))).join('\n')};
  window.beneficiaryCSVCurrentV102=function(){let t=window.activeBenTabV102||'monthly';return t==='list'?beneficiaryListCSVV102():t==='dups'?duplicateBeneficiariesCSVV102():t==='receipts'?beneficiaryReceiptCSVV102():beneficiaryMonthlyCSVV102()};

  const baseViewOrgV102=(typeof viewOrg==='function')?viewOrg:null;
  viewOrg=function(id){
    if(typeof ensureV84==='function')ensureV84();
    let o=A(state.orgs).find(x=>String(x.id)===String(id)); if(!o)return;
    let rs=A(state.reports).filter(r=>String(r.orgId)===String(id)), as=A(state.auditFindings).filter(a=>String(a.orgId)===String(id));
    let target=document.getElementById('orgReport')||document.getElementById('rarea'); if(!target)return baseViewOrgV102?baseViewOrgV102(id):null;
    target.innerHTML=`<div class="report" id="printArea"><div class="rhead"><h2>پرونده کامل سمن</h2><p>${E(o.name)} | شناسه ملی: ${E(o.nationalId)} | شماره ثبت: ${E(o.regNo)}</p></div><div class="grid2"><div><h3>مشخصات ثبتی</h3><p><b>حوزه:</b> ${E(o.activity)}</p><p><b>وضعیت:</b> ${B(o.status)}</p><p><b>آدرس:</b> ${E(o.address)}</p><p><b>تماس:</b> ${E(o.phone||'')}</p></div><div><h3>مدیرعامل</h3><p><b>نام:</b> ${E(o.ceo)}</p><p><b>کد ملی:</b> ${E(o.ceoNationalId)}</p></div></div><h3>مجوز و تصویر مجوز</h3>${typeof licenseDetailsV84==='function'?licenseDetailsV84(o):''}<h3>اطلاعات کامل هیأت مدیره</h3>${typeof boardTableV84==='function'?boardTableV84(o):''}<h3>گزارش‌های مالی</h3>${typeof repsTable==='function'?repsTable(rs):''}<h3>حسابرسی‌ها</h3>${typeof audTable==='function'?audTable(as):''}${typeof signs==='function'?signs(o.ceo):''}</div>`;
  };
  window.viewOrg=viewOrg;

  const baseReportHtmlV102=(typeof reportHtml==='function')?reportHtml:null;
  reportHtml=function(t){
    if(t==='ben')return beneficiaryMonthlySummaryV102();
    return baseReportHtmlV102?baseReportHtmlV102(t):'<div class="note bad">قالب گزارش پیدا نشد.</div>';
  };
  const baseCsvCurrentV102=(typeof csvCurrent==='function')?csvCurrent:null;
  csvCurrent=function(){try{if(typeof rtype!=='undefined'&&rtype==='ben')return beneficiaryMonthlyCSVV102();}catch(e){} return baseCsvCurrentV102?baseCsvCurrentV102():beneficiaryMonthlyCSVV102()};
  const baseWordV102=(typeof word==='function')?word:null;
  word=function(){return `<div class="card"><h3>خروجی Word حرفه‌ای</h3><p>گزارش‌های رسمی با سربرگ، کد رهگیری و سه محل امضا تولید می‌شوند.</p><div class="quick"><button onclick="downloadWord('گزارش جامع',reportHtml('full'))">📑 گزارش جامع</button><button onclick="downloadWord('لیست هیأت مدیره سمن‌ها',reportHtml('board'))">👥 لیست هیأت مدیره</button><button onclick="downloadWord('گزارش ماهانه مددجوها',beneficiaryMonthlySummaryV102())">👨‍👩‍👧 گزارش ماهانه مددجوها</button><button onclick="downloadWord('لیست کامل مددجوها',beneficiaryListV102())">📋 لیست کامل مددجوها</button><button onclick="downloadWord('مددجوهای تکراری',duplicateBeneficiariesV102())">♻️ مددجوهای تکراری</button><button onclick="downloadWord('گزارش دریافتی مددجوها از سمن‌ها',beneficiaryReceiptReportV102())">💳 دریافتی مددجوها</button><button onclick="downloadWord('گزارش مجوزها',reportHtml('lic'))">📜 گزارش مجوزها</button><button onclick="downloadWord('گزارش مالی',reportHtml('fin'))">📊 گزارش مالی</button><button onclick="downloadWord('گزارش حسابرسی',reportHtml('aud'))">🧾 گزارش حسابرسی</button></div></div>`};

  const baseNormalizeClientV102=(typeof normalizeClientV101==='function')?normalizeClientV101:null;
  if(baseNormalizeClientV102){ normalizeClientV101=function(data){
      let n=baseNormalizeClientV102(data);
      n.beneficiaries=A(n.beneficiaries).map(x=>Object.assign({},x,{firstName:x.firstName||'',lastName:x.lastName||'',fatherName:x.fatherName||x.father||'',address:x.address||'',mobile:x.mobile||x.phone||'',receivedAmount:x.receivedAmount??x.amount??0,totalReceived:x.totalReceived??x.amount??0}));
      return n;
    }; window.normalizeClientV101=normalizeClientV101;
  }

  try{window.ADMIN_VERSION_V102=ADMIN_VERSION_V102; if(state)state.adminVersion='V102'; if(typeof saveSafe==='function')saveSafe();else if(typeof save==='function')save();}catch(e){}
})();
/* ================= END V102 BENEFICIARY REPORTS PATCH ================= */


/* ================= V103 COUNTY BENEFICIARY TOTAL REPORT PATCH ================= */
(function(){
  const ADMIN_VERSION_V103='1.0.103';
  function A(v){return Array.isArray(v)?v:[]}
  function S(v){return String(v??'').trim()}
  function E(v){return (typeof safeEsc==='function'?safeEsc:String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]||m)))}
  function N(v){return Number(String(v??0).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/,/g,'').replace(/،/g,'').replace(/[^\d.-]/g,''))||0}
  function M(v){return (typeof money==='function')?money(v):String(N(v)).replace(/\B(?=(\d{3})+(?!\d))/g,',')+' ریال'}
  function C(v){return (typeof cell==='function')?cell(v):'"'+String(v??'').replace(/"/g,'""')+'"'}
  function D(v){return String(v??'').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\D/g,'')}
  function todayFa(){try{return typeof today==='function'?today():new Date().toLocaleDateString('fa-IR')}catch(e){return new Date().toLocaleDateString('fa-IR')}}
  function orgName(id){let o=A(state.orgs).find(x=>String(x.id)===String(id));return o?o.name:''}
  function orgReports(id){return A(state.reports).filter(r=>String(r.orgId)===String(id))}
  function orgBens(id){return A(state.beneficiaries).filter(b=>String(b.orgId)===String(id))}
  function reportCoveredLocal(r, orgId){
    if(typeof reportCovered==='function')return reportCovered(r,orgId);
    let v=N(r.totalCoveredBeneficiaries??r.coveredCount??r.beneficiaryCount??r.beneficiariesCount);
    return v||orgBens(orgId||r.orgId).length||0;
  }
  function reportBenPayLocal(r){
    if(typeof reportBenPay==='function')return reportBenPay(r);
    return N(r.beneficiaryPaidTotal??r.beneficiaryPay??r.beneficiaryPaymentTotal??r.beneficiaryPayments??r.amountPaidToBeneficiaries);
  }
  function ym(r){return (S(r.year)||'بدون سال')+' / '+(S(r.month)||'بدون ماه')}
  function countyBeneficiaryRowsV103(){
    return A(state.orgs).map((o,i)=>{
      let rs=orgReports(o.id);
      let monthItems=rs.map(r=>({label:ym(r),amount:reportBenPayLocal(r)})).filter(x=>x.label||x.amount);
      let total=monthItems.reduce((a,x)=>a+N(x.amount),0);
      let maxCovered=rs.reduce((m,r)=>Math.max(m,reportCoveredLocal(r,o.id)),0);
      let benCount=maxCovered||orgBens(o.id).length||0;
      let monthText=monthItems.length?monthItems.map(x=>`${x.label}: ${M(x.amount)}`).join(' | '):'واریزی ماهانه ثبت نشده';
      return {idx:i+1,org:o,benCount,monthItems,monthText,total,monthCount:monthItems.length};
    });
  }
  window.countyBeneficiaryTotalReportV103=function(){
    let rows=countyBeneficiaryRowsV103();
    let totalAmount=rows.reduce((a,x)=>a+N(x.total),0);
    let totalMonths=rows.reduce((a,x)=>a+N(x.monthCount),0);
    let totalBeneficiaries=rows.reduce((a,x)=>a+N(x.benCount),0);
    return `<div class="report" id="printArea"><div class="rhead"><h2>گزارش کل مددجوهای تحت پوشش سمن‌های شهرستان</h2><p>تجمیع شهرستانی بر اساس گزارش‌های مالی ماهانه ثبت‌شده تا تاریخ ${E(todayFa())}</p></div><div class="tablewrap"><table class="table"><tr><th>ردیف</th><th>نام سمن</th><th>تعداد مددجوها</th><th>مقدار واریزی هر ماه</th><th>مجموع چند ماه</th></tr>${rows.map(x=>`<tr><td>${x.idx}</td><td>${E(x.org.name||'')}</td><td>${x.benCount}</td><td style="text-align:right;line-height:2">${E(x.monthText)}</td><td>${M(x.total)}<br><small>${x.monthCount} ماه</small></td></tr>`).join('')||'<tr><td colspan="5">اطلاعاتی ثبت نشده است.</td></tr>'}<tr class="total"><td colspan="2"><b>جمع کل شهرستان</b></td><td><b>${totalBeneficiaries}</b></td><td><b>تعداد ماه‌های تجمیع‌شده: ${totalMonths}</b></td><td><b>${M(totalAmount)}</b></td></tr></table></div><div class="note ok"><b>جمع کل واریزی‌ها تا تاریخ ${E(todayFa())}:</b> ${M(totalAmount)} | <b>مجموع چند ماه:</b> ${totalMonths} ماه</div>${typeof signs==='function'?signs('نام و نام خانوادگی مدیرعامل سمن'):''}</div>`;
  };
  window.countyBeneficiaryTotalCSVV103=function(){
    let rows=countyBeneficiaryRowsV103();
    let totalAmount=rows.reduce((a,x)=>a+N(x.total),0), totalMonths=rows.reduce((a,x)=>a+N(x.monthCount),0), totalBeneficiaries=rows.reduce((a,x)=>a+N(x.benCount),0);
    let lines=['ردیف,نام سمن,تعداد مددجوها,مقدار واریزی هر ماه,مجموع چند ماه,تعداد ماه'];
    rows.forEach(x=>lines.push([x.idx,x.org.name||'',x.benCount,x.monthText,x.total,x.monthCount].map(C).join(',')));
    lines.push(['جمع کل شهرستان','',totalBeneficiaries,'تعداد ماه‌های تجمیع‌شده: '+totalMonths,totalAmount,totalMonths].map(C).join(','));
    return lines.join('\n');
  };

  const beneficiaryMonthlySummaryBaseV103=window.beneficiaryMonthlySummaryV102;
  const beneficiaryListBaseV103=window.beneficiaryListV102;
  const duplicateBeneficiariesBaseV103=window.duplicateBeneficiariesV102;
  const beneficiaryReceiptBaseV103=window.beneficiaryReceiptReportV102;
  window.beneficiariesDashboardV103=function(active){
    active=active||'county';
    let body= active==='monthly'&&beneficiaryMonthlySummaryBaseV103?beneficiaryMonthlySummaryBaseV103():
              active==='list'&&beneficiaryListBaseV103?beneficiaryListBaseV103():
              active==='dups'&&duplicateBeneficiariesBaseV103?duplicateBeneficiariesBaseV103():
              active==='receipts'&&beneficiaryReceiptBaseV103?beneficiaryReceiptBaseV103():
              countyBeneficiaryTotalReportV103();
    return `<div class="card"><h3>مددجوها</h3><div class="note info">گزارش‌های تخصصی مددجوها، شامل گزارش شهرستانی، گزارش ماهانه هر سمن، لیست کامل، تکراری‌ها و دریافتی مددجوها.</div><div class="tabs"><button onclick="benTabV103('county')">کل مددجوهای شهرستان</button><button onclick="benTabV103('monthly')">گزارش ماهانه هر سمن</button><button onclick="benTabV103('list')">لیست کامل مددجوها</button><button onclick="benTabV103('dups')">مددجوهای تکراری</button><button onclick="benTabV103('receipts')">گزارش دریافتی از سمن‌ها</button></div><div class="actions"><button class="primary" onclick="downloadWord('گزارش مددجوها',document.getElementById('benAreaV103').innerHTML)">Word</button><button class="ghost" onclick="downloadCSV('گزارش_مددجوها.csv',beneficiaryCSVCurrentV103())">Excel/CSV</button><button class="ghost" onclick="window.print()">چاپ/PDF</button></div></div><div id="benAreaV103">${body}</div>`;
  };
  window.benTabV103=function(t){window.activeBenTabV103=t; window.activeBenTabV102=t; let area=document.getElementById('benAreaV103'); if(area)area.innerHTML=(t==='monthly'&&beneficiaryMonthlySummaryBaseV103?beneficiaryMonthlySummaryBaseV103():t==='list'&&beneficiaryListBaseV103?beneficiaryListBaseV103():t==='dups'&&duplicateBeneficiariesBaseV103?duplicateBeneficiariesBaseV103():t==='receipts'&&beneficiaryReceiptBaseV103?beneficiaryReceiptBaseV103():countyBeneficiaryTotalReportV103())};
  window.beneficiaryCSVCurrentV103=function(){let t=window.activeBenTabV103||window.activeBenTabV102||'county'; if(t==='monthly'&&window.beneficiaryMonthlyCSVV102)return beneficiaryMonthlyCSVV102(); if(t==='list'&&window.beneficiaryListCSVV102)return beneficiaryListCSVV102(); if(t==='dups'&&window.duplicateBeneficiariesCSVV102)return duplicateBeneficiariesCSVV102(); if(t==='receipts'&&window.beneficiaryReceiptCSVV102)return beneficiaryReceiptCSVV102(); return countyBeneficiaryTotalCSVV103()};
  window.beneficiaryCSVCurrentV102=window.beneficiaryCSVCurrentV103;
  bens=function(){return beneficiariesDashboardV103(window.activeBenTabV103||'county')};
  window.bens=bens;

  const baseReportHtmlV103=(typeof reportHtml==='function')?reportHtml:null;
  reportHtml=function(t){ if(t==='benCounty'||t==='countyBeneficiaries')return countyBeneficiaryTotalReportV103(); return baseReportHtmlV103?baseReportHtmlV103(t):countyBeneficiaryTotalReportV103() };
  const baseCsvCurrentV103=(typeof csvCurrent==='function')?csvCurrent:null;
  csvCurrent=function(){try{if(typeof rtype!=='undefined'&&(rtype==='benCounty'||rtype==='countyBeneficiaries'))return countyBeneficiaryTotalCSVV103();}catch(e){} return baseCsvCurrentV103?baseCsvCurrentV103():countyBeneficiaryTotalCSVV103()};
  const baseWordV103=(typeof word==='function')?word:null;
  word=function(){return `<div class="card"><h3>خروجی Word حرفه‌ای</h3><p>گزارش‌های رسمی با سربرگ، کد رهگیری و سه محل امضا تولید می‌شوند.</p><div class="quick"><button onclick="downloadWord('گزارش جامع',reportHtml('full'))">📑 گزارش جامع</button><button onclick="downloadWord('لیست هیأت مدیره سمن‌ها',reportHtml('board'))">👥 لیست هیأت مدیره</button><button onclick="downloadWord('کل مددجوهای تحت پوشش سمن‌های شهرستان',countyBeneficiaryTotalReportV103())">🏙️ کل مددجوهای شهرستان</button><button onclick="downloadWord('گزارش ماهانه مددجوها',beneficiaryMonthlySummaryV102())">👨‍👩‍👧 گزارش ماهانه مددجوها</button><button onclick="downloadWord('لیست کامل مددجوها',beneficiaryListV102())">📋 لیست کامل مددجوها</button><button onclick="downloadWord('مددجوهای تکراری',duplicateBeneficiariesV102())">♻️ مددجوهای تکراری</button><button onclick="downloadWord('گزارش دریافتی مددجوها از سمن‌ها',beneficiaryReceiptReportV102())">💳 دریافتی مددجوها</button><button onclick="downloadWord('گزارش مجوزها',reportHtml('lic'))">📜 گزارش مجوزها</button><button onclick="downloadWord('گزارش مالی',reportHtml('fin'))">📊 گزارش مالی</button><button onclick="downloadWord('گزارش حسابرسی',reportHtml('aud'))">🧾 گزارش حسابرسی</button></div></div>`};

  try{window.ADMIN_VERSION_V103=ADMIN_VERSION_V103; if(state)state.adminVersion='V103'; if(typeof saveSafe==='function')saveSafe();else if(typeof save==='function')save();}catch(e){}
})();
/* ================= END V103 COUNTY BENEFICIARY TOTAL REPORT PATCH ================= */



/* ================= V105 ADMIN ICON + SECURE SETTINGS + DATABASE RESET PATCH ================= */
(function(){
  const ADMIN_VERSION_V105='ADMIN_V105_ICON_SECURITY_SETTINGS_20260613';
  function X(v){try{return (typeof esc==='function')?esc(v):String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]||m))}catch(e){return String(v??'')}}
  function V(id){return (document.getElementById(id)||{}).value||''}
  function hasAdminPass(p){return String(p||'')===String((state.settings&&state.settings.adminPass)||'admin123')}
  function ensureSignersV105(){
    state.settings=state.settings||{};
    state.settings.adminUser=state.settings.adminUser||'admin';
    state.settings.adminPass=state.settings.adminPass||'admin123';
    state.settings.title=state.settings.title||'سامانه جمع‌آوری اطلاعات سمن‌های مردم‌نهاد شهرستان جوانرود';
    if(!Array.isArray(state.settings.signers)||!state.settings.signers.length){
      state.settings.signers=[{id:'social',title:'کارشناس امور اجتماعی فرمانداری شهرستان جوانرود',name:'',active:true},{id:'governor',title:'فرماندار شهرستان جوانرود',name:'',active:true}];
    }
  }
  function emptyOperationalStateV105(){
    ensureSignersV105();
    const keepSettings=JSON.parse(JSON.stringify(state.settings||{}));
    const keepSession={user:keepSettings.adminUser||'admin',at:new Date().toLocaleString('fa-IR')};
    const keepRoles=Array.isArray(state.roles)?state.roles:[];
    const keepTemplates=Array.isArray(state.reportTemplates)?state.reportTemplates:[];
    return {
      session: keepSession,
      users:[], activations:[], orgs:[], reports:[], beneficiaries:[], imports:[], corrections:[], auditFindings:[],
      workflow:[], documents:[], clientDocuments:[], clientAttachments:[], attachments:[], licenses:[], accounts:[], members:[], boardReports:[],
      logs:[{action:'پاک‌سازی کامل اطلاعات عملیاتی توسط ادمین',at:new Date().toLocaleString('fa-IR'),user:keepSession.user}],
      changeHistory:[], realBackupHistory:[], migrations:[], errors:[], alerts:[],
      settings: keepSettings,
      roles: keepRoles,
      reportTemplates: keepTemplates,
      version:'105', adminVersion:'V105', __noDemoData:true
    };
  }
  try{
    if(typeof defaults==='function' && !window.__v105DefaultsWrapped){
      window.__v105DefaultsWrapped=true;
      window.__v105BaseDefaults=defaults;
      defaults=function(){
        ensureSignersV105();
        if(state && state.__noDemoData) return;
        return window.__v105BaseDefaults();
      };
    }
  }catch(e){}
  try{
    if(Array.isArray(tabs) && !tabs.some(t=>t[0]==='adminSecurity')){
      const i=tabs.findIndex(t=>t[0]==='settings');
      if(i>=0){tabs[i]=['settings','تعاریف و امضا','سربرگ و امضاها','✍️'];tabs.splice(i+1,0,['adminSecurity','تنظیمات ادمین','ورود و پاک‌سازی','🔧']);}
      else tabs.push(['adminSecurity','تنظیمات ادمین','ورود و پاک‌سازی','🔧']);
    }
  }catch(e){}
  try{
    if(typeof shell==='function' && !window.__v105ShellWrapped){
      window.__v105ShellWrapped=true;
      window.__v105BaseShell=shell;
      shell=function(a,c){
        window.__v105BaseShell(a,c);
        try{
          const g=document.querySelector('.govlogo');
          if(g){g.classList.add('has-icon');g.innerHTML='<img src="assets/ngo_app_icon.png" alt="NGO">';}
        }catch(e){}
      };
    }
  }catch(e){}
  try{
    settings=function(){
      ensureSignersV105();
      return `<div class="grid2"><div class="card"><h3>تعاریف امضاکنندگان گزارش‌ها</h3><div class="note info">پایان تمام گزارش‌ها: مدیرعامل سمن، کارشناس امور اجتماعی فرمانداری شهرستان جوانرود، فرماندار شهرستان جوانرود.</div>${state.settings.signers.map(s=>`<div class="field"><label>${X(s.title)}</label><input id="sign_${X(s.id)}" value="${X(s.name||'')}" placeholder="نام و نام خانوادگی"></div>`).join('')}<button class="primary" onclick="saveSigners()">ذخیره امضاها</button></div><div class="card"><h3>سربرگ و عنوان سامانه</h3><div class="field"><label>عنوان سامانه</label><input id="setTitleOnly" value="${X(state.settings.title)}"></div><button class="primary" onclick="saveTitleOnlyV105()">ذخیره عنوان</button><div class="note info">تغییر نام کاربری و رمز عبور از منوی «تنظیمات ادمین» انجام می‌شود.</div></div></div>`;
    };
  }catch(e){}
  window.saveTitleOnlyV105=function(){ensureSignersV105();state.settings.title=V('setTitleOnly')||state.settings.title;save();alert('عنوان سامانه ذخیره شد.');render('settings')};
  window.adminSecurityPanelV105=function(){
    ensureSignersV105();
    return `<div class="grid2"><div class="card security-ok"><h3>تنظیمات ورود ادمین</h3><div class="note info">برای تغییر نام کاربری یا رمز، باید رمز فعلی ادمین را وارد کنید.</div><div class="field"><label>نام کاربری فعلی</label><input value="${X(state.settings.adminUser||'admin')}" dir="ltr" disabled></div><div class="field"><label>رمز فعلی ادمین</label><input id="v105OldPass" type="password" dir="ltr" autocomplete="current-password"></div><div class="field"><label>نام کاربری جدید</label><input id="v105NewUser" value="${X(state.settings.adminUser||'admin')}" dir="ltr"></div><div class="field"><label>رمز عبور جدید</label><input id="v105NewPass" type="password" dir="ltr" autocomplete="new-password" placeholder="حداقل ۶ کاراکتر"></div><div class="field"><label>تکرار رمز عبور جدید</label><input id="v105NewPass2" type="password" dir="ltr" autocomplete="new-password"></div><button class="primary" onclick="saveAdminCredentialsV105()">ذخیره نام کاربری و رمز ادمین</button></div><div class="card security-danger"><h3>پاک کردن کامل اطلاعات دیتابیس</h3><div class="note bad"><b>هشدار جدی:</b><br>این عملیات همه اطلاعات عملیاتی را حذف می‌کند: سمن‌ها، کاربران کلاینت، فایل‌های فعال‌سازی، گزارش‌های مالی، مددجوها، واردات، حسابرسی، اصلاحات و لاگ‌ها. تنظیمات ورود ادمین و امضاها حفظ می‌شوند تا بتوانید دوباره وارد شوید.</div><div class="field"><label>رمز عبور ادمین برای تأیید حذف</label><input id="v105DeletePass" type="password" dir="ltr"></div><div class="field"><label>برای تأیید نهایی عبارت زیر را تایپ کنید: حذف کامل</label><input id="v105DeletePhrase" placeholder="حذف کامل"></div><div class="actions"><button class="primary red" onclick="clearAllAdminDatabaseV105()">حذف کامل دیتابیس</button><button class="ghost" onclick="downloadJSON('backup_before_delete_v105.json',state)">قبل از حذف بکاپ بگیر</button></div><div class="v105-mini">بعد از حذف، دیتای نمونه دوباره ساخته نمی‌شود و پنل با دیتابیس خالی بالا می‌آید.</div></div></div>`;
  };
  window.saveAdminCredentialsV105=function(){
    ensureSignersV105();
    const old=V('v105OldPass'), user=V('v105NewUser').trim(), p1=V('v105NewPass'), p2=V('v105NewPass2');
    if(!hasAdminPass(old)){alert('رمز فعلی ادمین اشتباه است.');return;}
    if(!user){alert('نام کاربری جدید را وارد کنید.');return;}
    if(!p1 || p1.length<6){alert('رمز عبور جدید باید حداقل ۶ کاراکتر باشد.');return;}
    if(p1!==p2){alert('تکرار رمز عبور با رمز جدید یکسان نیست.');return;}
    state.settings.adminUser=user; state.settings.adminPass=p1;
    if(state.session) state.session.user=user;
    try{log('تغییر نام کاربری/رمز عبور ادمین')}catch(e){}
    save();
    alert('تنظیمات ورود ادمین ذخیره شد. از ورود بعدی با نام کاربری و رمز جدید وارد شوید.');
    render('adminSecurity');
  };
  window.clearAllAdminDatabaseV105=async function(){
    ensureSignersV105();
    const pass=V('v105DeletePass'), phrase=V('v105DeletePhrase').trim();
    if(!hasAdminPass(pass)){alert('رمز عبور ادمین اشتباه است. حذف انجام نشد.');return;}
    if(phrase!=='حذف کامل'){alert('عبارت تأیید نهایی درست وارد نشده است.');return;}
    if(!confirm('آیا مطمئن هستید؟ همه اطلاعات عملیاتی حذف می‌شود و قابل بازگشت نیست مگر اینکه بکاپ داشته باشید.'))return;
    try{ if(window.JavanroodNativeStore && window.JavanroodNativeStore.backupState) await window.JavanroodNativeStore.backupState('admin_before_delete_v105', state); }catch(e){}
    state=emptyOperationalStateV105(); window.state=state;
    try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}
    try{ if(window.JavanroodNativeStore && window.JavanroodNativeStore.saveState) await window.JavanroodNativeStore.saveState('admin', state); }catch(e){}
    alert('اطلاعات دیتابیس حذف شد. پنل با دیتابیس خالی باز می‌شود.');
    render('dashboard');
  };
  try{
    if(typeof render==='function' && !window.__v105RenderWrapped){
      window.__v105RenderWrapped=true;
      window.__v105BaseRender=render;
      render=function(tab='dashboard'){
        if(!state.session){loginPage();return;}
        if(tab==='adminSecurity'){defaults(); shell('adminSecurity', adminSecurityPanelV105()); return;}
        return window.__v105BaseRender(tab);
      };
    }
  }catch(e){}
  try{state.adminVersion='V105';state.version='105';window.ADMIN_VERSION_V105=ADMIN_VERSION_V105;save();}catch(e){}
})();
/* ================= END V105 ADMIN ICON + SECURE SETTINGS + DATABASE RESET PATCH ================= */


/* ================= V106 SMART IMPORT DUPLICATE + REVISION DETECTION ================= */
(function(){
  const ADMIN_VERSION_V106='ADMIN_V106_SMART_IMPORT_DUPLICATE_REVISION_20260613';
  function S(v){try{return (typeof esc==='function'?esc(v):String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]||m)))}catch(e){return String(v??'')}}
  function A(v){return Array.isArray(v)?v:[]}
  function C(v){return String(v??'').trim()}
  function N(v){try{return typeof num==='function'?num(v):(Number(String(v||0).replace(/[^\d.-]/g,''))||0)}catch(e){return 0}}
  function M(v){try{return typeof money==='function'?money(v):(String(N(v)).replace(/\B(?=(\d{3})+(?!\d))/g,',')+' ریال')}catch(e){return String(v||0)}}
  function ID(p){try{return typeof uid==='function'?uid(p):p+'_'+Date.now()+'_'+Math.random().toString(36).slice(2,7)}catch(e){return p+'_'+Date.now()}}
  function T(){return new Date().toLocaleString('fa-IR')}
  function D(){return (typeof today==='function'?today():new Date().toLocaleDateString('fa-IR'))}
  function stable(obj){
    const omit={id:1,clientReportId:1,createdAt:1,updatedAt:1,importedAt:1,exportedAt:1,trackingCode:1,source:1,history:1,workflowStatus:1};
    if(obj===null||obj===undefined) return 'null';
    if(typeof obj!=='object') return JSON.stringify(obj);
    if(Array.isArray(obj)) return '['+obj.map(stable).sort().join(',')+']';
    return '{'+Object.keys(obj).filter(k=>!omit[k]).sort().map(k=>JSON.stringify(k)+':'+stable(obj[k])).join(',')+'}';
  }
  function hash(v){
    let str=typeof v==='string'?v:stable(v), h=2166136261;
    for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}
    return (h>>>0).toString(16).padStart(8,'0');
  }
  function reportKey(orgKey,r){return [C(orgKey),C(r.year),C(r.month)].join('|')}
  function reportComparable(r){
    return {
      year:C(r.year),month:C(r.month),previousCarryover:N(r.previousCarryover),income:N(r.income),expense:N(r.expense),beneficiaryPay:N(r.beneficiaryPay),currentCost:N(r.currentCost),
      accountDepositTotal:N(r.accountDepositTotal),cashDonations:N(r.cashDonations),cashBoxes:N(r.cashBoxes),ngoCollectedTotal:N(r.ngoCollectedTotal),
      totalCoveredBeneficiaries:N(r.totalCoveredBeneficiaries),beneficiaryPaidCount:N(r.beneficiaryPaidCount),beneficiaryUnpaidCount:N(r.beneficiaryUnpaidCount),
      balance:N(r.balance),balanceAmount:N(r.balanceAmount),balanceStatus:C(r.balanceStatus),status:C(r.status),note:C(r.note)
    };
  }
  function orgComparableFromIncoming(n){
    let o=n.org||{};
    return {name:C(o.organizationName||o.name),nationalId:C(o.organizationNationalId||o.nationalId),regNo:C(o.registrationNumber||o.regNo),ceo:C(o.managerFullName||o.ceo),ceoNationalId:C(o.managerNationalId||o.ceoNationalId),phone:C(o.phone),licenseNo:C(o.licenseNo),licenseEnd:C(o.licenseEnd)};
  }
  function orgComparableFromState(o){
    return {name:C(o&&o.name),nationalId:C(o&&o.nationalId),regNo:C(o&&o.regNo),ceo:C(o&&o.ceo),ceoNationalId:C(o&&o.ceoNationalId),phone:C(o&&o.phone),licenseNo:C(o&&o.licenseNo),licenseEnd:C(o&&o.licenseEnd)};
  }
  function normalizeMember(m){return {name:C(m.name||m.fullName||m.memberName||((m.firstName||'')+' '+(m.lastName||''))),nationalId:C(m.nationalId||m.nationalCode||m.codeMelli),role:C(m.role||m.position||m.post||'عضو'),phone:C(m.phone||m.mobile||m.tel)}}
  function normalizeAccount(a){return {bank:C(a.bank||a.bankName),accountNo:C(a.accountNo||a.account||a.number),cardNo:C(a.cardNo||a.card),sheba:C(a.sheba||a.iban),owner:C(a.owner||a.accountOwner)}}
  function normalizeBeneficiary(b){return {name:C(b.name||b.fullName),nationalId:C(b.nationalId||b.nationalCode),phone:C(b.phone),amount:N(b.amount||b.receivedAmount),status:C(b.status||'فعال'),note:C(b.note||b.notes)}}
  function findExistingOrg(n){
    let org=n.org||{}, orgName=C(org.organizationName||org.name), orgNat=C(org.organizationNationalId||org.nationalId), ceoNat=C(org.managerNationalId||org.ceoNationalId);
    return A(state.orgs).find(x=>(org.organizationKey&&String(x.id)===String(org.organizationKey))||(orgNat&&String(x.nationalId)===String(orgNat))||(orgName&&String(x.name)===String(orgName))||(ceoNat&&String(x.ceoNationalId)===String(ceoNat)));
  }
  function incomingPayload(n){
    return {org:orgComparableFromIncoming(n),members:A(n.members).map(normalizeMember),accounts:A(n.accounts).map(normalizeAccount),beneficiaries:A(n.beneficiaries).map(normalizeBeneficiary),reports:A(n.reports).map(reportComparable)};
  }
  function currentPayloadFor(o,n){
    let months=new Set(A(n.reports).map(r=>C(r.year)+'|'+C(r.month)));
    return {
      org:orgComparableFromState(o),
      members:A(o&& (o.board||o.boardMembers)).map(normalizeMember),
      accounts:(typeof accountsOfV101==='function'?accountsOfV101(o):A(o&&o.bankAccounts)).map(normalizeAccount),
      beneficiaries:A(state.beneficiaries).filter(b=>String(b.orgId)===String(o&&o.id)).map(normalizeBeneficiary),
      reports:A(state.reports).filter(r=>String(r.orgId)===String(o&&o.id)&&months.has(C(r.year)+'|'+C(r.month))).map(reportComparable)
    };
  }
  function diffLine(label,oldV,newV,type){
    if(String(oldV??'')===String(newV??'')) return '';
    return `<tr><td>${S(label)}</td><td>${type==='money'?M(oldV):S(oldV||'-')}</td><td>${type==='money'?M(newV):S(newV||'-')}</td></tr>`;
  }
  function compareReports(oldR,newR){
    let rows=[];
    rows.push(diffLine('تعداد تحت پوشش',oldR.totalCoveredBeneficiaries,newR.totalCoveredBeneficiaries));
    rows.push(diffLine('تعداد واریز شده',oldR.beneficiaryPaidCount,newR.beneficiaryPaidCount));
    rows.push(diffLine('تعداد واریز نشده',oldR.beneficiaryUnpaidCount,newR.beneficiaryUnpaidCount));
    rows.push(diffLine('مبلغ واریزی مددجوها',oldR.beneficiaryPay,newR.beneficiaryPay,'money'));
    rows.push(diffLine('مجموع واریزی و جمع‌آوری سمن',oldR.ngoCollectedTotal,newR.ngoCollectedTotal,'money'));
    rows.push(diffLine('جمع کل ورودی',oldR.income,newR.income,'money'));
    rows.push(diffLine('جمع خروجی/هزینه',oldR.expense,newR.expense,'money'));
    rows.push(diffLine('تراز نهایی',oldR.balanceAmount,newR.balanceAmount,'money'));
    rows.push(diffLine('وضعیت تراز',oldR.balanceStatus,newR.balanceStatus));
    return rows.filter(Boolean);
  }
  function analyzeImportV106(data){
    state.imports=A(state.imports); state.importHistory=A(state.importHistory); state.importFingerprints=A(state.importFingerprints);
    let n=window.normalizeClientV101?window.normalizeClientV101(data):null;
    if(!n) throw new Error('تابع تبدیل خروجی کلاینت پیدا نشد.');
    let existing=findExistingOrg(n), orgKey=(existing&&existing.id)||C((n.org||{}).organizationNationalId)||C((n.org||{}).organizationName)||'new_org';
    let incoming=incomingPayload(n), current=existing?currentPayloadFor(existing,n):null;
    let fileHash=hash(incoming), currentHash=current?hash(current):'';
    let exactByHistory=state.importFingerprints.some(x=>x.fileHash===fileHash);
    let reportItems=A(n.reports).map(r=>{
      let key=reportKey(orgKey,r), newHash=hash(reportComparable(r));
      let old=A(state.reports).find(x=>existing&&String(x.orgId)===String(existing.id)&&C(x.year)===C(r.year)&&C(x.month)===C(r.month));
      let oldHash=old?hash(reportComparable(old)):'';
      let status=!old?'new':(oldHash===newHash?'same':'changed');
      return {key,year:C(r.year),month:C(r.month),newReport:r,oldReport:old,newHash,oldHash,status,diffs:old?compareReports(reportComparable(old),reportComparable(r)):[]};
    });
    let hasNew=reportItems.some(x=>x.status==='new'), hasChanged=reportItems.some(x=>x.status==='changed');
    let sameReports=reportItems.length && reportItems.every(x=>x.status==='same');
    let isExact=!!existing && (exactByHistory || (sameReports && currentHash===fileHash));
    let status=isExact?'duplicate':(existing&&(hasChanged||(!sameReports&&currentHash!==fileHash&&!hasNew))?'revision':(existing&&hasNew?'mixed':'new'));
    if(existing && sameReports && currentHash!==fileHash && !isExact) status='revision';
    return {n,existing,orgKey,fileHash,currentHash,exactByHistory,reportItems,status,hasNew,hasChanged,incoming,current,createdAt:n.createdAt||data.createdAt||data.exportedAt||'',trackingCode:n.trackingCode||data.trackingCode||('IMP-'+Date.now())};
  }
  function analysisHtmlV106(a){
    let orgName=C((a.n.org||{}).organizationName)||C(a.existing&&a.existing.name)||'سمن واردشده';
    let rows=a.reportItems.map((x,i)=>`<tr><td>${i+1}</td><td>${S(x.year)}</td><td>${S(x.month)}</td><td>${x.status==='new'?'<span class="badge b-ok">جدید</span>':x.status==='changed'?'<span class="badge b-warn">اصلاحی</span>':'<span class="badge b-blue">بدون تغییر</span>'}</td><td>${x.diffs.length?'<button class="ghost" onclick="showImportDiffDetailsV106('+i+')">مشاهده اختلاف</button>':'-'}</td></tr>`).join('')||'<tr><td colspan="5">گزارش مالی ماهانه در فایل نیست.</td></tr>';
    let top=a.status==='duplicate'?`<div class="note ok"><b>این فایل تکراری است.</b><br>اطلاعات این فایل قبلاً بدون تغییر وارد شده یا با داده فعلی همان ماه یکسان است. Import انجام نمی‌شود تا رکورد تکراری ساخته نشود.</div>`:
      a.status==='revision'?`<div class="note warn"><b>این فایل اصلاحی است.</b><br>برای ${S(orgName)} قبلاً گزارش همان ماه ثبت شده، اما فایل جدید تغییر دارد. قبل از جایگزینی، اختلاف‌ها را بررسی کنید.</div>`:
      a.status==='mixed'?`<div class="note warn"><b>فایل شامل ماه جدید و/یا اصلاحی است.</b><br>برخی ماه‌ها جدید هستند و برخی مربوط به گزارش‌های قبلی‌اند.</div>`:
      `<div class="note info"><b>فایل جدید است.</b><br>برای ${S(orgName)} گزارش تکراری پیدا نشد.</div>`;
    let actions=a.status==='duplicate'?`<div class="actions"><button class="ghost" onclick="render('import')">بستن</button></div>`:
      `<div class="actions"><button class="primary green" onclick="applySmartImportV106()">${a.status==='revision'||a.status==='mixed'?'اعمال و جایگزینی اصلاحات':'ورود فایل جدید'}</button><button class="ghost" onclick="cancelSmartImportV106()">لغو</button></div>`;
    return `${top}<div class="card"><h3>نتیجه بررسی هوشمند Import</h3><div class="grid3"><div class="note info"><b>سمن:</b><br>${S(orgName)}</div><div class="note info"><b>اثر انگشت فایل:</b><br><span class="ltr">${S(a.fileHash)}</span></div><div class="note info"><b>کد رهگیری:</b><br><span class="ltr">${S(a.trackingCode)}</span></div></div><div class="tablewrap"><table class="table"><tr><th>ردیف</th><th>سال</th><th>ماه</th><th>وضعیت</th><th>اختلاف‌ها</th></tr>${rows}</table></div>${actions}</div>`;
  }
  window.showImportDiffDetailsV106=function(i){
    let a=window.pendingImportV106; if(!a||!a.reportItems||!a.reportItems[i])return;
    let it=a.reportItems[i];
    let html=`<div class="note warn"><b>اختلاف‌های گزارش ${S(it.month)} ${S(it.year)}</b></div><div class="tablewrap"><table class="table"><tr><th>فیلد</th><th>قبلی</th><th>جدید</th></tr>${it.diffs.join('')||'<tr><td colspan="3">اختلافی در فیلدهای اصلی پیدا نشد.</td></tr>'}</table></div>`;
    let box=document.getElementById('importDiffDetailsV106');
    if(!box){box=document.createElement('div');box.id='importDiffDetailsV106';document.getElementById('importResult')?.appendChild(box)}
    box.innerHTML=html;
  };
  function rememberImportV106(a,applied,statusLabel){
    state.importHistory=A(state.importHistory); state.importFingerprints=A(state.importFingerprints);
    let orgName=C((a.n.org||{}).organizationName)||C(a.existing&&a.existing.name)||'';
    state.importHistory.unshift({id:ID('ih'),orgName,trackingCode:a.trackingCode,fileHash:a.fileHash,currentHash:a.currentHash,status:statusLabel,applied:!!applied,checkedAt:T(),reports:a.reportItems.map(x=>({year:x.year,month:x.month,status:x.status,oldHash:x.oldHash,newHash:x.newHash}))});
    state.importHistory=state.importHistory.slice(0,500);
    if(applied){
      state.importFingerprints.unshift({id:ID('fp'),orgName,trackingCode:a.trackingCode,fileHash:a.fileHash,importedAt:T(),reports:a.reportItems.map(x=>({key:x.key,year:x.year,month:x.month,hash:x.newHash}))});
      state.importFingerprints=state.importFingerprints.slice(0,500);
    }
  }
  const baseProcessV106=window.processExport||processExport;
  window.applySmartImportV106=function(){
    let a=window.pendingImportV106; if(!a){alert('فایل بررسی‌شده پیدا نشد.');return;}
    if((a.status==='revision'||a.status==='mixed') && !confirm('برای این سمن/ماه قبلاً گزارش وجود دارد. اطلاعات جدید جایگزین رکوردهای همان ماه شود؟'))return;
    baseProcessV106(a.rawData||a.data);
    rememberImportV106(a,true,a.status==='revision'?'اصلاحی و جایگزین شد':a.status==='mixed'?'ترکیبی/اصلاحی وارد شد':'جدید وارد شد');
    try{
      if(state.imports&&state.imports[0]){state.imports[0].fileHash=a.fileHash;state.imports[0].status=a.status==='revision'?'اصلاحی جایگزین شد':a.status==='mixed'?'ترکیبی وارد شد':'وارد شد';state.imports[0].duplicateCheck='V106';}
      save();
    }catch(e){}
    let box=document.getElementById('importResult'); if(box)box.innerHTML=`<div class="note ok"><b>ورود فایل انجام شد.</b><br>وضعیت: ${S(state.imports&&state.imports[0]&&state.imports[0].status)}<br>اثر انگشت: <span class="ltr">${S(a.fileHash)}</span></div>`;
    window.pendingImportV106=null;
  };
  window.cancelSmartImportV106=function(){window.pendingImportV106=null;let box=document.getElementById('importResult');if(box)box.innerHTML='<div class="note info">ورود فایل لغو شد.</div>'};
  processExport=function(data){
    let box=document.getElementById('importResult');
    try{
      let a=analyzeImportV106(data); a.rawData=data; a.data=data; window.pendingImportV106=a;
      if(a.status==='duplicate'){
        rememberImportV106(a,false,'تکراری بدون ورود');
        state.imports=A(state.imports);
        state.imports.unshift({id:ID('imp'),trackingCode:a.trackingCode,orgName:C((a.n.org||{}).organizationName)||C(a.existing&&a.existing.name),exportedAt:a.createdAt,importedAt:D(),status:'تکراری - وارد نشد',schema:a.n.schema,fileHash:a.fileHash,summary:'این فایل قبلاً بدون تغییر وارد شده یا با داده موجود یکسان است.'});
        save();
      }
      if(box)box.innerHTML=analysisHtmlV106(a);
    }catch(e){ if(box)box.innerHTML=`<div class="note bad">${S(e.message||'فایل خروجی کلاینت معتبر نیست.')}</div>`; }
  };
  window.processExport=processExport;
  importFile=function(){let f=document.getElementById('importFile')&&document.getElementById('importFile').files[0];if(!f){alert('فایل را انتخاب کنید.');return}let r=new FileReader();r.onload=()=>{try{processExport(JSON.parse(r.result))}catch(e){let box=document.getElementById('importResult'); if(box)box.innerHTML='<div class="note bad">فایل JSON معتبر نیست. برای پکیج کامل، ابتدا export.json داخل پکیج را وارد کنید.</div>';}};r.readAsText(f,'utf-8')};
  const baseImpV106=typeof imp==='function'?imp:null;
  imp=function(){
    let list=A(state.imports).map(i=>`<tr><td class="ltr">${S(i.trackingCode)}</td><td>${S(i.orgName)}</td><td>${S(i.exportedAt)}</td><td>${S(i.importedAt)}</td><td>${typeof badge==='function'?badge(i.status):S(i.status)}</td><td class="ltr">${S(i.fileHash||'')}</td><td>${S(i.summary)}</td></tr>`).join('')||'<tr><td colspan="7">فایلی وارد نشده است.</td></tr>';
    let hist=A(state.importHistory).slice(0,30).map(h=>`<tr><td>${S(h.checkedAt)}</td><td>${S(h.orgName)}</td><td>${S(h.status)}</td><td class="ltr">${S(h.fileHash)}</td><td>${S(A(h.reports).map(r=>r.month+' '+r.year+': '+r.status).join(' | '))}</td></tr>`).join('')||'<tr><td colspan="5">تاریخچه بررسی وجود ندارد.</td></tr>';
    return `<div class="card"><h3>ورود فایل خروجی سمن‌ها - کنترل تکراری و اصلاحی</h3><div class="note info">ادمین قبل از ورود، فایل را بررسی می‌کند: اگر دقیقاً تکراری باشد وارد نمی‌شود؛ اگر همان ماه اما اصلاح‌شده باشد اختلاف‌ها را نشان می‌دهد و فقط با تأیید ادمین جایگزین می‌کند.</div><input type="file" id="importFile" accept="application/json,.json"><div class="actions" style="margin-top:12px"><button class="primary" onclick="importFile()">بررسی هوشمند فایل</button></div><div id="importResult"></div></div><div class="card"><h3>لیست فایل‌های واردشده</h3><div class="tablewrap"><table class="table"><tr><th>کد رهگیری</th><th>سمن</th><th>تاریخ خروجی</th><th>تاریخ ورود</th><th>وضعیت</th><th>اثر انگشت</th><th>جزئیات</th></tr>${list}</table></div></div><div class="card"><h3>تاریخچه بررسی Import</h3><div class="tablewrap"><table class="table"><tr><th>زمان بررسی</th><th>سمن</th><th>نتیجه</th><th>اثر انگشت</th><th>ماه‌ها</th></tr>${hist}</table></div></div>`;
  };
  try{state.adminVersion='V106';state.version='106';window.ADMIN_VERSION_V106=ADMIN_VERSION_V106;if(typeof save==='function')save();}catch(e){}
})();
/* ================= END V106 SMART IMPORT DUPLICATE + REVISION DETECTION ================= */


// ===== V21.0.0 RESET UI =====
async function resetDatabase(){
  const pass = prompt("Enter admin password to reset database:");
  if(!pass) return;

  const res = await window.electron.ipcRenderer.invoke('native:resetDatabase', pass);

  if(res.ok){
    alert("Database cleared successfully");
  }else{
    alert("Error: " + res.error);
  }
}

// ===== V21.0.0 REPORTING =====
async function loadReports(){
  const logs = await window.electron.ipcRenderer.invoke('native:getAuditLogs');
  console.log('AUDIT LOGS', logs);
  alert('Reports loaded: ' + logs.length);
}

// ===== V21.0.0 AUDIT UI =====
async function loadAuditDashboard(){
  const d = await window.electron.ipcRenderer.invoke('audit:getDashboard');
  console.log('AUDIT DASHBOARD', d);
  alert(`Total:${d.total} | Imports:${d.imports} | Deletes:${d.deletes} | Duplicates:${d.duplicates}`);
}

async function exportAudit(){
  const res = await window.electron.ipcRenderer.invoke('audit:export');
  alert('Exported to: ' + res.path);
}

async function filterAudit(type){
  const logs = await window.electron.ipcRenderer.invoke('audit:getLogs',{type});
  console.log('FILTERED LOGS', logs);
}

// ===== V21.0.0 ADVANCED REPORTING =====
async function auditTimeline(){
  const data = await window.electron.ipcRenderer.invoke('audit:timeline');
  console.log("TIMELINE", data);
  alert("Events: " + data.length);
}

async function verifyAudit(){
  const res = await window.electron.ipcRenderer.invoke('audit:verify');
  alert(res.ok ? "Ledger OK" : "BROKEN at " + res.brokenAt);
}

// ===== V21.0.0 ANALYTICS UI =====
async function loadAnalytics(){
  const data = await window.electron.ipcRenderer.invoke('audit:analytics');
  console.log("ANALYTICS", data);
  alert("Total:"+data.stats.total+" Imports:"+data.stats.imports+" Resets:"+data.stats.resets);
}

async function getRole(user){
  return await window.electron.ipcRenderer.invoke('auth:getRole', user);
}

// ===== V21.0.0 LETTER UI =====
async function createLetterFromAudit(issues){
  const res = await window.electron.ipcRenderer.invoke('audit:triggerLetter', issues);
  alert("Letter created: " + res.path);
}

async function generateManualLetter(title, issues){
  const res = await window.electron.ipcRenderer.invoke('letter:generate',{title,issues});
  alert("Saved: " + res.path);
}
