import json
import subprocess
import pytest
from support import ROOT, CASES, deploy, compile_channel


@pytest.mark.parametrize('case',CASES)
def test_actual_vm_against_independent_javascript_cube_slice_oracle(direct_vm,direct_deploy,case):
    c = deploy(direct_deploy,case)
    compile_channel(c,direct_vm,case)
    records,queries = [],[]
    if case not in ['unresolved','invalid']:
        c.design(6,6)
        records.append({'method':'design','args':['6','6']})
        c.compose(0,3,9)
        records.append({'method':'compose','args':['0','3','9']})
        for low in range(13):
            for high in range(13): queries.append({'low':low,'high':high,'result':c.preview(low,high)})
    out = subprocess.run(['node','scripts/check-local-trace.cjs'],cwd=ROOT,input=json.dumps({'id':case,'state':c.get_state(),'records':records,'queries':queries}),text=True,capture_output=True)
    assert out.returncode == 0, out.stdout + out.stderr
