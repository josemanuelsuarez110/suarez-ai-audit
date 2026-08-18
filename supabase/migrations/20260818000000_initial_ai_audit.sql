-- ============================================================
-- SUAREZ AI AUDIT
-- Initial Database Schema
-- Supabase / PostgreSQL
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

do $$
begin
  create type audit_status as enum (
    'draft',
    'in_progress',
    'completed'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type risk_level as enum (
    'low',
    'medium',
    'high',
    'critical'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type finding_status as enum (
    'open',
    'investigating',
    'resolved',
    'accepted'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type risk_status as enum (
    'open',
    'mitigated',
    'accepted',
    'closed'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type transaction_status as enum (
    'pending',
    'approved',
    'rejected',
    'flagged',
    'reviewed'
  );
exception
  when duplicate_object then null;
end $$;

-- ============================================================
-- ORGANIZATIONS
-- ============================================================

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  legal_name text,
  industry text,
  tax_id text,

  contact_name text,
  contact_email text,
  contact_phone text,

  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- AUDITS
-- ============================================================

create table if not exists audits (
  id uuid primary key default gen_random_uuid(),

  audit_code text not null unique,

  organization_id uuid not null
    references organizations(id)
    on delete cascade,

  name text not null,
  type text not null,

  status audit_status not null default 'draft',

  risk_level risk_level not null default 'low',

  progress integer not null default 0
    check (progress between 0 and 100),

  score numeric(5,2)
    check (score between 0 and 10),

  scope text,
  objectives text,
  methodology text,

  started_at timestamptz,
  completed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- FINDINGS
-- ============================================================

create table if not exists findings (
  id uuid primary key default gen_random_uuid(),

  finding_code text not null unique,

  audit_id uuid not null
    references audits(id)
    on delete cascade,

  title text not null,
  description text,

  category text not null,

  risk_level risk_level not null default 'medium',

  status finding_status not null default 'open',

  score numeric(5,2)
    check (score between 0 and 10),

  recommendation text,

  assigned_to uuid,

  due_date date,

  resolved_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- RISKS
-- ============================================================

create table if not exists risks (
  id uuid primary key default gen_random_uuid(),

  risk_code text not null unique,

  audit_id uuid not null
    references audits(id)
    on delete cascade,

  title text not null,
  description text,

  category text,

  likelihood integer not null default 1
    check (likelihood between 1 and 5),

  impact integer not null default 1
    check (impact between 1 and 5),

  risk_score integer generated always as
    (likelihood * impact) stored,

  risk_level risk_level not null default 'low',

  status risk_status not null default 'open',

  mitigation_plan text,

  owner_id uuid,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- TRANSACTIONS
-- ============================================================

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),

  transaction_code text not null unique,

  audit_id uuid
    references audits(id)
    on delete set null,

  transaction_date timestamptz not null,

  reference text,

  description text,

  account_code text,

  counterparty text,

  amount numeric(18,2) not null,

  currency char(3) not null default 'DOP',

  status transaction_status not null default 'pending',

  anomaly_score numeric(5,2)
    check (anomaly_score between 0 and 100),

  is_anomaly boolean not null default false,

  ai_explanation text,

  reviewed_by uuid,

  reviewed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- EVIDENCE
-- ============================================================

create table if not exists evidence (
  id uuid primary key default gen_random_uuid(),

  evidence_code text not null unique,

  audit_id uuid not null
    references audits(id)
    on delete cascade,

  finding_id uuid
    references findings(id)
    on delete cascade,

  risk_id uuid
    references risks(id)
    on delete cascade,

  name text not null,

  description text,

  file_path text,

  file_name text,

  file_type text,

  file_size bigint,

  checksum text,

  uploaded_by uuid,

  created_at timestamptz not null default now()
);

-- ============================================================
-- REPORTS
-- ============================================================

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),

  report_code text not null unique,

  audit_id uuid not null
    references audits(id)
    on delete cascade,

  title text not null,

  executive_summary text,

  total_findings integer not null default 0,
  critical_findings integer not null default 0,
  high_findings integer not null default 0,
  medium_findings integer not null default 0,
  low_findings integer not null default 0,

  total_risks integer not null default 0,

  audit_score numeric(5,2),

  generated_at timestamptz,

  generated_by uuid,

  file_path text,

  created_at timestamptz not null default now()
);

-- ============================================================
-- AUDIT LOG
-- ============================================================

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),

  audit_id uuid
    references audits(id)
    on delete cascade,

  user_id uuid,

  action text not null,

  entity_type text,

  entity_id uuid,

  old_values jsonb,

  new_values jsonb,

  ip_address inet,

  user_agent text,

  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_audits_organization
  on audits(organization_id);

create index if not exists idx_audits_status
  on audits(status);

create index if not exists idx_audits_risk_level
  on audits(risk_level);

create index if not exists idx_findings_audit
  on findings(audit_id);

create index if not exists idx_findings_status
  on findings(status);

create index if not exists idx_findings_risk
  on findings(risk_level);

create index if not exists idx_risks_audit
  on risks(audit_id);

create index if not exists idx_risks_status
  on risks(status);

create index if not exists idx_transactions_audit
  on transactions(audit_id);

create index if not exists idx_transactions_date
  on transactions(transaction_date);

create index if not exists idx_transactions_anomaly
  on transactions(is_anomaly);

create index if not exists idx_evidence_audit
  on evidence(audit_id);

create index if not exists idx_evidence_finding
  on evidence(finding_id);

create index if not exists idx_reports_audit
  on reports(audit_id);

create index if not exists idx_audit_logs_audit
  on audit_logs(audit_id);

create index if not exists idx_audit_logs_created
  on audit_logs(created_at);

-- ============================================================
-- UPDATED_AT FUNCTION
-- ============================================================

create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

drop trigger if exists organizations_updated_at
on organizations;

create trigger organizations_updated_at
before update on organizations
for each row
execute function update_updated_at();


drop trigger if exists audits_updated_at
on audits;

create trigger audits_updated_at
before update on audits
for each row
execute function update_updated_at();


drop trigger if exists findings_updated_at
on findings;

create trigger findings_updated_at
before update on findings
for each row
execute function update_updated_at();


drop trigger if exists risks_updated_at
on risks;

create trigger risks_updated_at
before update on risks
for each row
execute function update_updated_at();


drop trigger if exists transactions_updated_at
on transactions;

create trigger transactions_updated_at
before update on transactions
for each row
execute function update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table organizations enable row level security;
alter table audits enable row level security;
alter table findings enable row level security;
alter table risks enable row level security;
alter table transactions enable row level security;
alter table evidence enable row level security;
alter table reports enable row level security;
alter table audit_logs enable row level security;

-- ============================================================
-- DEVELOPMENT POLICIES
--
-- Estas políticas permiten trabajar con el frontend durante
-- la fase inicial. Antes de producción deben sustituirse
-- por políticas basadas en auth.uid() y roles.
-- ============================================================

drop policy if exists "authenticated organizations"
on organizations;

create policy "authenticated organizations"
on organizations
for all
to authenticated
using (true)
with check (true);


drop policy if exists "authenticated audits"
on audits;

create policy "authenticated audits"
on audits
for all
to authenticated
using (true)
with check (true);


drop policy if exists "authenticated findings"
on findings;

create policy "authenticated findings"
on findings
for all
to authenticated
using (true)
with check (true);


drop policy if exists "authenticated risks"
on risks;

create policy "authenticated risks"
on risks
for all
to authenticated
using (true)
with check (true);


drop policy if exists "authenticated transactions"
on transactions;

create policy "authenticated transactions"
on transactions
for all
to authenticated
using (true)
with check (true);


drop policy if exists "authenticated evidence"
on evidence;

create policy "authenticated evidence"
on evidence
for all
to authenticated
using (true)
with check (true);


drop policy if exists "authenticated reports"
on reports;

create policy "authenticated reports"
on reports
for all
to authenticated
using (true)
with check (true);


drop policy if exists "authenticated audit logs"
on audit_logs;

create policy "authenticated audit logs"
on audit_logs
for all
to authenticated
using (true)
with check (true);

-- ============================================================
-- END
-- ============================================================
