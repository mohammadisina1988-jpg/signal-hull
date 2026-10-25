import hashlib
import json
import re
from fractions import Fraction
import pytest
from support import CASES, F, answer, record, deploy, mocks, compile_channel, verify_result


@pytest.mark.parametrize('case',CASES)
def test_actual_vm_compilation_and_all_profiles(direct_vm,direct_deploy,case):
    c = deploy(direct_deploy,case)
    with direct_vm.expect_revert('Channel not ready'): c.design(0,12)
    channel = compile_channel(c,direct_vm,case)
    assert channel['source'] == json.loads(record(case)[2]) and channel['assessment'] == answer(case)
    assert channel['status'] == F['compile_counts'](answer(case))['status']
    before = c.get_state()
    if channel['status'] == 'READY':
        for low in range(13):
            for high in range(13): verify_result(answer(case)['counts'],[low,high],c.preview(low,high))
    else:
        with direct_vm.expect_revert('Channel not ready'): c.preview(6,6)
        with direct_vm.expect_revert('Channel not ready'): c.compose(0,3,9)
    with direct_vm.expect_revert('Channel already compiled'): c.compile()
    assert c.get_state() == before


def test_permissionless_design_composition_and_parent_immutability(direct_vm,direct_deploy,direct_accounts):
    c = deploy(direct_deploy)
    compile_channel(c,direct_vm)
    direct_vm.sender = direct_accounts[1]
    c.design(8,4)
    parent = c.get_state()['designs'][0]
    direct_vm.sender = direct_accounts[2]
    c.compose(0,3,9)
    state = c.get_state()
    assert state['designs'][0] == parent
    assert state['designs'][1]['parent'] == 0
    verify_result(answer()['counts'],[Fraction(7),Fraction(5)],state['designs'][1]['result'])
    c.compose(1,1,11)
    c.compose(2,2,10)
    before = c.get_state()
    with direct_vm.expect_revert('depth exhausted'): c.compose(3,3,9)
    with direct_vm.expect_revert('Composition already recorded'): c.compose(0,3,9)
    with direct_vm.expect_revert('Profile already designed'): c.design(8,4)
    assert c.get_state() == before


