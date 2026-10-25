import ast
from fractions import Fraction
from itertools import combinations, product
import hashlib
import json
import math
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'contracts/signal_hull.py'
REPO = 'mohammadisina1988-jpg/signal-hull'
CONTEXTS = ['low', 'high']
SIGNALS = ['red', 'blue', 'green', 'gray']
CASES = ['informative', 'noisy', 'blind', 'unresolved', 'invalid']


def pure():
    names = {'integer','valid_assessment','cross','reduced','geometry','compile_counts','separator','mixture','solve','postprocess'}
    tree = ast.parse(SOURCE.read_text())
    def fail(message): raise AssertionError(message)
    ns = {'CONTEXTS':CONTEXTS, 'SIGNALS':SIGNALS, 'math':math, 'fail':fail}
    exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name in names], type_ignores=[]),str(SOURCE),'exec'),ns)
    return ns


F = pure()


def answer(case='noisy'):
    return json.loads((ROOT / 'tests' / (case+'-expected.json')).read_text())


def record(case='noisy'):
    raw = (ROOT / 'reports' / (case+'.json')).read_bytes()
    return 'https://raw.githubusercontent.com/'+REPO+'/'+'a'*40+'/reports/'+case+'.json', hashlib.sha256(raw).hexdigest(), raw


def deploy(factory, case='noisy', **overrides):
    url, sha, raw = record(case)
    params = {'repository':REPO,'url':url,'sha256':sha}
    params.update(overrides)
    return factory(str(SOURCE),**params)


def mocks(vm, case='noisy', proposed=None, audit=None, raw=None, status=200):
    vm.clear_mocks()
    vm.mock_web(re.escape(record(case)[0]),{'status':status,'body':record(case)[2] if raw is None else raw})
    vm.mock_llm(r'.*SIGNALHULL-EXTRACT.*',json.dumps(answer(case) if proposed is None else proposed))
    vm.mock_llm(r'.*SIGNALHULL-AUDIT.*',json.dumps({'trials':[True]*2,'counts':[[True]*4 for _ in range(2)]} if audit is None else audit))


def compile_channel(c, vm, case='noisy'):
    mocks(vm,case)
    c.compile()
    assert vm.run_validator() is True
    return c.get_state()['channel']


def feasible(counts, target):
    # Independent cube-slice vertex enumeration: no polygon or triangulation.
    for free in combinations(range(4),2):
        fixed = [j for j in range(4) if j not in free]
        a,b = free
        det = counts[0][a]*counts[1][b]-counts[0][b]*counts[1][a]
        if not det:
            continue
        for bits in product([0,1],repeat=2):
            rhs = [target[i]-sum(counts[i][j]*x for j,x in zip(fixed,bits)) for i in range(2)]
            x = Fraction(rhs[0]*counts[1][b]-rhs[1]*counts[0][b],det)
            y = Fraction(counts[0][a]*rhs[1]-counts[1][a]*rhs[0],det)
            if 0 <= x <= 1 and 0 <= y <= 1:
                return True
    # Rank-one slice: one free coordinate suffices for a vertex.
    for free in range(4):
        fixed = [j for j in range(4) if j != free]
        for bits in product([0,1],repeat=3):
            rhs = [target[i]-sum(counts[i][j]*x for j,x in zip(fixed,bits)) for i in range(2)]
            row = next((i for i in range(2) if counts[i][free]),None)
            if row is None:
                continue
            x = Fraction(rhs[row],counts[row][free])
            if 0 <= x <= 1 and all(counts[i][free]*x == rhs[i] for i in range(2)):
                return True
    return False


def verify_result(counts, target, result):
    possible = feasible(counts,target)
    assert (result['status'] == 'FEASIBLE') == possible
    if possible:
        selector = result['selector']
        d = selector['denominator']
        assert len(selector['numerators']) == 4 and d > 0
        assert all(type(n) is int and 0 <= n <= d for n in selector['numerators'])
        assert math.gcd(d,*selector['numerators']) == 1
        assert [sum(row[j]*Fraction(selector['numerators'][j],d) for j in range(4)) for row in counts] == list(target)
        p = result['profile']
        assert [12*Fraction(n,p['denominator']) for n in p['numerators']] == list(target)
        witness = result['witness']
        if witness['kind'] == 'MIXTURE':
            nums,den = witness['weights']['numerators'],witness['weights']['denominator']
            assert len(nums) == len(witness['masks']) <= 3 and sum(nums) == den and all(n >= 0 for n in nums)
            for j in range(4):
                assert sum(Fraction(n,den) for mask,n in zip(witness['masks'],nums) if mask & (1<<j)) == Fraction(selector['numerators'][j],d)
    else:
        normal,bound = result['normal'],result['bound']
        assert len(normal) == 2 and math.gcd(*normal) == 1
        values = []
        for mask in range(16):
            point = [sum(row[j] for j in range(4) if mask & (1<<j)) for row in counts]
            values.append(sum(n*x for n,x in zip(normal,point)))
        observed = sum(n*x for n,x in zip(normal,target))
        assert max(values) == bound < observed
        assert result['observed'] == observed and result['margin'] == observed-bound
