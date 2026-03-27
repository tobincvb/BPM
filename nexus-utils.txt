// ─── Modal helpers ────────────────────────────────────────────────────────────
function openModal(title, html, wide) {
document.getElementById(‘modal-title’).textContent = title;
document.getElementById(‘modal-body’).innerHTML = html;
document.getElementById(‘modal-box’).className = ‘modal-box’ + (wide ? ’ wide’ : ‘’);
document.getElementById(‘modal-overlay’).classList.remove(‘hidden’);
}
function closeModal() { document.getElementById(‘modal-overlay’).classList.add(‘hidden’); }

function mFooter(id, deleteFn) {
const mf = document.getElementById(‘mf’);
if (!mf) return;
if (deleteFn) {
const db = document.createElement(‘button’);
db.className = ‘btn btn-danger btn-sm’;
db.textContent = ‘Delete’;
db.addEventListener(‘click’, deleteFn);
mf.appendChild(db);
}
const cb = document.createElement(‘button’);
cb.className = ‘btn btn-outline btn-sm’;
cb.textContent = ‘Cancel’;
cb.addEventListener(‘click’, closeModal);
mf.appendChild(cb);
return mf;
}

// ─── Process modal ────────────────────────────────────────────────────────────
function openProcModal(id) {
const p = id ? D.processes.find(x=>x.id===id) : {id:‘PR’+uid(),title:’’,level:‘Level 3 — Process’,owner:’’,version:‘1.0’,status:‘Draft’,maturity:‘Initial’,description:’’,reviewFrequency:‘Quarterly’,nextReview:’’,kpis:[],procedures:[],relatedPolicies:[],tags:[],changeLog:[]};
openModal(id ? ‘Edit Process’ : ‘New Process’,
‘<div class="field"><label>Title</label><input class="inp" id="m-title" value="'+esc(p.title)+'"/></div>’+
‘<div class="grid2">’+
‘<div class="field"><label>Level</label><select class="inp" id="m-level">’+selectOpts(PROC_LEVELS,p.level)+’</select></div>’+
‘<div class="field"><label>Owner</label><select class="inp" id="m-owner">’+peopleOpts(p.owner)+’</select></div>’+
‘<div class="field"><label>Status</label><select class="inp" id="m-status">’+selectOpts(APR_STATES,p.status)+’</select></div>’+
‘<div class="field"><label>Maturity</label><select class="inp" id="m-maturity">’+selectOpts(MATURITY,p.maturity)+’</select></div>’+
‘<div class="field"><label>Version</label><input class="inp" id="m-version" value="'+esc(p.version)+'"/></div>’+
‘<div class="field"><label>Next Review</label><input class="inp" type="date" id="m-nextReview" value="'+esc(p.nextReview||'')+'"/></div>’+
‘</div>’+
‘<div class="field"><label>Description</label><textarea class="inp" id="m-desc" style="height:70px;">’+esc(p.description)+’</textarea></div>’+
‘<div class="field"><label>Procedures (one per line)</label><textarea class="inp" id="m-procs" style="height:60px;">’+esc((p.procedures||[]).join(’\n’))+’</textarea></div>’+
‘<div class="modal-footer" id="mf"></div>’, true);
const mf = mFooter(id, id ? ()=>{upd(‘processes’,a=>a.filter(x=>x.id!==id));procSel=null;closeModal();} : null);
const sb = document.createElement(‘button’); sb.className=‘btn btn-sm’; sb.textContent=‘Save’;
sb.addEventListener(‘click’, () => {
const item={id:p.id,title:document.getElementById(‘m-title’).value,level:document.getElementById(‘m-level’).value,owner:document.getElementById(‘m-owner’).value,version:document.getElementById(‘m-version’).value,status:document.getElementById(‘m-status’).value,maturity:document.getElementById(‘m-maturity’).value,description:document.getElementById(‘m-desc’).value,nextReview:document.getElementById(‘m-nextReview’).value,procedures:document.getElementById(‘m-procs’).value.split(’\n’).filter(Boolean)};
const ex=D.processes.find(x=>x.id===p.id);
if(ex) upd(‘processes’,a=>a.map(x=>x.id===p.id?{…x,…item}:x));
else upd(‘processes’,a=>[…a,{…item,reviewFrequency:‘Quarterly’,kpis:[],relatedPolicies:[],tags:[],changeLog:[]}]);
addAudit(ex?‘Updated’:‘Created’,‘Process’,item.title,‘v’+item.version);
procSel=D.processes.find(x=>x.id===p.id); closeModal();
});
mf.appendChild(sb);
}

