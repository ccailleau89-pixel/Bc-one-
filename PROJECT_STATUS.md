BC ONE — Project Status

Current status

BC ONE is a project in preparation. No production token has been deployed.

## Verified state — 17 October 2026 (CI and Pages)

- GitHub Actions quality workflow passed on Node.js 20 and 22: dependency installation, JavaScript syntax checks, automated tests, and Vite build all succeeded. Run: https://github.com/ccailleau89-pixel/Bc-one-/actions/runs/38977827080
- Public-site smoke checks passed for the homepage, Burger ID entry point, migration checks, and Burger ID module syntax. Run: https://github.com/ccailleau89-pixel/Bc-one-/actions/runs/38977767361
- GitHub Pages deployment completed successfully for the commit containing the MVP roadmap. Run: https://github.com/ccailleau89-pixel/Bc-one-/actions/runs/38977827145
- These checks validate the repository and static prototype only. They do not validate live Supabase authentication, real customer data, payments, token issuance, or production financial workflows.

## Verified state — 16 October 2026

- Public GitHub Pages prototype is deployed: https://ccailleau89-pixel.github.io/Bc-one-/
- Burger ID entry point is published, but authentication remains disabled until a shared Supabase project is configured.
- Latest public-site smoke workflow passed: HTML titles and required safety copy, local links, Supabase config blank-state, migration version uniqueness, and Burger ID JavaScript syntax.
- Legacy `burger-id-schema.sql` has been marked deprecated because it conflicts with the current migration schema.
- Burger ID profile reads/writes now use `user_id` and the current migration's `display_name` field; city and favorite burger remain in user metadata.
- Current migrations are not applied to any remote Supabase project. No real account, payment, token issuance, or blockchain deployment is active.

## Next release gates

1. Configure one approved Supabase test project for both apps and set only its public URL/key in the browser config.
2. Apply the two current migrations to that test project after review.
3. Test signup, email confirmation, login, logout, recovery, and profile updates.
4. Use two separate accounts to verify row-level security and that one account cannot read or alter the other's records or credits.
5. Validate the complete flow on mobile and only then decide whether to open a limited pilot.

Main objectives

- Build a premium BC ONE website and mobile-friendly interface.
- Design a wallet interface without fabricated balances or transactions.
- Develop a blockchain token with predefined, limited issuance rules.
- Build automated tests and technical documentation.
- Develop a prospect research tool with human approval before contact.

Brand direction

- Primary background: #0B0B0C
- Gold accent: #D6A64A
- Cream: #F5F1E8
- Orange accent: #FF682E
- Premium, clear and mobile-first design.

Blockchain decisions pending

- Choose the blockchain network after technical and cost comparison.
- Confirm token supply and allocation before implementation.
- Define issuance limits and permissions.
- Review legal and security requirements before any public launch.

Security boundaries

- No mainnet deployment without explicit approval.
- No real-money transactions or wallet signing.
- Never store private keys or seed phrases in this repository.
- Never claim that a token, market price or liquidity exists unless verified.
- Never contact prospects without human approval.

First development milestone

1. Inspect the repository.
2. Propose a mobile-first website prototype.
3. Add automated checks and documentation.
4. Report actual test results and blockers.
5. Request approval before sensitive actions.

Important

The existence of project files does not mean the application is built, tested or deployed.
