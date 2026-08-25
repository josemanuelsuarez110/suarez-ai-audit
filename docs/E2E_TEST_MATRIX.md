# E2E Test Matrix

## Current Baseline

**13 Playwright tests passing** in Chromium with one worker.

| # | Test Area | Scenario | Primary Risk Covered |
|---:|---|---|---|
| 1 | Authentication setup | Authenticate admin and persist storage state | Invalid session blocks all protected flows |
| 2 | Dashboard | Load executive dashboard without critical console errors | Core application fails after login |
| 3 | RBAC visibility | Display Administrator role | Incorrect role resolution |
| 4 | Operations | Open global Operations search | Operational tooling inaccessible |
| 5 | Governance | Open Governance Suite and verify tabs | Governance modules regress |
| 6 | Enterprise Risk | Open Enterprise Risk Suite and verify sections | Risk-management modules regress |
| 7 | Consolidation | Open Consolidation Center | Cross-module management inaccessible |
| 8 | RBAC admin | Show Users access for administrator | Admin privileges disappear |
| 9 | RBAC write | Show write action in Governance for admin | Authorized user cannot perform controlled writes |
| 10 | Global Search | Search transaction-related data | Search experience stops returning operational results |
| 11 | Consolidation Search | Search within Consolidation Center | Unified record lookup regresses |
| 12 | Transactions | Open Transaction Center | Transaction operations inaccessible |
| 13 | Transaction Detail | Open existing transaction and verify Audit Trail | Decision history/traceability unavailable |

## Authentication Model

The setup project logs in once and stores browser state in:

```text
e2e/.auth/admin.json
```

The state file is ignored by Git and regenerated for each clean test execution.

## CI Execution

GitHub Actions provides:

- `E2E_EMAIL`
- `E2E_PASSWORD`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The workflow installs Chromium and executes:

```bash
npx playwright test --project=chromium
```

## Expansion Candidates

Future high-value regression coverage:

- Viewer and auditor negative-permission tests
- Create/edit/delete Governance records
- Risk lifecycle transitions
- Incident workflow transitions
- PDF generation validation
- Mobile viewport smoke coverage
- Production synthetic smoke tests