// ─── Policy modal ─────────────────────────────────────────────────────────────
function openPolModal(id) {
const p = id ? D.policies.find(x=>x.id===id) : {id:‘POL’+uid(),title:’’,category:‘Compliance’,owner:’’,version:‘1.0’,status:‘Draft’,description:’’,reviewDate:’’,obligationIds:[],relatedProcessIds:[],content:‘Purpose:\n\nScope:\n\nRequirements:\n’,changeLog:[]};
openModal(id?‘Edit Policy’:‘New Policy’,
‘<div class="field"><label>Title</label><input class="inp" id="m-title" value="'+esc(p.title)+'"/></div>’+
‘<div class="grid2">’+
‘<div class="field"><label>Category</label><input class="inp" id="m-cat" value="'+esc(p.category)+'"/></div>’+
‘<div class="field"><label>Owner</label><select class="inp" id="m-owner">’+peopleOpts(p.owner)+’</select></div>’+
‘<div class="field"><label>Status</label><select class="inp" id="m-status">’+selectOpts(APR_STATES,p.status)+’</select></div>’+
‘<div class="field"><label>Version</label><input class="inp" id="m-version" value="'+esc(p.version)+'"/></div>’+
‘<div class="field"><label>Review Date</label><input class="inp" type="date" id="m-reviewDate" value="'+esc(p.reviewDate||'')+'"/></div>’+
‘</div>’+
‘<div class="field"><label>Description</label><textarea class="inp" id="m-desc" style="height:60px;">’+esc(p.description)+’</textarea></div>’+
‘<div class="field"><label>Content</label><textarea class="inp" id="m-content" style="height:120px;font-family:monospace;font-size:12px;">’+esc(p.content||’’)+’</textarea></div>’+
‘<div class="modal-footer" id="mf"></div>’, true);
const mf = mFooter(id, id ? ()=>{upd(‘policies’,a=>a.filter(x=>x.id!==id));polSel=null;closeModal();} : null);
const sb = document.createElement(‘button’); sb.className=‘btn btn-sm’; sb.textContent=‘Save’;
sb.addEventListener(‘click’, () => {
const item={id:p.id,title:document.getElementById(‘m-title’).value,category:document.getElementById(‘m-cat’).value,owner:document.getElementById(‘m-owner’).value,version:document.getElementById(‘m-version’).value,status:document.getElementById(‘m-status’).value,description:document.getElementById(‘m-desc’).value,reviewDate:document.getElementById(‘m-reviewDate’).value,content:document.getElementById(‘m-content’).value};
const ex=D.policies.find(x=>x.id===p.id);
if(ex) upd(‘policies’,a=>a.map(x=>x.id===p.id?{…x,…item}:x));
else upd(‘policies’,a=>[…a,{…item,obligationIds:[],relatedProcessIds:[],changeLog:[]}]);
addAudit(ex?‘Updated’:‘Created’,‘Policy’,item.title,‘v’+item.version);
polSel=D.policies.find(x=>x.id===p.id); closeModal();
});
mf.appendChild(sb);
}