def test_infeasible_parent_cannot_compose_and_capacity_is_bounded(direct_vm,direct_deploy):
    c = deploy(direct_deploy)
    compile_channel(c,direct_vm)
    c.design(12,0)
    with direct_vm.expect_revert('Parent filter infeasible'): c.compose(0,0,12)
    for i in range(15): c.design(i//13,i%13)
    before = c.get_state()
    with direct_vm.expect_revert('Design log full'): c.design(5,5)
    assert c.get_state() == before


@pytest.mark.parametrize('position',range(10))
def test_validator_rejects_each_independent_count_disagreement(direct_vm,direct_deploy,position):
    c = deploy(direct_deploy)
    compile_channel(c,direct_vm)
    a = answer()
    if position < 2: a['trials'][position] = 'UNKNOWN'
    else: a['counts'][(position-2)//4][(position-2)%4] = 'UNKNOWN'
    mocks(direct_vm,proposed=a)
    assert direct_vm.run_validator() is False


@pytest.mark.parametrize('position',range(10))
def test_substantive_audit_rejects_each_cell(direct_vm,direct_deploy,position):
    c = deploy(direct_deploy)
    compile_channel(c,direct_vm)
    a = {'trials':[True]*2,'counts':[[True]*4 for _ in range(2)]}
    if position < 2: a['trials'][position] = False
    else: a['counts'][(position-2)//4][(position-2)%4] = False
    mocks(direct_vm,audit=a)
    assert direct_vm.run_validator() is False


def test_validator_fetches_source_independently(direct_vm,direct_deploy):
    c = deploy(direct_deploy)
    compile_channel(c,direct_vm)
    mocks(direct_vm,raw=b'wrong bytes')
    assert direct_vm.run_validator() is False


@pytest.mark.parametrize('bad',[{}, {'trials':[12,12]}, {'trials':[12,12],'counts':[[6,3,2]]}, {'trials':[12,12],'counts':[[6,3,2,None],[1,2,3,6]]}])
def test_malformed_model_result_never_compiles(direct_vm,direct_deploy,bad):
    c = deploy(direct_deploy)
    mocks(direct_vm,proposed=bad)
    with direct_vm.expect_revert('Invalid complete counts'): c.compile()
    assert c.get_state()['channel'] == {'status':'PENDING'}


def test_schema_repair_retains_explicit_unknown(direct_vm,direct_deploy):
    c = deploy(direct_deploy,'unresolved')
    bad = answer('unresolved')
    bad['counts'][0][1] = None
    direct_vm.mock_web(re.escape(record('unresolved')[0]),{'status':200,'body':record('unresolved')[2]})
    direct_vm.mock_llm(r'(?s)^(?!.*Previous invalid response:).*SIGNALHULL-EXTRACT.*',json.dumps(bad))
    direct_vm.mock_llm(r'(?s).*SIGNALHULL-EXTRACT.*Previous invalid response:.*',json.dumps(answer('unresolved')))
    direct_vm.mock_llm(r'.*SIGNALHULL-AUDIT.*',json.dumps({'trials':[True]*2,'counts':[[True]*4 for _ in range(2)]}))
    c.compile()
    assert direct_vm.run_validator() is True
    assert c.get_state()['channel']['status'] == 'REVIEW'


@pytest.mark.parametrize('mutation',['roster','signals','trials','text','duplicate','oversize','json'])
def test_invalid_external_report_does_not_consume(direct_vm,direct_deploy,mutation):
    source = json.loads(record()[2])
    if mutation == 'roster': source['contexts'].reverse()
    if mutation == 'signals': source['contexts'][0]['signals'].reverse()
    if mutation == 'trials': source['contexts'][0]['trials'] = 12
    if mutation == 'text': source['contexts'][0]['signals'][0]['text'] = ''
    raw = json.dumps(source).encode()
    if mutation == 'duplicate': raw = b'{"id":"one","id":"two"}'
    if mutation == 'oversize': raw = b'x'*18001
    if mutation == 'json': raw = b'not json'
    c = deploy(direct_deploy,sha256=hashlib.sha256(raw).hexdigest())
    mocks(direct_vm,raw=raw)
    with direct_vm.expect_revert('EXTERNAL'): c.compile()
    assert c.get_state()['channel'] == {'status':'PENDING'}


def test_hash_failure_transient_and_matching_model_errors(direct_vm,direct_deploy):
    c = deploy(direct_deploy)
    mocks(direct_vm,raw=b'changed')
    with direct_vm.expect_revert('commitment mismatch'): c.compile()
    mocks(direct_vm,status=503)
    with direct_vm.expect_revert('TRANSIENT'): c.compile()
    assert c.get_state()['channel'] == {'status':'PENDING'}
    compile_channel(c,direct_vm)
    mocks(direct_vm,proposed={'bad':True})
    assert direct_vm.run_validator(leader_error=Exception('[LLM_ERROR] Invalid complete counts')) is False
    mocks(direct_vm,status=503)
    assert direct_vm.run_validator(leader_error=Exception('[TRANSIENT] Report unavailable')) is True


@pytest.mark.parametrize('low,high',[(-1,0),(0,13),(13,0),(0,-1)])
def test_invalid_profiles(direct_vm,direct_deploy,low,high):
    c = deploy(direct_deploy)
    compile_channel(c,direct_vm)
    with direct_vm.expect_revert('Invalid response profile'): c.design(low,high)


@pytest.mark.parametrize('parent,zero,one',[(0,0,12),(-1,0,12),(0,-1,12),(0,0,13)])
def test_invalid_composition(direct_vm,direct_deploy,parent,zero,one):
    c = deploy(direct_deploy)
    compile_channel(c,direct_vm)
    if parent >= 0 and zero < 0 or one > 12: c.design(6,6)
    with direct_vm.expect_revert('Invalid composition'): c.compose(parent,zero,one)


@pytest.mark.parametrize('override',[{'url':'https://example.com/report.json'}, {'url':'https://raw.githubusercontent.com/'+ 'mohammadisina1988-jpg/signal-hull/main/reports/noisy.json'}, {'sha256':'A'*64}, {'repository':'../bad'}])
def test_deployment_commit_scope(direct_vm,direct_deploy,override):
    with direct_vm.expect_revert('EXPECTED'): deploy(direct_deploy,**override)
