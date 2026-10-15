# BC ONE test token — prototype local Foundry

## Purpose and status

`BCOneTestToken` is a development contract for local tests and, only after a separate explicit decision, a public test network. It has no economic value, is not redeemable, is not a production BC ONE token, and does not represent a live currency. Nothing in this change deploys a contract or sends a transaction.

The contract is an ERC-20 with 18 decimals, an immutable lifetime supply cap supplied at deployment, and owner-only minting up to that cap. The owner can transfer ownership using OpenZeppelin's two-step ownership flow. There is no initial mint, public faucet, burn, pause, algorithm oracle, price peg, redemption, upgrade, or automatic issuance. The cap is not a finalized tokenomics decision. Test cases use an arbitrary local cap solely to exercise the code.

## Pinned dependency and local checks

OpenZeppelin Contracts is pinned as a Git submodule to release v5.4.0, commit `c64a1edb67b6e3f4a15cca8909c9482ad33a02b0`.

Clone including the dependency and run the local Foundry suite:

```sh
git clone --recurse-submodules https://github.com/ccailleau89-pixel/Bc-one-.git
cd Bc-one-
forge test
```

With an existing checkout, initialize the pinned submodule before running Foundry. Solidity compiler version is pinned to 0.8.24 in `foundry.toml`.

## Risks and decisions before any test-network deployment

- Select a chain only after the comparison requested in `AGENT_PLAN.md`.
- Confirm supply cap, allocation, issuer governance, mint schedule/limits, and whether owner minting is acceptable. The prototype has only a lifetime cap; it has no per-period mint ceiling.
- A single owner key is a concentrated control risk. Production governance may need multisig, timelock, operational monitoring, and independent review.
- The contract is unaudited and the tests are basic behavior checks, not a security audit.
- The basket index is not wired into token issuance or transfer rules. It must not be represented as determining the token's exchange price.
- Get appropriate legal review before offering, distributing, or marketing any crypto-asset.

Never put seed phrases, private keys, RPC credentials, or API keys in the repository. Test-network deployment, public release, mainnet deployment, real transactions, and any change to supply/emission rules require separate explicit human approval.
