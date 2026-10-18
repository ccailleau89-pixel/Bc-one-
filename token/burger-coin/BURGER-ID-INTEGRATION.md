# Burger ID ↔ BC ONE integration plan

## Identity and balances

Keep one shared Burger ID identity across BC ONE and Crush Burger. Do not collapse different balance types into one number:

- **BCONE on-chain balance:** read from the token contract for the wallet linked by the user.
- **BC ONE application/loyalty balance:** retained in its existing application ledger.
- **Crush Burger balance/points:** retained in its own application ledger.

These balances are not interchangeable and must not be silently converted or merged.

## Proposed linking flow

1. User signs in with the existing Burger ID authentication flow.
2. User connects a wallet in the browser.
3. Backend issues a one-time challenge bound to the authenticated Burger ID and wallet address.
4. Wallet signs the challenge; backend verifies the signature and expiry.
5. Backend stores the verified wallet association with a uniqueness constraint on the wallet address, according to product policy.
6. UI reads the on-chain BCONE balance from Base and labels it separately from all off-chain points.

Never ask users for seed phrases or private keys. Never put deployment keys or server secrets in frontend code, public repository files, or client-readable database rows.

## API/UI boundaries

- GET /api/burger-id/me: current authenticated identity.
- POST /api/wallet/challenge: request a short-lived, single-use wallet-link challenge.
- POST /api/wallet/verify: verify signature and consume challenge.
- GET /api/token/bcone/balance: return wallet address, chain ID, token contract address, raw balance, and formatted balance.
- Existing loyalty APIs remain separate and unchanged.

These routes are a design proposal only; they have not been implemented by this document.

## Required before implementation

Inspect the existing authentication and database schema first. Reuse the established Burger ID identity provider; do not create a second user directory. Apply row-level security and server-side authorization to wallet links. Validate chain ID and contract address, handle wallet unlinking and account recovery, rate-limit challenge endpoints, and log security-relevant events without logging secrets.

## Current state

The ERC-20 contract prototype is in contracts/BurgerCoin.sol. The app-to-wallet linking flow and the routes above are not yet implemented. No token deployment has been performed.