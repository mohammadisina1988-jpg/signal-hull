const fs=require('node:fs');
const {assert}=require('./transport.cjs');
const {assessment,validateState,validateResult}=require('./scenario.cjs');
const x=JSON.parse(fs.readFileSync(0,'utf8'));
validateState(x.state,x.id,'a'.repeat(40),true,x.records);
for(const q of x.queries)validateResult(q.result,assessment(x.id).counts,[q.low,q.high]);
console.log('Actual VM matches independent linear-feasibility oracle');
