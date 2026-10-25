const fs=require('node:fs'),path=require('node:path');
const {root,assert,equal,digest}=require('./transport.cjs');
const ids=['informative','noisy','blind','unresolved'],signals=['red','blue','green','gray'];
const repository='mohammadisina1988-jpg/signal-hull';
function report(id,revision){const raw=fs.readFileSync(path.join(root,'reports',id+'.json'));assert(/^[a-f0-9]{40}$/.test(revision),'Pinned source revision');return {url:'https://raw.githubusercontent.com/'+repository+'/'+revision+'/reports/'+id+'.json',sha256:digest(raw),source:JSON.parse(raw)};}
const assessment=id=>JSON.parse(fs.readFileSync(path.join(root,'tests',id+'-expected.json')));
const args=(id,revision)=>{const r=report(id,revision);return [repository,r.url,r.sha256];};
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
function reduced(ns,d){const g=ns.reduce((g,n)=>gcd(g,n),d);return {numerators:ns.map(n=>n/g),denominator:d/g};}
function corners(counts){return Array.from({length:16},(_,mask)=>({mask,point:counts.map(row=>row.reduce((s,n,j)=>s+((mask&2**j)?n:0),0))}));}
function feasible(counts,target){
 // Independent LP cube-slice vertex enumeration, no convex hull construction.
 let fullRank=false;
 for(let a=0;a<4;a++)for(let b=a+1;b<4;b++){
  const det=counts[0][a]*counts[1][b]-counts[0][b]*counts[1][a];if(!det)continue;fullRank=true;
  const fixed=[0,1,2,3].filter(j=>j!==a&&j!==b);
  for(let bits=0;bits<4;bits++){
   const rhs=target.map((n,i)=>n-fixed.reduce((s,j,k)=>s+((bits&2**k)?counts[i][j]:0),0));
   const xs=rhs[0]*counts[1][b]-rhs[1]*counts[0][b],ys=counts[0][a]*rhs[1]-counts[1][a]*rhs[0];
   if(det>0?xs>=0&&xs<=det&&ys>=0&&ys<=det:xs<=0&&xs>=det&&ys<=0&&ys>=det)return true;
  }
 }
 return !fullRank&&target[0]===target[1];
}
function validateGeometry(g,counts){
 assert(equal(Object.keys(g).sort(),['hull','vertices']),'Exact attainable-region schema');
 const all=corners(counts),unique=[];
 all.forEach(v=>{if(!unique.some(w=>equal(v.point,w.point)))unique.push(v);});unique.sort((a,b)=>a.point[0]-b.point[0]||a.point[1]-b.point[1]);
 assert(equal(g.vertices,unique),'All deterministic filters, least-mask deduplication');
 assert(g.hull.length>=2&&g.hull.length<=8&&equal(g.hull[0],unique[0]),'Canonical bounded polygon');
 g.hull.forEach(v=>assert(unique.some(w=>equal(v,w)),'Hull vertex is a real deterministic filter'));
 assert(new Set(g.hull.map(v=>v.mask)).size===g.hull.length,'Unique hull vertices');
 const cross=(a,b,p)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
 if(g.hull.length===2){assert(equal(g.hull.map(v=>v.point),[[0,0],[12,12]])&&unique.every(v=>v.point[0]===v.point[1]),'Exact rank-one diagonal');}
 else g.hull.forEach((v,i)=>{const b=g.hull[(i+1)%g.hull.length],c=g.hull[(i+2)%g.hull.length];assert(cross(v.point,b.point,c.point)>0&&all.every(p=>cross(v.point,b.point,p.point)>=0),'Strict CCW exposed edges contain every cube corner');});
}
function fraction(x,length){assert(equal(Object.keys(x).sort(),['denominator','numerators'])&&Number.isSafeInteger(x.denominator)&&x.denominator>0&&Array.isArray(x.numerators)&&x.numerators.length===length&&x.numerators.every(n=>Number.isSafeInteger(n)&&n>=0&&n<=x.denominator),'Exact bounded rational vector');assert(x.numerators.reduce((g,n)=>gcd(g,n),x.denominator)===1,'Reduced common denominator');}
function validateResult(r,counts,target){
 const possible=feasible(counts,target);assert(r.status===(possible?'FEASIBLE':'INFEASIBLE'),'Independent LP feasibility decision');
 if(!possible){assert(equal(Object.keys(r).sort(),['bound','margin','normal','observed','status'])&&Array.isArray(r.normal)&&r.normal.length===2&&r.normal.every(Number.isSafeInteger)&&gcd(...r.normal)===1,'Exact separating-line schema');const support=Math.max(...corners(counts).map(v=>v.point.reduce((s,x,i)=>s+x*r.normal[i],0))),observed=target.reduce((s,x,i)=>s+x*r.normal[i],0);assert(r.bound===support&&r.observed===observed&&r.margin===observed-support&&r.margin>0,'All sixteen filters separated by positive exact margin');return;}
 assert(equal(Object.keys(r).sort(),['depth','profile','selector','status','witness'])&&r.depth===0,'Exact base filter schema');
 fraction(r.selector,4);fraction(r.profile,2);assert(equal(r.profile,reduced(target,12)),'Exact requested profile');
 validateSelector(r,counts);
 const w=r.witness;assert(equal(Object.keys(w).sort(),['kind','masks','weights'])&&w.kind==='MIXTURE'&&Array.isArray(w.masks)&&w.masks.length>=2&&w.masks.length<=3&&w.masks.every(m=>Number.isInteger(m)&&m>=0&&m<=15),'At most three deterministic filters');
 // Weights sum to one; unlike selector cells, each number is a mixture coefficient.
 assert(equal(Object.keys(w.weights).sort(),['denominator','numerators'])&&Number.isSafeInteger(w.weights.denominator)&&w.weights.denominator>0&&w.weights.numerators.length===w.masks.length&&w.weights.numerators.every(n=>Number.isSafeInteger(n)&&n>=0)&&w.weights.numerators.reduce((s,n)=>s+n,0)===w.weights.denominator,'Convex exact weights');
 for(let j=0;j<4;j++){const n=w.masks.reduce((s,m,i)=>s+((m&2**j)?w.weights.numerators[i]:0),0);assert(n*r.selector.denominator===r.selector.numerators[j]*w.weights.denominator,'Constructed signal rule equals convex mixture');}
}
function validateSelector(r,counts){
 fraction(r.selector,4);fraction(r.profile,2);
 counts.forEach((row,i)=>{const sum=row.reduce((s,n,j)=>s+n*r.selector.numerators[j],0);assert(Number.isSafeInteger(sum*r.profile.denominator)&&sum*r.profile.denominator===12*r.profile.numerators[i]*r.selector.denominator,'Exact induced conditional response');});
}
function validateComposition(r,parent,zero,one,counts){
 assert(equal(Object.keys(r).sort(),['depth','profile','selector','status','witness'])&&r.status==='FEASIBLE'&&r.depth===parent.depth+1&&r.depth<=3&&equal(r.witness,{kind:'POSTPROCESS'}),'Exact composition provenance');
 const s=parent.selector,p=parent.profile;
 assert(equal(r.selector,reduced(s.numerators.map(n=>(s.denominator-n)*zero+n*one),s.denominator*12))&&equal(r.profile,reduced(p.numerators.map(n=>p.denominator*zero+n*(one-zero)),p.denominator*12)),'Exact affine postprocessing from the actual parent filter');validateSelector(r,counts);
}
function validateState(state,id,revision,compiled,records){
 const source=report(id,revision),a=assessment(id);
 assert(equal(Object.keys(state).sort(),['channel','configuration','designs'])&&equal(state.configuration,{repository,url:source.url,sha256:source.sha256,contexts:['low','high'],signals,trials_per_context:12}),'Immutable source-bound scope');
 assert(Array.isArray(state.designs)&&state.designs.length===records.length,'Exact append count');
 if(!compiled){assert(equal(state.channel,{status:'PENDING'})&&records.length===0,'Initial state only');return;}
 const c=state.channel;assert(equal(c.source,source.source)&&equal(c.assessment,a),'Full independently acquired source and all ten decisions');
 if(id==='unresolved'){assert(equal(Object.keys(c).sort(),['assessment','source','status','unknown'])&&c.status==='REVIEW'&&equal(c.unknown,['low:blue','low:gray'])&&records.length===0,'No invented pooled-count split');return;}
 if(id==='invalid'){assert(c.status==='INVALID_COUNTS'&&equal(c.row_totals,[13,12])&&records.length===0,'Invalid normalization rejected');return;}
 assert(equal(Object.keys(c).sort(),['assessment','geometry','source','status'])&&c.status==='READY','Exact compiled channel');validateGeometry(c.geometry,a.counts);
 records.forEach((item,i)=>{const d=state.designs[i];if(item.method==='design'){assert(equal(Object.keys(d).sort(),['kind','result','target'])&&d.kind==='DESIGN'&&equal(d.target,item.args.map(Number)),'Exact requested design');validateResult(d.result,a.counts,d.target);}else {const [parent,zero,one]=item.args.map(Number);assert(equal(Object.keys(d).sort(),['kind','one','parent','result','zero'])&&d.kind==='COMPOSE'&&d.parent===parent&&d.zero===zero&&d.one===one&&parent<i,'Parent and postprocessing request');validateComposition(d.result,state.designs[parent].result,zero,one,a.counts);}});
}
function plan(id){
 const targets=id==='informative'?[[0,12],[3,9]]:id==='noisy'?[[8,4],[12,0]]:[[6,6],[7,5]];
 const initial=[{label:id+'-reject-before-compile',method:'design',args:['0','12'],error:'[EXPECTED] Channel not ready'},{label:id+'-compile',method:'compile',args:[]}];
 if(id==='unresolved')return [...initial,{label:id+'-reject-unresolved-design',method:'design',args:['6','6'],error:'[EXPECTED] Channel not ready'},{label:id+'-reject-unresolved-compose',method:'compose',args:['0','3','9'],error:'[EXPECTED] Channel not ready'},{label:id+'-reject-recompile',method:'compile',args:[],error:'[EXPECTED] Channel already compiled'}];
 const parent=id==='informative'?1:0,post=id==='blind'?[0,12]:[3,9];
 return [...initial,...targets.map((t,i)=>({label:id+'-design-'+i,method:'design',args:t.map(String)})),{label:id+'-compose',method:'compose',args:[parent,...post].map(String)},
  id==='informative'?{label:id+'-reject-parent',method:'compose',args:['999','0','12'],error:'[EXPECTED] Invalid composition'}:{label:id+'-reject-infeasible-parent',method:'compose',args:['1','0','12'],error:'[EXPECTED] Parent filter infeasible'},
  {label:id+'-reject-duplicate',method:'design',args:targets[1].map(String),error:'[EXPECTED] Profile already designed'},{label:id+'-reject-recompile',method:'compile',args:[],error:'[EXPECTED] Channel already compiled'}];
}
const queryPlan=id=>id==='unresolved'?[]:[[0,0],[0,12],[12,0],[12,12],[6,6],[3,9],[9,3],[8,4],[7,5]].map(([low,high])=>({low,high}));
module.exports={ids,signals,repository,report,assessment,args,gcd,reduced,corners,feasible,validateGeometry,validateResult,validateSelector,validateComposition,validateState,plan,queryPlan};
