// ─── State ────────────────────────────────────────────────────────────────────
let currentUser = null;
let isPreview = false;
let activeTab = ‘Processes’;
let activeSubViews = {Processes:‘List’, ITSM:‘Incidents’, Projects:‘Board’};
let activePrj = ‘PRJ1’;
let activeSpr = ‘SPR1’;
let procSel = null, polSel = null, oblSel = null, riskSel = null, personSel = null, pageView = null;
let mapSelId = null, mapPanelOpen = false, mapElEdit = null;
let mapPan = {x:0,y:0}, mapZoom = 1, mapPanning = false, mapPanStart = {x:0,y:0};
let linkingMode = false, linkFrom = null;
let showNotifsOpen = false;

const ADMIN_TABS = [‘Processes’,‘Policies’,‘Obligations’,‘Risks’,‘ITSM’,‘Projects’,‘Learning’,‘Reports’,‘Audit’,‘Dashboard’,‘Admin’];
const USER_TABS  = [‘Processes’,‘Policies’,‘Obligations’,‘Risks’,‘ITSM’,‘Projects’,‘Learning’,‘Dashboard’];
const PROC_VIEWS = [‘List’,‘Map’,‘Swimlane’,‘RACI’,‘Workflows’,‘KPIs’];
const ITSM_VIEWS = [‘Incidents’,‘Changes’,‘CMDB’];
const PROJ_VIEWS = [‘Board’,‘Backlog’,‘Wiki’];
const PRIORITIES = [‘Critical’,‘High’,‘Medium’,‘Low’];
const INC_STATES = [‘New’,‘In Progress’,‘On Hold’,‘Resolved’,‘Closed’];
const CHG_STATES = [‘Draft’,‘Assess’,‘Authorize’,‘Scheduled’,‘Implement’,‘Review’,‘Closed’];
const ISS_STATES = [‘Backlog’,‘To Do’,‘In Progress’,‘In Review’,‘Done’];
const MATURITY   = [‘Initial’,‘Defined’,‘Managed’,‘Optimised’,‘Transformative’];
const RACI_T     = [‘Responsible’,‘Accountable’,‘Consulted’,‘Informed’];
const PROC_LEVELS= [‘Level 1 — Enterprise’,‘Level 2 — Function’,‘Level 3 — Process’,‘Level 4 — Procedure’];
const APR_STATES = [‘Draft’,‘In Review’,‘Approved’,‘Rejected’,‘Archived’];
const OBL_TYPES  = [‘Regulation’,‘Standard’,‘Policy’,‘Contract’,‘Licence’];
const RISK_L     = [‘Rare’,‘Unlikely’,‘Possible’,‘Likely’,‘Almost Certain’];
const RISK_I     = [‘Insignificant’,‘Minor’,‘Moderate’,‘Major’,‘Catastrophic’];
const RISK_S     = [‘Open’,‘In Treatment’,‘Accepted’,‘Closed’];
const LANES      = [‘Operations’,‘Compliance’,‘Risk’,‘Technology’,‘HR’];
const EL_TYPES   = [‘process’,‘role’,‘risk’,‘policy’,‘control’];
const EL_COLORS  = {process:’#6366f1’,role:’#10b981’,risk:’#f59e0b’,policy:’#3b82f6’,control:’#ec4899’};
const NODE_W=148, NODE_H=50;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,5);
const today = () => new Date().toISOString().slice(0,10);
const esc = s => String(s||’’).replace(/&/g,’&’).replace(/</g,’<’).replace(/>/g,’>’).replace(/”/g,’"’);
const PC = p => ({Critical:’#ef4444’,High:’#f59e0b’,Medium:’#6366f1’,Low:’#10b981’}[p]||’#94a3b8’);
const SC = s => ({New:’#6366f1’,‘In Progress’:’#f59e0b’,‘On Hold’:’#94a3b8’,Resolved:’#10b981’,Closed:’#64748b’,
Draft:’#94a3b8’,Assess:’#6366f1’,Authorize:’#f59e0b’,Scheduled:’#3b82f6’,Implement:’#ec4899’,Review:’#10b981’,
Backlog:’#94a3b8’,‘To Do’:’#6366f1’,‘In Review’:’#f59e0b’,Done:’#10b981’,Approved:’#10b981’,
Rejected:’#ef4444’,Archived:’#94a3b8’,Open:’#f59e0b’,‘In Treatment’:’#6366f1’,Accepted:’#94a3b8’}[s]||’#94a3b8’);
const MC = m => ({Initial:’#ef4444’,Defined:’#f59e0b’,Managed:’#3b82f6’,Optimised:’#10b981’,Transformative:’#8b5cf6’}[m]||’#94a3b8’);
const rScore = (l,i) => (RISK_L.indexOf(l)+1)*(RISK_I.indexOf(i)+1);
const rLevel = s => s>=16?‘Critical’:s>=9?‘High’:s>=4?‘Medium’:‘Low’;
const pOwner = id => { const p = D.people.find(x=>x.id===id); return p?p.name:’—’; };
const badge = (v,c) => `<span class="badge" style="background:${c||'#94a3b8'}22;color:${c||'#94a3b8'}">${esc(v)}</span>`;

// ─── Storage ──────────────────────────────────────────────────────────────────
const save = () => { try { localStorage.setItem(‘nexus_v1’, JSON.stringify(D)); showSaveMsg(); } catch(e){} };
const load = () => { try { const v = localStorage.getItem(‘nexus_v1’); if(v) D = JSON.parse(v); } catch(e){} };
const showSaveMsg = () => { const el=document.getElementById(‘save-msg’); if(!el) return; el.style.display=‘inline’; setTimeout(()=>el.style.display=‘none’,2000); };
const upd = (key, fn) => { D[key] = fn(D[key]); save(); render(); };
const addAudit = (action,type,title,detail) => { D.auditLog.unshift({id:`AU${uid()}`,timestamp:new Date().toLocaleString(),user:currentUser?.name||‘System’,action,entityType:type,entityTitle:title,detail}); D.auditLog=D.auditLog.slice(0,300); save(); };

// Seed data loaded from nexus-data.js
let D = SEED;
people:[
{id:‘P1’,name:‘Sarah Chen’,title:‘CEO’,dept:‘Executive’,reportsTo:null,email:‘s.chen@nexus.com’,location:‘Sydney’,avatar:‘SC’,bio:‘20 years financial services.’,skills:[‘Strategy’,‘Leadership’],enrolledCourses:[],completedCourses:[‘C1’]},
{id:‘P2’,name:‘Tom Nguyen’,title:‘CTO’,dept:‘Technology’,reportsTo:‘P1’,email:‘t.nguyen@nexus.com’,location:‘Sydney’,avatar:‘TN’,bio:‘Full-stack engineer.’,skills:[‘AWS’,‘DevOps’],enrolledCourses:[‘C2’],completedCourses:[]},
{id:‘P3’,name:‘James Smith’,title:‘VP Operations’,dept:‘Operations’,reportsTo:‘P1’,email:‘j.smith@nexus.com’,location:‘Melbourne’,avatar:‘JS’,bio:‘Process improvement specialist.’,skills:[‘BPM’,‘Lean’],enrolledCourses:[‘C1’],completedCourses:[]},
{id:‘P4’,name:‘Anika Lee’,title:‘Chief Compliance Officer’,dept:‘Risk & Compliance’,reportsTo:‘P1’,email:‘a.lee@nexus.com’,location:‘Sydney’,avatar:‘AL’,bio:‘AUSTRAC & APRA specialist.’,skills:[‘GRC’,‘AUSTRAC’],enrolledCourses:[],completedCourses:[‘C3’]},
{id:‘P5’,name:‘Marcus Obi’,title:‘Risk Manager’,dept:‘Risk & Compliance’,reportsTo:‘P4’,email:‘m.obi@nexus.com’,location:‘Brisbane’,avatar:‘MO’,bio:‘Operational risk expert.’,skills:[‘Risk’,‘CPS 230’],enrolledCourses:[‘C3’],completedCourses:[]},
],
elements:[
{id:‘E1’,type:‘process’,label:‘Customer Onboarding’,x:80,y:100,lane:‘Operations’,links:[‘E2’,‘E3’]},
{id:‘E2’,type:‘role’,label:‘Compliance Officer’,x:320,y:60,lane:‘Compliance’,links:[]},
{id:‘E3’,type:‘risk’,label:‘Identity Fraud Risk’,x:320,y:190,lane:‘Risk’,links:[‘E4’]},
{id:‘E4’,type:‘policy’,label:‘KYC Policy’,x:560,y:120,lane:‘Compliance’,links:[]},
{id:‘E5’,type:‘control’,label:‘AML Screening’,x:560,y:260,lane:‘Operations’,links:[]},
],
processes:[
{id:‘PR1’,title:‘Customer Onboarding’,level:‘Level 3 — Process’,owner:‘P3’,version:‘2.1’,status:‘Approved’,maturity:‘Managed’,description:‘End-to-end customer onboarding including identity verification and account setup.’,reviewFrequency:‘Quarterly’,nextReview:‘2026-04-15’,kpis:[{name:‘Avg Onboarding Time’,target:10,unit:‘min’,history:[{date:‘Oct’,value:12},{date:‘Nov’,value:11},{date:‘Dec’,value:10},{date:‘Jan’,value:9.8},{date:‘Feb’,value:8.9},{date:‘Mar’,value:8.5}]},{name:‘Completion Rate’,target:95,unit:’%’,history:[{date:‘Oct’,value:91},{date:‘Nov’,value:93},{date:‘Dec’,value:95},{date:‘Jan’,value:96},{date:‘Feb’,value:97},{date:‘Mar’,value:97.2}]}],procedures:[‘Verify identity’,‘Run credit check’,‘Create CRM account’,‘Send welcome email’],relatedPolicies:[‘POL1’,‘POL2’],tags:[‘customer’],changeLog:[{version:‘2.1’,date:‘2026-01-15’,author:‘James Smith’,note:‘Updated ID verification step’}]},
{id:‘PR2’,title:‘KYC Verification’,level:‘Level 3 — Process’,owner:‘P4’,version:‘1.3’,status:‘Approved’,maturity:‘Optimised’,description:‘Know Your Customer identity verification per AUSTRAC requirements.’,reviewFrequency:‘Quarterly’,nextReview:‘2026-05-01’,kpis:[{name:‘False Positive Rate’,target:2,unit:’%’,history:[{date:‘Oct’,value:3.2},{date:‘Nov’,value:2.8},{date:‘Dec’,value:2.1},{date:‘Jan’,value:1.8},{date:‘Feb’,value:1.4},{date:‘Mar’,value:1.1}]}],procedures:[‘Capture ID’,‘AUSTRAC check’,‘Store results’,‘Flag anomalies’],relatedPolicies:[‘POL1’],tags:[‘kyc’],changeLog:[{version:‘1.3’,date:‘2026-02-01’,author:‘Anika Lee’,note:‘Updated for new AUSTRAC guidance’}]},
{id:‘PR3’,title:‘Incident Response’,level:‘Level 2 — Function’,owner:‘P2’,version:‘3.0’,status:‘In Review’,maturity:‘Defined’,description:‘Detecting, triaging and resolving technology incidents.’,reviewFrequency:‘Bi-annually’,nextReview:‘2026-04-01’,kpis:[{name:‘MTTR’,target:4,unit:‘hrs’,history:[{date:‘Oct’,value:7.2},{date:‘Nov’,value:6.1},{date:‘Dec’,value:5.8},{date:‘Jan’,value:5.5},{date:‘Feb’,value:5.3},{date:‘Mar’,value:5.2}]}],procedures:[‘Detect & alert’,‘Triage’,‘Assign’,‘Communicate’,‘Post-incident review’],relatedPolicies:[‘POL3’],tags:[‘itsm’],changeLog:[{version:‘3.0’,date:‘2025-10-01’,author:‘Tom Nguyen’,note:‘Aligned with ITIL v4’}]},
{id:‘PR4’,title:‘Employee Onboarding’,level:‘Level 2 — Function’,owner:‘P3’,version:‘1.0’,status:‘Draft’,maturity:‘Initial’,description:‘HR onboarding process for new employees.’,reviewFrequency:‘Annually’,nextReview:‘2026-06-01’,kpis:[],procedures:[‘Send offer letter’,‘Setup IT accounts’,‘Conduct orientation’],relatedPolicies:[],tags:[‘hr’],changeLog:[]},
],
raci:[
{id:‘R1’,processId:‘PR1’,roleId:‘P3’,type:‘Accountable’,notes:‘VP Operations owns’},
{id:‘R2’,processId:‘PR1’,roleId:‘P4’,type:‘Responsible’,notes:‘Executes KYC checks’},
{id:‘R3’,processId:‘PR1’,roleId:‘P1’,type:‘Informed’,notes:‘CEO informed monthly’},
{id:‘R4’,processId:‘PR2’,roleId:‘P4’,type:‘Accountable’,notes:‘Compliance Director owns’},
{id:‘R5’,processId:‘PR2’,roleId:‘P5’,type:‘Responsible’,notes:‘Risk Manager runs AUSTRAC’},
{id:‘R6’,processId:‘PR3’,roleId:‘P2’,type:‘Accountable’,notes:‘CTO owns’},
],
policies:[
{id:‘POL1’,title:‘KYC Policy’,category:‘Compliance’,owner:‘P4’,version:‘3.2’,status:‘Approved’,description:‘Requirements for verifying customer identity per AUSTRAC.’,reviewDate:‘2026-07-01’,approvedBy:‘P1’,obligationIds:[‘OBL1’,‘OBL2’],relatedProcessIds:[‘PR1’,‘PR2’],content:’## Purpose\nEstablish KYC requirements.\n\n## Requirements\n1. Government-issued photo ID required\n2. Verified against AUSTRAC database\n3. Records retained 7 years\n4. Suspicious activity reported within 24 hrs’,changeLog:[{version:‘3.2’,date:‘2026-01-20’,author:‘Anika Lee’,note:‘Updated retention to 7 years’}]},
{id:‘POL2’,title:‘Data Privacy Policy’,category:‘Privacy’,owner:‘P4’,version:‘2.0’,status:‘Approved’,description:‘Governs personal data per Privacy Act 1988.’,reviewDate:‘2026-06-01’,approvedBy:‘P1’,obligationIds:[‘OBL3’],relatedProcessIds:[‘PR1’],content:’## Purpose\nEnsure Privacy Act 1988 compliance.\n\n## Requirements\n- Collect only necessary data\n- Obtain explicit consent\n- Encrypt data at rest\n- Notify breaches within 30 days’,changeLog:[{version:‘2.0’,date:‘2025-12-01’,author:‘Sarah Chen’,note:‘Full rewrite’}]},
{id:‘POL3’,title:‘Incident Management Policy’,category:‘ITSM’,owner:‘P2’,version:‘1.1’,status:‘In Review’,description:‘Framework for managing technology incidents.’,reviewDate:‘2026-04-01’,approvedBy:null,obligationIds:[],relatedProcessIds:[‘PR3’],content:’## Severity Levels\n- P1: Full outage — 15 min response\n- P2: Degradation — 1 hr\n- P3: Minor — 4 hr’,changeLog:[{version:‘1.1’,date:‘2025-10-01’,author:‘Tom Nguyen’,note:‘Added P3 tier’}]},
],
obligations:[
{id:‘OBL1’,title:‘AUSTRAC AML/CTF Act 2006’,type:‘Regulation’,regulator:‘AUSTRAC’,jurisdiction:‘Australia’,description:‘AML/CTF obligations for reporting entities.’,complianceStatus:‘Compliant’,owner:‘P4’,reviewDate:‘2026-06-01’,linkedPolicyIds:[‘POL1’],linkedProcessIds:[‘PR1’,‘PR2’],controls:[‘ID Verification’,‘Transaction Monitoring’,‘Suspicious Matter Reporting’],notes:‘Annual attestation due June.’},
{id:‘OBL2’,title:‘AUSTRAC CDD Requirements’,type:‘Regulation’,regulator:‘AUSTRAC’,jurisdiction:‘Australia’,description:‘Customer Due Diligence requirements.’,complianceStatus:‘Compliant’,owner:‘P4’,reviewDate:‘2026-06-01’,linkedPolicyIds:[‘POL1’],linkedProcessIds:[‘PR2’],controls:[‘KYC Verification’],notes:‘Enhanced due diligence for high-risk customers.’},
{id:‘OBL3’,title:‘Privacy Act 1988 — APPs’,type:‘Regulation’,regulator:‘OAIC’,jurisdiction:‘Australia’,description:‘13 Australian Privacy Principles.’,complianceStatus:‘Compliant’,owner:‘P4’,reviewDate:‘2026-03-01’,linkedPolicyIds:[‘POL2’],linkedProcessIds:[‘PR1’],controls:[‘Data Encryption’,‘Breach Notification’],notes:’’},
{id:‘OBL4’,title:‘CPS 230 Operational Risk’,type:‘Standard’,regulator:‘APRA’,jurisdiction:‘Australia’,description:‘APRA operational risk management standard.’,complianceStatus:‘In Progress’,owner:‘P4’,reviewDate:‘2026-07-01’,linkedPolicyIds:[],linkedProcessIds:[‘PR3’],controls:[‘BCP’,‘Critical Ops Register’],notes:‘Remediation in progress.’},
],
risks:[
{id:‘RSK001’,title:‘Identity Fraud Risk’,category:‘Compliance’,likelihood:‘Possible’,impact:‘Major’,status:‘Open’,owner:‘P5’,description:‘Fraudulent identity documents used during onboarding.’,linkedProcessIds:[‘PR1’,‘PR2’],treatments:[‘Enhanced ID verification’,‘ML fraud detection’],residualLikelihood:‘Unlikely’,residualImpact:‘Moderate’,reviewDate:‘2026-06-01’,notes:’’},
{id:‘RSK002’,title:‘System Outage — Core Banking’,category:‘Technology’,likelihood:‘Unlikely’,impact:‘Catastrophic’,status:‘In Treatment’,owner:‘P2’,description:‘Unplanned outage of core banking platform.’,linkedProcessIds:[‘PR3’],treatments:[‘Hot standby DR’,‘Runbook automation’],residualLikelihood:‘Rare’,residualImpact:‘Major’,reviewDate:‘2026-03-01’,notes:’’},
{id:‘RSK003’,title:‘Data Breach — PII Exposure’,category:‘Privacy’,likelihood:‘Unlikely’,impact:‘Major’,status:‘Open’,owner:‘P4’,description:‘Unauthorised access to customer PII.’,linkedProcessIds:[‘PR1’],treatments:[‘Encryption at rest’,‘Access controls review’],residualLikelihood:‘Rare’,residualImpact:‘Moderate’,reviewDate:‘2026-05-01’,notes:’’},
{id:‘RSK004’,title:‘AUSTRAC Non-Compliance’,category:‘Compliance’,likelihood:‘Rare’,impact:‘Catastrophic’,status:‘Open’,owner:‘P4’,description:‘Failure to meet AUSTRAC reporting obligations.’,linkedProcessIds:[‘PR2’],treatments:[‘Compliance monitoring’,‘Regular audits’],residualLikelihood:‘Rare’,residualImpact:‘Major’,reviewDate:‘2026-06-01’,notes:’’},
],
incidents:[
{id:‘INC-001’,title:‘Login service degradation’,priority:‘High’,state:‘Resolved’,assignee:‘Tom Nguyen’,description:‘Auth service latency spike.’,createdAt:‘2026-03-20’,notes:’’},
{id:‘INC-002’,title:‘Batch job failure — nightly reconciliation’,priority:‘Critical’,state:‘In Progress’,assignee:‘Tom Nguyen’,description:‘Nightly reconciliation batch failed.’,createdAt:‘2026-03-26’,notes:’’},
{id:‘INC-003’,title:‘Certificate expiry warning’,priority:‘Medium’,state:‘New’,assignee:’’,description:‘SSL cert expires in 14 days.’,createdAt:‘2026-03-27’,notes:’’},
],
changes:[
{id:‘CHG-001’,title:‘Deploy authentication service v2.4’,priority:‘High’,state:‘Authorize’,assignee:‘Tom Nguyen’,type:‘Normal’,description:‘Upgrade auth service.’,createdAt:‘2026-03-15’,scheduledAt:‘2026-04-05’},
{id:‘CHG-002’,title:‘Database index optimisation’,priority:‘Medium’,state:‘Scheduled’,assignee:‘Tom Nguyen’,type:‘Standard’,description:‘Add composite indexes.’,createdAt:‘2026-03-20’,scheduledAt:‘2026-03-30’},
{id:‘CHG-003’,title:‘Firewall rule update — PCI zone’,priority:‘Critical’,state:‘Draft’,assignee:’’,type:‘Emergency’,description:‘Block detected scanning activity.’,createdAt:‘2026-03-27’,scheduledAt:’’},
],
assets:[
{id:‘CI-001’,name:‘Core Banking Platform’,type:‘Application’,status:‘Operational’,owner:‘Technology’,version:‘14.2.1’,criticality:‘Critical’,description:‘Primary banking system.’},
{id:‘CI-002’,name:‘Auth Service’,type:‘Application’,status:‘Operational’,owner:‘Technology’,version:‘2.3.7’,criticality:‘Critical’,description:‘OAuth2 / JWT authentication.’},
{id:‘CI-003’,name:‘CRM System’,type:‘Application’,status:‘Operational’,owner:‘Operations’,version:‘5.1’,criticality:‘High’,description:‘Customer relationship management.’},
{id:‘CI-004’,name:‘Prod DB Cluster’,type:‘Infrastructure’,status:‘Operational’,owner:‘Technology’,version:‘PG 15’,criticality:‘Critical’,description:‘PostgreSQL HA cluster.’},
{id:‘CI-005’,name:‘Batch Processor’,type:‘Application’,status:‘Maintenance’,owner:‘Technology’,version:‘3.0.2’,criticality:‘High’,description:‘Nightly reconciliation batch.’},
],
projects:[
{id:‘PRJ1’,title:‘Customer Portal Rebuild’,status:‘Active’,owner:‘P2’,description:‘React + GraphQL portal rebuild.’,startDate:‘2026-01-10’,targetDate:‘2026-06-30’},
{id:‘PRJ2’,title:‘GRC Platform Uplift’,status:‘Planning’,owner:‘P4’,description:‘New GRC tooling for CPS 230.’,startDate:‘2026-04-01’,targetDate:‘2026-12-31’},
],
sprints:[
{id:‘SPR1’,projectId:‘PRJ1’,title:‘Sprint 7 — Authentication’,startDate:‘2026-03-24’,endDate:‘2026-04-06’},
{id:‘SPR2’,projectId:‘PRJ1’,title:‘Sprint 8 — Dashboard’,startDate:‘2026-04-07’,endDate:‘2026-04-20’},
],
issues:[
{id:‘ISS-001’,projectId:‘PRJ1’,sprintId:‘SPR1’,title:‘Implement PKCE flow’,state:‘In Progress’,priority:‘High’,assignee:‘P2’,storyPoints:5,description:‘Add PKCE to OAuth2.’,createdAt:‘2026-03-24’},
{id:‘ISS-002’,projectId:‘PRJ1’,sprintId:‘SPR1’,title:‘MFA enrollment UI’,state:‘To Do’,priority:‘High’,assignee:‘P2’,storyPoints:8,description:‘Build TOTP screens.’,createdAt:‘2026-03-24’},
{id:‘ISS-003’,projectId:‘PRJ1’,sprintId:‘SPR1’,title:‘Session timeout handling’,state:‘Done’,priority:‘Medium’,assignee:‘P3’,storyPoints:3,description:‘Auto-logout 30 min.’,createdAt:‘2026-03-20’},
{id:‘ISS-004’,projectId:‘PRJ1’,sprintId:null,title:‘Accessibility audit’,state:‘Backlog’,priority:‘Low’,assignee:’’,storyPoints:5,description:‘WCAG 2.1 AA audit.’,createdAt:‘2026-03-01’},
{id:‘ISS-005’,projectId:‘PRJ1’,sprintId:‘SPR1’,title:‘SSO integration Azure AD’,state:‘In Review’,priority:‘Critical’,assignee:‘P2’,storyPoints:13,description:‘Federated login via Azure AD.’,createdAt:‘2026-03-22’},
],
pages:[
{id:‘PG1’,projectId:‘PRJ1’,title:‘Architecture Overview’,content:’## Architecture\n\nReact SPA with GraphQL API gateway.\n\n### Auth Flow\n1. Client requests token\n2. Auth Service validates\n3. JWT issued with 1hr expiry’,createdAt:‘2026-03-01’,updatedAt:‘2026-03-25’,author:‘Tom Nguyen’},
],
workflows:[
{id:‘WF1’,name:‘Process Approval’,steps:[{id:‘S1’,name:‘Draft’},{id:‘S2’,name:‘Review’},{id:‘S3’,name:‘Approve’},{id:‘S4’,name:‘Published’}]},
{id:‘WF2’,name:‘Policy Review Cycle’,steps:[{id:‘S1’,name:‘Initiate’},{id:‘S2’,name:‘Review’},{id:‘S3’,name:‘Approve’},{id:‘S4’,name:‘Publish’}]},
],
courses:[
{id:‘C1’,title:‘BPM Fundamentals’,category:‘Process Management’,instructor:‘James Smith’,duration:240,level:‘Beginner’,description:‘Learn BPMN 2.0, process mapping, and continuous improvement.’,thumbnail:‘🗺️’,rating:4.7,enrolled:42},
{id:‘C2’,title:‘Cloud Architecture & DevOps’,category:‘Technology’,instructor:‘Tom Nguyen’,duration:360,level:‘Intermediate’,description:‘AWS, CI/CD, Docker, Kubernetes.’,thumbnail:‘☁️’,rating:4.9,enrolled:28},
{id:‘C3’,title:‘Risk & Compliance Essentials’,category:‘Risk & Compliance’,instructor:‘Marcus Obi’,duration:180,level:‘Beginner’,description:‘GRC frameworks, CPS 230, AUSTRAC.’,thumbnail:‘🛡️’,rating:4.6,enrolled:35},
],
auditLog:[
{id:‘AU1’,timestamp:‘2026-03-27 09:14’,user:‘Sarah Chen’,action:‘Approved’,entityType:‘Process’,entityTitle:‘Customer Onboarding’,detail:‘Version 2.1 approved’},
{id:‘AU2’,timestamp:‘2026-03-27 08:52’,user:‘Tom Nguyen’,action:‘Submitted’,entityType:‘Process’,entityTitle:‘Incident Response’,detail:‘Workflow started’},
{id:‘AU3’,timestamp:‘2026-03-26 16:30’,user:‘Anika Lee’,action:‘Updated’,entityType:‘Policy’,entityTitle:‘KYC Policy’,detail:‘Version 3.2’},
],
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
function doLogin() {
const u = document.getElementById(‘login-user’).value.trim();
const p = document.getElementById(‘login-pass’).value;
const user = D.users.find(x => x.username === u && x.password === p);
if (!user) {
const e = document.getElementById(‘login-err’);
e.textContent = ‘Invalid credentials.’;
e.style.display = ‘block’;
return;
}
currentUser = user;
document.getElementById(‘login-screen’).style.display = ‘none’;
document.getElementById(‘app’).classList.remove(‘hidden’);
renderHeader();
setTab(‘Processes’);
}

function logout() {
currentUser = null;
isPreview = false;
document.getElementById(‘login-screen’).style.display = ‘flex’;
document.getElementById(‘app’).classList.add(‘hidden’);
}

function exitPreview() {
isPreview = false;
document.getElementById(‘preview-banner’).classList.add(‘hidden’);
setTab(‘Processes’);
}

const getRole = () => isPreview ? ‘user’ : (currentUser?.role || ‘user’);
const canEdit = () => getRole() === ‘admin’;

// ─── Demo accounts ────────────────────────────────────────────────────────────
function renderDemoAccounts() {
const demos = [
{l:‘Admin’, u:‘sarah.chen’, p:‘admin123’, c:’#6366f1’},
{l:‘Admin’, u:‘admin’,      p:‘admin’,    c:’#6366f1’},
{l:‘User’,  u:‘tom.nguyen’, p:‘user123’,  c:’#10b981’},
];
const container = document.getElementById(‘demo-accounts’);
if (!container) return;
container.innerHTML = ‘’;
demos.forEach(d => {
const div = document.createElement(‘div’);
div.style.cssText = ‘display:flex;align-items:center;justify-content:space-between;padding:4px 7px;border-radius:6px;cursor:pointer;margin-bottom:2px;background:white;border:1px solid #f1f5f9;’;
const lbl = document.createElement(‘span’);
lbl.style.cssText = ‘font-size:11px;color:#334155;’;
lbl.textContent = d.u + ’ / ’ + d.p;
const bdg = document.createElement(‘span’);
bdg.className = ‘badge’;
bdg.style.cssText = ‘background:’ + d.c + ‘22;color:’ + d.c;
bdg.textContent = d.l;
div.appendChild(lbl);
div.appendChild(bdg);
div.addEventListener(‘mouseover’, () => div.style.background = ‘#f1f5f9’);
div.addEventListener(‘mouseout’,  () => div.style.background = ‘white’);
div.addEventListener(‘click’, () => {
document.getElementById(‘login-user’).value = d.u;
document.getElementById(‘login-pass’).value = d.p;
});
container.appendChild(div);
});
}

// ─── Header ───────────────────────────────────────────────────────────────────
function renderHeader() {
const role = getRole();
const tabs = role === ‘admin’ ? ADMIN_TABS : USER_TABS;

const rb = document.getElementById(‘role-badge’);
rb.textContent = role === ‘admin’ ? ‘ADMIN’ : ‘USER’;
rb.style.cssText = ‘background:’ + (role===‘admin’?’#6366f1’:’#10b981’) + ‘22;color:’ + (role===‘admin’?’#6366f1’:’#10b981’);

const tb = document.getElementById(‘tab-bar’);
tb.innerHTML = ‘’;
tabs.forEach(t => {
const b = document.createElement(‘button’);
b.className = ‘tab-btn’ + (activeTab === t ? ’ active’ : ‘’);
b.textContent = t;
b.addEventListener(‘click’, () => setTab(t));
tb.appendChild(b);
});

const me = D.people.find(p => p.id === currentUser?.personId) || D.people[0];
document.getElementById(‘user-avatar’).textContent = me?.avatar || me?.name?.[0] || ‘U’;

renderNotifs();
}

function setTab(t) {
activeTab = t;
renderHeader();
render();
}

// ─── Notifications ────────────────────────────────────────────────────────────
function getNotifs() {
const n = [];
D.processes.filter(p => p.nextReview && p.nextReview <= today()).forEach(p => n.push({icon:‘📋’, title:‘Process review overdue’, body:p.title, go:() => { procSel = D.processes.find(x=>x.id===p.id); activeSubViews.Processes=‘List’; setTab(‘Processes’); }}));
D.policies.filter(p => p.reviewDate && p.reviewDate <= today()).forEach(p => n.push({icon:‘📜’, title:‘Policy review overdue’, body:p.title, go:() => { polSel = D.policies.find(x=>x.id===p.id); setTab(‘Policies’); }}));
D.obligations.filter(o => o.complianceStatus !== ‘Compliant’).forEach(o => n.push({icon:‘⚖️’, title:‘Obligation not compliant’, body:o.title, go:() => { oblSel = D.obligations.find(x=>x.id===o.id); setTab(‘Obligations’); }}));
D.incidents.filter(i => i.priority===‘Critical’ && ![‘Resolved’,‘Closed’].includes(i.state)).forEach(i => n.push({icon:‘🚨’, title:‘Critical incident open’, body:i.title, go:() => { setTab(‘ITSM’); }}));
return n;
}

function renderNotifs() {
const n = getNotifs();
const cnt = document.getElementById(‘notif-count’);
if (n.length > 0) { cnt.textContent = n.length; cnt.classList.remove(‘hidden’); }
else { cnt.classList.add(‘hidden’); }

const dd = document.getElementById(‘notif-dropdown’);
dd.innerHTML = ‘’;
if (n.length === 0) {
dd.innerHTML = ‘<div style="padding:16px;text-align:center;font-size:11px;color:#94a3b8;">All clear ✓</div>’;
} else {
n.forEach(x => {
const div = document.createElement(‘div’);
div.className = ‘notif-item’;
div.innerHTML = ‘<span style="font-size:14px;">’ + x.icon + ‘</span><div><div style="font-size:11px;font-weight:600;color:#334155;">’ + esc(x.title) + ‘</div><div style="font-size:10px;color:#64748b;">’ + esc(x.body) + ‘</div></div>’;
div.addEventListener(‘click’, () => { x.go(); showNotifsOpen = false; dd.classList.add(‘hidden’); });
dd.appendChild(div);
});
}
}

// ─── Search ───────────────────────────────────────────────────────────────────
function toggleSearch() {
const ov = document.getElementById(‘search-overlay’);
ov.classList.toggle(‘hidden’);
document.getElementById(‘search-input’).value = ‘’;
renderSearch();
if (!ov.classList.contains(‘hidden’)) setTimeout(() => document.getElementById(‘search-input’).focus(), 50);
}
function closeSearch() { document.getElementById(‘search-overlay’).classList.add(‘hidden’); }

function renderSearch() {
const q = document.getElementById(‘search-input’).value.toLowerCase().trim();
const el = document.getElementById(‘search-results’);
if (!q) {
el.innerHTML = ‘<div style="padding:16px;display:flex;gap:7px;flex-wrap:wrap;"></div>’;
const wrap = el.firstChild;
[‘processes’,‘policies’,‘risks’,‘incidents’].forEach(s => {
const b = document.createElement(‘button’);
b.className = ‘btn btn-outline btn-sm’;
b.textContent = s;
b.addEventListener(‘click’, () => { document.getElementById(‘search-input’).value = s; renderSearch(); });
wrap.appendChild(b);
});
return;
}
const res = [];
D.processes.forEach(x => { if (x.title.toLowerCase().includes(q)) res.push({icon:‘📋’, type:‘Process’, title:x.title, go:() => { procSel=D.processes.find(p=>p.id===x.id); setTab(‘Processes’); closeSearch(); }}); });
D.policies.forEach(x => { if (x.title.toLowerCase().includes(q)) res.push({icon:‘📜’, type:‘Policy’, title:x.title, go:() => { polSel=D.policies.find(p=>p.id===x.id); setTab(‘Policies’); closeSearch(); }}); });
D.obligations.forEach(x => { if (x.title.toLowerCase().includes(q)) res.push({icon:‘⚖️’, type:‘Obligation’, title:x.title, go:() => { oblSel=D.obligations.find(o=>o.id===x.id); setTab(‘Obligations’); closeSearch(); }}); });
D.risks.forEach(x => { if (x.title.toLowerCase().includes(q)) res.push({icon:‘⚠️’, type:‘Risk’, title:x.title, go:() => { riskSel=D.risks.find(r=>r.id===x.id); setTab(‘Risks’); closeSearch(); }}); });
D.incidents.forEach(x => { if (x.title.toLowerCase().includes(q)) res.push({icon:‘🚨’, type:‘Incident’, title:x.title, go:() => { setTab(‘ITSM’); closeSearch(); }}); });

el.innerHTML = ‘’;
if (!res.length) {
el.innerHTML = ‘<div style="padding:22px;text-align:center;color:#94a3b8;font-size:12px;">No results for “’ + esc(q) + ‘”</div>’;
return;
}
res.slice(0,10).forEach(r => {
const div = document.createElement(‘div’);
div.className = ‘search-result-row’;
div.style.cssText = ‘display:flex;align-items:center;gap:10px;padding:9px 16px;cursor:pointer;’;
div.innerHTML = ‘<span style="font-size:14px;width:20px;text-align:center;">’ + r.icon + ‘</span><span style="font-size:12px;font-weight:500;color:#334155;flex:1;">’ + esc(r.title) + ‘</span>’ + badge(r.type,’#6366f1’);
div.addEventListener(‘click’, r.go);
el.appendChild(div);
});
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function openModal(title, html, wide) {
document.getElementById(‘modal-title’).textContent = title;
document.getElementById(‘modal-body’).innerHTML = html;
document.getElementById(‘modal-box’).className = ‘modal-box’ + (wide ? ’ wide’ : ‘’);
document.getElementById(‘modal-overlay’).classList.remove(‘hidden’);
}
function closeModal() { document.getElementById(‘modal-overlay’).classList.add(‘hidden’); }

// ─── Utility builders ─────────────────────────────────────────────────────────
function tblHeader(cols) { return ‘<thead><tr>’ + cols.map(c => ‘<th>’ + esc(c) + ‘</th>’).join(’’) + ‘</tr></thead>’; }
function statCards(items) {
return ‘<div style="display:grid;grid-template-columns:repeat(' + items.length + ',1fr);gap:8px;margin-bottom:12px;">’ +
items.map(s => ‘<div class="card stat-card"><div style="width:30px;height:30px;border-radius:7px;background:' + s.c + '22;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><div style="width:11px;height:11px;border-radius:3px;background:' + s.c + ';"></div></div><div><div style="font-size:18px;font-weight:800;">’ + esc(String(s.v)) + ‘</div><div style="font-size:10px;color:#64748b;">’ + esc(s.l) + ‘</div></div></div>’).join(’’) + ‘</div>’;
}
function barHTML(pct, color, h=6) {
return ‘<div style="height:' + h + 'px;background:#f1f5f9;border-radius:' + (h/2) + 'px;overflow:hidden;"><div style="height:100%;background:' + (color||'#6366f1') + ';width:' + Math.min(100,Math.max(0,pct||0)) + '%;border-radius:' + (h/2) + 'px;transition:width .4s;"></div></div>’;
}
function sparklineHTML(kpi) {
if (!kpi.history || !kpi.history.length) return ‘<div style="font-size:11px;color:#94a3b8;">No data</div>’;
const vals = kpi.history.map(d => d.value);
const mn = Math.min(…vals) * .9, mx = Math.max(…vals, kpi.target) * 1.1;
const W = 220, H = 70;
const px = (_,i) => (i / (kpi.history.length-1)) * W;
const py = v => H - (((v-mn) / (mx-mn)) * H);
const pts = kpi.history.map((d,i) => px(d.value,i) + ‘,’ + py(d.value)).join(’ ‘);
const tY = py(kpi.target);
const last = vals[vals.length-1];
const good = kpi.unit === ‘%’ ? last >= kpi.target : last <= kpi.target;
return ‘<div class="sparkline-wrap"><div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;"><span style="font-size:11px;font-weight:600;color:#334155;">’ + esc(kpi.name) + ‘</span><div style="display:flex;align-items:baseline;gap:5px;"><span style="font-size:17px;font-weight:800;color:' + (good?'#10b981':'#ef4444') + ';">’ + last + esc(kpi.unit) + ‘</span><span style="font-size:9px;color:#94a3b8;">target ’ + kpi.target + esc(kpi.unit) + ‘</span></div></div><svg width="' + W + '" height="' + H + '" style="display:block;"><line x1="0" y1="' + tY + '" x2="' + W + '" y2="' + tY + '" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3,3"/><polyline points="' + pts + '" fill="none" stroke="#6366f1" stroke-width="2"/>’ + kpi.history.map((d,i) => ‘<circle cx="' + px(d.value,i) + '" cy="' + py(d.value) + '" r="3" fill="#6366f1"/>’).join(’’) + ‘</svg><div style="display:flex;justify-content:space-between;margin-top:2px;"><span style="font-size:9px;color:#94a3b8;">’ + kpi.history[0].date + ‘</span><span style="font-size:9px;color:#94a3b8;">’ + kpi.history[kpi.history.length-1].date + ‘</span></div></div>’;
}
function selectOpts(arr, val) { return arr.map(a => ‘<option value=”’ + esc(a) + ‘”’ + (a===val?’ selected’:’’) + ‘>’ + esc(a) + ‘</option>’).join(’’); }
function peopleOpts(val, blank) { return ‘<option value="">’ + (blank||’— Select —’) + ‘</option>’ + D.people.map(p => ‘<option value=”’ + p.id + ‘”’ + (p.id===val?’ selected’:’’) + ‘>’ + esc(p.name) + ‘</option>’).join(’’); }
function sidebarLayout(sidebarHtml, detailHtml) {
return ‘<div class="sidebar-layout"><div class="sidebar">’ + sidebarHtml + ‘</div><div class="detail-panel">’ + detailHtml + ‘</div></div>’;
}

// ─── Main Render ──────────────────────────────────────────────────────────────
function render() {
renderNotifs();
const c = document.getElementById(‘content’);
const t = activeTab;
if      (t===‘Processes’)   renderProcesses(c);
else if (t===‘Policies’)    renderPolicies(c);
else if (t===‘Obligations’) renderObligations(c);
else if (t===‘Risks’)       renderRisks(c);
else if (t===‘ITSM’)        renderITSM(c);
else if (t===‘Projects’)    renderProjects(c);
else if (t===‘Learning’)    renderLearning(c);
else if (t===‘Reports’)     renderReports(c);
else if (t===‘Audit’)       renderAudit(c);
else if (t===‘Dashboard’)   renderDashboard(c);
else if (t===‘Admin’)       renderAdmin(c);
else c.innerHTML = ‘<div style="padding:40px;color:#94a3b8;">Coming soon</div>’;
bindDynamicEvents();
}

// After each render, bind subnav buttons
function bindDynamicEvents() {
document.querySelectorAll(’.subnav-btn[data-view]’).forEach(b => {
b.addEventListener(‘click’, () => {
activeSubViews[b.dataset.tab] = b.dataset.view;
render();
});
});
drawMap();
}

// ─── PROCESSES ────────────────────────────────────────────────────────────────
function renderProcesses(c) {
const sv = activeSubViews.Processes || ‘List’;
let subnav = ‘<div class="subnav">’;
PROC_VIEWS.forEach(v => { subnav += ‘<button class="subnav-btn' + (sv===v?' active':'') + '" data-tab="Processes" data-view="' + v + '">’ + v + ‘</button>’; });
subnav += ‘</div>’;
c.innerHTML = subnav + ‘<div id="proc-view" style="flex:1;overflow:hidden;display:flex;"></div>’;
const pv = document.getElementById(‘proc-view’);
if      (sv===‘List’)      renderProcList(pv);
else if (sv===‘Map’)       renderProcMap(pv);
else if (sv===‘Swimlane’)  renderProcSwimlane(pv);
else if (sv===‘RACI’)      renderProcRaci(pv);
else if (sv===‘Workflows’) renderProcWorkflows(pv);
else if (sv===‘KPIs’)      renderProcKPIs(pv);
}

function renderProcList(el) {
const sidebar = ‘<div class="sidebar-header"><div><div style="font-weight:700;font-size:13px;">Process Library</div><div style="font-size:10px;color:#64748b;">’ + D.processes.length + ’ processes</div></div>’ +
(canEdit() ? ‘<button class="btn btn-sm" id="new-proc-btn">+ New</button>’ : ‘’) + ‘</div>’ +
‘<div class="sidebar-list">’ + D.processes.map(p =>
‘<div class="sidebar-item' + (procSel?.id===p.id?' active':'') + '" data-pid="' + p.id + '">’ +
‘<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px;"><span style="font-size:12px;font-weight:600;">’ + esc(p.title) + ‘</span>’ + badge(p.status,SC(p.status)) + ‘</div>’ +
‘<div style="display:flex;gap:5px;">’ + badge(p.maturity,MC(p.maturity)) + ‘<span style="font-size:9px;color:#94a3b8;">v’ + p.version + ‘</span></div></div>’
).join(’’) + ‘</div>’;

let detail = ‘<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:13px;">Select a process</div>’;
if (procSel) {
const p = D.processes.find(x=>x.id===procSel.id) || procSel;
const linkedObls = D.obligations.filter(o => o.linkedProcessIds?.includes(p.id));
const linkedRisks = D.risks.filter(r => r.linkedProcessIds?.includes(p.id));
detail = ‘<div style="max-width:700px;">’ +
‘<div class="card" style="margin-bottom:12px;">’ +
‘<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">’ +
‘<div><h2 style="font-weight:800;font-size:16px;margin:0 0 4px;">’ + esc(p.title) + ‘</h2>’ +
‘<div style="display:flex;gap:5px;flex-wrap:wrap;">’ + badge(p.status,SC(p.status)) + badge(p.maturity,MC(p.maturity)) + badge(p.level,’#94a3b8’) + ‘</div></div>’ +
(canEdit() ? ‘<button class="btn btn-outline btn-sm" data-edit-proc="' + p.id + '">✏️ Edit</button>’ : ‘’) +
‘</div>’ +
‘<div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:8px;">’ +
‘<div><div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Owner</div><div style="font-size:12px;font-weight:600;">’ + esc(pOwner(p.owner)) + ‘</div></div>’ +
‘<div><div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Version</div><div style="font-size:12px;font-weight:600;">v’ + esc(p.version) + ‘</div></div>’ +
‘<div><div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Next Review</div><div style="font-size:12px;font-weight:600;color:' + (p.nextReview&&p.nextReview<=today()?'#ef4444':'#334155') + ';">’ + esc(p.nextReview||’—’) + ‘</div></div>’ +
‘</div>’ +
‘<p style="font-size:13px;color:#64748b;margin:0 0 10px;">’ + esc(p.description) + ‘</p>’ +
(p.procedures?.length ? ‘<div><div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:5px;">Procedures</div><ol style="margin:0;padding-left:18px;">’ + p.procedures.map(s => ‘<li style="font-size:12px;color:#334155;margin-bottom:2px;">’ + esc(s) + ‘</li>’).join(’’) + ‘</ol></div>’ : ‘’) +
‘</div>’ +
‘<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">’ +
‘<div class="card">’ +
‘<div style="font-size:9px;font-weight:700;color:#94a3b8;margin-bottom:4px;text-transform:uppercase;">Policies</div>’ +
(p.relatedPolicies||[]).map(pid => { const pol=D.policies.find(x=>x.id===pid); return pol ? ‘<div class="nav-link" data-goto="policy" data-id="' + pid + '" style="font-size:11px;padding:3px 8px;border-radius:6px;background:#ede9fe;color:#4338ca;margin-bottom:3px;cursor:pointer;">’ + esc(pol.title.slice(0,28)) + ‘</div>’ : ‘’; }).join(’’) +
‘<div style="font-size:9px;font-weight:700;color:#94a3b8;margin:7px 0 3px;text-transform:uppercase;">Obligations</div>’ +
linkedObls.map(o => ‘<div class="nav-link" data-goto="obl" data-id="' + o.id + '" style="font-size:11px;padding:3px 8px;border-radius:6px;background:#fef3c7;color:#92400e;margin-bottom:3px;cursor:pointer;">’ + esc(o.title.slice(0,30)) + ‘</div>’).join(’’) +
‘<div style="font-size:9px;font-weight:700;color:#94a3b8;margin:7px 0 3px;text-transform:uppercase;">Risks</div>’ +
linkedRisks.map(r => { const lv=rLevel(rScore(r.likelihood,r.impact)); return ‘<div class="nav-link" data-goto="risk" data-id="' + r.id + '" style="font-size:11px;padding:3px 8px;border-radius:6px;background:' + PC(lv) + '18;color:' + PC(lv) + ';margin-bottom:3px;cursor:pointer;">’ + esc(r.title.slice(0,26)) + ‘</div>’; }).join(’’) +
‘</div>’ +
‘<div class="card"><div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:6px;">KPIs</div>’ +
(p.kpis?.length ? p.kpis.map(k => sparklineHTML(k)).join(’’) : ‘<p style="font-size:11px;color:#94a3b8;">No KPIs defined.</p>’) +
‘</div>’ +
‘</div>’ +
‘<div class="card" style="margin-bottom:12px;">’ +
‘<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">’ +
‘<div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;">RACI</div>’ +
(canEdit() ? ‘<button class="btn btn-sm" data-raci-proc="' + p.id + '">+ Assign</button>’ : ‘’) +
‘</div>’ +
‘<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">’ +
RACI_T.map(type => {
const tc = {Responsible:’#6366f1’,Accountable:’#10b981’,Consulted:’#f59e0b’,Informed:’#94a3b8’}[type];
const entries = D.raci.filter(r => r.processId===p.id && r.type===type);
return ‘<div style="background:' + tc + '12;border-radius:8px;padding:7px 9px;border:1px solid ' + tc + '28;">’ +
‘<div style="font-size:9px;font-weight:700;color:' + tc + ';margin-bottom:4px;text-transform:uppercase;">’ + type + ‘</div>’ +
(!entries.length ? ‘<p style="font-size:10px;color:#94a3b8;margin:0;">None</p>’ : entries.map(r => ‘<div style="font-size:11px;color:#334155;padding:2px 0;">’ + esc(D.people.find(x=>x.id===r.roleId)?.name||’?’) + ‘</div>’).join(’’)) +
‘</div>’;
}).join(’’) +
‘</div>’ +
‘</div>’ +
(p.changeLog?.length ? ‘<div class="card"><div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:8px;">Change Log</div><table class="tbl">’ + tblHeader([‘Version’,‘Date’,‘Author’,‘Note’]) + ‘<tbody>’ + p.changeLog.map((c,i) => ‘<tr><td>v’ + esc(c.version) + ‘</td><td>’ + esc(c.date) + ‘</td><td>’ + esc(c.author) + ‘</td><td>’ + esc(c.note) + ‘</td></tr>’).join(’’) + ‘</tbody></table></div>’ : ‘’) +
‘</div>’;
}
el.innerHTML = sidebarLayout(sidebar, detail);

// Bind events
el.querySelectorAll(’.sidebar-item[data-pid]’).forEach(item => {
item.addEventListener(‘click’, () => { procSel = D.processes.find(x=>x.id===item.dataset.pid); render(); });
});
const np = el.querySelector(’#new-proc-btn’);
if (np) np.addEventListener(‘click’, () => openProcModal(null));
el.querySelectorAll(’[data-edit-proc]’).forEach(b => b.addEventListener(‘click’, () => openProcModal(b.dataset.editProc)));
el.querySelectorAll(’[data-raci-proc]’).forEach(b => b.addEventListener(‘click’, () => openRaciModal(b.dataset.raciProc)));
el.querySelectorAll(’.nav-link[data-goto]’).forEach(b => {
b.addEventListener(‘click’, () => {
if (b.dataset.goto===‘policy’)  { polSel  = D.policies.find(x=>x.id===b.dataset.id); setTab(‘Policies’); }
if (b.dataset.goto===‘obl’)     { oblSel   = D.obligations.find(x=>x.id===b.dataset.id); setTab(‘Obligations’); }
if (b.dataset.goto===‘risk’)    { riskSel  = D.risks.find(x=>x.id===b.dataset.id); setTab(‘Risks’); }
});
});
}

function renderProcMap(el) {
el.innerHTML = ‘<div id="map-container">’ +
(canEdit() ? ‘<div style="position:absolute;top:12px;left:12px;z-index:10;display:flex;gap:5px;flex-wrap:wrap;" id="map-toolbar"></div>’ : ‘’) +
‘<svg id="map-svg"><defs><marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#cbd5e1"/></marker><filter id="sh"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity=".08"/></filter></defs><g id="map-g"></g></svg>’ +
(mapPanelOpen && mapElEdit ? renderMapPanel() : ‘’) +
‘</div>’;

if (canEdit()) {
const tb = document.getElementById(‘map-toolbar’);
EL_TYPES.forEach(t => {
const b = document.createElement(‘button’);
b.className = ‘btn btn-sm’;
b.style.cssText = ‘background:’ + EL_COLORS[t] + ‘22;color:’ + EL_COLORS[t] + ‘;border:none;’;
b.textContent = ‘+ ’ + t;
b.addEventListener(‘click’, () => addMapEl(t));
tb.appendChild(b);
});
const lb = document.createElement(‘button’);
lb.className = ‘btn btn-sm’ + (linkingMode ? ‘’ : ’ btn-outline’);
lb.textContent = linkingMode ? ‘Click source…’ : ‘🔗 Link’;
lb.addEventListener(‘click’, toggleLinking);
tb.appendChild(lb);
}

const svg = document.getElementById(‘map-svg’);
svg.addEventListener(‘mousedown’, mapMD);
svg.addEventListener(‘mousemove’, mapMM);
svg.addEventListener(‘mouseup’,   mapMU);
svg.addEventListener(‘wheel’,     mapWheel, {passive:false});
drawMap();
bindMapPanelEvents();
}

function renderMapPanel() {
const e = mapElEdit;
return ‘<div id="map-panel"><div style="display:flex;justify-content:space-between;margin-bottom:10px;"><span style="font-weight:700;font-size:13px;">Edit Element</span><button id="close-map-panel" style="border:none;background:none;cursor:pointer;font-size:16px;color:#94a3b8;">×</button></div>’ +
‘<div class="field"><label>Label</label><input class="inp" id="map-el-label" value="' + esc(e.label||'') + '"/></div>’ +
‘<div class="field"><label>Type</label><select class="inp" id="map-el-type">’ + selectOpts(EL_TYPES, e.type) + ‘</select></div>’ +
‘<div class="field"><label>Lane</label><select class="inp" id="map-el-lane">’ + selectOpts(LANES, e.lane||‘Operations’) + ‘</select></div>’ +
(canEdit() ? ‘<div style="display:flex;gap:6px;"><button class="btn btn-sm" id="save-map-el">Save</button><button class="btn btn-sm btn-danger" id="del-map-el">Delete</button></div>’ : ‘’) +
‘</div>’;
}

function bindMapPanelEvents() {
const cmp = document.getElementById(‘close-map-panel’);
if (cmp) cmp.addEventListener(‘click’, () => { mapPanelOpen=false; render(); });
const sme = document.getElementById(‘save-map-el’);
if (sme) sme.addEventListener(‘click’, saveMapEl);
const dme = document.getElementById(‘del-map-el’);
if (dme) dme.addEventListener(‘click’, deleteMapEl);
}

function drawMap() {
const g = document.getElementById(‘map-g’); if (!g) return;
const lines = D.elements.map(el => (el.links||[]).map(lid => {
const t = D.elements.find(e=>e.id===lid); if (!t) return ‘’;
return ‘<line x1="' + (el.x+NODE_W/2) + '" y1="' + (el.y+NODE_H/2) + '" x2="' + (t.x+NODE_W/2) + '" y2="' + (t.y+NODE_H/2) + '" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr)"/>’;
}).join(’’)).join(’’);
const nodes = D.elements.map(el => {
const col = EL_COLORS[el.type]||’#64748b’;
const sel = mapSelId === el.id;
return ‘<g class="map-node" data-eid="' + el.id + '" style="cursor:pointer;">’ +
‘<rect x="' + el.x + '" y="' + el.y + '" width="' + NODE_W + '" height="' + NODE_H + '" rx="8" fill="white" stroke="' + (sel?col:'#e2e8f0') + '" stroke-width="' + (sel?2:1) + '" filter="url(#sh)"/>’ +
‘<rect x="' + el.x + '" y="' + el.y + '" width="4" height="' + NODE_H + '" rx="2" fill="' + col + '"/>’ +
‘<text x="' + (el.x+14) + '" y="' + (el.y+18) + '" font-size="9" fill="' + col + '" font-weight="700">’ + esc((el.type||’’).toUpperCase()) + ‘</text>’ +
‘<text x="' + (el.x+14) + '" y="' + (el.y+33) + '" font-size="11" fill="#1e293b" font-weight="600">’ + esc((el.label||’’).slice(0,18)) + ‘</text>’ +
‘</g>’;
}).join(’’);
g.innerHTML = ‘<g transform="translate(' + mapPan.x + ',' + mapPan.y + ') scale(' + mapZoom + ')">’ + lines + nodes + ‘</g>’;

// Bind node events after drawing
g.querySelectorAll(’.map-node[data-eid]’).forEach(node => {
let dragging=false, moved=false, ds={mx:0,my:0,ex:0,ey:0};
node.addEventListener(‘mousedown’, e => {
if (!canEdit()) return;
e.stopPropagation();
const el = D.elements.find(x=>x.id===node.dataset.eid);
dragging=true; moved=false; ds={mx:e.clientX,my:e.clientY,ex:el.x,ey:el.y};
});
node.addEventListener(‘mousemove’, e => {
if (!dragging) return;
e.stopPropagation();
const dx=(e.clientX-ds.mx)/mapZoom, dy=(e.clientY-ds.my)/mapZoom;
if (Math.abs(dx)>3||Math.abs(dy)>3) moved=true;
const el=D.elements.find(x=>x.id===node.dataset.eid);
if (el&&moved){el.x=ds.ex+dx;el.y=ds.ey+dy;drawMap();}
});
node.addEventListener(‘mouseup’, e => {
if (dragging) {
e.stopPropagation();
if (moved) save();
else mapClickEl(node.dataset.eid);
dragging=false;
}
});
});
}

function mapClickEl(id) {
if (linkingMode && linkFrom) {
if (id !== linkFrom) {
const el = D.elements.find(x=>x.id===linkFrom);
if (el) { el.links=el.links||[]; if(!el.links.includes(id)) el.links.push(id); save(); drawMap(); }
}
linkingMode=false; linkFrom=null; return;
}
mapSelId = id===mapSelId ? null : id;
if (mapSelId) { mapElEdit = {…D.elements.find(x=>x.id===id)}; mapPanelOpen=true; }
else { mapPanelOpen=false; }
render();
}
function addMapEl(type) { const id=`E${uid()}`; D.elements.push({id,type,label:’New ’+type,x:120+Math.random()*200,y:100+Math.random()*150,lane:‘Operations’,links:[]}); save(); render(); }
function toggleLinking() { linkingMode=!linkingMode; linkFrom=mapSelId; render(); }
function saveMapEl() {
const lbl=document.getElementById(‘map-el-label’), typ=document.getElementById(‘map-el-type’), lan=document.getElementById(‘map-el-lane’);
if (!lbl||!mapElEdit) return;
const idx=D.elements.findIndex(x=>x.id===mapElEdit.id);
if (idx>=0) D.elements[idx]={…D.elements[idx],label:lbl.value,type:typ.value,lane:lan.value};
save(); mapPanelOpen=false; render();
}
function deleteMapEl() {
if (!mapElEdit) return;
D.elements=D.elements.filter(x=>x.id!==mapElEdit.id).map(x=>({…x,links:(x.links||[]).filter(l=>l!==mapElEdit.id)}));
mapSelId=null; mapPanelOpen=false; mapElEdit=null; save(); render();
}
function mapMD(e) { if(e.target.id===‘map-svg’||e.target.tagName===‘svg’){mapPanning=true;mapPanStart={x:e.clientX-mapPan.x,y:e.clientY-mapPan.y};} }
function mapMM(e) { if(mapPanning){mapPan={x:e.clientX-mapPanStart.x,y:e.clientY-mapPanStart.y};drawMap();} }
function mapMU()  { mapPanning=false; }
function mapWheel(e) { e.preventDefault(); mapZoom=Math.max(.25,Math.min(3,mapZoom-e.deltaY*.001)); drawMap(); }

function renderProcSwimlane(el) {
el.innerHTML = ‘<div style="flex:1;overflow-y:auto;padding:16px;"><h2 style="font-weight:700;font-size:14px;margin-bottom:12px;">Swimlane View</h2>’ +
LANES.map(lane => {
const les = D.elements.filter(e=>(e.lane||‘Operations’)===lane);
return ‘<div style="margin-bottom:8px;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0;background:white;">’ +
‘<div style="padding:7px 14px;background:#f8fafc;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;gap:7px;"><span style="font-weight:700;font-size:12px;">’ + esc(lane) + ‘</span><span style="font-size:10px;color:#94a3b8;background:#f1f5f9;border-radius:20px;padding:1px 6px;">’ + les.length + ‘</span></div>’ +
‘<div style="padding:10px;min-height:56px;display:flex;flex-wrap:wrap;gap:7px;">’ +
(les.length ? les.map(e => { const col=EL_COLORS[e.type]; return ‘<div class="nav-link" data-goto="map-el" data-id="' + e.id + '" style="padding:5px 10px;border-radius:7px;background:' + col + '15;border:1px solid ' + col + '30;cursor:pointer;"><div style="font-size:9px;font-weight:700;color:' + col + ';text-transform:uppercase;">’ + e.type + ‘</div><div style="font-size:11px;font-weight:600;">’ + esc(e.label) + ‘</div></div>’; }).join(’’) : ‘<span style="font-size:11px;color:#cbd5e1;">No elements</span>’) +
‘</div></div>’;
}).join(’’) + ‘</div>’;
el.querySelectorAll(’[data-goto=“map-el”]’).forEach(b => {
b.addEventListener(‘click’, () => { mapSelId=b.dataset.id; mapElEdit={…D.elements.find(x=>x.id===b.dataset.id)}; mapPanelOpen=true; activeSubViews.Processes=‘Map’; render(); });
});
}

function renderProcRaci(el) {
el.innerHTML = ‘<div style="flex:1;overflow:auto;padding:16px;"><h2 style="font-weight:700;font-size:14px;margin-bottom:12px;">RACI Matrix</h2>’ +
‘<table class="tbl"><thead><tr><th>Process</th>’ + D.people.map(p=>’<th>’+esc(p.name.split(’ ‘)[0])+’</th>’).join(’’) + ‘</tr></thead><tbody>’ +
D.processes.map(proc => ‘<tr><td style="font-weight:600;">’ + esc(proc.title) + ‘</td>’ +
D.people.map(p => { const e=D.raci.find(r=>r.processId===proc.id&&r.roleId===p.id); const tc={Responsible:’#6366f1’,Accountable:’#10b981’,Consulted:’#f59e0b’,Informed:’#94a3b8’}[e?.type]; return ‘<td style="text-align:center;">’ + (e?’<span style="display:inline-block;width:22px;height:22px;line-height:22px;border-radius:50%;background:'+tc+'25;color:'+tc+';font-size:10px;font-weight:800;">’+e.type[0]+’</span>’:’’) + ‘</td>’; }).join(’’) + ‘</tr>’
).join(’’) + ‘</tbody></table></div>’;
}

function renderProcWorkflows(el) {
el.innerHTML = ‘<div style="flex:1;overflow-y:auto;padding:16px;">’ +
‘<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><h2 style="font-weight:700;font-size:14px;margin:0;">Workflow Templates</h2>’ +
(canEdit() ? ‘<button class="btn btn-sm" id="new-wf-btn">+ New Workflow</button>’ : ‘’) + ‘</div>’ +
D.workflows.map(wf =>
‘<div class="card" style="margin-bottom:10px;">’ +
‘<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><span style="font-weight:700;font-size:13px;">’ + esc(wf.name) + ‘</span>’ +
(canEdit() ? ‘<button class="btn btn-outline btn-sm" data-edit-wf="' + wf.id + '">✏️ Edit</button>’ : ‘’) + ‘</div>’ +
‘<div style="display:flex;gap:0;overflow-x:auto;">’ +
wf.steps.map((s,i) => ‘<div style="display:flex;align-items:center;"><div style="padding:6px 12px;border-radius:20px;background:' + (i===0?'#6366f1':'#f1f5f9') + ';color:' + (i===0?'white':'#64748b') + ';font-size:11px;font-weight:600;white-space:nowrap;">’ + esc(s.name) + ‘</div>’ + (i<wf.steps.length-1?’<span style="font-size:12px;color:#cbd5e1;margin:0 2px;">→</span>’:’’) + ‘</div>’).join(’’) +
‘</div></div>’
).join(’’) + ‘</div>’;
const nw = el.querySelector(’#new-wf-btn’); if (nw) nw.addEventListener(‘click’, () => openWorkflowModal(null));
el.querySelectorAll(’[data-edit-wf]’).forEach(b => b.addEventListener(‘click’, () => openWorkflowModal(b.dataset.editWf)));
}

function renderProcKPIs(el) {
const procs = D.processes.filter(p=>p.kpis&&p.kpis.length>0);
el.innerHTML = ‘<div style="flex:1;overflow-y:auto;padding:16px;"><h2 style="font-weight:700;font-size:14px;margin-bottom:12px;">Process KPIs</h2>’ +
‘<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">’ +
procs.map(p => ‘<div class="card"><div style="margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #f1f5f9;"><div style="font-weight:700;font-size:12px;">’ + esc(p.title) + ‘</div><div style="display:flex;gap:4px;margin-top:3px;">’ + badge(p.status,SC(p.status)) + badge(p.maturity,MC(p.maturity)) + ‘</div></div>’ + p.kpis.map(k=>sparklineHTML(k)).join(’’) + ‘</div>’).join(’’) +
‘</div></div>’;
}

// ─── POLICIES ─────────────────────────────────────────────────────────────────
function renderPolicies(c) {
const sidebar = ‘<div class="sidebar-header"><div style="font-weight:700;font-size:13px;">Policy Library</div>’ +
(canEdit() ? ‘<button class="btn btn-sm" id="new-pol-btn">+ New</button>’ : ‘’) + ‘</div>’ +
‘<div class="sidebar-list">’ + D.policies.map(p =>
‘<div class="sidebar-item' + (polSel?.id===p.id?' active':'') + '" style="' + (polSel?.id===p.id?'border-left-color:#3b82f6;background:#eff6ff;':'') + '" data-polid="' + p.id + '">’ +
‘<div style="display:flex;justify-content:space-between;margin-bottom:2px;"><span style="font-size:12px;font-weight:600;">’ + esc(p.title) + ‘</span>’ + badge(p.status,SC(p.status)) + ‘</div>’ +
‘<div style="display:flex;gap:5px;">’ + badge(p.category,’#3b82f6’) + ‘<span style="font-size:9px;color:#94a3b8;">v’ + p.version + ‘</span></div></div>’
).join(’’) + ‘</div>’;

let detail = ‘<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:13px;">Select a policy</div>’;
if (polSel) {
const p = D.policies.find(x=>x.id===polSel.id)||polSel;
detail = ‘<div style="max-width:700px;">’ +
‘<div class="card" style="margin-bottom:12px;">’ +
‘<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;"><div><h2 style="font-weight:800;font-size:16px;margin:0 0 4px;">’ + esc(p.title) + ‘</h2><div style="display:flex;gap:5px;">’ + badge(p.status,SC(p.status)) + badge(p.category,’#3b82f6’) + ‘</div></div>’ +
(canEdit() ? ‘<button class="btn btn-outline btn-sm" data-edit-pol="' + p.id + '">✏️ Edit</button>’ : ‘’) + ‘</div>’ +
‘<div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:8px;"><div><div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Owner</div><div style="font-size:12px;font-weight:600;">’ + esc(pOwner(p.owner)) + ‘</div></div><div><div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Version</div><div style="font-size:12px;font-weight:600;">v’ + p.version + ‘</div></div><div><div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Review Date</div><div style="font-size:12px;font-weight:600;">’ + esc(p.reviewDate||’—’) + ‘</div></div></div>’ +
‘<p style="font-size:13px;color:#64748b;margin:0 0 10px;">’ + esc(p.description) + ‘</p>’ +
(p.content ? ‘<div style="background:#f8fafc;border-radius:8px;padding:12px 14px;font-size:12px;color:#334155;white-space:pre-wrap;">’ + esc(p.content) + ‘</div>’ : ‘’) +
‘</div>’ +
‘<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">’ +
‘<div class="card"><div style="font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:7px;">Obligations</div>’ +
(p.obligationIds||[]).map(id => { const o=D.obligations.find(x=>x.id===id); return o ? ‘<div class="nav-link" data-goto="obl" data-id="' + id + '" style="font-size:11px;padding:3px 8px;border-radius:6px;background:#fef3c7;color:#92400e;margin-bottom:3px;cursor:pointer;">’ + esc(o.title.slice(0,30)) + ‘</div>’ : ‘’; }).join(’’) +
(!(p.obligationIds?.length) ? ‘<p style="font-size:11px;color:#94a3b8;">None.</p>’ : ‘’) + ‘</div>’ +
‘<div class="card"><div style="font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:7px;">Related Processes</div>’ +
(p.relatedProcessIds||[]).map(id => { const pr=D.processes.find(x=>x.id===id); return pr ? ‘<div class="nav-link" data-goto="proc" data-id="' + id + '" style="font-size:11px;padding:3px 8px;border-radius:6px;background:#f5f3ff;color:#4338ca;margin-bottom:3px;cursor:pointer;">’ + esc(pr.title) + ‘</div>’ : ‘’; }).join(’’) +
(!(p.relatedProcessIds?.length) ? ‘<p style="font-size:11px;color:#94a3b8;">None.</p>’ : ‘’) + ‘</div>’ +
‘</div></div>’;
}
c.innerHTML = sidebarLayout(sidebar, detail);
const np = c.querySelector(’#new-pol-btn’); if (np) np.addEventListener(‘click’, () => openPolModal(null));
c.querySelectorAll(’[data-polid]’).forEach(item => item.addEventListener(‘click’, () => { polSel=D.policies.find(x=>x.id===item.dataset.polid); render(); }));
c.querySelectorAll(’[data-edit-pol]’).forEach(b => b.addEventListener(‘click’, () => openPolModal(b.dataset.editPol)));
c.querySelectorAll(’.nav-link[data-goto]’).forEach(b => {
b.addEventListener(‘click’, () => {
if (b.dataset.goto===‘obl’)  { oblSel=D.obligations.find(x=>x.id===b.dataset.id); setTab(‘Obligations’); }
if (b.dataset.goto===‘proc’) { procSel=D.processes.find(x=>x.id===b.dataset.id); setTab(‘Processes’); }
});
});
}

// ─── OBLIGATIONS ──────────────────────────────────────────────────────────────
function renderObligations(c) {
const sidebar = ‘<div class="sidebar-header"><div style="font-weight:700;font-size:13px;">Obligation Register</div>’ +
(canEdit() ? ‘<button class="btn btn-sm" id="new-obl-btn">+ New</button>’ : ‘’) + ‘</div>’ +
‘<div class="sidebar-list">’ + D.obligations.map(o => {
const cc = o.complianceStatus===‘Compliant’?’#10b981’:o.complianceStatus===‘In Progress’?’#f59e0b’:’#ef4444’;
return ‘<div class="sidebar-item' + (oblSel?.id===o.id?' active':'') + '" style="' + (oblSel?.id===o.id?'border-left-color:#f59e0b;background:#fffbeb;':'') + '" data-oblid="' + o.id + '">’ +
‘<div style="margin-bottom:2px;font-size:11px;font-weight:600;">’ + esc(o.title.slice(0,32)) + ‘</div>’ +
‘<div style="display:flex;gap:5px;">’ + badge(o.complianceStatus,cc) + badge(o.type,’#f59e0b’) + ‘</div></div>’;
}).join(’’) + ‘</div>’;

let detail = ‘<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:13px;">Select an obligation</div>’;
if (oblSel) {
const o = D.obligations.find(x=>x.id===oblSel.id)||oblSel;
const cc = o.complianceStatus===‘Compliant’?’#10b981’:o.complianceStatus===‘In Progress’?’#f59e0b’:’#ef4444’;
detail = ‘<div style="max-width:700px;">’ +
‘<div class="card" style="margin-bottom:12px;">’ +
‘<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;"><div><h2 style="font-weight:800;font-size:16px;margin:0 0 4px;">’ + esc(o.title) + ‘</h2><div style="display:flex;gap:5px;">’ + badge(o.type,’#f59e0b’) + badge(o.complianceStatus,cc) + ‘</div></div>’ +
(canEdit() ? ‘<button class="btn btn-outline btn-sm" data-edit-obl="' + o.id + '">✏️ Edit</button>’ : ‘’) + ‘</div>’ +
‘<div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:8px;"><div><div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Regulator</div><div style="font-size:12px;font-weight:600;">’ + esc(o.regulator||’—’) + ‘</div></div><div><div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Owner</div><div style="font-size:12px;font-weight:600;">’ + esc(pOwner(o.owner)) + ‘</div></div><div><div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Review</div><div style="font-size:12px;font-weight:600;">’ + esc(o.reviewDate||’—’) + ‘</div></div></div>’ +
‘<p style="font-size:13px;color:#64748b;margin:0 0 8px;">’ + esc(o.description) + ‘</p>’ +
(o.notes ? ‘<div style="background:#fffbeb;border-radius:7px;padding:8px 12px;font-size:12px;color:#92400e;">💡 ’ + esc(o.notes) + ‘</div>’ : ‘’) +
‘</div>’ +
‘<div class="card" style="margin-bottom:12px;"><div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:7px;">Controls</div><div style="display:flex;flex-wrap:wrap;gap:5px;">’ + (o.controls||[]).map(ctrl => ‘<span style="font-size:11px;background:#ecfdf5;color:#065f46;border-radius:6px;padding:3px 8px;border:1px solid #a7f3d0;">’ + esc(ctrl) + ‘</span>’).join(’’) + ‘</div></div>’ +
‘<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">’ +
‘<div class="card"><div style="font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:7px;">Linked Policies</div>’ + (o.linkedPolicyIds||[]).map(id => { const pol=D.policies.find(x=>x.id===id); return pol ? ‘<div class="nav-link" data-goto="pol" data-id="' + id + '" style="font-size:11px;padding:4px 8px;border-radius:6px;background:#eff6ff;color:#1d4ed8;margin-bottom:4px;cursor:pointer;">’ + esc(pol.title.slice(0,30)) + ‘</div>’ : ‘’; }).join(’’) + (!(o.linkedPolicyIds?.length)?’<p style="font-size:11px;color:#94a3b8;">None.</p>’:’’) + ‘</div>’ +
‘<div class="card"><div style="font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:7px;">Linked Processes</div>’ + (o.linkedProcessIds||[]).map(id => { const pr=D.processes.find(x=>x.id===id); return pr ? ‘<div class="nav-link" data-goto="proc" data-id="' + id + '" style="font-size:11px;padding:4px 8px;border-radius:6px;background:#f5f3ff;color:#4338ca;margin-bottom:4px;cursor:pointer;">’ + esc(pr.title) + ‘</div>’ : ‘’; }).join(’’) + (!(o.linkedProcessIds?.length)?’<p style="font-size:11px;color:#94a3b8;">None.</p>’:’’) + ‘</div>’ +
‘</div></div>’;
}
c.innerHTML = sidebarLayout(sidebar, detail);
const no = c.querySelector(’#new-obl-btn’); if (no) no.addEventListener(‘click’, () => openOblModal(null));
c.querySelectorAll(’[data-oblid]’).forEach(item => item.addEventListener(‘click’, () => { oblSel=D.obligations.find(x=>x.id===item.dataset.oblid); render(); }));
c.querySelectorAll(’[data-edit-obl]’).forEach(b => b.addEventListener(‘click’, () => openOblModal(b.dataset.editObl)));
c.querySelectorAll(’.nav-link[data-goto]’).forEach(b => {
b.addEventListener(‘click’, () => {
if (b.dataset.goto===‘pol’)  { polSel=D.policies.find(x=>x.id===b.dataset.id); setTab(‘Policies’); }
if (b.dataset.goto===‘proc’) { procSel=D.processes.find(x=>x.id===b.dataset.id); setTab(‘Processes’); }
});
});
}

// ─── RISKS ────────────────────────────────────────────────────────────────────
function riskMatrixHTML() {
const rows = […RISK_L].reverse().map(l =>
‘<tr><th style="padding:4px 8px;font-weight:700;color:#64748b;text-align:right;font-size:9px;white-space:nowrap;">’ + l + ‘</th>’ +
RISK_I.map(i => {
const sc=rScore(l,i); const lv=rLevel(sc);
const tc={Critical:’#ef4444’,High:’#f59e0b’,Medium:’#6366f1’,Low:’#10b981’}[lv];
const rs=D.risks.filter(r=>r.likelihood===l&&r.impact===i&&r.status!==‘Closed’);
return ‘<td class="risk-cell" data-rid="' + (rs[0]?.id||'') + '" style="border:1px solid #e2e8f0;width:80px;vertical-align:top;background:' + tc + '10;cursor:' + (rs.length?'pointer':'default') + ';padding:4px;">’ +
rs.map(r => ‘<div title="' + esc(r.title) + '" style="font-size:9px;background:' + tc + '20;color:' + tc + ';border-radius:4px;padding:1px 4px;margin-bottom:2px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:72px;">’ + esc(r.title.slice(0,14)) + ‘</div>’).join(’’) +
‘</td>’;
}).join(’’) + ‘</tr>’
).join(’’);
return ‘<div style="overflow-x:auto;"><table style="border-collapse:collapse;font-size:10px;"><thead><tr><td style="padding:4px 8px;font-weight:700;color:#64748b;font-size:9px;text-align:right;">Impact →<br/>Likelihood ↓</td>’ +
RISK_I.map(i => ‘<th style="padding:4px 6px;font-weight:700;color:#64748b;text-align:center;width:80px;">’ + i + ‘</th>’).join(’’) +
‘</tr></thead><tbody>’ + rows + ‘</tbody></table></div>’;
}

function renderRisks(c) {
const sidebar = ‘<div class="sidebar-header"><div><div style="font-weight:700;font-size:13px;">Risk Register</div><div style="font-size:10px;color:#64748b;">’ + D.risks.filter(r=>r.status!==‘Closed’).length + ’ open risks</div></div>’ +
(canEdit() ? ‘<button class="btn btn-sm" id="new-risk-btn">+ New</button>’ : ‘’) + ‘</div>’ +
‘<div class="sidebar-list">’ + D.risks.map(r => {
const lv=rLevel(rScore(r.likelihood,r.impact));
return ‘<div class="sidebar-item' + (riskSel?.id===r.id?' active':'') + '" style="' + (riskSel?.id===r.id?'border-left-color:'+PC(lv)+';background:'+PC(lv)+'12;':'') + '" data-riskid="' + r.id + '">’ +
‘<div style="display:flex;justify-content:space-between;margin-bottom:2px;"><span style="font-size:12px;font-weight:600;">’ + esc(r.title) + ‘</span>’ + badge(lv,PC(lv)) + ‘</div>’ +
‘<div style="display:flex;gap:5px;">’ + badge(r.status,SC(r.status)) + ‘<span style="font-size:9px;color:#94a3b8;">’ + esc(r.category) + ‘</span></div></div>’;
}).join(’’) + ‘</div>’;

let detail = ‘<div style="padding:16px;"><h2 style="font-weight:700;font-size:14px;margin-bottom:12px;">Risk Matrix</h2>’ + riskMatrixHTML() + ‘</div>’;
if (riskSel) {
const r = D.risks.find(x=>x.id===riskSel.id)||riskSel;
const sc=rScore(r.likelihood,r.impact); const lv=rLevel(sc);
detail = ‘<div style="max-width:700px;">’ +
‘<div class="card" style="margin-bottom:12px;">’ +
‘<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;"><div><h2 style="font-weight:800;font-size:16px;margin:0 0 4px;">’ + esc(r.title) + ‘</h2><div style="display:flex;gap:5px;">’ + badge(lv,PC(lv)) + badge(‘Score: ‘+sc,’#94a3b8’) + badge(r.status,SC(r.status)) + ‘</div></div>’ +
(canEdit() ? ‘<button class="btn btn-outline btn-sm" data-edit-risk="' + r.id + '">✏️ Edit</button>’ : ‘’) + ‘</div>’ +
‘<div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:8px;"><div><div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Likelihood</div><div style="font-size:12px;font-weight:600;">’ + esc(r.likelihood) + ‘</div></div><div><div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Impact</div><div style="font-size:12px;font-weight:600;">’ + esc(r.impact) + ‘</div></div><div><div style="font-size:9px;font-weight:700;color:#94a3b8;text-transform:uppercase;">Owner</div><div style="font-size:12px;font-weight:600;">’ + esc(pOwner(r.owner)) + ‘</div></div></div>’ +
‘<p style="font-size:13px;color:#64748b;margin:0 0 10px;">’ + esc(r.description) + ‘</p>’ +
(r.treatments?.length ? ‘<div><div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:5px;">Treatments</div>’ + r.treatments.map(t => ‘<div style="font-size:12px;color:#334155;padding:3px 0;border-bottom:1px solid #f1f5f9;">• ’ + esc(t) + ‘</div>’).join(’’) + ‘</div>’ : ‘’) +
‘</div>’ +
‘<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">’ +
‘<div class="card"><div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:6px;">Residual Risk</div><div style="display:flex;gap:10px;"><div><div style="font-size:9px;color:#94a3b8;">Likelihood</div><div style="font-size:12px;font-weight:700;">’ + esc(r.residualLikelihood) + ‘</div></div><div><div style="font-size:9px;color:#94a3b8;">Impact</div><div style="font-size:12px;font-weight:700;">’ + esc(r.residualImpact) + ‘</div></div></div></div>’ +
‘<div class="card"><div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:6px;">Linked Processes</div>’ +
D.processes.filter(p=>(r.linkedProcessIds||[]).includes(p.id)).map(p => ‘<div class="nav-link" data-goto="proc" data-id="' + p.id + '" style="font-size:11px;padding:3px 8px;border-radius:6px;background:#f5f3ff;color:#4338ca;margin-bottom:3px;cursor:pointer;">’ + esc(p.title) + ‘</div>’).join(’’) +
‘</div>’ +
‘</div></div>’;
}
c.innerHTML = sidebarLayout(sidebar, detail);
const nr = c.querySelector(’#new-risk-btn’); if (nr) nr.addEventListener(‘click’, () => openRiskModal(null));
c.querySelectorAll(’[data-riskid]’).forEach(item => item.addEventListener(‘click’, () => { riskSel=D.risks.find(x=>x.id===item.dataset.riskid); render(); }));
c.querySelectorAll(’[data-edit-risk]’).forEach(b => b.addEventListener(‘click’, () => openRiskModal(b.dataset.editRisk)));
c.querySelectorAll(’.risk-cell[data-rid]’).forEach(cell => {
if (cell.dataset.rid) cell.addEventListener(‘click’, () => { riskSel=D.risks.find(x=>x.id===cell.dataset.rid); render(); });
});
c.querySelectorAll(’.nav-link[data-goto=“proc”]’).forEach(b => b.addEventListener(‘click’, () => { procSel=D.processes.find(x=>x.id===b.dataset.id); setTab(‘Processes’); }));
}

// ─── ITSM ─────────────────────────────────────────────────────────────────────
function renderITSM(c) {
const sv = activeSubViews.ITSM || ‘Incidents’;
let subnav = ‘<div class="subnav">’;
ITSM_VIEWS.forEach(v => { subnav += ‘<button class="subnav-btn' + (sv===v?' active':'') + '" data-tab="ITSM" data-view="' + v + '">’ + v + ‘</button>’; });
subnav += ‘</div>’;
c.innerHTML = subnav + ‘<div style="flex:1;overflow-y:auto;padding:16px;" id="itsm-body"></div>’;
const b = document.getElementById(‘itsm-body’);
if      (sv===‘Incidents’) renderIncidents(b);
else if (sv===‘Changes’)   renderChanges(b);
else if (sv===‘CMDB’)      renderCMDB(b);
}

function renderIncidents(b) {
b.innerHTML = ‘<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><h2 style="font-weight:700;font-size:14px;margin:0;">Incidents</h2>’ +
(canEdit() ? ‘<button class="btn btn-sm" id="new-inc-btn">+ New</button>’ : ‘’) + ‘</div>’ +
statCards([{l:‘Total’,v:D.incidents.length,c:’#6366f1’},{l:‘Open’,v:D.incidents.filter(i=>![‘Resolved’,‘Closed’].includes(i.state)).length,c:’#f59e0b’},{l:‘Critical’,v:D.incidents.filter(i=>i.priority===‘Critical’).length,c:’#ef4444’},{l:‘Resolved’,v:D.incidents.filter(i=>[‘Resolved’,‘Closed’].includes(i.state)).length,c:’#10b981’}]) +
‘<div class="card" style="padding:0;overflow:hidden;"><table class="tbl">’ + tblHeader([‘ID’,‘Title’,‘Priority’,‘State’,‘Assignee’,‘Created’,’’]) +
‘<tbody>’ + D.incidents.map((inc,i) => ‘<tr><td style="font-weight:700;color:#6366f1;">’ + esc(inc.id) + ‘</td><td>’ + esc(inc.title) + ‘</td><td>’ + badge(inc.priority,PC(inc.priority)) + ‘</td><td>’ + badge(inc.state,SC(inc.state)) + ‘</td><td>’ + esc(inc.assignee||’—’) + ‘</td><td>’ + esc(inc.createdAt) + ‘</td><td>’ + (canEdit() ? ‘<button class="btn btn-outline btn-sm" data-edit-inc="' + inc.id + '">Edit</button>’ : ‘’) + ‘</td></tr>’).join(’’) +
‘</tbody></table></div>’;
const ni = b.querySelector(’#new-inc-btn’); if (ni) ni.addEventListener(‘click’, () => openIncModal(null));
b.querySelectorAll(’[data-edit-inc]’).forEach(btn => btn.addEventListener(‘click’, () => openIncModal(btn.dataset.editInc)));
}

function renderChanges(b) {
b.innerHTML = ‘<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><h2 style="font-weight:700;font-size:14px;margin:0;">Changes</h2>’ +
(canEdit() ? ‘<button class="btn btn-sm" id="new-chg-btn">+ New</button>’ : ‘’) + ‘</div>’ +
‘<div style="display:flex;gap:5px;margin-bottom:10px;overflow-x:auto;">’ +
CHG_STATES.map(s => { const cnt=D.changes.filter(c=>c.state===s).length; return ‘<div style="flex:0 0 auto;min-width:78px;background:white;border:1px solid #e2e8f0;border-radius:8px;padding:6px 8px;text-align:center;border-top:3px solid '+SC(s)+';"><div style="font-size:13px;font-weight:800;">’ + cnt + ‘</div><div style="font-size:9px;color:#64748b;">’ + esc(s) + ‘</div></div>’; }).join(’’) + ‘</div>’ +
‘<div class="card" style="padding:0;overflow:hidden;"><table class="tbl">’ + tblHeader([‘ID’,‘Title’,‘Type’,‘Priority’,‘State’,‘Scheduled’,’’]) +
‘<tbody>’ + D.changes.map((ch,i) => ‘<tr><td style="font-weight:700;color:#6366f1;">’ + esc(ch.id) + ‘</td><td>’ + esc(ch.title) + ‘</td><td>’ + esc(ch.type) + ‘</td><td>’ + badge(ch.priority,PC(ch.priority)) + ‘</td><td>’ + badge(ch.state,SC(ch.state)) + ‘</td><td>’ + esc(ch.scheduledAt||’—’) + ‘</td><td>’ + (canEdit() ? ‘<button class="btn btn-outline btn-sm" data-edit-chg="' + ch.id + '">Edit</button>’ : ‘’) + ‘</td></tr>’).join(’’) +
‘</tbody></table></div>’;
const nc = b.querySelector(’#new-chg-btn’); if (nc) nc.addEventListener(‘click’, () => openChgModal(null));
b.querySelectorAll(’[data-edit-chg]’).forEach(btn => btn.addEventListener(‘click’, () => openChgModal(btn.dataset.editChg)));
}

function renderCMDB(b) {
b.innerHTML = ‘<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><h2 style="font-weight:700;font-size:14px;margin:0;">CMDB</h2>’ +
(canEdit() ? ‘<button class="btn btn-sm" id="new-asset-btn">+ Add CI</button>’ : ‘’) + ‘</div>’ +
statCards([{l:‘Total CIs’,v:D.assets.length,c:’#6366f1’},{l:‘Operational’,v:D.assets.filter(a=>a.status===‘Operational’).length,c:’#10b981’},{l:‘Maintenance’,v:D.assets.filter(a=>a.status===‘Maintenance’).length,c:’#f59e0b’},{l:‘Critical’,v:D.assets.filter(a=>a.criticality===‘Critical’).length,c:’#ef4444’}]) +
‘<div class="card" style="padding:0;overflow:hidden;"><table class="tbl">’ + tblHeader([‘CI ID’,‘Name’,‘Type’,‘Status’,‘Criticality’,‘Owner’,’’]) +
‘<tbody>’ + D.assets.map((a,i) => ‘<tr><td style="font-weight:700;color:#6366f1;">’ + esc(a.id) + ‘</td><td>’ + esc(a.name) + ‘</td><td>’ + esc(a.type) + ‘</td><td>’ + badge(a.status,({Operational:’#10b981’,Maintenance:’#f59e0b’,Degraded:’#ef4444’})[a.status]||’#94a3b8’) + ‘</td><td>’ + badge(a.criticality,PC(a.criticality)) + ‘</td><td>’ + esc(a.owner) + ‘</td><td>’ + (canEdit() ? ‘<button class="btn btn-outline btn-sm" data-edit-asset="' + a.id + '">Edit</button>’ : ‘’) + ‘</td></tr>’).join(’’) +
‘</tbody></table></div>’;
const na = b.querySelector(’#new-asset-btn’); if (na) na.addEventListener(‘click’, () => openAssetModal(null));
b.querySelectorAll(’[data-edit-asset]’).forEach(btn => btn.addEventListener(‘click’, () => openAssetModal(btn.dataset.editAsset)));
}

// ─── PROJECTS ─────────────────────────────────────────────────────────────────
function renderProjects(c) {
const sv = activeSubViews.Projects || ‘Board’;
let topbar = ‘<div style="padding:6px 14px;background:white;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;gap:8px;flex-shrink:0;" id="proj-topbar">’ +
‘<select class="inp" style="width:auto;font-size:12px;" id="prj-select">’ + D.projects.map(p => ‘<option value=”’ + p.id + ‘”’ + (p.id===activePrj?’ selected’:’’) + ‘>’ + esc(p.title) + ‘</option>’).join(’’) + ‘</select>’ +
(canEdit() ? ‘<button class="btn btn-sm" id="new-proj-btn">+ Project</button>’ : ‘’) + ‘</div>’;
let subnav = ‘<div class="subnav">’;
PROJ_VIEWS.forEach(v => { subnav += ‘<button class="subnav-btn' + (sv===v?' active':'') + '" data-tab="Projects" data-view="' + v + '">’ + v + ‘</button>’; });
subnav += ‘</div>’;
c.innerHTML = topbar + subnav + ‘<div id="proj-body" style="flex:1;overflow:hidden;display:flex;flex-direction:column;"></div>’;

document.getElementById(‘prj-select’).addEventListener(‘change’, function(){ activePrj=this.value; render(); });
const np = document.getElementById(‘new-proj-btn’); if (np) np.addEventListener(‘click’, () => openProjModal(null));

const pb = document.getElementById(‘proj-body’);
if      (sv===‘Board’)   renderBoard(pb);
else if (sv===‘Backlog’) renderBacklog(pb);
else if (sv===‘Wiki’)    renderWiki(pb);
}

function renderBoard(b) {
b.innerHTML = ‘<div class="board">’ + ISS_STATES.map(state => {
const issues = D.issues.filter(i=>i.projectId===activePrj&&i.sprintId===activeSpr&&i.state===state);
return ‘<div class="board-col">’ +
‘<div class="board-col-header"><div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-size:11px;font-weight:700;">’ + esc(state) + ‘</span><span style="font-size:10px;background:' + SC(state) + '22;color:' + SC(state) + ';border-radius:10px;padding:1px 6px;font-weight:700;">’ + issues.length + ‘</span></div></div>’ +
‘<div class="board-col-body">’ +
issues.map(iss => ‘<div class="issue-card"><div style="display:flex;justify-content:space-between;margin-bottom:4px;">’ + badge(iss.priority,PC(iss.priority)) + ‘<span style="font-size:9px;color:#94a3b8;">’ + iss.storyPoints + ’ pts</span></div><div style="font-size:12px;font-weight:600;margin-bottom:4px;">’ + esc(iss.title) + ‘</div><div style="font-size:9px;color:#94a3b8;">’ + esc(iss.id) + ‘</div>’ + (canEdit() ? ‘<button class="btn btn-outline btn-sm" style="margin-top:5px;font-size:9px;" data-edit-iss="' + iss.id + '">Edit</button>’ : ‘’) + ‘</div>’).join(’’) +
(canEdit() ? ‘<button class="btn btn-sm" style="width:100%;border:1px dashed #cbd5e1;background:transparent;color:#94a3b8;margin-top:4px;" data-add-iss="' + state + '">+ Add issue</button>’ : ‘’) +
‘</div></div>’;
}).join(’’) + ‘</div>’;
b.querySelectorAll(’[data-edit-iss]’).forEach(btn => btn.addEventListener(‘click’, () => openIssModal(btn.dataset.editIss)));
b.querySelectorAll(’[data-add-iss]’).forEach(btn => btn.addEventListener(‘click’, () => openIssModal(null, btn.dataset.addIss)));
}

function renderBacklog(b) {
b.innerHTML = ‘<div style="flex:1;overflow-y:auto;padding:16px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><h2 style="font-weight:700;font-size:14px;margin:0;">Backlog</h2>’ +
(canEdit() ? ‘<button class="btn btn-sm" id="new-iss-btn">+ Issue</button>’ : ‘’) + ‘</div>’ +
‘<div class="card" style="padding:0;overflow:hidden;"><table class="tbl">’ + tblHeader([‘ID’,‘Title’,‘Priority’,‘State’,‘Assignee’,‘Points’,’’]) +
‘<tbody>’ + D.issues.filter(i=>i.projectId===activePrj).map((iss,i) => ‘<tr><td style="font-weight:700;color:#6366f1;">’ + esc(iss.id) + ‘</td><td>’ + esc(iss.title) + ‘</td><td>’ + badge(iss.priority,PC(iss.priority)) + ‘</td><td>’ + badge(iss.state,SC(iss.state)) + ‘</td><td>’ + esc(D.people.find(p=>p.id===iss.assignee)?.name||’—’) + ‘</td><td>’ + iss.storyPoints + ‘</td><td>’ + (canEdit() ? ‘<button class="btn btn-outline btn-sm" data-edit-iss="' + iss.id + '">Edit</button>’ : ‘’) + ‘</td></tr>’).join(’’) +
‘</tbody></table></div></div>’;
const ni = b.querySelector(’#new-iss-btn’); if (ni) ni.addEventListener(‘click’, () => openIssModal(null,‘Backlog’));
b.querySelectorAll(’[data-edit-iss]’).forEach(btn => btn.addEventListener(‘click’, () => openIssModal(btn.dataset.editIss)));
}

function renderWiki(b) {
if (pageView) {
b.innerHTML = ‘<div style="flex:1;overflow-y:auto;padding:16px;"><div style="max-width:700px;">’ +
‘<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><button class="btn btn-outline btn-sm" id="back-wiki">← Back</button><h2 style="font-weight:700;font-size:14px;margin:0;">’ + esc(pageView.title) + ‘</h2>’ +
(canEdit() ? ‘<button class="btn btn-outline btn-sm" data-edit-page="' + pageView.id + '">✏️ Edit</button>’ : ‘’) + ‘</div>’ +
‘<div class="card" style="white-space:pre-wrap;font-size:13px;color:#334155;line-height:1.7;">’ + esc(pageView.content) + ‘</div></div></div>’;
const bw = b.querySelector(’#back-wiki’); if (bw) bw.addEventListener(‘click’, () => { pageView=null; render(); });
b.querySelectorAll(’[data-edit-page]’).forEach(btn => btn.addEventListener(‘click’, () => openPageModal(btn.dataset.editPage)));
return;
}
const pages = D.pages.filter(p=>p.projectId===activePrj);
b.innerHTML = ‘<div style="flex:1;overflow-y:auto;padding:16px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><h2 style="font-weight:700;font-size:14px;margin:0;">Wiki</h2>’ +
(canEdit() ? ‘<button class="btn btn-sm" id="new-page-btn">+ Page</button>’ : ‘’) + ‘</div>’ +
‘<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;">’ +
pages.map(pg => ‘<div class="card wiki-page-card" style="cursor:pointer;" data-pageid="' + pg.id + '"><div style="font-weight:700;font-size:13px;margin-bottom:4px;">📄 ’ + esc(pg.title) + ‘</div><div style="font-size:10px;color:#94a3b8;">’ + esc(pg.author) + ’ · ’ + esc(pg.updatedAt) + ‘</div></div>’).join(’’) + ‘</div></div>’;
const np = b.querySelector(’#new-page-btn’); if (np) np.addEventListener(‘click’, () => openPageModal(null));
b.querySelectorAll(’[data-pageid]’).forEach(card => card.addEventListener(‘click’, () => { pageView=D.pages.find(x=>x.id===card.dataset.pageid); render(); }));
}

// ─── LEARNING ─────────────────────────────────────────────────────────────────
function renderLearning(c) {
const myPid = currentUser?.personId || ‘P1’;
const me = D.people.find(p=>p.id===myPid) || D.people[0];
c.innerHTML = ‘<div style="flex:1;overflow-y:auto;padding:16px;"><h2 style="font-weight:700;font-size:14px;margin-bottom:12px;">Learning Centre</h2>’ +
‘<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">’ +
D.courses.map(course => {
const enrolled = (me?.enrolledCourses||[]).includes(course.id);
return ‘<div class="card"><div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="font-size:28px;">’ + course.thumbnail + ‘</span>’ + badge(course.level,’#6366f1’) + ‘</div>’ +
‘<div style="font-weight:700;font-size:13px;margin-bottom:3px;">’ + esc(course.title) + ‘</div>’ +
‘<div style="font-size:10px;color:#64748b;margin-bottom:8px;">’ + esc(course.category) + ’ · ’ + esc(course.instructor) + ’ · ’ + Math.round(course.duration/60) + ‘h ’ + (course.duration%60) + ‘m</div>’ +
‘<p style="font-size:11px;color:#64748b;margin-bottom:8px;">’ + esc(course.description) + ‘</p>’ +
‘<div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-size:11px;color:#f59e0b;">★ ’ + course.rating + ’ · ’ + course.enrolled + ’ enrolled</div>’ +
(enrolled ? ‘<span style="font-size:10px;color:#10b981;font-weight:600;">✓ Enrolled</span>’ : ‘<button class="btn btn-sm enrol-btn" data-cid="' + course.id + '" data-pid="' + myPid + '">Enrol</button>’) +
‘</div></div>’;
}).join(’’) + ‘</div></div>’;
c.querySelectorAll(’.enrol-btn’).forEach(btn => btn.addEventListener(‘click’, () => {
const cid=btn.dataset.cid, pid=btn.dataset.pid;
upd(‘people’, p => p.map(x => x.id===pid ? {…x, enrolledCourses:[…(x.enrolledCourses||[]).filter(c=>c!==cid),cid]} : x));
}));
}

// ─── REPORTS ──────────────────────────────────────────────────────────────────
function renderReports(c) {
c.innerHTML = ‘<div style="flex:1;overflow-y:auto;padding:16px;"><div style="max-width:900px;margin:0 auto;">’ +
‘<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;"><h2 style="font-weight:700;font-size:15px;margin:0;">Reports & Analytics</h2>’ +
‘<div style="display:flex;gap:6px;">’ +
‘<button class="btn btn-outline btn-sm" id="exp-proc">↓ Processes</button>’ +
‘<button class="btn btn-outline btn-sm" id="exp-risk">↓ Risks</button>’ +
‘<button class="btn btn-outline btn-sm" id="exp-obl">↓ Obligations</button>’ +
‘</div></div>’ +
‘<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">’ +
‘<div class="card"><div style="font-size:12px;font-weight:700;margin-bottom:10px;">Process Maturity</div>’ + MATURITY.map(m => { const cnt=D.processes.filter(p=>p.maturity===m).length; return ‘<div style="margin-bottom:7px;"><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px;"><span style="color:'+MC(m)+';font-weight:600;">’+m+’</span><span style="color:#64748b;">’+cnt+’</span></div>’+barHTML(D.processes.length?cnt/D.processes.length*100:0,MC(m))+’</div>’; }).join(’’) + ‘</div>’ +
‘<div class="card"><div style="font-size:12px;font-weight:700;margin-bottom:10px;">Risk Heat Map</div>’ + riskMatrixHTML() + ‘</div>’ +
‘<div class="card"><div style="font-size:12px;font-weight:700;margin-bottom:10px;">Obligation Compliance</div>’ + [‘Compliant’,‘In Progress’,‘Non-Compliant’].map(s => { const cnt=D.obligations.filter(o=>o.complianceStatus===s).length; const col=s===‘Compliant’?’#10b981’:s===‘In Progress’?’#f59e0b’:’#ef4444’; return ‘<div style="margin-bottom:7px;"><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px;"><span style="font-weight:600;color:'+col+';">’+s+’</span><span style="color:#64748b;">’+cnt+’</span></div>’+barHTML(D.obligations.length?cnt/D.obligations.length*100:0,col)+’</div>’; }).join(’’) + ‘</div>’ +
‘<div class="card"><div style="font-size:12px;font-weight:700;margin-bottom:10px;">Incident States</div>’ + INC_STATES.map(s => { const cnt=D.incidents.filter(i=>i.state===s).length; return ‘<div style="margin-bottom:7px;"><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px;"><span style="color:'+SC(s)+';font-weight:600;">’+s+’</span><span style="color:#64748b;">’+cnt+’</span></div>’+barHTML(D.incidents.length?cnt/D.incidents.length*100:0,SC(s))+’</div>’; }).join(’’) + ‘</div>’ +
‘</div></div></div>’;
document.getElementById(‘exp-proc’).addEventListener(‘click’, () => exportCSV(‘processes’));
document.getElementById(‘exp-risk’).addEventListener(‘click’, () => exportCSV(‘risks’));
document.getElementById(‘exp-obl’).addEventListener(‘click’,  () => exportCSV(‘obligations’));
c.querySelectorAll(’.risk-cell[data-rid]’).forEach(cell => {
if (cell.dataset.rid) cell.addEventListener(‘click’, () => { riskSel=D.risks.find(x=>x.id===cell.dataset.rid); setTab(‘Risks’); });
});
}

function exportCSV(type) {
let rows = [];
if (type===‘processes’)   rows = D.processes.map(p=>({id:p.id,title:p.title,level:p.level,status:p.status,maturity:p.maturity,owner:pOwner(p.owner),version:p.version,nextReview:p.nextReview||’’}));
else if (type===‘risks’)  rows = D.risks.map(r=>({id:r.id,title:r.title,likelihood:r.likelihood,impact:r.impact,score:rScore(r.likelihood,r.impact),level:rLevel(rScore(r.likelihood,r.impact)),status:r.status}));
else if (type===‘obligations’) rows = D.obligations.map(o=>({id:o.id,title:o.title,type:o.type,regulator:o.regulator,status:o.complianceStatus}));
if (!rows.length) return;
const keys = Object.keys(rows[0]);
const csv = [keys, …rows.map(r => keys.map(k => ‘”’ + String(r[k]||’’).replace(/”/g,’””’).replace(/\n/g,’ ‘) + ‘”’))].map(r=>r.join(’,’)).join(’\n’);
const a = document.createElement(‘a’); a.href=URL.createObjectURL(new Blob([csv],{type:‘text/csv’})); a.download=type+’.csv’; a.click();
}

// ─── AUDIT ────────────────────────────────────────────────────────────────────
function renderAudit(c) {
c.innerHTML = ‘<div style="flex:1;overflow-y:auto;padding:16px;"><div style="max-width:900px;margin:0 auto;"><h2 style="font-weight:700;font-size:14px;margin-bottom:12px;">Audit Log</h2>’ +
‘<div class="card" style="padding:0;overflow:hidden;"><table class="tbl">’ + tblHeader([‘Timestamp’,‘User’,‘Action’,‘Type’,‘Entity’,‘Detail’]) +
‘<tbody>’ + D.auditLog.map((e,i) => ‘<tr><td style="color:#94a3b8;white-space:nowrap;">’ + esc(e.timestamp) + ‘</td><td style="font-weight:600;">’ + esc(e.user) + ‘</td><td>’ + badge(e.action, e.action===‘Approved’?’#10b981’:e.action.includes(‘Delete’)?’#ef4444’:’#6366f1’) + ‘</td><td>’ + esc(e.entityType) + ‘</td><td style="font-weight:500;">’ + esc(e.entityTitle) + ‘</td><td style="color:#64748b;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">’ + esc(e.detail) + ‘</td></tr>’).join(’’) +
‘</tbody></table></div></div></div>’;
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function renderDashboard(c) {
const notifs = getNotifs();
c.innerHTML = ‘<div style="flex:1;overflow-y:auto;padding:16px;"><div style="max-width:900px;margin:0 auto;">’ +
‘<h2 style="font-weight:700;font-size:14px;margin-bottom:12px;">Enterprise Dashboard</h2>’ +
statCards([{l:‘Processes’,v:D.processes.length,c:’#6366f1’},{l:‘Open Risks’,v:D.risks.filter(r=>r.status===‘Open’).length,c:’#ef4444’},{l:‘Compliance’,v:Math.round(D.obligations.filter(o=>o.complianceStatus===‘Compliant’).length/Math.max(1,D.obligations.length)*100)+’%’,c:’#10b981’},{l:‘Notifications’,v:notifs.length,c:’#f59e0b’}]) +
‘<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">’ +
‘<div class="card"><div style="font-size:11px;font-weight:700;margin-bottom:9px;">Process Status</div>’ + APR_STATES.slice(0,4).map(s => { const cnt=D.processes.filter(p=>p.status===s).length; return ‘<div style="margin-bottom:7px;"><div style="display:flex;justify-content:space-between;font-size:10px;color:#64748b;margin-bottom:2px;"><span>’+s+’</span><span>’+cnt+’</span></div>’+barHTML(D.processes.length?cnt/D.processes.length*100:0,SC(s))+’</div>’; }).join(’’) + ‘</div>’ +
‘<div class="card"><div style="font-size:11px;font-weight:700;margin-bottom:9px;">Risk by Level</div>’ + [‘Critical’,‘High’,‘Medium’,‘Low’].map(lv => { const cnt=D.risks.filter(r=>rLevel(rScore(r.likelihood,r.impact))===lv&&r.status!==‘Closed’).length; return ‘<div style="margin-bottom:7px;"><div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:2px;"><span style="color:'+PC(lv)+';font-weight:600;">’+lv+’</span><span style="color:#64748b;">’+cnt+’</span></div>’+barHTML(D.risks.length?cnt/D.risks.length*100:0,PC(lv))+’</div>’; }).join(’’) + ‘</div>’ +
‘<div class="card"><div style="font-size:11px;font-weight:700;margin-bottom:9px;">Obligations</div>’ + [‘Compliant’,‘In Progress’,‘Non-Compliant’].map(s => { const cnt=D.obligations.filter(o=>o.complianceStatus===s).length; const col=s===‘Compliant’?’#10b981’:s===‘In Progress’?’#f59e0b’:’#ef4444’; return ‘<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;"><div style="display:flex;align-items:center;gap:7px;"><div style="width:8px;height:8px;border-radius:50%;background:'+col+';"></div><span style="font-size:11px;color:#64748b;">’+s+’</span></div><span style="font-size:13px;font-weight:800;">’+cnt+’</span></div>’; }).join(’’) + ‘</div>’ +
‘<div class="card" id="dash-notifs"><div style="font-size:11px;font-weight:700;margin-bottom:9px;">Notifications</div>’ + (notifs.length ? notifs.slice(0,5).map(n => ‘<div class="notif-item" data-notif-idx="' + notifs.indexOf(n) + '"><span style="font-size:13px;flex-shrink:0;">’ + n.icon + ‘</span><div><div style="font-size:11px;font-weight:600;color:#334155;">’ + esc(n.title) + ‘</div><div style="font-size:10px;color:#64748b;">’ + esc(n.body) + ‘</div></div></div>’).join(’’) : ‘<p style="font-size:11px;color:#94a3b8;">All clear ✓</p>’) + ‘</div>’ +
‘</div></div></div>’;
const dn = document.getElementById(‘dash-notifs’);
if (dn) {
dn.querySelectorAll(’[data-notif-idx]’).forEach(el => {
el.addEventListener(‘click’, () => { notifs[+el.dataset.notifIdx]?.go(); });
});
}
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
function renderAdmin(c) {
if (getRole() !== ‘admin’) { c.innerHTML = ‘<div style="padding:40px;color:#94a3b8;">Access denied.</div>’; return; }
c.innerHTML = ‘<div style="flex:1;overflow-y:auto;padding:16px;"><div style="max-width:860px;margin:0 auto;">’ +
‘<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;"><h2 style="font-weight:700;font-size:14px;margin:0;">⚙️ Admin Panel</h2>’ +
(!isPreview ? ‘<button class="btn btn-sm" id="preview-btn">👁 Preview as User</button>’ : ‘’) + ‘</div>’ +
statCards([{l:‘Total Users’,v:D.users.length,c:’#6366f1’},{l:‘Admins’,v:D.users.filter(u=>u.role===‘admin’).length,c:’#ef4444’},{l:‘Regular Users’,v:D.users.filter(u=>u.role===‘user’).length,c:’#10b981’},{l:‘People’,v:D.people.length,c:’#f59e0b’}]) +
‘<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px;"><div style="font-size:12px;font-weight:700;">User Accounts</div><button class="btn btn-sm" id="new-user-btn">+ New User</button></div>’ +
‘<div class="card" style="padding:0;overflow:hidden;margin-bottom:16px;"><table class="tbl">’ + tblHeader([’’,‘Username’,‘Name’,‘Role’,‘Actions’]) +
‘<tbody>’ + D.users.map((u,i) => ‘<tr><td><div style="width:24px;height:24px;border-radius:50%;background:' + (u.role==='admin'?'#6366f1':'#10b981') + '22;border:2px solid ' + (u.role==='admin'?'#6366f1':'#10b981') + ';display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:' + (u.role==='admin'?'#6366f1':'#10b981') + ';">’ + esc(u.avatar||u.name?.[0]||’?’) + ‘</div></td><td style="font-weight:700;">’ + esc(u.username) + ‘</td><td>’ + esc(u.name) + ‘</td><td>’ + badge(u.role.toUpperCase(),u.role===‘admin’?’#6366f1’:’#10b981’) + ‘</td><td style="display:flex;gap:5px;"><button class="btn btn-outline btn-sm" data-edit-user="' + u.id + '">Edit</button>’ + (u.id!==currentUser?.id ? ‘<button class="btn btn-danger btn-sm" data-del-user="' + u.id + '">Delete</button>’ : ‘<span style="font-size:9px;color:#94a3b8;">You</span>’) + ‘</td></tr>’).join(’’) +
‘</tbody></table></div>’ +
‘<h3 style="font-weight:700;font-size:13px;margin-bottom:10px;">Org Chart</h3>’ +
‘<div class="card" style="overflow-x:auto;padding:20px;"><div style="display:flex;justify-content:center;" id="org-chart"></div></div>’ +
‘</div></div>’;

const pb = c.querySelector(’#preview-btn’); if (pb) pb.addEventListener(‘click’, () => { isPreview=true; document.getElementById(‘preview-banner’).classList.remove(‘hidden’); setTab(‘Processes’); });
const nu = c.querySelector(’#new-user-btn’); if (nu) nu.addEventListener(‘click’, () => openUserModal(null));
c.querySelectorAll(’[data-edit-user]’).forEach(b => b.addEventListener(‘click’, () => openUserModal(b.dataset.editUser)));
c.querySelectorAll(’[data-del-user]’).forEach(b => b.addEventListener(‘click’, () => { upd(‘users’, p=>p.filter(x=>x.id!==b.dataset.delUser)); }));
renderOrgChart();
}

function renderOrgChart() {
const el = document.getElementById(‘org-chart’); if (!el) return;
const roots = D.people.filter(p=>!p.reportsTo);
el.innerHTML = roots.map(p => orgNodeHTML(p)).join(’’);
el.querySelectorAll(’[data-person-id]’).forEach(node => {
node.addEventListener(‘click’, () => { const p=D.people.find(x=>x.id===node.dataset.personId); if(p) openPersonModal(p); });
});
}

function orgNodeHTML(person) {
const reps = D.people.filter(p=>p.reportsTo===person.id);
return ‘<div class="org-wrap"><div class="org-node" data-person-id="' + person.id + '">’ +
‘<div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:12px;margin:0 auto 5px;">’ + esc(person.avatar||person.name[0]) + ‘</div>’ +
‘<div style="font-size:12px;font-weight:700;">’ + esc(person.name) + ‘</div>’ +
‘<div style="font-size:10px;color:#64748b;">’ + esc(person.title) + ‘</div>’ +
‘<div style="font-size:9px;color:#94a3b8;">’ + esc(person.dept) + ‘</div></div>’ +
(reps.length ? ‘<div class="org-children">’ + reps.map(r => ‘<div style="display:flex;flex-direction:column;align-items:center;"><div style="width:1px;height:16px;background:#e2e8f0;"></div>’ + orgNodeHTML(r) + ‘</div>’).join(’’) + ‘</div>’ : ‘’) +
‘</div>’;
}

// ─── MODALS ───────────────────────────────────────────────────────────────────
function openProcModal(id) {
const p = id ? D.processes.find(x=>x.id===id) : {id:`PR${uid()}`,title:’’,level:‘Level 3 — Process’,owner:’’,version:‘1.0’,status:‘Draft’,maturity:‘Initial’,description:’’,reviewFrequency:‘Quarterly’,nextReview:’’,kpis:[],procedures:[],relatedPolicies:[],tags:[],changeLog:[]};
openModal(id ? ‘Edit Process’ : ‘New Process’,
‘<div class="field"><label>Title</label><input class="inp" id="m-title" value="' + esc(p.title) + '"/></div>’ +
‘<div class="grid2">’ +
‘<div class="field"><label>Level</label><select class="inp" id="m-level">’ + selectOpts(PROC_LEVELS,p.level) + ‘</select></div>’ +
‘<div class="field"><label>Owner</label><select class="inp" id="m-owner">’ + peopleOpts(p.owner) + ‘</select></div>’ +
‘<div class="field"><label>Status</label><select class="inp" id="m-status">’ + selectOpts(APR_STATES,p.status) + ‘</select></div>’ +
‘<div class="field"><label>Maturity</label><select class="inp" id="m-maturity">’ + selectOpts(MATURITY,p.maturity) + ‘</select></div>’ +
‘<div class="field"><label>Version</label><input class="inp" id="m-version" value="' + esc(p.version) + '"/></div>’ +
‘<div class="field"><label>Next Review</label><input class="inp" type="date" id="m-nextReview" value="' + esc(p.nextReview||'') + '"/></div>’ +
‘</div>’ +
‘<div class="field"><label>Description</label><textarea class="inp" id="m-desc" style="height:70px;">’ + esc(p.description) + ‘</textarea></div>’ +
‘<div class="field"><label>Procedures (one per line)</label><textarea class="inp" id="m-procs" style="height:60px;">’ + esc((p.procedures||[]).join(’\n’)) + ‘</textarea></div>’ +
‘<div class="modal-footer" id="mf"></div>’, true);
const mf = document.getElementById(‘mf’);
if (id) { const db=document.createElement(‘button’); db.className=‘btn btn-danger btn-sm’; db.textContent=‘Delete’; db.addEventListener(‘click’,()=>{upd(‘processes’,p=>p.filter(x=>x.id!==id));procSel=null;closeModal();}); mf.appendChild(db); }
const cb=document.createElement(‘button’); cb.className=‘btn btn-outline btn-sm’; cb.textContent=‘Cancel’; cb.addEventListener(‘click’,closeModal); mf.appendChild(cb);
const sb=document.createElement(‘button’); sb.className=‘btn btn-sm’; sb.textContent=‘Save’; sb.addEventListener(‘click’,()=>{
const item={id:p.id,title:document.getElementById(‘m-title’).value,level:document.getElementById(‘m-level’).value,owner:document.getElementById(‘m-owner’).value,version:document.getElementById(‘m-version’).value,status:document.getElementById(‘m-status’).value,maturity:document.getElementById(‘m-maturity’).value,description:document.getElementById(‘m-desc’).value,nextReview:document.getElementById(‘m-nextReview’).value,procedures:document.getElementById(‘m-procs’).value.split(’\n’).filter(Boolean)};
const ex=D.processes.find(x=>x.id===p.id);
if(ex) upd(‘processes’,arr=>arr.map(x=>x.id===p.id?{…x,…item}:x));
else upd(‘processes’,arr=>[…arr,{…item,reviewFrequency:‘Quarterly’,kpis:[],relatedPolicies:[],tags:[],changeLog:[]}]);
addAudit(ex?‘Updated’:‘Created’,‘Process’,item.title,‘v’+item.version);
procSel=D.processes.find(x=>x.id===p.id); closeModal();
}); mf.appendChild(sb);
}

function openPolModal(id) {
const p = id ? D.policies.find(x=>x.id===id) : {id:`POL${uid()}`,title:’’,category:‘Compliance’,owner:’’,version:‘1.0’,status:‘Draft’,description:’’,reviewDate:’’,obligationIds:[],relatedProcessIds:[],content:’## Purpose\n\n## Scope\n\n## Requirements\n’,changeLog:[]};
openModal(id?‘Edit Policy’:‘New Policy’,
‘<div class="field"><label>Title</label><input class="inp" id="m-title" value="' + esc(p.title) + '"/></div>’ +
‘<div class="grid2">’ +
‘<div class="field"><label>Category</label><input class="inp" id="m-cat" value="' + esc(p.category) + '"/></div>’ +
‘<div class="field"><label>Owner</label><select class="inp" id="m-owner">’ + peopleOpts(p.owner) + ‘</select></div>’ +
‘<div class="field"><label>Status</label><select class="inp" id="m-status">’ + selectOpts(APR_STATES,p.status) + ‘</select></div>’ +
‘<div class="field"><label>Version</label><input class="inp" id="m-version" value="' + esc(p.version) + '"/></div>’ +
‘<div class="field"><label>Review Date</label><input class="inp" type="date" id="m-reviewDate" value="' + esc(p.reviewDate||'') + '"/></div>’ +
‘</div>’ +
‘<div class="field"><label>Description</label><textarea class="inp" id="m-desc" style="height:60px;">’ + esc(p.description) + ‘</textarea></div>’ +
‘<div class="field"><label>Content</label><textarea class="inp" id="m-content" style="height:120px;font-family:monospace;font-size:12px;">’ + esc(p.content||’’) + ‘</textarea></div>’ +
‘<div class="modal-footer" id="mf"></div>’, true);
const mf=document.getElementById(‘mf’);
if(id){const db=document.createElement(‘button’);db.className=‘btn btn-danger btn-sm’;db.textContent=‘Delete’;db.addEventListener(‘click’,()=>{upd(‘policies’,arr=>arr.filter(x=>x.id!==id));polSel=null;closeModal();});mf.appendChild(db);}
const cb=document.createElement(‘button’);cb.className=‘btn btn-outline btn-sm’;cb.textContent=‘Cancel’;cb.addEventListener(‘click’,closeModal);mf.appendChild(cb);
const sb=document.createElement(‘button’);sb.className=‘btn btn-sm’;sb.textContent=‘Save’;sb.addEventListener(‘click’,()=>{
const item={id:p.id,title:document.getElementById(‘m-title’).value,category:document.getElementById(‘m-cat’).value,owner:document.getElementById(‘m-owner’).value,version:document.getElementById(‘m-version’).value,status:document.getElementById(‘m-status’).value,description:document.getElementById(‘m-desc’).value,reviewDate:document.getElementById(‘m-reviewDate’).value,content:document.getElementById(‘m-content’).value};
const ex=D.policies.find(x=>x.id===p.id);
if(ex) upd(‘policies’,arr=>arr.map(x=>x.id===p.id?{…x,…item}:x));
else upd(‘policies’,arr=>[…arr,{…item,obligationIds:[],relatedProcessIds:[],changeLog:[]}]);
addAudit(ex?‘Updated’:‘Created’,‘Policy’,item.title,‘v’+item.version);
polSel=D.policies.find(x=>x.id===p.id); closeModal();
});mf.appendChild(sb);
}

function openOblModal(id) {
const o = id ? D.obligations.find(x=>x.id===id) : {id:`OBL${uid()}`,title:’’,type:‘Regulation’,regulator:’’,jurisdiction:‘Australia’,description:’’,complianceStatus:‘Compliant’,owner:’’,reviewDate:’’,linkedPolicyIds:[],linkedProcessIds:[],controls:[],notes:’’};
openModal(id?‘Edit Obligation’:‘New Obligation’,
‘<div class="field"><label>Title</label><input class="inp" id="m-title" value="' + esc(o.title) + '"/></div>’ +
‘<div class="grid2">’ +
‘<div class="field"><label>Type</label><select class="inp" id="m-type">’ + selectOpts(OBL_TYPES,o.type) + ‘</select></div>’ +
‘<div class="field"><label>Regulator</label><input class="inp" id="m-reg" value="' + esc(o.regulator) + '"/></div>’ +
‘<div class="field"><label>Compliance Status</label><select class="inp" id="m-cs">’ + selectOpts([‘Compliant’,‘In Progress’,‘Non-Compliant’],o.complianceStatus) + ‘</select></div>’ +
‘<div class="field"><label>Owner</label><select class="inp" id="m-owner">’ + peopleOpts(o.owner) + ‘</select></div>’ +
‘<div class="field"><label>Review Date</label><input class="inp" type="date" id="m-reviewDate" value="' + esc(o.reviewDate||'') + '"/></div>’ +
‘</div>’ +
‘<div class="field"><label>Description</label><textarea class="inp" id="m-desc" style="height:70px;">’ + esc(o.description) + ‘</textarea></div>’ +
‘<div class="field"><label>Notes</label><input class="inp" id="m-notes" value="' + esc(o.notes||'') + '"/></div>’ +
‘<div class="modal-footer" id="mf"></div>’, true);
const mf=document.getElementById(‘mf’);
if(id){const db=document.createElement(‘button’);db.className=‘btn btn-danger btn-sm’;db.textContent=‘Delete’;db.addEventListener(‘click’,()=>{upd(‘obligations’,arr=>arr.filter(x=>x.id!==id));oblSel=null;closeModal();});mf.appendChild(db);}
const cb=document.createElement(‘button’);cb.className=‘btn btn-outline btn-sm’;cb.textContent=‘Cancel’;cb.addEventListener(‘click’,closeModal);mf.appendChild(cb);
const sb=document.createElement(‘button’);sb.className=‘btn btn-sm’;sb.textContent=‘Save’;sb.addEventListener(‘click’,()=>{
const item={id:o.id,title:document.getElementById(‘m-title’).value,type:document.getElementById(‘m-type’).value,regulator:document.getElementById(‘m-reg’).value,complianceStatus:document.getElementById(‘m-cs’).value,owner:document.getElementById(‘m-owner’).value,reviewDate:document.getElementById(‘m-reviewDate’).value,description:document.getElementById(‘m-desc’).value,notes:document.getElementById(‘m-notes’).value};
const ex=D.obligations.find(x=>x.id===o.id);
if(ex) upd(‘obligations’,arr=>arr.map(x=>x.id===o.id?{…x,…item}:x));
else upd(‘obligations’,arr=>[…arr,{…item,jurisdiction:‘Australia’,linkedPolicyIds:[],linkedProcessIds:[],controls:[]}]);
oblSel=D.obligations.find(x=>x.id===o.id); closeModal();
});mf.appendChild(sb);
}

function openRiskModal(id) {
const r = id ? D.risks.find(x=>x.id===id) : {id:`RSK${uid()}`,title:’’,category:‘Operational’,likelihood:‘Possible’,impact:‘Moderate’,status:‘Open’,owner:’’,description:’’,linkedProcessIds:[],treatments:[],residualLikelihood:‘Unlikely’,residualImpact:‘Minor’,reviewDate:’’,notes:’’};
openModal(id?‘Edit Risk’:‘New Risk’,
‘<div class="field"><label>Title</label><input class="inp" id="m-title" value="' + esc(r.title) + '"/></div>’ +
‘<div class="grid2">’ +
‘<div class="field"><label>Category</label><input class="inp" id="m-cat" value="' + esc(r.category) + '"/></div>’ +
‘<div class="field"><label>Status</label><select class="inp" id="m-status">’ + selectOpts(RISK_S,r.status) + ‘</select></div>’ +
‘<div class="field"><label>Likelihood</label><select class="inp" id="m-like">’ + selectOpts(RISK_L,r.likelihood) + ‘</select></div>’ +
‘<div class="field"><label>Impact</label><select class="inp" id="m-imp">’ + selectOpts(RISK_I,r.impact) + ‘</select></div>’ +
‘<div class="field"><label>Owner</label><select class="inp" id="m-owner">’ + peopleOpts(r.owner) + ‘</select></div>’ +
‘<div class="field"><label>Review Date</label><input class="inp" type="date" id="m-reviewDate" value="' + esc(r.reviewDate||'') + '"/></div>’ +
‘</div>’ +
‘<div class="field"><label>Description</label><textarea class="inp" id="m-desc" style="height:70px;">’ + esc(r.description) + ‘</textarea></div>’ +
‘<div class="field"><label>Treatments (one per line)</label><textarea class="inp" id="m-treats" style="height:60px;">’ + esc((r.treatments||[]).join(’\n’)) + ‘</textarea></div>’ +
‘<div class="modal-footer" id="mf"></div>’, true);
const mf=document.getElementById(‘mf’);
if(id){const db=document.createElement(‘button’);db.className=‘btn btn-danger btn-sm’;db.textContent=‘Delete’;db.addEventListener(‘click’,()=>{upd(‘risks’,arr=>arr.filter(x=>x.id!==id));riskSel=null;closeModal();});mf.appendChild(db);}
const cb=document.createElement(‘button’);cb.className=‘btn btn-outline btn-sm’;cb.textContent=‘Cancel’;cb.addEventListener(‘click’,closeModal);mf.appendChild(cb);
const sb=document.createElement(‘button’);sb.className=‘btn btn-sm’;sb.textContent=‘Save’;sb.addEventListener(‘click’,()=>{
const item={id:r.id,title:document.getElementById(‘m-title’).value,category:document.getElementById(‘m-cat’).value,status:document.getElementById(‘m-status’).value,likelihood:document.getElementById(‘m-like’).value,impact:document.getElementById(‘m-imp’).value,owner:document.getElementById(‘m-owner’).value,reviewDate:document.getElementById(‘m-reviewDate’).value,description:document.getElementById(‘m-desc’).value,treatments:document.getElementById(‘m-treats’).value.split(’\n’).filter(Boolean)};
const ex=D.risks.find(x=>x.id===r.id);
if(ex) upd(‘risks’,arr=>arr.map(x=>x.id===r.id?{…x,…item}:x));
else upd(‘risks’,arr=>[…arr,{…item,linkedProcessIds:[],residualLikelihood:‘Unlikely’,residualImpact:‘Minor’,notes:’’}]);
addAudit(ex?‘Updated’:‘Created’,‘Risk’,item.title,’’);
riskSel=D.risks.find(x=>x.id===r.id); closeModal();
});mf.appendChild(sb);
}

function openRaciModal(procId) {
openModal(‘Assign RACI’,
‘<div class="field"><label>Person</label><select class="inp" id="m-role">’ + peopleOpts(’’) + ‘</select></div>’ +
‘<div class="field"><label>Type</label><select class="inp" id="m-type">’ + selectOpts(RACI_T,‘Responsible’) + ‘</select></div>’ +
‘<div class="field"><label>Notes</label><input class="inp" id="m-notes" value=""/></div>’ +
‘<div class="modal-footer" id="mf"></div>’);
const mf=document.getElementById(‘mf’);
const cb=document.createElement(‘button’);cb.className=‘btn btn-outline btn-sm’;cb.textContent=‘Cancel’;cb.addEventListener(‘click’,closeModal);mf.appendChild(cb);
const sb=document.createElement(‘button’);sb.className=‘btn btn-sm’;sb.textContent=‘Save’;sb.addEventListener(‘click’,()=>{
upd(‘raci’,arr=>[…arr,{id:uid(),processId:procId,roleId:document.getElementById(‘m-role’).value,type:document.getElementById(‘m-type’).value,notes:document.getElementById(‘m-notes’).value}]); closeModal();
});mf.appendChild(sb);
}

function openIncModal(id) {
const inc = id ? D.incidents.find(x=>x.id===id) : {id:`INC-${String(D.incidents.length+1).padStart(3,'0')}`,title:’’,priority:‘Medium’,state:‘New’,assignee:’’,description:’’,createdAt:today(),notes:’’};
openModal(id?‘Edit Incident’:‘New Incident’,
‘<div class="field"><label>Title</label><input class="inp" id="m-title" value="' + esc(inc.title) + '"/></div>’ +
‘<div class="grid2">’ +
‘<div class="field"><label>Priority</label><select class="inp" id="m-pri">’ + selectOpts(PRIORITIES,inc.priority) + ‘</select></div>’ +
‘<div class="field"><label>State</label><select class="inp" id="m-state">’ + selectOpts(INC_STATES,inc.state) + ‘</select></div>’ +
‘<div class="field"><label>Assignee</label><select class="inp" id="m-assignee"><option value="">— Unassigned —</option>’ + D.people.map(p=>’<option value=”’+esc(p.name)+’”’+(p.name===inc.assignee?’ selected’:’’)+’>’+esc(p.name)+’</option>’).join(’’) + ‘</select></div>’ +
‘</div>’ +
‘<div class="field"><label>Description</label><textarea class="inp" id="m-desc" style="height:80px;">’ + esc(inc.description) + ‘</textarea></div>’ +
‘<div class="modal-footer" id="mf"></div>’);
const mf=document.getElementById(‘mf’);
const cb=document.createElement(‘button’);cb.className=‘btn btn-outline btn-sm’;cb.textContent=‘Cancel’;cb.addEventListener(‘click’,closeModal);mf.appendChild(cb);
const sb=document.createElement(‘button’);sb.className=‘btn btn-sm’;sb.textContent=‘Save’;sb.addEventListener(‘click’,()=>{
const item={id:inc.id,title:document.getElementById(‘m-title’).value,priority:document.getElementById(‘m-pri’).value,state:document.getElementById(‘m-state’).value,assignee:document.getElementById(‘m-assignee’).value,description:document.getElementById(‘m-desc’).value};
const ex=D.incidents.find(x=>x.id===inc.id);
if(ex) upd(‘incidents’,arr=>arr.map(x=>x.id===inc.id?{…x,…item}:x));
else upd(‘incidents’,arr=>[…arr,{…item,createdAt:today(),notes:’’}]);
closeModal();
});mf.appendChild(sb);
}

function openChgModal(id) {
const ch = id ? D.changes.find(x=>x.id===id) : {id:`CHG-${String(D.changes.length+1).padStart(3,'0')}`,title:’’,priority:‘Medium’,state:‘Draft’,assignee:’’,type:‘Normal’,description:’’,createdAt:today(),scheduledAt:’’};
openModal(id?‘Edit Change’:‘New Change’,
‘<div class="field"><label>Title</label><input class="inp" id="m-title" value="' + esc(ch.title) + '"/></div>’ +
‘<div class="grid2">’ +
‘<div class="field"><label>Type</label><select class="inp" id="m-type">’ + selectOpts([‘Standard’,‘Normal’,‘Emergency’],ch.type) + ‘</select></div>’ +
‘<div class="field"><label>Priority</label><select class="inp" id="m-pri">’ + selectOpts(PRIORITIES,ch.priority) + ‘</select></div>’ +
‘<div class="field"><label>State</label><select class="inp" id="m-state">’ + selectOpts(CHG_STATES,ch.state) + ‘</select></div>’ +
‘<div class="field"><label>Scheduled Date</label><input class="inp" type="date" id="m-sched" value="' + esc(ch.scheduledAt||'') + '"/></div>’ +
‘</div>’ +
‘<div class="field"><label>Description</label><textarea class="inp" id="m-desc" style="height:80px;">’ + esc(ch.description) + ‘</textarea></div>’ +
‘<div class="modal-footer" id="mf"></div>’);
const mf=document.getElementById(‘mf’);
const cb=document.createElement(‘button’);cb.className=‘btn btn-outline btn-sm’;cb.textContent=‘Cancel’;cb.addEventListener(‘click’,closeModal);mf.appendChild(cb);
const sb=document.createElement(‘button’);sb.className=‘btn btn-sm’;sb.textContent=‘Save’;sb.addEventListener(‘click’,()=>{
const item={id:ch.id,title:document.getElementById(‘m-title’).value,type:document.getElementById(‘m-type’).value,priority:document.getElementById(‘m-pri’).value,state:document.getElementById(‘m-state’).value,scheduledAt:document.getElementById(‘m-sched’).value,description:document.getElementById(‘m-desc’).value};
const ex=D.changes.find(x=>x.id===ch.id);
if(ex) upd(‘changes’,arr=>arr.map(x=>x.id===ch.id?{…x,…item}:x));
else upd(‘changes’,arr=>[…arr,{…item,createdAt:today()}]);
closeModal();
});mf.appendChild(sb);
}

function openAssetModal(id) {
const a = id ? D.assets.find(x=>x.id===id) : {id:`CI-${uid()}`,name:’’,type:‘Application’,status:‘Operational’,owner:‘Technology’,version:’’,criticality:‘High’,description:’’};
openModal(‘Configuration Item’,
‘<div class="field"><label>Name</label><input class="inp" id="m-name" value="' + esc(a.name) + '"/></div>’ +
‘<div class="grid2">’ +
‘<div class="field"><label>Type</label><select class="inp" id="m-type">’ + selectOpts([‘Application’,‘Infrastructure’,‘Database’,‘Network’,‘Service’],a.type) + ‘</select></div>’ +
‘<div class="field"><label>Status</label><select class="inp" id="m-status">’ + selectOpts([‘Operational’,‘Maintenance’,‘Degraded’,‘Decommissioned’],a.status) + ‘</select></div>’ +
‘<div class="field"><label>Criticality</label><select class="inp" id="m-crit">’ + selectOpts(PRIORITIES,a.criticality) + ‘</select></div>’ +
‘<div class="field"><label>Version</label><input class="inp" id="m-version" value="' + esc(a.version||'') + '"/></div>’ +
‘</div>’ +
‘<div class="field"><label>Description</label><textarea class="inp" id="m-desc" style="height:70px;">’ + esc(a.description) + ‘</textarea></div>’ +
‘<div class="modal-footer" id="mf"></div>’);
const mf=document.getElementById(‘mf’);
const cb=document.createElement(‘button’);cb.className=‘btn btn-outline btn-sm’;cb.textContent=‘Cancel’;cb.addEventListener(‘click’,closeModal);mf.appendChild(cb);
const sb=document.createElement(‘button’);sb.className=‘btn btn-sm’;sb.textContent=‘Save’;sb.addEventListener(‘click’,()=>{
const item={id:a.id,name:document.getElementById(‘m-name’).value,type:document.getElementById(‘m-type’).value,status:document.getElementById(‘m-status’).value,criticality:document.getElementById(‘m-crit’).value,version:document.getElementById(‘m-version’).value,description:document.getElementById(‘m-desc’).value,owner:‘Technology’};
const ex=D.assets.find(x=>x.id===a.id);
if(ex) upd(‘assets’,arr=>arr.map(x=>x.id===a.id?{…x,…item}:x));
else upd(‘assets’,arr=>[…arr,item]);
closeModal();
});mf.appendChild(sb);
}

function openIssModal(id, defaultState) {
const iss = id ? D.issues.find(x=>x.id===id) : {id:`ISS-${uid()}`,projectId:activePrj,sprintId:activeSpr,title:’’,state:defaultState||‘To Do’,priority:‘Medium’,assignee:’’,storyPoints:3,description:’’,createdAt:today()};
openModal(id?‘Edit Issue’:‘New Issue’,
‘<div class="field"><label>Title</label><input class="inp" id="m-title" value="' + esc(iss.title) + '"/></div>’ +
‘<div class="grid2">’ +
‘<div class="field"><label>Priority</label><select class="inp" id="m-pri">’ + selectOpts(PRIORITIES,iss.priority) + ‘</select></div>’ +
‘<div class="field"><label>State</label><select class="inp" id="m-state">’ + selectOpts(ISS_STATES,iss.state) + ‘</select></div>’ +
‘<div class="field"><label>Assignee</label><select class="inp" id="m-assignee">’ + peopleOpts(iss.assignee) + ‘</select></div>’ +
‘<div class="field"><label>Story Points</label><input class="inp" type="number" id="m-pts" value="' + iss.storyPoints + '"/></div>’ +
‘<div class="field"><label>Sprint</label><select class="inp" id="m-sprint"><option value="">Backlog</option>’ + D.sprints.filter(s=>s.projectId===activePrj).map(s=>’<option value=”’+s.id+’”’+(s.id===iss.sprintId?’ selected’:’’)+’>’+esc(s.title)+’</option>’).join(’’) + ‘</select></div>’ +
‘</div>’ +
‘<div class="field"><label>Description</label><textarea class="inp" id="m-desc" style="height:70px;">’ + esc(iss.description) + ‘</textarea></div>’ +
‘<div class="modal-footer" id="mf"></div>’);
const mf=document.getElementById(‘mf’);
if(id){const db=document.createElement(‘button’);db.className=‘btn btn-danger btn-sm’;db.textContent=‘Delete’;db.addEventListener(‘click’,()=>{upd(‘issues’,arr=>arr.filter(x=>x.id!==id));closeModal();});mf.appendChild(db);}
const cb=document.createElement(‘button’);cb.className=‘btn btn-outline btn-sm’;cb.textContent=‘Cancel’;cb.addEventListener(‘click’,closeModal);mf.appendChild(cb);
const sb=document.createElement(‘button’);sb.className=‘btn btn-sm’;sb.textContent=‘Save’;sb.addEventListener(‘click’,()=>{
const item={id:iss.id,projectId:activePrj,sprintId:document.getElementById(‘m-sprint’).value||null,title:document.getElementById(‘m-title’).value,state:document.getElementById(‘m-state’).value,priority:document.getElementById(‘m-pri’).value,assignee:document.getElementById(‘m-assignee’).value,storyPoints:+document.getElementById(‘m-pts’).value,description:document.getElementById(‘m-desc’).value};
const ex=D.issues.find(x=>x.id===iss.id);
if(ex) upd(‘issues’,arr=>arr.map(x=>x.id===iss.id?{…x,…item}:x));
else upd(‘issues’,arr=>[…arr,{…item,createdAt:today()}]);
closeModal();
});mf.appendChild(sb);
}

function openPageModal(id) {
const pg = id ? D.pages.find(x=>x.id===id) : {id:`PG${uid()}`,projectId:activePrj,title:’’,content:’’,createdAt:today(),updatedAt:today(),author:currentUser?.name||’’};
openModal(id?‘Edit Page’:‘New Page’,
‘<div class="field"><label>Title</label><input class="inp" id="m-title" value="' + esc(pg.title) + '"/></div>’ +
‘<div class="field"><label>Content</label><textarea class="inp" id="m-content" style="height:200px;font-family:monospace;font-size:12px;">’ + esc(pg.content) + ‘</textarea></div>’ +
‘<div class="modal-footer" id="mf"></div>’, true);
const mf=document.getElementById(‘mf’);
if(id){const db=document.createElement(‘button’);db.className=‘btn btn-danger btn-sm’;db.textContent=‘Delete’;db.addEventListener(‘click’,()=>{upd(‘pages’,arr=>arr.filter(x=>x.id!==id));pageView=null;closeModal();});mf.appendChild(db);}
const cb=document.createElement(‘button’);cb.className=‘btn btn-outline btn-sm’;cb.textContent=‘Cancel’;cb.addEventListener(‘click’,closeModal);mf.appendChild(cb);
const sb=document.createElement(‘button’);sb.className=‘btn btn-sm’;sb.textContent=‘Save’;sb.addEventListener(‘click’,()=>{
const item={id:pg.id,projectId:activePrj,title:document.getElementById(‘m-title’).value,content:document.getElementById(‘m-content’).value,updatedAt:today(),author:currentUser?.name||’’};
const ex=D.pages.find(x=>x.id===pg.id);
if(ex) upd(‘pages’,arr=>arr.map(x=>x.id===pg.id?{…x,…item}:x));
else upd(‘pages’,arr=>[…arr,{…item,createdAt:today()}]);
pageView=D.pages.find(x=>x.id===pg.id); closeModal();
});mf.appendChild(sb);
}

function openWorkflowModal(id) {
const wf = id ? D.workflows.find(x=>x.id===id) : {id:`WF${uid()}`,name:’’,steps:[]};
openModal(id?‘Edit Workflow’:‘New Workflow’,
‘<div class="field"><label>Name</label><input class="inp" id="m-name" value="' + esc(wf.name) + '"/></div>’ +
‘<div class="field"><label>Steps (comma-separated)</label><input class="inp" id="m-steps" value="' + esc(wf.steps.map(s=>s.name).join(',')) + '" placeholder="Draft,Review,Approve,Publish"/></div>’ +
‘<div class="modal-footer" id="mf"></div>’);
const mf=document.getElementById(‘mf’);
const cb=document.createElement(‘button’);cb.className=‘btn btn-outline btn-sm’;cb.textContent=‘Cancel’;cb.addEventListener(‘click’,closeModal);mf.appendChild(cb);
const sb=document.createElement(‘button’);sb.className=‘btn btn-sm’;sb.textContent=‘Save’;sb.addEventListener(‘click’,()=>{
const item={id:wf.id,name:document.getElementById(‘m-name’).value,steps:document.getElementById(‘m-steps’).value.split(’,’).filter(Boolean).map((n,i)=>({id:‘S’+(i+1),name:n.trim()}))};
const ex=D.workflows.find(x=>x.id===wf.id);
if(ex) upd(‘workflows’,arr=>arr.map(x=>x.id===wf.id?{…x,…item}:x));
else upd(‘workflows’,arr=>[…arr,item]);
closeModal();
});mf.appendChild(sb);
}

function openProjModal(id) {
const p = id ? D.projects.find(x=>x.id===id) : {id:`PRJ${uid()}`,title:’’,status:‘Planning’,owner:’’,description:’’,startDate:today(),targetDate:’’};
openModal(‘Project’,
‘<div class="field"><label>Title</label><input class="inp" id="m-title" value="' + esc(p.title) + '"/></div>’ +
‘<div class="grid2">’ +
‘<div class="field"><label>Status</label><select class="inp" id="m-status">’ + selectOpts([‘Planning’,‘Active’,‘Completed’,‘On Hold’],p.status) + ‘</select></div>’ +
‘<div class="field"><label>Owner</label><select class="inp" id="m-owner">’ + peopleOpts(p.owner) + ‘</select></div>’ +
‘</div>’ +
‘<div class="field"><label>Description</label><textarea class="inp" id="m-desc" style="height:70px;">’ + esc(p.description) + ‘</textarea></div>’ +
‘<div class="modal-footer" id="mf"></div>’);
const mf=document.getElementById(‘mf’);
const cb=document.createElement(‘button’);cb.className=‘btn btn-outline btn-sm’;cb.textContent=‘Cancel’;cb.addEventListener(‘click’,closeModal);mf.appendChild(cb);
const sb=document.createElement(‘button’);sb.className=‘btn btn-sm’;sb.textContent=‘Save’;sb.addEventListener(‘click’,()=>{
const item={id:p.id,title:document.getElementById(‘m-title’).value,status:document.getElementById(‘m-status’).value,owner:document.getElementById(‘m-owner’).value,description:document.getElementById(‘m-desc’).value};
const ex=D.projects.find(x=>x.id===p.id);
if(ex) upd(‘projects’,arr=>arr.map(x=>x.id===p.id?{…x,…item}:x));
else upd(‘projects’,arr=>[…arr,{…item,startDate:today(),targetDate:’’}]);
activePrj=p.id; closeModal();
});mf.appendChild(sb);
}

function openUserModal(id) {
const u = id ? D.users.find(x=>x.id===id) : {id:`U${uid()}`,username:’’,password:’’,role:‘user’,name:’’,avatar:’’,personId:’’};
openModal(id?‘Edit User’:‘New User’,
‘<div class="field"><label>Name</label><input class="inp" id="m-name" value="' + esc(u.name) + '"/></div>’ +
‘<div class="field"><label>Username</label><input class="inp" id="m-user" value="' + esc(u.username) + '"/></div>’ +
‘<div class="field"><label>Password</label><input class="inp" type="password" id="m-pass" value="' + esc(u.password) + '"/></div>’ +
‘<div class="field"><label>Role</label><select class="inp" id="m-role"><option value=“user”’ + (u.role===‘user’?’ selected’:’’) + ‘>User</option><option value=“admin”’ + (u.role===‘admin’?’ selected’:’’) + ‘>Admin</option></select></div>’ +
‘<div class="modal-footer" id="mf"></div>’);
const mf=document.getElementById(‘mf’);
if(id&&id!==currentUser?.id){const db=document.createElement(‘button’);db.className=‘btn btn-danger btn-sm’;db.textContent=‘Delete’;db.addEventListener(‘click’,()=>{upd(‘users’,arr=>arr.filter(x=>x.id!==id));closeModal();});mf.appendChild(db);}
const cb=document.createElement(‘button’);cb.className=‘btn btn-outline btn-sm’;cb.textContent=‘Cancel’;cb.addEventListener(‘click’,closeModal);mf.appendChild(cb);
const sb=document.createElement(‘button’);sb.className=‘btn btn-sm’;sb.textContent=‘Save’;sb.addEventListener(‘click’,()=>{
const item={id:u.id,name:document.getElementById(‘m-name’).value,username:document.getElementById(‘m-user’).value,password:document.getElementById(‘m-pass’).value,role:document.getElementById(‘m-role’).value};
const ex=D.users.find(x=>x.id===u.id);
if(ex) upd(‘users’,arr=>arr.map(x=>x.id===u.id?{…x,…item}:x));
else upd(‘users’,arr=>[…arr,{…item,avatar:item.name.split(’ ‘).map(n=>n[0]).join(’’).slice(0,2),personId:’’}]);
closeModal();
});mf.appendChild(sb);
}

function openPersonModal(person) {
if (!person) return;
openModal(‘Profile’,
‘<div style="text-align:center;margin-bottom:16px;">’ +
‘<div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:18px;margin:0 auto 8px;">’ + esc(person.avatar||person.name[0]) + ‘</div>’ +
‘<div style="font-weight:800;font-size:15px;">’ + esc(person.name) + ‘</div>’ +
‘<div style="font-size:12px;color:#64748b;">’ + esc(person.title) + ’ · ’ + esc(person.dept) + ‘</div></div>’ +
‘<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">’ +
‘<div style="font-size:11px;color:#64748b;">📧 ’ + esc(person.email) + ‘</div>’ +
‘<div style="font-size:11px;color:#64748b;">📍 ’ + esc(person.location) + ‘</div></div>’ +
(person.bio ? ‘<p style="font-size:12px;color:#64748b;margin-bottom:10px;">’ + esc(person.bio) + ‘</p>’ : ‘’) +
(person.skills?.length ? ‘<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px;">’ + person.skills.map(s=>badge(s,’#6366f1’)).join(’’) + ‘</div>’ : ‘’) +
‘<div class="modal-footer" id="mf"></div>’);
const mf=document.getElementById(‘mf’);
const cb=document.createElement(‘button’);cb.className=‘btn btn-outline btn-sm’;cb.textContent=‘Close’;cb.addEventListener(‘click’,closeModal);mf.appendChild(cb);
}

// ─── Init ─────────────────────────────────────────────────────────────────────
load();
renderDemoAccounts();

document.getElementById(‘login-btn’).addEventListener(‘click’, doLogin);
document.getElementById(‘login-user’).addEventListener(‘keydown’, e => { if(e.key===‘Enter’) doLogin(); });
document.getElementById(‘login-pass’).addEventListener(‘keydown’, e => { if(e.key===‘Enter’) doLogin(); });
document.getElementById(‘logout-btn’).addEventListener(‘click’, logout);
document.getElementById(‘exit-preview-btn’).addEventListener(‘click’, exitPreview);
document.getElementById(‘search-btn’).addEventListener(‘click’, toggleSearch);
document.getElementById(‘notif-btn’).addEventListener(‘click’, () => { showNotifsOpen=!showNotifsOpen; document.getElementById(‘notif-dropdown’).classList.toggle(‘hidden’,!showNotifsOpen); });
document.getElementById(‘user-avatar’).addEventListener(‘click’, () => { const me=D.people.find(p=>p.id===currentUser?.personId)||D.people[0]; openPersonModal(me); });
document.getElementById(‘modal-close-btn’).addEventListener(‘click’, closeModal);
document.getElementById(‘modal-overlay’).addEventListener(‘click’, e => { if(e.target===document.getElementById(‘modal-overlay’)) closeModal(); });
document.getElementById(‘search-overlay’).addEventListener(‘click’, e => { if(e.target===document.getElementById(‘search-overlay’)) closeSearch(); });
document.getElementById(‘search-input’).addEventListener(‘input’, renderSearch);

document.addEventListener(‘keydown’, e => {
if ((e.metaKey||e.ctrlKey) && e.key===‘k’) { e.preventDefault(); toggleSearch(); }
if (e.key===‘Escape’) { closeModal(); closeSearch(); showNotifsOpen=false; document.getElementById(‘notif-dropdown’).classList.add(‘hidden’); }
});