// ─── Obligation modal ─────────────────────────────────────────────────────────
function openOblModal(id) {
const o = id ? D.obligations.find(x=>x.id===id) : {id:‘OBL’+uid(),title:’’,type:‘Regulation’,regulator:’’,jurisdiction:‘Australia’,description:’’,complianceStatus:‘Compliant’,owner:’’,reviewDate:’’,linkedPolicyIds:[],linkedProcessIds:[],controls:[],notes:’’};
openModal(id?‘Edit Obligation’:‘New Obligation’,
‘<div class="field"><label>Title</label><input class="inp" id="m-title" value="'+esc(o.title)+'"/></div>’+
‘<div class="grid2">’+
‘<div class="field"><label>Type</label><select class="inp" id="m-type">’+selectOpts(OBL_TYPES,o.type)+’</select></div>’+
‘<div class="field"><label>Regulator</label><input class="inp" id="m-reg" value="'+esc(o.regulator)+'"/></div>’+
‘<div class="field"><label>Compliance Status</label><select class="inp" id="m-cs">’+selectOpts([‘Compliant’,‘In Progress’,‘Non-Compliant’],o.complianceStatus)+’</select></div>’+
‘<div class="field"><label>Owner</label><select class="inp" id="m-owner">’+peopleOpts(o.owner)+’</select></div>’+
‘<div class="field"><label>Review Date</label><input class="inp" type="date" id="m-reviewDate" value="'+esc(o.reviewDate||'')+'"/></div>’+
‘</div>’+
‘<div class="field"><label>Description</label><textarea class="inp" id="m-desc" style="height:70px;">’+esc(o.description)+’</textarea></div>’+
‘<div class="field"><label>Notes</label><input class="inp" id="m-notes" value="'+esc(o.notes||'')+'"/></div>’+
‘<div class="modal-footer" id="mf"></div>’, true);
const mf = mFooter(id, id ? ()=>{upd(‘obligations’,a=>a.filter(x=>x.id!==id));oblSel=null;closeModal();} : null);
const sb = document.createElement(‘button’); sb.className=‘btn btn-sm’; sb.textContent=‘Save’;
sb.addEventListener(‘click’, () => {
const item={id:o.id,title:document.getElementById(‘m-title’).value,type:document.getElementById(‘m-type’).value,regulator:document.getElementById(‘m-reg’).value,complianceStatus:document.getElementById(‘m-cs’).value,owner:document.getElementById(‘m-owner’).value,reviewDate:document.getElementById(‘m-reviewDate’).value,description:document.getElementById(‘m-desc’).value,notes:document.getElementById(‘m-notes’).value};
const ex=D.obligations.find(x=>x.id===o.id);
if(ex) upd(‘obligations’,a=>a.map(x=>x.id===o.id?{…x,…item}:x));
else upd(‘obligations’,a=>[…a,{…item,jurisdiction:‘Australia’,linkedPolicyIds:[],linkedProcessIds:[],controls:[]}]);
oblSel=D.obligations.find(x=>x.id===o.id); closeModal();
});
mf.appendChild(sb);
}

// ─── Risk modal ───────────────────────────────────────────────────────────────
function openRiskModal(id) {
const r = id ? D.risks.find(x=>x.id===id) : {id:‘RSK’+uid(),title:’’,category:‘Operational’,likelihood:‘Possible’,impact:‘Moderate’,status:‘Open’,owner:’’,description:’’,linkedProcessIds:[],treatments:[],residualLikelihood:‘Unlikely’,residualImpact:‘Minor’,reviewDate:’’,notes:’’};
openModal(id?‘Edit Risk’:‘New Risk’,
‘<div class="field"><label>Title</label><input class="inp" id="m-title" value="'+esc(r.title)+'"/></div>’+
‘<div class="grid2">’+
‘<div class="field"><label>Category</label><input class="inp" id="m-cat" value="'+esc(r.category)+'"/></div>’+
‘<div class="field"><label>Status</label><select class="inp" id="m-status">’+selectOpts(RISK_S,r.status)+’</select></div>’+
‘<div class="field"><label>Likelihood</label><select class="inp" id="m-like">’+selectOpts(RISK_L,r.likelihood)+’</select></div>’+
‘<div class="field"><label>Impact</label><select class="inp" id="m-imp">’+selectOpts(RISK_I,r.impact)+’</select></div>’+
‘<div class="field"><label>Owner</label><select class="inp" id="m-owner">’+peopleOpts(r.owner)+’</select></div>’+
‘<div class="field"><label>Review Date</label><input class="inp" type="date" id="m-reviewDate" value="'+esc(r.reviewDate||'')+'"/></div>’+
‘</div>’+
‘<div class="field"><label>Description</label><textarea class="inp" id="m-desc" style="height:70px;">’+esc(r.description)+’</textarea></div>’+
‘<div class="field"><label>Treatments (one per line)</label><textarea class="inp" id="m-treats" style="height:60px;">’+esc((r.treatments||[]).join(’\n’))+’</textarea></div>’+
‘<div class="modal-footer" id="mf"></div>’, true);
const mf = mFooter(id, id ? ()=>{upd(‘risks’,a=>a.filter(x=>x.id!==id));riskSel=null;closeModal();} : null);
const sb = document.createElement(‘button’); sb.className=‘btn btn-sm’; sb.textContent=‘Save’;
sb.addEventListener(‘click’, () => {
const item={id:r.id,title:document.getElementById(‘m-title’).value,category:document.getElementById(‘m-cat’).value,status:document.getElementById(‘m-status’).value,likelihood:document.getElementById(‘m-like’).value,impact:document.getElementById(‘m-imp’).value,owner:document.getElementById(‘m-owner’).value,reviewDate:document.getElementById(‘m-reviewDate’).value,description:document.getElementById(‘m-desc’).value,treatments:document.getElementById(‘m-treats’).value.split(’\n’).filter(Boolean)};
const ex=D.risks.find(x=>x.id===r.id);
if(ex) upd(‘risks’,a=>a.map(x=>x.id===r.id?{…x,…item}:x));
else upd(‘risks’,a=>[…a,{…item,linkedProcessIds:[],residualLikelihood:‘Unlikely’,residualImpact:‘Minor’,notes:’’}]);
addAudit(ex?‘Updated’:‘Created’,‘Risk’,item.title,’’);
riskSel=D.risks.find(x=>x.id===r.id); closeModal();
});
mf.appendChild(sb);
}

