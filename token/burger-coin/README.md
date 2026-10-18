# Burger Coin (BCONE) — contract prototype

This directory is an isolated Hardhat project added to the BC ONE repository. It does not change the existing web app.

## Contract design

- Network target: Base Sepolia testnet (chain ID 84532).
- Token: Burger Coin / BCONE, ERC-20, 18 decimals.
- Fixed initial supply: 100,000,000 BCONE, minted to the deploying wallet.
- No owner/admin role, additional minting, transfer tax, blacklist, or upgrade mechanism.
- This is a technical prototype, not a deployed token or an investment offer.

## Important separation: Burger ID

Burger ID can remain the shared identity/login across BC ONE and Crush Burger, while keeping application balances and ledgers separate. This on-chain ERC-20 contract does not automatically connect to Burger ID, award loyalty points, authenticate users, or reconcile off-chain balances. Those require a separately reviewed backend integration with explicit wallet-linking, authorization, and accounting rules. Do not expose private keys in the frontend or store them in Supabase.

## Local checks

Requires Node.js 20+.

```sh
npm install
npm test
npm run compile
```

Tests cover metadata, supply, transfers, absence of a public mint function, and fixed supply.

## Base Sepolia deployment (not run automatically)

1. Create a dedicated test wallet. Never use a mainnet wallet's private key for testing.
2. Copy `.env.example` to `.env`; set a Base Sepolia RPC URL and the test wallet private key.
3. Fund the test wallet with Base Sepolia test ETH from a reputable faucet.
4. Run `npm run deploy:sepolia`.
5. Record the deployment address and transaction hash, then test transfers and verify the contract on the Base Sepolia explorer.

The deploy script refuses networks other than Base Sepolia. No deployment has been performed by adding these files.

## Before a mainnet launch

Review legal/regulatory obligations in the target jurisdictions, tax/accounting treatment, threat model, contract and dependency versions, deployment ownership, key management, independent security review, user disclosures, and any token distribution or liquidity plans. Never promise a token price or returns.
