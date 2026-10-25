from fractions import Fraction
import random
import pytest
from support import F, answer, verify_result


@pytest.mark.parametrize('left',range(13))
def test_every_two_signal_channel_and_all_169_requested_profiles(left):
    for right in range(13):
        counts = [[left,12-left,0,0],[right,12-right,0,0]]
        basis = F['geometry'](counts)
        for a in range(13):
            for b in range(13):
                verify_result(counts,[a,b],F['solve'](basis,[a,b]))


@pytest.mark.parametrize('seed',range(32))
def test_generated_four_signal_channels_all_profiles_and_exact_compositions(seed):
    rng = random.Random(seed)
    def row():
        cuts = [0]+sorted(rng.randint(0,12) for _ in range(3))+[12]
        return [b-a for a,b in zip(cuts,cuts[1:])]
    counts = [row(),row()]
    basis = F['geometry'](counts)
    for a in range(13):
        for b in range(13):
            result = F['solve'](basis,[a,b])
            verify_result(counts,[a,b],result)
            if result['status'] == 'FEASIBLE' and (a+b)%7 == 0:
                for depth in range(3):
                    zero,one = rng.randint(0,12),rng.randint(0,12)
                    target = [Fraction(zero)+v*Fraction(one-zero,12) for v in [Fraction(a),Fraction(b)]] if depth == 0 else [Fraction(zero)+v*Fraction(one-zero,12) for v in target]
                    result = F['postprocess'](result,zero,one)
                    verify_result(counts,target,result)
                    assert result['depth'] == depth+1


@pytest.mark.parametrize('case,status',[('informative','READY'),('noisy','READY'),('blind','READY'),('unresolved','REVIEW'),('invalid','INVALID_COUNTS')])
def test_all_compilation_gates(case,status):
    result = F['compile_counts'](answer(case))
    assert result['status'] == status
    if status == 'REVIEW': assert result['unknown'] == ['low:blue','low:gray']
    if status == 'INVALID_COUNTS': assert result['row_totals'] == [13,12]


@pytest.mark.parametrize('bad',[None,True,False,1.0,-1,13,'1',[],{}])
def test_strict_count_types(bad):
    a = answer()
    a['counts'][0][0] = bad
    assert not F['valid_assessment'](a)
