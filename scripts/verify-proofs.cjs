const fs=require('node:fs'),path=require('node:path');
const {root,assert,equal,sourceHash,rpc,read,receiptSummary,save}=require('./transport.cjs');
const {decodeReceipt}=require('./receipt-calldata.cjs');
const {ids,args,assessment,plan,validateState,queryPlan,validateResult}=require('./scenario.cjs');
const load=name=>JSON.parse(fs.readFileSync(path.join(root,'proofs',name+'.json')));
async function main(){
 const offline=process.argv.includes('--offline'),selected=process.env.SIGNAL_SCENARIO||'all',chosen=selected==='all'?ids:[selected];
 assert(chosen.every(x=>ids.includes(x)),'Known verification scope');
 const suite=load('suite'),journal=load('transactions'),revision=fs.readFileSync(path.join(root,'config/fixture-revision.txt'),'utf8').trim();
 const code=fs.readFileSync(path.join(root,'contracts/signal_hull.py'));assert(journal.source_sha256===sourceHash&&suite.length===chosen.length,'Complete source-bound suite');
 if(!offline)assert(await rpc('eth_chainId',[])==='0xf22f','StudioNet only');
 const hashes=new Set(),summary={scope:selected,mode:offline?'offline-artifact':'fresh-rpc-and-state',verified_at:new Date().toISOString(),source_sha256:sourceHash,instances:[],transactions:[]};
 async function verify(label,hash,d,expected,error){
  const saved=load(label+'-receipt'),r=offline?saved:await rpc('eth_getTransactionByHash',[hash]),s=receiptSummary(r),votes=Object.keys(r.consensus_data.votes).length;
  assert(!hashes.has(hash)&&journal.hashes[label]===hash,'Unique journaled transaction');hashes.add(hash);
  assert(s.hash===hash&&s.status==='FINALIZED'&&s.result==='MAJORITY_AGREE'&&s.agree>votes/2&&votes===s.agree+s.disagree+s.idle&&votes===r.consensus_data.validators.length+1,'Full votes and strict finalized majority');
  assert((r.to_address||r.recipient).toLowerCase()===d.contract.toLowerCase()&&(r.from_address||r.sender).toLowerCase()===d.caller,'Actual signed caller and target');
  assert(equal(saved.data,r.data)&&equal(saved.consensus_data.votes,r.consensus_data.votes)&&equal(await decodeReceipt(r),expected),'Decoded actual calldata and preserved vote map');
  assert(error?s.execution==='ERROR':['SUCCESS','FINISHED_WITH_RETURN'].includes(s.execution),'Expected execution status');
  if(label.endsWith('-deployment'))assert(code.equals(Buffer.from(r.data.contract_code,'base64')),'Exact deployment source bytes');
  if(error){const raw=Buffer.from(r.consensus_data.leader_receipt[0].result,'base64');assert(raw[0]===1&&raw.subarray(1).toString('utf8')===error,'Exact expected rejection bytes');}
  summary.transactions.push({label,...s,recorded_voters:votes,round_count:r.num_of_rounds,rotation_count:r.rotation_count});
 }
 for(let i=0;i<suite.length;i++){
  const d=suite[i],id=chosen[i];assert(d.id===id&&d.network==='studionet'&&d.chain_id===61999&&d.source_sha256===sourceHash&&d.fixture_revision===revision&&equal(d.args,args(id,revision))&&/^0x[0-9a-f]{40}$/.test(d.caller),'Fixed source-bound deployment');
  await verify(id+'-deployment',d.deployment,d,{args:d.args});
  let before=load(id+'-initial-state'),compiled=false;const records=[];validateState(before,id,revision,compiled,records);
  const trace=load(id+'-trace'),items=plan(id);assert(trace.length===items.length,'Complete public scenario plan');
  for(let j=0;j<items.length;j++){
   const item=items[j],t=trace[j];assert(Object.keys(item).every(k=>equal(item[k],t[k]))&&equal(t.state_before,before),'Exact scenario and state linkage');
   await verify(item.label,t.transaction,d,{method:item.method,args:item.args.map(Number)},item.error);
   if(item.error)assert(equal(before,t.state),'Entire rejected-call rollback');else if(item.method==='compile')compiled=true;else records.push(item);
   validateState(t.state,id,revision,compiled,records);before=t.state;
  }
  assert(equal(before,load(id+'-final-state')),'Complete final channel and composition state');
  const queries=load(id+'-queries'),expected=queryPlan(id);assert(queries.length===expected.length,'Complete independent profile preview grid');
  for(let j=0;j<queries.length;j++){
   const q=queries[j],p=expected[j];assert(q.low===p.low&&q.high===p.high,'Planned requested response');validateResult(q.result,assessment(id).counts,[p.low,p.high]);
   if(!offline)assert(equal(await read(id+'-fresh-preview-'+j,['call',d.contract,'preview','--args',String(p.low),String(p.high)]),q.result),'Fresh exact rational filter or separator');
  }
  if(!offline){assert(code.equals(Buffer.from(await rpc('gen_getContractCode',[d.contract]),'base64')),'Fresh deployed source');assert(equal(await read(id+'-fresh-final',['call',d.contract,'get_state']),before),'Fresh full report, assessment, geometry, filters and provenance');}
  summary.instances.push({id,contract:d.contract,channel_status:before.channel.status,design_statuses:before.designs.map(x=>x.result.status),previews:queries.length});
 }
 const count=chosen.reduce((n,id)=>n+plan(id).length+1,0);assert(hashes.size===count&&Object.keys(journal.hashes).length===count,'Exactly planned receipt set');
 summary.transaction_calldata_checked=true;summary.rejection_bytes_checked=true;summary.independent_cube_slice_lp_oracle=true;
 if(!offline){summary.live_state_match=true;save(selected==='all'?'verification':'verification-'+selected,summary);}else save('offline-verification',summary);
 console.log(JSON.stringify({scope:summary.scope,mode:summary.mode,instances:summary.instances,receipts:summary.transactions.length},null,2));
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
