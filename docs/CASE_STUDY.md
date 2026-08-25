# Suarez AI Audit — Engineering Case Study

## Problem

Audit operations, transaction reviews, risk monitoring and governance workflows often become fragmented across spreadsheets, disconnected reports and manual approval processes. That fragmentation reduces traceability and makes it harder to identify high-risk activity quickly.

## Solution

Suarez AI Audit was designed as a unified enterprise auditing platform combining:

- Executive audit visibility
- Transaction intelligence and anomaly prioritization
- Controlled review decisions
- Governance and remediation workflows
- Enterprise risk management
- Third-party and incident monitoring
- Consolidated search and reporting

## Engineering Approach

### Frontend

React, TypeScript and Vite provide a responsive operational interface organized around modular domain components.

### Data and security

Supabase provides PostgreSQL persistence and authentication. Row Level Security and database functions protect sensitive workflows and enforce application roles.

### Transaction traceability

Transactions can move through controlled review states, with reviewer identity and timestamps preserved in the Audit Trail.

### Quality engineering

Playwright validates critical browser journeys using authenticated sessions. Static quality checks, production builds and bundle-size validation run automatically in GitHub Actions.

## Delivery Pipeline

```text
Developer
   |
   v
GitHub
   |
   v
GitHub Actions
   |-- Static Quality
   |-- Production Build
   |-- Bundle Budget
   `-- Playwright E2E
   |
   v
Vercel
   |
   v
Production
```

## Results

The current implementation includes:

- Production deployment on Vercel
- Supabase-backed authentication and data
- RBAC for administrator, auditor and viewer roles
- Governance, Operations and Enterprise Risk suites
- Transaction review and decision history
- CI quality gates
- 13 passing authenticated Playwright E2E tests
- Automated bundle-size control

## Engineering Value Demonstrated

This project demonstrates the ability to connect software engineering, QA automation, data security and DevOps into one production-oriented system rather than treating them as separate exercises.

It is especially relevant as a portfolio project for QA/SDET, test automation, full-stack engineering and quality-focused platform roles.