// ─── RACI modal ───────────────────────────────────────────────────────────────
function openRaciModal(procId) {
openModal(‘Assign RACI’,
‘<div class="field"><label>Person</label><select class="inp" id="m-role">’+peopleOpts(’’)+’</select></div>’+
‘<div class="field"><label>Type</label><select class="inp" id="m-type">’+selectOpts(RACI_T,‘Responsible’)+’</select></div>’+
‘<div class="field"><label>Notes</label><input class="inp" id="m-notes" value=""/></div>’+
‘<div class="modal-footer" id="mf"></div>’);
const mf = mFooter(null, null);
const sb = document.createElement(‘button’); sb.className=‘btn btn-sm’; sb.textContent=‘Save’;
sb.addEventListener(‘click’, () => {
upd(‘raci’,a=>[…a,{id:uid(),processId:procId,roleId:document.getElementById(‘m-role’).value,type:document.getElementById(‘m-type’).value,notes:document.getElementById(‘m-notes’).value}]);
closeModal();
});
mf.appendChild(sb);
}

// ─── Incident modal ───────────────────────────────────────────────────────────
function openIncModal(id) {
const inc = id ? D.incidents.find(x=>x.id===id) : {id:‘INC-’+String(D.incidents.length+1).padStart(3,‘0’),title:’’,priority:‘Medium’,state:‘New’,assignee:’’,description:’’,createdAt:today(),notes:’’};
openModal(id?‘Edit Incident’:‘New Incident’,
‘<div class="field"><label>Title</label><input class="inp" id="m-title" value="'+esc(inc.title)+'"/></div>’+
‘<div class="grid2">’+
‘<div class="field"><label>Priority</label><select class="inp" id="m-pri">’+selectOpts(PRIORITIES,inc.priority)+’</select></div>’+
‘<div class="field"><label>State</label><select class="inp" id="m-state">’+selectOpts(INC_STATES,inc.state)+’</select></div>’+
‘<div class="field"><label>Assignee</label><select class="inp" id="m-assignee"><option value="">Unassigned</option>’+D.people.map(p=>’<option value=”’+esc(p.name)+’”’+(p.name===inc.assignee?’ selected’:’’)+’>’+esc(p.name)+’</option>’).join(’’)+’</select></div>’+
‘</div>’+
‘<div class="field"><label>Description</label><textarea class="inp" id="m-desc" style="height:80px;">’+esc(inc.description)+’</textarea></div>’+
‘<div class="modal-footer" id="mf"></div>’);
const mf = mFooter(null, null);
const sb = document.createElement(‘button’); sb.className=‘btn btn-sm’; sb.textContent=‘Save’;
sb.addEventListener(‘click’, () => {
const item={id:inc.id,title:document.getElementById(‘m-title’).value,priority:document.getElementById(‘m-pri’).value,state:document.getElementById(‘m-state’).value,assignee:document.getElementById(‘m-assignee’).value,description:document.getElementById(‘m-desc’).value};
const ex=D.incidents.find(x=>x.id===inc.id);
if(ex) upd(‘incidents’,a=>a.map(x=>x.id===inc.id?{…x,…item}:x));
else upd(‘incidents’,a=>[…a,{…item,createdAt:today(),notes:’’}]);
closeModal();
});
mf.appendChild(sb);
}

