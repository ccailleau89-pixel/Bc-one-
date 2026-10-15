# BC ONE — ERC-20 token draft

**Status: development draft only. Not deployed, audited, offered for sale, or connected to a wallet.**

## What is implemented

- EVM-compatible ERC-20 contract written in Solidity 0.8.24.
- Name: `BC ONE`; symbol: `BCONE`; decimals: 18.
- Initial supply is minted to the initial owner at construction.
- An immutable maximum supply is set at construction.
- Only the owner may mint additional tokens, and the contract rejects minting above the cap.
- Two-step ownership transfer reduces the risk of transferring control to the wrong address.
- No upgrade mechanism, public sale, staking, tax, blacklist, pause switch, or burn extension is included.

## Parameters are not approved tokenomics

The constructor takes three values:
- `initialSupplyWholeTokens`: initial whole-token supply.
- `maxSupplyWholeTokens`: immutable maximum whole-token supply.
- `initialOwner`: address that receives the initial supply and initially controls minting.

The test fixture uses 1,000 initial tokens and a 10,000-token cap **only to exercise the code**. These are not proposed or approved BC ONE tokenomics. No production values have been chosen.

## Important governance and security risks

- The owner can mint at any time until the cap is reached. This is a privileged issuance policy, not a decentralized emission schedule.
- Losing the owner key could permanently prevent further issuance; compromising it could allow issuance up to the cap.
- A single-owner setup is a development default, not a recommended production governance design. Consider a multisig and a timelock only after explicit governance decisions.
- The cap constrains total supply but does not establish token price, liquidity, redemption value, or purchasing power.
- The contract has not been independently audited. Automated tests do not prove the contract is secure.
- The selected EVM chain remains undecided. The contract must be reviewed against the final chain and deployment tooling.

## Decisions required before deployment

1. Choose the chain after comparing Base, Polygon PoS, and Arbitrum One.
2. Approve the maximum supply, initial supply, issuance schedule, and whether minting remains possible.
3. Approve the owner/governance model and recovery process.
4. Determine legal and regulatory obligations in the relevant jurisdictions, including any applicable EU crypto-asset requirements.
5. Review and audit the final source code; verify compiler and dependency versions.
6. Run local tests and a testnet rehearsal, then separately approve any production deployment.

## Local development

Install Foundry, then run:

```sh
forge install OpenZeppelin/openzeppelin-contracts@v5.0.2 --no-commit
forge install foundry-rs/forge-std@v1.9.6 --no-commit
forge fmt --check
forge test -vvv
```

These commands compile and test only. There is no deployment script in this draft and no transaction should be signed.
