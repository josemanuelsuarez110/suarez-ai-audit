# Suarez AI Audit

Enterprise-grade intelligent auditing, risk management and transaction monitoring platform.

## Live Application

https://suarez-ai-audit.vercel.app

## Core Capabilities

- Executive audit dashboard
- Transaction intelligence and anomaly detection
- Audit and findings management
- Governance Suite
- Enterprise Risk Suite
- Operations Suite
- Consolidation Center
- Executive reporting and PDF export
- Role-based access control
- Decision Audit Trail

## Technology Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Backend / Data
- Supabase
- PostgreSQL
- Supabase Auth
- Row Level Security
- PostgreSQL RPC functions

### Quality Engineering
- Playwright E2E
- GitHub Actions
- Automated production build
- Bundle-size validation
- Security checks

## Automated Testing

Current E2E baseline:

    13 tests passed

Coverage includes:

- Authentication
- Dashboard
- Administrator RBAC
- Operations Suite
- Governance Suite
- Enterprise Risk
- Consolidation Center
- Global search
- Transaction center
- Transaction detail
- Decision history

## CI/CD

    GitHub
       |
       v
    GitHub Actions
       |
       +-- Static quality checks
       +-- Production build
       +-- Bundle validation
       +-- Playwright E2E
       |
       v
    Vercel Production

## Security

- Supabase authentication
- RBAC
- Row Level Security
- Browser-safe publishable key
- Protected server-side workflows
- No service-role credentials exposed to the frontend

## Local Development

    npm install
    npm run dev

Production build:

    npm run build

Quality:

    npm run quality:static
    npm run quality:full

E2E:

    npm run test:e2e

## Environment Variables

    VITE_SUPABASE_URL
    VITE_SUPABASE_ANON_KEY

E2E additionally requires:

    E2E_EMAIL
    E2E_PASSWORD

## Production

https://suarez-ai-audit.vercel.app

## Author

José Manuel Suárez

Information Systems Engineer

JMTechLab