// ─── Change modal ─────────────────────────────────────────────────────────────
function openChgModal(id) {
const ch = id ? D.changes.find(x=>x.id===id) : {id:‘CHG-’+String(D.changes.length+1).padStart(3,‘0’),title:’’,priority:‘Medium’,state:‘Draft’,assignee:’’,type:‘Normal’,description:’’,createdAt:today(),scheduledAt:’’};
openModal(id?‘Edit Change’:‘New Change’,
‘<div class="field"><label>Title</label><input class="inp" id="m-title" value="'+esc(ch.title)+'"/></div>’+
‘<div class="grid2">’+
‘<div class="field"><label>Type</label><select class="inp" id="m-type">’+selectOpts([‘Standard’,‘Normal’,‘Emergency’],ch.type)+’</select></div>’+
‘<div class="field"><label>Priority</label><select class="inp" id="m-pri">’+selectOpts(PRIORITIES,ch.priority)+’</select></div>’+
‘<div class="field"><label>State</label><select class="inp" id="m-state">’+selectOpts(CHG_STATES,ch.state)+’</select></div>’+
‘<div class="field"><label>Scheduled Date</label><input class="inp" type="date" id="m-sched" value="'+esc(ch.scheduledAt||'')+'"/></div>’+
‘</div>’+
‘<div class="field"><label>Description</label><textarea class="inp" id="m-desc" style="height:80px;">’+esc(ch.description)+’</textarea></div>’+
‘<div class="modal-footer" id="mf"></div>’);
const mf = mFooter(null, null);
const sb = document.createElement(‘button’); sb.className=‘btn btn-sm’; sb.textContent=‘Save’;
sb.addEventListener(‘click’, () => {
const item={id:ch.id,title:document.getElementById(‘m-title’).value,type:document.getElementById(‘m-type’).value,priority:document.getElementById(‘m-pri’).value,state:document.getElementById(‘m-state’).value,scheduledAt:document.getElementById(‘m-sched’).value,description:document.getElementById(‘m-desc’).value};
const ex=D.changes.find(x=>x.id===ch.id);
if(ex) upd(‘changes’,a=>a.map(x=>x.id===ch.id?{…x,…item}:x));
else upd(‘changes’,a=>[…a,{…item,createdAt:today()}]);
closeModal();
});
mf.appendChild(sb);
}

// ─── Asset modal ──────────────────────────────────────────────────────────────
function openAssetModal(id) {
const a = id ? D.assets.find(x=>x.id===id) : {id:‘CI-’+uid(),name:’’,type:‘Application’,status:‘Operational’,owner:‘Technology’,version:’’,criticality:‘High’,description:’’};
openModal(‘Configuration Item’,
‘<div class="field"><label>Name</label><input class="inp" id="m-name" value="'+esc(a.name)+'"/></div>’+
‘<div class="grid2">’+
‘<div class="field"><label>Type</label><select class="inp" id="m-type">’+selectOpts([‘Application’,‘Infrastructure’,‘Database’,‘Network’,‘Service’],a.type)+’</select></div>’+
‘<div class="field"><label>Status</label><select class="inp" id="m-status">’+selectOpts([‘Operational’,‘Maintenance’,‘Degraded’,‘Decommissioned’],a.status)+’</select></div>’+
‘<div class="field"><label>Criticality</label><select class="inp" id="m-crit">’+selectOpts(PRIORITIES,a.criticality)+’</select></div>’+
‘<div class="field"><label>Version</label><input class="inp" id="m-version" value="'+esc(a.version||'')+'"/></div>’+
‘</div>’+
‘<div class="field"><label>Description</label><textarea class="inp" id="m-desc" style="height:70px;">’+esc(a.description)+’</textarea></div>’+
‘<div class="modal-footer" id="mf"></div>’);
const mf = mFooter(null, null);
const sb = document.createElement(‘button’); sb.className=‘btn btn-sm’; sb.textContent=‘Save’;
sb.addEventListener(‘click’, () => {
const item={id:a.id,name:document.getElementById(‘m-name’).value,type:document.getElementById(‘m-type’).value,status:document.getElementById(‘m-status’).value,criticality:document.getElementById(‘m-crit’).value,version:document.getElementById(‘m-version’).value,description:document.getElementById(‘m-desc’).value,owner:‘Technology’};
const ex=D.assets.find(x=>x.id===a.id);
if(ex) upd(‘assets’,arr=>arr.map(x=>x.id===a.id?{…x,…item}:x));
else upd(‘assets’,arr=>[…arr,item]);
closeModal();
});
mf.appendChild(sb);
}

