const fs=require('node:fs'),path=require('node:path');
const {root,assert,equal,sourceHash,invoke,read,rpc,receipt,save}=require('./transport.cjs');
const {ids,args,assessment,plan,validateState,queryPlan,validateResult}=require('./scenario.cjs');
async function main(){
 const id=process.env.SIGNAL_SCENARIO;assert(ids.includes(id),'Select a complete channel scenario');
 const accounts=JSON.parse(process.env.SIGNAL_ACCOUNTS||'[]');assert(accounts.length===1,'One disposable CLI caller');
 const account=accounts[0];process.env.SIGNAL_ACCOUNT=account.name;
 assert(await rpc('eth_chainId',[])==='0xf22f','StudioNet only');
 const revision=fs.readFileSync(path.join(root,'config/fixture-revision.txt'),'utf8').trim();
 const hash=await invoke(id+'-deployment',['deploy','--contract','contracts/signal_hull.py','--args',...args(id,revision)]);
 const deployment=await receipt(id+'-deployment',hash,true),contract=deployment.to_address||deployment.recipient;assert(/^0x[a-fA-F0-9]{40}$/.test(contract),'Actual deployed contract');
 save('suite',[{id,network:'studionet',chain_id:61999,contract,deployment:hash,caller:account.address,args:args(id,revision),fixture_revision:revision,source_sha256:sourceHash}]);
 let before=await read(id+'-initial',['call',contract,'get_state']),compiled=false;const records=[],trace=[];
 validateState(before,id,revision,compiled,records);save(id+'-initial-state',before);
 for(const item of plan(id)){
  const h=await invoke(item.label,['write',contract,item.method,...(item.args.length?['--args',...item.args]:[])]);
  await receipt(item.label,h,!item.error);
  const state=await read(item.label+'-state',['call',contract,'get_state']);
  if(item.error)assert(equal(before,state),'Full rollback after expected rejection');
  else if(item.method==='compile')compiled=true;else records.push(item);
  validateState(state,id,revision,compiled,records);trace.push({...item,transaction:h,state_before:before,state});save(id+'-trace',trace);before=state;
 }
 save(id+'-final-state',before);const queries=[];
 for(const q of queryPlan(id)){
  const result=await read(id+'-preview-'+q.low+'-'+q.high,['call',contract,'preview','--args',String(q.low),String(q.high)]);
  validateResult(result,assessment(id).counts,[q.low,q.high]);queries.push({...q,result});save(id+'-queries',queries);
 }
 save(id+'-queries',queries);console.log('PASSED '+id+': '+(trace.length+1)+' finalized receipts and '+queries.length+' independent LP-checked previews');
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;});
