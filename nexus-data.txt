const SEED = {
users:[
{id:‘U1’,username:‘sarah.chen’,password:‘admin123’,role:‘admin’,name:‘Sarah Chen’,avatar:‘SC’,personId:‘P1’},
{id:‘U2’,username:‘tom.nguyen’,password:‘user123’,role:‘user’,name:‘Tom Nguyen’,avatar:‘TN’,personId:‘P2’},
{id:‘U3’,username:‘james.smith’,password:‘user123’,role:‘user’,name:‘James Smith’,avatar:‘JS’,personId:‘P3’},
{id:‘U4’,username:‘admin’,password:‘admin’,role:‘admin’,name:‘Platform Admin’,avatar:‘PA’,personId:null},
],
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
{id:‘POL1’,title:‘KYC Policy’,category:‘Compliance’,owner:‘P4’,version:‘3.2’,status:‘Approved’,description:‘Requirements for verifying customer identity per AUSTRAC.’,reviewDate:‘2026-07-01’,approvedBy:‘P1’,obligationIds:[‘OBL1’,‘OBL2’],relatedProcessIds:[‘PR1’,‘PR2’],content:‘Purpose: Establish KYC requirements.\n\nRequirements:\n1. Government-issued photo ID required\n2. Verified against AUSTRAC database\n3. Records retained 7 years\n4. Suspicious activity reported within 24 hrs’,changeLog:[{version:‘3.2’,date:‘2026-01-20’,author:‘Anika Lee’,note:‘Updated retention to 7 years’}]},
{id:‘POL2’,title:‘Data Privacy Policy’,category:‘Privacy’,owner:‘P4’,version:‘2.0’,status:‘Approved’,description:‘Governs personal data per Privacy Act 1988.’,reviewDate:‘2026-06-01’,approvedBy:‘P1’,obligationIds:[‘OBL3’],relatedProcessIds:[‘PR1’],content:‘Purpose: Ensure Privacy Act 1988 compliance.\n\nRequirements:\n- Collect only necessary data\n- Obtain explicit consent\n- Encrypt data at rest\n- Notify breaches within 30 days’,changeLog:[{version:‘2.0’,date:‘2025-12-01’,author:‘Sarah Chen’,note:‘Full rewrite’}]},
{id:‘POL3’,title:‘Incident Management Policy’,category:‘ITSM’,owner:‘P2’,version:‘1.1’,status:‘In Review’,description:‘Framework for managing technology incidents.’,reviewDate:‘2026-04-01’,approvedBy:null,obligationIds:[],relatedProcessIds:[‘PR3’],content:‘Severity Levels:\n- P1: Full outage — 15 min response\n- P2: Degradation — 1 hr\n- P3: Minor — 4 hr’,changeLog:[{version:‘1.1’,date:‘2025-10-01’,author:‘Tom Nguyen’,note:‘Added P3 tier’}]},
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
{id:‘INC-003’,title:‘Certificate expiry warning’,priority:‘Medium’,state:‘New’,assignee:’’,description:‘SSL certificate expires in 14 days.’,createdAt:‘2026-03-27’,notes:’’},
],
changes:[
{id:‘CHG-001’,title:‘Deploy authentication service v2.4’,priority:‘High’,state:‘Authorize’,assignee:‘Tom Nguyen’,type:‘Normal’,description:‘Upgrade auth service.’,createdAt:‘2026-03-15’,scheduledAt:‘2026-04-05’},
{id:‘CHG-002’,title:‘Database index optimisation’,priority:‘Medium’,state:‘Scheduled’,assignee:‘Tom Nguyen’,type:‘Standard’,description:‘Add composite indexes.’,createdAt:‘2026-03-20’,scheduledAt:‘2026-03-30’},
{id:‘CHG-003’,title:‘Firewall rule update — PCI zone’,priority:‘Critical’,state:‘Draft’,assignee:’’,type:‘Emergency’,description:‘Block detected scanning activity.’,createdAt:‘2026-03-27’,scheduledAt:’’},
],
assets:[
{id:‘CI-001’,name:‘Core Banking Platform’,type:‘Application’,status:‘Operational’,owner:‘Technology’,version:‘14.2.1’,criticality:‘Critical’,description:‘Primary banking system.’},
{id:‘CI-002’,name:‘Auth Service’,type:‘Application’,status:‘Operational’,owner:‘Technology’,version:‘2.3.7’,criticality:‘Critical’,description:‘OAuth2 and JWT authentication.’},
{id:‘CI-003’,name:‘CRM System’,type:‘Application’,status:‘Operational’,owner:‘Operations’,version:‘5.1’,criticality:‘High’,description:‘Customer relationship management.’},
{id:‘CI-004’,name:‘Prod DB Cluster’,type:‘Infrastructure’,status:‘Operational’,owner:‘Technology’,version:‘PG 15’,criticality:‘Critical’,description:‘PostgreSQL HA cluster.’},
{id:‘CI-005’,name:‘Batch Processor’,type:‘Application’,status:‘Maintenance’,owner:‘Technology’,version:‘3.0.2’,criticality:‘High’,description:‘Nightly reconciliation batch.’},
],
projects:[
{id:‘PRJ1’,title:‘Customer Portal Rebuild’,status:‘Active’,owner:‘P2’,description:‘Portal rebuild.’,startDate:‘2026-01-10’,targetDate:‘2026-06-30’},
{id:‘PRJ2’,title:‘GRC Platform Uplift’,status:‘Planning’,owner:‘P4’,description:‘New GRC tooling.’,startDate:‘2026-04-01’,targetDate:‘2026-12-31’},
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
{id:‘PG1’,projectId:‘PRJ1’,title:‘Architecture Overview’,content:‘Architecture\n\nReact SPA with GraphQL API gateway.\n\nAuth Flow\n1. Client requests token\n2. Auth Service validates\n3. JWT issued with 1hr expiry’,createdAt:‘2026-03-01’,updatedAt:‘2026-03-25’,author:‘Tom Nguyen’},
],
workflows:[
{id:‘WF1’,name:‘Process Approval’,steps:[{id:‘S1’,name:‘Draft’},{id:‘S2’,name:‘Review’},{id:‘S3’,name:‘Approve’},{id:‘S4’,name:‘Published’}]},
{id:‘WF2’,name:‘Policy Review Cycle’,steps:[{id:‘S1’,name:‘Initiate’},{id:‘S2’,name:‘Review’},{id:‘S3’,name:‘Approve’},{id:‘S4’,name:‘Publish’}]},
],
courses:[
{id:‘C1’,title:‘BPM Fundamentals’,category:‘Process Management’,instructor:‘James Smith’,duration:240,level:‘Beginner’,description:‘Learn BPMN 2.0, process mapping, and continuous improvement.’,thumbnail:‘🗺️’,rating:4.7,enrolled:42},
{id:‘C2’,title:‘Cloud Architecture and DevOps’,category:‘Technology’,instructor:‘Tom Nguyen’,duration:360,level:‘Intermediate’,description:‘AWS, CI/CD, Docker, Kubernetes.’,thumbnail:‘☁️’,rating:4.9,enrolled:28},
{id:‘C3’,title:‘Risk and Compliance Essentials’,category:‘Risk and Compliance’,instructor:‘Marcus Obi’,duration:180,level:‘Beginner’,description:‘GRC frameworks, CPS 230, AUSTRAC.’,thumbnail:‘🛡️’,rating:4.6,enrolled:35},
],
auditLog:[
{id:‘AU1’,timestamp:‘2026-03-27 09:14’,user:‘Sarah Chen’,action:‘Approved’,entityType:‘Process’,entityTitle:‘Customer Onboarding’,detail:‘Version 2.1 approved’},
{id:‘AU2’,timestamp:‘2026-03-27 08:52’,user:‘Tom Nguyen’,action:‘Submitted’,entityType:‘Process’,entityTitle:‘Incident Response’,detail:‘Workflow started’},
{id:‘AU3’,timestamp:‘2026-03-26 16:30’,user:‘Anika Lee’,action:‘Updated’,entityType:‘Policy’,entityTitle:‘KYC Policy’,detail:‘Version 3.2’},
],
};