// ─── Issue modal ──────────────────────────────────────────────────────────────
function openIssModal(id, defaultState) {
const iss = id ? D.issues.find(x=>x.id===id) : {id:‘ISS-’+uid(),projectId:activePrj,sprintId:activeSpr,title:’’,state:defaultState||‘To Do’,priority:‘Medium’,assignee:’’,storyPoints:3,description:’’,createdAt:today()};
openModal(id?‘Edit Issue’:‘New Issue’,
‘<div class="field"><label>Title</label><input class="inp" id="m-title" value="'+esc(iss.title)+'"/></div>’+
‘<div class="grid2">’+
‘<div class="field"><label>Priority</label><select class="inp" id="m-pri">’+selectOpts(PRIORITIES,iss.priority)+’</select></div>’+
‘<div class="field"><label>State</label><select class="inp" id="m-state">’+selectOpts(ISS_STATES,iss.state)+’</select></div>’+
‘<div class="field"><label>Assignee</label><select class="inp" id="m-assignee">’+peopleOpts(iss.assignee)+’</select></div>’+
‘<div class="field"><label>Story Points</label><input class="inp" type="number" id="m-pts" value="'+iss.storyPoints+'"/></div>’+
‘<div class="field"><label>Sprint</label><select class="inp" id="m-sprint"><option value="">Backlog</option>’+D.sprints.filter(s=>s.projectId===activePrj).map(s=>’<option value=”’+s.id+’”’+(s.id===iss.sprintId?’ selected’:’’)+’>’+esc(s.title)+’</option>’).join(’’)+’</select></div>’+
‘</div>’+
‘<div class="field"><label>Description</label><textarea class="inp" id="m-desc" style="height:70px;">’+esc(iss.description)+’</textarea></div>’+
‘<div class="modal-footer" id="mf"></div>’);
const mf = mFooter(id, id ? ()=>{upd(‘issues’,a=>a.filter(x=>x.id!==id));closeModal();} : null);
const sb = document.createElement(‘button’); sb.className=‘btn btn-sm’; sb.textContent=‘Save’;
sb.addEventListener(‘click’, () => {
const item={id:iss.id,projectId:activePrj,sprintId:document.getElementById(‘m-sprint’).value||null,title:document.getElementById(‘m-title’).value,state:document.getElementById(‘m-state’).value,priority:document.getElementById(‘m-pri’).value,assignee:document.getElementById(‘m-assignee’).value,storyPoints:+document.getElementById(‘m-pts’).value,description:document.getElementById(‘m-desc’).value};
const ex=D.issues.find(x=>x.id===iss.id);
if(ex) upd(‘issues’,a=>a.map(x=>x.id===iss.id?{…x,…item}:x));
else upd(‘issues’,a=>[…a,{…item,createdAt:today()}]);
closeModal();
});
mf.appendChild(sb);
}

// ─── Page modal ───────────────────────────────────────────────────────────────
function openPageModal(id) {
const pg = id ? D.pages.find(x=>x.id===id) : {id:‘PG’+uid(),projectId:activePrj,title:’’,content:’’,createdAt:today(),updatedAt:today(),author:currentUser?.name||’’};
openModal(id?‘Edit Page’:‘New Page’,
‘<div class="field"><label>Title</label><input class="inp" id="m-title" value="'+esc(pg.title)+'"/></div>’+
‘<div class="field"><label>Content</label><textarea class="inp" id="m-content" style="height:200px;font-family:monospace;font-size:12px;">’+esc(pg.content)+’</textarea></div>’+
‘<div class="modal-footer" id="mf"></div>’, true);
const mf = mFooter(id, id ? ()=>{upd(‘pages’,a=>a.filter(x=>x.id!==id));pageView=null;closeModal();} : null);
const sb = document.createElement(‘button’); sb.className=‘btn btn-sm’; sb.textContent=‘Save’;
sb.addEventListener(‘click’, () => {
const item={id:pg.id,projectId:activePrj,title:document.getElementById(‘m-title’).value,content:document.getElementById(‘m-content’).value,updatedAt:today(),author:currentUser?.name||’’};
const ex=D.pages.find(x=>x.id===pg.id);
if(ex) upd(‘pages’,a=>a.map(x=>x.id===pg.id?{…x,…item}:x));
else upd(‘pages’,a=>[…a,{…item,createdAt:today()}]);
pageView=D.pages.find(x=>x.id===pg.id); closeModal();
});
mf.appendChild(sb);
}

