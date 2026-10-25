# SignalHull: verified StudioNet scenario proofs

Gasless GenLayer StudioNet, chain **61999**. Four independent CLI deployments, **33 finalized MAJORITY_AGREE receipts**: 17 successful operations and 16 expected rejections. Complete states and **27 live profile previews** pass an independent cube-slice linear-feasibility oracle.

Contract source SHA-256: `2279ccb85da1ef029158232337395f867bf81f71d11057dd90b1bba6b9e67a25`. Fixture commit: `aca3d6e3dadd06a66d2fa4c7868abb9b03c43bfe`. Workflow revision: `ddbe7ea3ac4ed0cc90d2fa868c159687e0eb4b1a`. [Contract](../contracts/signal_hull.py) · [Architecture](../docs/architecture.md) · [Verification](verification.json) · [Local offline replay](offline-verification.json) · [Artifact metadata](artifact-manifest.json).

| Scenario | Explorer contract | Deployment | Compiled status | Fresh workflow |
|---|---|---|---|---|
| informative | [`0x793fb9c6715E7378b241C086fDed7c5877Cde80c`](https://explorer-studio.genlayer.com/address/0x793fb9c6715E7378b241C086fDed7c5877Cde80c) | [transaction](https://explorer-studio.genlayer.com/tx/0xf478f81ceb5b1b34af2d419ae489e06298bfab43d5c8865f876cca61d99e2251) | READY | [run 40195198608](https://github.com/mohammadisina1988-jpg/signal-hull/actions/runs/40195198608) |
| noisy | [`0x8171973fd2Ed672085BF970898f78906A67A102b`](https://explorer-studio.genlayer.com/address/0x8171973fd2Ed672085BF970898f78906A67A102b) | [transaction](https://explorer-studio.genlayer.com/tx/0x91cf40f2042f7004252b0427122fecfc5ec1a42a7c2e53d1f33e07fb595f1434) | READY | [run 40195202436](https://github.com/mohammadisina1988-jpg/signal-hull/actions/runs/40195202436) |
| blind | [`0xb811c517cc7907d129B8c01deE1e237046ab8d22`](https://explorer-studio.genlayer.com/address/0xb811c517cc7907d129B8c01deE1e237046ab8d22) | [transaction](https://explorer-studio.genlayer.com/tx/0xa36a17fb7e5164a2c5a160e1aad745e9e7ae1b51fc7133da25d28294041cdbb1) | READY | [run 40195206202](https://github.com/mohammadisina1988-jpg/signal-hull/actions/runs/40195206202) |
| unresolved | [`0x297621d9BF16eca3cf830656b68691F5c384f97e`](https://explorer-studio.genlayer.com/address/0x297621d9BF16eca3cf830656b68691F5c384f97e) | [transaction](https://explorer-studio.genlayer.com/tx/0x53a8a0530041cd5febaec50cb826cdc7f67cde30134ab5f884d51749b172f32a) | REVIEW | [run 40195210762](https://github.com/mohammadisina1988-jpg/signal-hull/actions/runs/40195210762) |

## Material behavior

- **Informative:** disjoint source-signal supports reproduce a fully discriminating response and a fractional response. Postprocessing stores a new exact selector and induced rational profile.
- **Noisy:** `(8/12,4/12)` is constructible while `(12/12,0/12)` is separated from all sixteen deterministic rules. A valid filter composes; the impossible design cannot become a parent.
- **Blind:** identical input distributions produce a diagonal attainable segment. `(6/12,6/12)` is constructible; `(7/12,5/12)` has a positive separating margin.
- **Unresolved:** the report pools blue and gray observations without an individual split. Consensus retains both UNKNOWN cells, records REVIEW and rejects design and composition with unchanged state.
- Every suite rejects premature design and recompilation. Ready suites reject duplicate profiles and invalid/infeasible parents. Exact error bytes and full rollback are checked.

## Recorded filters and separation witnesses

| Scenario / index | Operation | Result | Exact rule or witness |
|---|---|---|---|
| informative / 0 | DESIGN | FEASIBLE | selector [0,0,1,1] / 1; profile [0,1] / 1; depth 0 |
| informative / 1 | DESIGN | FEASIBLE | selector [1,1,3,3] / 4; profile [1,3] / 4; depth 0 |
| informative / 2 | COMPOSE from 1 | FEASIBLE | selector [3,3,5,5] / 8; profile [3,5] / 8; depth 1 |
| noisy / 0 | DESIGN | FEASIBLE | selector [16,16,12,0] / 21; profile [2,1] / 3; depth 0 |
| noisy / 1 | DESIGN | INFEASIBLE | normal [1,-6]; bound 0; requested value 12; margin 12 |
| noisy / 2 | COMPOSE from 0 | FEASIBLE | selector [53,53,45,21] / 84; profile [7,5] / 12; depth 1 |
| blind / 0 | DESIGN | FEASIBLE | selector [1,1,1,1] / 2; profile [1,1] / 2; depth 0 |
| blind / 1 | DESIGN | INFEASIBLE | normal [1,-1]; bound 0; requested value 2; margin 2 |
| blind / 2 | COMPOSE from 0 | FEASIBLE | selector [1,1,1,1] / 2; profile [1,1] / 2; depth 1 |

## Every signed call

| Call | Explorer transaction | Execution | Final votes agree / disagree / idle |
|---|---|---|---|
| informative-deployment | [`0xf478f81ceb…`](https://explorer-studio.genlayer.com/tx/0xf478f81ceb5b1b34af2d419ae489e06298bfab43d5c8865f876cca61d99e2251) · [receipt](informative-deployment-receipt.json) | SUCCESS | 5 / 0 / 0 |
| informative-reject-before-compile | [`0xc625eadf53…`](https://explorer-studio.genlayer.com/tx/0xc625eadf5345fb887dfb9c10fe0fcf523b866b78fe6a924adb4d1b0334151697) · [receipt](informative-reject-before-compile-receipt.json) | ERROR | 5 / 0 / 0 |
| informative-compile | [`0x9c95c79488…`](https://explorer-studio.genlayer.com/tx/0x9c95c794881e8f6bb32563f35702e3b47d0d95aa253da0dd78926cae1d665af7) · [receipt](informative-compile-receipt.json) | SUCCESS | 3 / 0 / 2 |
| informative-design-0 | [`0x6f11ef32f7…`](https://explorer-studio.genlayer.com/tx/0x6f11ef32f754f7e341c1b824754d1b4e6caf334a8a8e0eabab8e457eaf912b6a) · [receipt](informative-design-0-receipt.json) | SUCCESS | 5 / 0 / 0 |
| informative-design-1 | [`0xd2eac397cd…`](https://explorer-studio.genlayer.com/tx/0xd2eac397cd7d4bd1239ef44673e5f25c4ddc9d89ed4e1e9500e730501e4a5fad) · [receipt](informative-design-1-receipt.json) | SUCCESS | 5 / 0 / 0 |
| informative-compose | [`0x1f8220c536…`](https://explorer-studio.genlayer.com/tx/0x1f8220c5363c82082fd95acd1f3cfcbb43bf121b1920fd045c03bfa0cf028602) · [receipt](informative-compose-receipt.json) | SUCCESS | 3 / 0 / 2 |
| informative-reject-parent | [`0x91bd0e2608…`](https://explorer-studio.genlayer.com/tx/0x91bd0e26084e61f7c4523c786eaab47e57c30c27763145749ecb6f06affc2be5) · [receipt](informative-reject-parent-receipt.json) | ERROR | 3 / 0 / 2 |
| informative-reject-duplicate | [`0x48ec53f514…`](https://explorer-studio.genlayer.com/tx/0x48ec53f514ac64c4cf5883b81f504bda839bf50a493c27433b33898e551fb1e3) · [receipt](informative-reject-duplicate-receipt.json) | ERROR | 3 / 0 / 2 |
| informative-reject-recompile | [`0xae59dfd0d8…`](https://explorer-studio.genlayer.com/tx/0xae59dfd0d818a14876e5ed89a63f834c14e841c49ad49adad5e54c4f65aaebd0) · [receipt](informative-reject-recompile-receipt.json) | ERROR | 5 / 0 / 0 |
| noisy-deployment | [`0x91cf40f204…`](https://explorer-studio.genlayer.com/tx/0x91cf40f2042f7004252b0427122fecfc5ec1a42a7c2e53d1f33e07fb595f1434) · [receipt](noisy-deployment-receipt.json) | SUCCESS | 5 / 0 / 0 |
| noisy-reject-before-compile | [`0x5dd6a53e4e…`](https://explorer-studio.genlayer.com/tx/0x5dd6a53e4e3efe2c44109182118e27732e3f6670425683a7555faabd385a53f8) · [receipt](noisy-reject-before-compile-receipt.json) | ERROR | 3 / 0 / 2 |
| noisy-compile | [`0x6376a52566…`](https://explorer-studio.genlayer.com/tx/0x6376a5256685c85b64a4bbc7599d7be3e4fc2ce9bac22006251e3970e8ad349f) · [receipt](noisy-compile-receipt.json) | SUCCESS | 3 / 0 / 2 |
| noisy-design-0 | [`0x42b10bce90…`](https://explorer-studio.genlayer.com/tx/0x42b10bce90b92740cb95359936b48cfd1ee5c454246e3f9f84018be96ee69fa5) · [receipt](noisy-design-0-receipt.json) | SUCCESS | 3 / 0 / 2 |
| noisy-design-1 | [`0x271efd8c62…`](https://explorer-studio.genlayer.com/tx/0x271efd8c62c258fd89283a3c95ad8da9b17580ff2f1bbef655b8704f450ec460) · [receipt](noisy-design-1-receipt.json) | SUCCESS | 5 / 0 / 0 |
| noisy-compose | [`0x2757332fe7…`](https://explorer-studio.genlayer.com/tx/0x2757332fe74b5afc49e25d2cefeb6e21f4c037c0e9e061484b6a018488211ed3) · [receipt](noisy-compose-receipt.json) | SUCCESS | 5 / 0 / 0 |
| noisy-reject-infeasible-parent | [`0x4410ac7590…`](https://explorer-studio.genlayer.com/tx/0x4410ac7590f70909c9712f3c5fc5a6e4b5fa8fd654bae9ebfda8621ea0be6298) · [receipt](noisy-reject-infeasible-parent-receipt.json) | ERROR | 5 / 0 / 0 |
| noisy-reject-duplicate | [`0x9b479500d8…`](https://explorer-studio.genlayer.com/tx/0x9b479500d86d280321f51b387ed88b9e80e53308089d8c0bbff88f6f35678e3c) · [receipt](noisy-reject-duplicate-receipt.json) | ERROR | 5 / 0 / 0 |
| noisy-reject-recompile | [`0xd9537f38d3…`](https://explorer-studio.genlayer.com/tx/0xd9537f38d3185c6ea027547e6924d9366750b1efc5b36c4aaee8913b1d1fdb95) · [receipt](noisy-reject-recompile-receipt.json) | ERROR | 5 / 0 / 0 |
| blind-deployment | [`0xa36a17fb7e…`](https://explorer-studio.genlayer.com/tx/0xa36a17fb7e5164a2c5a160e1aad745e9e7ae1b51fc7133da25d28294041cdbb1) · [receipt](blind-deployment-receipt.json) | SUCCESS | 3 / 0 / 2 |
| blind-reject-before-compile | [`0x3a90a8b74a…`](https://explorer-studio.genlayer.com/tx/0x3a90a8b74a48b530449497508e66eb944dab4ce79b95b0b0ea2c10d222c30ac9) · [receipt](blind-reject-before-compile-receipt.json) | ERROR | 5 / 0 / 0 |
| blind-compile | [`0xf8eb0d98c2…`](https://explorer-studio.genlayer.com/tx/0xf8eb0d98c2b9b3d5d2eaec64ea10d11670a136379cb77958986c91990f79ec33) · [receipt](blind-compile-receipt.json) | SUCCESS | 3 / 0 / 2 |
| blind-design-0 | [`0x18c574b57e…`](https://explorer-studio.genlayer.com/tx/0x18c574b57ecc7a4abb08e7ad8db34f1369aa4325eb7dec1342788d2353b905c4) · [receipt](blind-design-0-receipt.json) | SUCCESS | 5 / 0 / 0 |
| blind-design-1 | [`0xf955c30428…`](https://explorer-studio.genlayer.com/tx/0xf955c30428be0cbd75805b697bbbfcc1675d6c2cf02b9db236c86ed1bf15f6b5) · [receipt](blind-design-1-receipt.json) | SUCCESS | 5 / 0 / 0 |
| blind-compose | [`0x82e68566a1…`](https://explorer-studio.genlayer.com/tx/0x82e68566a127d472cf39ea1eb0235242d6cf4f2aa417a4c38716b7795683d7a1) · [receipt](blind-compose-receipt.json) | SUCCESS | 3 / 0 / 2 |
| blind-reject-infeasible-parent | [`0x086724b467…`](https://explorer-studio.genlayer.com/tx/0x086724b46787d37f40f628e0a13d92baaa666c2ef78236e9682e03b184a620c2) · [receipt](blind-reject-infeasible-parent-receipt.json) | ERROR | 3 / 0 / 2 |
| blind-reject-duplicate | [`0x4013a7b7b5…`](https://explorer-studio.genlayer.com/tx/0x4013a7b7b5b11c56dbb879430be15d8954566627e95b629f3b0e12549b60d487) · [receipt](blind-reject-duplicate-receipt.json) | ERROR | 5 / 0 / 0 |
| blind-reject-recompile | [`0x479b30d7b6…`](https://explorer-studio.genlayer.com/tx/0x479b30d7b696a98b4119dddb314037ed22af4ba7854d848b0840ca853747265e) · [receipt](blind-reject-recompile-receipt.json) | ERROR | 3 / 0 / 2 |
| unresolved-deployment | [`0x53a8a05300…`](https://explorer-studio.genlayer.com/tx/0x53a8a0530041cd5febaec50cb826cdc7f67cde30134ab5f884d51749b172f32a) · [receipt](unresolved-deployment-receipt.json) | SUCCESS | 3 / 0 / 2 |
| unresolved-reject-before-compile | [`0xd4fecdb5fa…`](https://explorer-studio.genlayer.com/tx/0xd4fecdb5fa809ac041bb6df065a42176ca14ae3524fb99d1d16283c1840e90d7) · [receipt](unresolved-reject-before-compile-receipt.json) | ERROR | 3 / 0 / 2 |
| unresolved-compile | [`0x4f62a31f7f…`](https://explorer-studio.genlayer.com/tx/0x4f62a31f7f7c491725b1ad26a300120e3ef62a19a63a43392b9f7ba2027ce183) · [receipt](unresolved-compile-receipt.json) | SUCCESS | 3 / 0 / 2 |
| unresolved-reject-unresolved-design | [`0x032c9d9c6b…`](https://explorer-studio.genlayer.com/tx/0x032c9d9c6bdd746902f1c5653741d878aab351243e498dcdb2c6f393024ce6ed) · [receipt](unresolved-reject-unresolved-design-receipt.json) | ERROR | 3 / 0 / 2 |
| unresolved-reject-unresolved-compose | [`0xcc9189d808…`](https://explorer-studio.genlayer.com/tx/0xcc9189d808ebc6b9ad5c2103e4a54d7c0f5553ed7514a0fcc0133cebf536928e) · [receipt](unresolved-reject-unresolved-compose-receipt.json) | ERROR | 3 / 0 / 2 |
| unresolved-reject-recompile | [`0xe2daf7b28b…`](https://explorer-studio.genlayer.com/tx/0xe2daf7b28b90ca5dc857464fc7729c9bca7532179ee5612b6551ec0ff8529b2a) · [receipt](unresolved-reject-recompile-receipt.json) | ERROR | 5 / 0 / 0 |

Aggregate final vote maps: **131 agree, 0 disagree, 34 idle**. These totals do not flatten earlier rounds. Full receipts retain dissent, idle entries, round counts and rotations.

## Verification scope

The verifier decodes actual signed calldata using the pinned CLI SDK and checks signer, target, exact deployed bytes, all source commitments and ten assessment cells. It checks every geometric corner, hull support line, rational selector, exact response profile, mixture witness and affine composition from the actual parent. A separate cube-slice linear solver checks feasibility without using polygon triangulation. Every failed call must preserve the complete state and match its intended error bytes.

Local and hosted JUnit reports retain **117 passing direct tests**, including **33,969** requested-profile checks across every two-signal channel with twelve observations per context and 32 generated four-signal channels. Actual VM versus JavaScript checks cover all 169 integer profiles for each complete fixture. Seven transport tests ensure ambiguous mutations are never retried. Mocked tests exercise code; live receipts exercise actual source acquisition and AI consensus.

Verification mode: `merged-hosted-fresh-rpc-and-state`; latest recorded fresh time: `2026-10-25T13:04:59.781Z`. Fresh receipt, deployed-source, complete-state and all-pair-preview RPC checks were performed by the linked hosted workflows at the recorded times. This merge independently matches their results against local offline replay; it makes no additional fresh RPC claim.

Synthetic empirical reports do not establish physical truth or population probabilities. Hashes establish bytes rather than identity. SignalHull constructs rules; sampling randomness and actual signal acquisition remain external. REVIEW and INVALID_COUNTS block filter creation. Design/composition capacity is permissionless and finite.
