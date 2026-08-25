# QA Strategy

## Objective

The QA strategy for Suarez AI Audit focuses on protecting the highest-risk user journeys and preventing regressions across authentication, RBAC, audit operations, transaction review, governance and enterprise-risk modules.

## Quality Layers

### Static validation

- Secret-pattern scanning
- Structural platform checks
- E2E test structure validation
- TypeScript compilation
- Vite production build
- Bundle-size budget

### Browser-level validation

Playwright validates the application using an authenticated admin session.

Primary targets:

- Login and session restoration
- Executive dashboard rendering
- Administrator permissions
- Navigation across major modules
- Global search
- Transaction Center
- Transaction detail
- Audit Trail visibility

## Risk-Based Priorities

| Priority | Area | Risk |
|---|---|---|
| P0 | Authentication | User cannot access platform or session is invalid |
| P0 | RBAC | Unauthorized operations become available |
| P0 | Transaction decisions | Review/approval state becomes inconsistent |
| P1 | Audit Trail | Decision traceability is lost |
| P1 | Core module navigation | Governance or Enterprise Risk becomes inaccessible |
| P1 | Search | Operational data cannot be located efficiently |
| P2 | Reporting and PDF | Executive output is incomplete or unavailable |
| P2 | Bundle regression | Frontend payload grows unexpectedly |

## Test Data Strategy

Authenticated E2E tests use dedicated environment credentials supplied through local `.env.e2e` or GitHub Actions repository secrets.

Secrets are never committed to the repository.

## CI Policy

A production-quality change should satisfy:

1. Secret check passes.
2. Platform smoke check passes.
3. E2E structural check passes.
4. Production build passes.
5. Bundle budget passes.
6. Authenticated Playwright suite passes.

## Regression Philosophy

Tests should validate observable user behavior rather than implementation details. Selectors are scoped to visible dialogs or regions where possible to prevent false positives from duplicate dashboard content.

## Current Baseline

The current Playwright baseline contains 13 passing tests executed sequentially with one Chromium worker for predictable resource usage and reproducibility.