// ─── Workflow modal ───────────────────────────────────────────────────────────
function openWorkflowModal(id) {
const wf = id ? D.workflows.find(x=>x.id===id) : {id:‘WF’+uid(),name:’’,steps:[]};
openModal(id?‘Edit Workflow’:‘New Workflow’,
‘<div class="field"><label>Name</label><input class="inp" id="m-name" value="'+esc(wf.name)+'"/></div>’+
‘<div class="field"><label>Steps (comma-separated)</label><input class="inp" id="m-steps" value="'+esc(wf.steps.map(s=>s.name).join(','))+'" placeholder="Draft,Review,Approve,Publish"/></div>’+
‘<div class="modal-footer" id="mf"></div>’);
const mf = mFooter(null, null);
const sb = document.createElement(‘button’); sb.className=‘btn btn-sm’; sb.textContent=‘Save’;
sb.addEventListener(‘click’, () => {
const item={id:wf.id,name:document.getElementById(‘m-name’).value,steps:document.getElementById(‘m-steps’).value.split(’,’).filter(Boolean).map((n,i)=>({id:‘S’+(i+1),name:n.trim()}))};
const ex=D.workflows.find(x=>x.id===wf.id);
if(ex) upd(‘workflows’,a=>a.map(x=>x.id===wf.id?{…x,…item}:x));
else upd(‘workflows’,a=>[…a,item]);
closeModal();
});
mf.appendChild(sb);
}

// ─── Project modal ────────────────────────────────────────────────────────────
function openProjModal(id) {
const p = id ? D.projects.find(x=>x.id===id) : {id:‘PRJ’+uid(),title:’’,status:‘Planning’,owner:’’,description:’’,startDate:today(),targetDate:’’};
openModal(‘Project’,
‘<div class="field"><label>Title</label><input class="inp" id="m-title" value="'+esc(p.title)+'"/></div>’+
‘<div class="grid2">’+
‘<div class="field"><label>Status</label><select class="inp" id="m-status">’+selectOpts([‘Planning’,‘Active’,‘Completed’,‘On Hold’],p.status)+’</select></div>’+
‘<div class="field"><label>Owner</label><select class="inp" id="m-owner">’+peopleOpts(p.owner)+’</select></div>’+
‘</div>’+
‘<div class="field"><label>Description</label><textarea class="inp" id="m-desc" style="height:70px;">’+esc(p.description)+’</textarea></div>’+
‘<div class="modal-footer" id="mf"></div>’);
const mf = mFooter(null, null);
const sb = document.createElement(‘button’); sb.className=‘btn btn-sm’; sb.textContent=‘Save’;
sb.addEventListener(‘click’, () => {
const item={id:p.id,title:document.getElementById(‘m-title’).value,status:document.getElementById(‘m-status’).value,owner:document.getElementById(‘m-owner’).value,description:document.getElementById(‘m-desc’).value};
const ex=D.projects.find(x=>x.id===p.id);
if(ex) upd(‘projects’,a=>a.map(x=>x.id===p.id?{…x,…item}:x));
else upd(‘projects’,a=>[…a,{…item,startDate:today(),targetDate:’’}]);
activePrj=p.id; closeModal();
});
mf.appendChild(sb);
}

