# SignalHull

**Consensus observation reports → exact randomized signal filters, or a separating impossibility witness.**

A fixed commit-pinned prose report describes two input contexts and four observed signal labels. GenLayer leader and validators independently fetch the complete document, extract all ten trial/count decisions, compare each exactly and separately audit every full source clause. Requested response profiles come from users; observed counts come from the fetched report.

The contract enumerates all sixteen deterministic filters and constructs their attainable response polygon. A feasible request becomes an exact rational mixture of at most three deterministic filters, yielding one emit-one probability per source signal. An infeasible request gets an integer separating line proving that every attainable filter misses it. Equal context distributions collapse to a diagonal segment, handled explicitly. Feasible filters can be composed with further binary postprocessing while retaining their exact response probabilities and parent provenance.

## Read and reproduce

- [Pinned GenVM contract](contracts/signal_hull.py)
- [Architecture and consensus boundary](docs/architecture.md)
- [Synthetic reports](reports)
- [Independent linear-feasibility tests](tests/direct)
- [CLI live driver](scripts/live-proof.cjs) and [receipt/state verifier](scripts/verify-proofs.cjs)
- [Onchain proof index](proofs/README.md)

```sh
pip install -r requirements-dev.txt
npm ci --no-audit --no-fund
genvm-lint download --version v0.2.16
genvm-lint check contracts/signal_hull.py --json
python -m pytest tests/direct -q
node --test tests/rpc-preflight.test.cjs
```

Python 3.13 and Node 24. Runner, SDK, CLI and test dependencies are pinned. A newer-runner notice from the linter does not change the concrete reviewed source header.

## Interface

Deploy with `(repository,url,sha256)`. The URL must be HTTPS raw GitHub, pinned to a forty-character commit under that repository's `reports/` directory. The source is immutable for the deployment.

- `compile()`: permissionless one-time fetching and interpretation. READY requires exactly twelve completed trials and counts summing to twelve for each context. Missing counts yield REVIEW; wrong totals yield INVALID_COUNTS. Those statuses block filter creation.
- `preview(low,high)`: exact feasibility/filter or separator for response probabilities low/12 and high/12.
- `design(low,high)`: append that result once for the requested profile.
- `compose(parent,zero,one)`: postprocess a feasible recorded filter, emitting one with probabilities zero/12 or one/12 after parent output zero or one.
- `get_state()`: full source, assessment, attainable geometry, designs and composition provenance.

No administrator, update path, deletion, service certificate or token settlement. Sixteen records and three composition layers bound storage and rational arithmetic. The sampler is external: this contract constructs probability rules and proves their empirical response profiles; it does not supply randomness or observe a real sensor. Another contract or client can consume the returned rational selector with its own sampling mechanism.

The independent oracle enumerates vertices of the linear constraint system, rather than using the contract's polygon triangulation. Tests cover every two-signal channel with twelve trials per context and all 169 requested profiles, generated four-signal channels, exact compositions, each validator disagreement/audit cell and actual VM versus JavaScript results. Live workflows separately exercise real fetching and AI consensus, check every signed receipt and complete state transition, and freshly read deployed code/state/previews. FINALIZED alone is insufficient.

Synthetic empirical counts demonstrate a bounded information-processing primitive. Twelve observations do not establish population probabilities or physical truth. Hashes establish bytes, not author identity or commit ancestry. The source repository controls the available evidence, and AI interpretations can be wrong despite consensus. Deploy a reviewed replacement for corrections; there is no owner override.

MIT. Classical channel-garbling/convexity results are credited in the architecture note. Generic CLI transport and test bootstrap are reused under MIT with attribution retained; the channel construction, composition mechanism, fixtures and independent feasibility oracles are specific to SignalHull.
