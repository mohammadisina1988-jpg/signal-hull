# Worked exact filter

The noisy fixture's final observations are:

| Input context | Red | Blue | Green | Gray | Total |
|---|---:|---:|---:|---:|---:|
| low | 6 | 3 | 2 | 1 | 12 |
| high | 1 | 2 | 3 | 6 | 12 |

To emit one with conditional probabilities 8/12 and 4/12, SignalHull constructs the rational signal rule `[16,16,12,0]/21` in red/blue/green/gray order. Its exact empirical output counts are:

```
low:  (6*16 + 3*16 + 2*12 + 1*0)/21 = 8
high: (1*16 + 2*16 + 3*12 + 6*0)/21 = 4
```

The constructive witness mixes deterministic masks 0, 3 and 7 with weights `[5,4,12]/21`. Mask 0 always emits zero; mask 3 emits one after red or blue; mask 7 emits one after red, blue or green. This mixture reconstructs each component of the rational rule.

Postprocess that binary output by emitting one with probability 3/12 after zero and 9/12 after one. The new four-signal selector is `[53,53,45,21]/84`. Its response profile becomes `(7/12,5/12)`. The stored composition points to the original filter; it is the affine transformation of that actual selector, not a replacement optimized only for the same profile.

The requested profile `(12/12,0/12)` is impossible. The separating normal `[1,-6]` has support bound zero: each generator has value at most zero, so every deterministic rule and convex mixture does too. The requested count point has value `12 - 6*0 = 12`, a strict gap of twelve. This is an exact impossibility witness over the compiled empirical channel.

The direct tests independently solve the linear constraints for these profiles. [Live receipts](../proofs/README.md) separately bind the acquired report and accepted interpretation to the deployed state. The example does not claim population probabilities or supply a randomness source for executing the rule.