// ─── User modal ───────────────────────────────────────────────────────────────
function openUserModal(id) {
const u = id ? D.users.find(x=>x.id===id) : {id:‘U’+uid(),username:’’,password:’’,role:‘user’,name:’’,avatar:’’,personId:’’};
openModal(id?‘Edit User’:‘New User’,
‘<div class="field"><label>Name</label><input class="inp" id="m-name" value="'+esc(u.name)+'"/></div>’+
‘<div class="field"><label>Username</label><input class="inp" id="m-user" value="'+esc(u.username)+'"/></div>’+
‘<div class="field"><label>Password</label><input class="inp" type="password" id="m-pass" value="'+esc(u.password)+'"/></div>’+
‘<div class="field"><label>Role</label><select class="inp" id="m-role"><option value=“user”’+(u.role===‘user’?’ selected’:’’)+’>User</option><option value=“admin”’+(u.role===‘admin’?’ selected’:’’)+’>Admin</option></select></div>’+
‘<div class="modal-footer" id="mf"></div>’);
const mf = mFooter(id&&id!==currentUser?.id ? id : null, id&&id!==currentUser?.id ? ()=>{upd(‘users’,a=>a.filter(x=>x.id!==id));closeModal();} : null);
const sb = document.createElement(‘button’); sb.className=‘btn btn-sm’; sb.textContent=‘Save’;
sb.addEventListener(‘click’, () => {
const item={id:u.id,name:document.getElementById(‘m-name’).value,username:document.getElementById(‘m-user’).value,password:document.getElementById(‘m-pass’).value,role:document.getElementById(‘m-role’).value};
const ex=D.users.find(x=>x.id===u.id);
if(ex) upd(‘users’,a=>a.map(x=>x.id===u.id?{…x,…item}:x));
else upd(‘users’,a=>[…a,{…item,avatar:item.name.split(’ ‘).map(n=>n[0]).join(’’).slice(0,2),personId:’’}]);
closeModal();
});
mf.appendChild(sb);
}

// ─── Person modal ─────────────────────────────────────────────────────────────
function openPersonModal(person) {
if (!person) return;
openModal(‘Profile’,
‘<div style="text-align:center;margin-bottom:16px;">’+
‘<div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:18px;margin:0 auto 8px;">’+esc(person.avatar||person.name[0])+’</div>’+
‘<div style="font-weight:800;font-size:15px;">’+esc(person.name)+’</div>’+
‘<div style="font-size:12px;color:#64748b;">’+esc(person.title)+’ · ‘+esc(person.dept)+’</div></div>’+
‘<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">’+
‘<div style="font-size:11px;color:#64748b;">📧 ‘+esc(person.email)+’</div>’+
‘<div style="font-size:11px;color:#64748b;">📍 ‘+esc(person.location)+’</div></div>’+
(person.bio?’<p style="font-size:12px;color:#64748b;margin-bottom:10px;">’+esc(person.bio)+’</p>’:’’)+
(person.skills?.length?’<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px;">’+person.skills.map(s=>badge(s,’#6366f1’)).join(’’)+’</div>’:’’)+
‘<div class="modal-footer" id="mf"></div>’);
const mf = mFooter(null, null);
const cb = mf.querySelector(’.btn-outline’); // already added by mFooter
// mFooter adds Cancel which closes — that’s all we need
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
document.getElementById(‘notif-btn’).addEventListener(‘click’, () => {
showNotifsOpen = !showNotifsOpen;
document.getElementById(‘notif-dropdown’).classList.toggle(‘hidden’, !showNotifsOpen);
});
document.getElementById(‘user-avatar’).addEventListener(‘click’, () => {
const me = D.people.find(p=>p.id===currentUser?.personId) || D.people[0];
openPersonModal(me);
});
document.getElementById(‘modal-close-btn’).addEventListener(‘click’, closeModal);
document.getElementById(‘modal-overlay’).addEventListener(‘click’, e => { if(e.target===document.getElementById(‘modal-overlay’)) closeModal(); });
document.getElementById(‘search-overlay’).addEventListener(‘click’, e => { if(e.target===document.getElementById(‘search-overlay’)) closeSearch(); });
document.getElementById(‘search-input’).addEventListener(‘input’, renderSearch);

document.addEventListener(‘keydown’, e => {
if ((e.metaKey||e.ctrlKey) && e.key===‘k’) { e.preventDefault(); toggleSearch(); }
if (e.key===‘Escape’) { closeModal(); closeSearch(); showNotifsOpen=false; document.getElementById(‘notif-dropdown’).classList.add(‘hidden’); }
});
