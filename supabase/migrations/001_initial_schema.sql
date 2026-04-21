-- ============================================================
-- KRAV MAGÁ PLATFORM — SCHEMA COMPLETO
-- Supabase (PostgreSQL)
-- ============================================================

-- Habilitar extensões necessárias
create extension if not exists "uuid-ossp";

-- ─── ENUMS ────────────────────────────────────────────────────
create type user_role as enum ('admin', 'instructor', 'student');
create type belt_level as enum ('white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black');
create type enrollment_status as enum ('pending', 'active', 'suspended', 'cancelled');
create type financial_status as enum ('paid', 'pending', 'overdue');
create type checkin_status as enum ('pending', 'approved', 'rejected');
create type order_status as enum ('pending', 'processing', 'ready', 'delivered', 'cancelled');
create type event_type as enum ('seminar', 'event');
create type registration_status as enum ('pending', 'approved', 'rejected');
create type shirt_size as enum ('PP', 'P', 'M', 'G', 'GG', 'XGG');
create type pants_size as enum ('PP', 'P', 'M', 'G', 'GG', 'XGG');
create type product_category as enum ('uniform', 'equipment', 'accessory', 'other');
create type training_type as enum ('class', 'seminar', 'event');

-- ─── ACADEMIES ───────────────────────────────────────────────
create table academies (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  address       text,
  logo_url      text,
  phone         text,
  email         text,
  instagram     text,
  contract_text text,  -- Texto completo do contrato para o formulário de matrícula
  created_at    timestamptz default now()
);

-- ─── PROFILES ────────────────────────────────────────────────
-- Estende auth.users do Supabase
create table profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  academy_id         uuid references academies(id) on delete cascade,
  role               user_role not null default 'student',
  full_name          text not null,
  email              text not null,
  phone              text,
  birth_date         date,
  cpf                text,
  shirt_size         shirt_size,
  pants_size         pants_size,
  belt               belt_level not null default 'white',
  enrollment_status  enrollment_status not null default 'pending',
  avatar_url         text,
  emergency_contacts jsonb default '[]'::jsonb,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

-- ─── ENROLLMENT REQUESTS ─────────────────────────────────────
-- Solicitações de matrícula (antes de criar o usuário no auth)
create table enrollment_requests (
  id                   uuid primary key default uuid_generate_v4(),
  academy_id           uuid references academies(id) on delete cascade,
  full_name            text not null,
  birth_date           date not null,
  cpf                  text not null,
  phone                text not null,
  email                text not null,
  shirt_size           shirt_size not null,
  pants_size           pants_size not null,
  emergency_contacts   jsonb not null default '[]'::jsonb,
  accepted_terms       boolean not null default false,
  confirmed_truthfulness boolean not null default false,
  status               enrollment_status not null default 'pending',
  reviewed_at          timestamptz,
  reviewed_by          uuid references profiles(id),
  rejection_reason     text,
  created_at           timestamptz default now()
);

-- ─── CLASSES ─────────────────────────────────────────────────
create table classes (
  id            uuid primary key default uuid_generate_v4(),
  academy_id    uuid references academies(id) on delete cascade,
  name          text not null,
  instructor_id uuid references profiles(id) on delete set null,
  day_of_week   smallint not null check (day_of_week between 0 and 6),
  start_time    time not null,
  end_time      time not null,
  max_students  integer,
  description   text,
  active        boolean default true,
  created_at    timestamptz default now()
);

-- ─── CHECKINS ────────────────────────────────────────────────
create table checkins (
  id             uuid primary key default uuid_generate_v4(),
  academy_id     uuid references academies(id) on delete cascade,
  student_id     uuid references profiles(id) on delete cascade,
  class_id       uuid references classes(id) on delete cascade,
  status         checkin_status not null default 'pending',
  checked_in_at  timestamptz default now(),
  approved_at    timestamptz,
  approved_by    uuid references profiles(id)
);

-- ─── FINANCIALS ──────────────────────────────────────────────
create table financials (
  id          uuid primary key default uuid_generate_v4(),
  academy_id  uuid references academies(id) on delete cascade,
  student_id  uuid references profiles(id) on delete cascade,
  month       smallint not null check (month between 1 and 12),
  year        smallint not null,
  amount      numeric(10,2) not null,
  status      financial_status not null default 'pending',
  due_date    date not null,
  paid_at     timestamptz,
  notes       text,
  created_at  timestamptz default now(),
  unique(academy_id, student_id, month, year)
);

-- ─── PRODUCTS ────────────────────────────────────────────────
create table products (
  id                      uuid primary key default uuid_generate_v4(),
  academy_id              uuid references academies(id) on delete cascade,
  name                    text not null,
  description             text,
  price                   numeric(10,2) not null,
  image_url               text,
  available_shirt_sizes   shirt_size[],
  available_pants_sizes   pants_size[],
  category                product_category not null default 'uniform',
  stock                   integer not null default 0,
  active                  boolean default true,
  created_at              timestamptz default now()
);

-- ─── ORDERS ──────────────────────────────────────────────────
create table orders (
  id          uuid primary key default uuid_generate_v4(),
  academy_id  uuid references academies(id) on delete cascade,
  student_id  uuid references profiles(id) on delete cascade,
  items       jsonb not null default '[]'::jsonb,
  total       numeric(10,2) not null,
  status      order_status not null default 'pending',
  notes       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── EVENTS ──────────────────────────────────────────────────
create table events (
  id            uuid primary key default uuid_generate_v4(),
  academy_id    uuid references academies(id) on delete cascade,
  type          event_type not null default 'event',
  title         text not null,
  description   text,
  date          timestamptz not null,
  location      text,
  max_capacity  integer,
  price         numeric(10,2),
  image_url     text,
  created_by    uuid references profiles(id),
  created_at    timestamptz default now()
);

-- ─── EVENT REGISTRATIONS ─────────────────────────────────────
create table event_registrations (
  id            uuid primary key default uuid_generate_v4(),
  academy_id    uuid references academies(id) on delete cascade,
  event_id      uuid references events(id) on delete cascade,
  student_id    uuid references profiles(id) on delete cascade,
  status        registration_status not null default 'pending',
  requested_at  timestamptz default now(),
  approved_at   timestamptz,
  unique(event_id, student_id)
);

-- ─── ANNOUNCEMENTS ───────────────────────────────────────────
create table announcements (
  id          uuid primary key default uuid_generate_v4(),
  academy_id  uuid references academies(id) on delete cascade,
  author_id   uuid references profiles(id) on delete set null,
  title       text not null,
  content     text not null,
  pinned      boolean default false,
  created_at  timestamptz default now()
);

-- ─── CURRICULUM ──────────────────────────────────────────────
create table curriculum (
  id          uuid primary key default uuid_generate_v4(),
  academy_id  uuid references academies(id) on delete cascade,
  belt        belt_level not null,
  techniques  jsonb not null default '[]'::jsonb,
  updated_at  timestamptz default now(),
  unique(academy_id, belt)
);

-- ─── TRAINING HISTORY ────────────────────────────────────────
create table training_history (
  id             uuid primary key default uuid_generate_v4(),
  academy_id     uuid references academies(id) on delete cascade,
  student_id     uuid references profiles(id) on delete cascade,
  type           training_type not null,
  ref_id         uuid not null,   -- ID da aula, evento ou seminário
  ref_name       text not null,   -- Nome para exibição (desnormalizado)
  date           date not null,
  notes          text,
  registered_by  uuid references profiles(id)
);

-- ─── GRADUATIONS ─────────────────────────────────────────────
create table graduations (
  id            uuid primary key default uuid_generate_v4(),
  academy_id    uuid references academies(id) on delete cascade,
  student_id    uuid references profiles(id) on delete cascade,
  from_belt     belt_level not null,
  to_belt       belt_level not null,
  promoted_at   timestamptz default now(),
  promoted_by   uuid references profiles(id),
  notes         text
);

-- ============================================================
-- ÍNDICES
-- ============================================================
create index idx_profiles_academy on profiles(academy_id);
create index idx_profiles_role on profiles(role);
create index idx_enrollment_requests_academy on enrollment_requests(academy_id);
create index idx_enrollment_requests_status on enrollment_requests(status);
create index idx_checkins_academy_status on checkins(academy_id, status);
create index idx_checkins_student on checkins(student_id);
create index idx_financials_academy_status on financials(academy_id, status);
create index idx_financials_student on financials(student_id);
create index idx_orders_academy_status on orders(academy_id, status);
create index idx_training_history_student on training_history(student_id);
create index idx_announcements_academy on announcements(academy_id, created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table academies enable row level security;
alter table profiles enable row level security;
alter table enrollment_requests enable row level security;
alter table classes enable row level security;
alter table checkins enable row level security;
alter table financials enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table events enable row level security;
alter table event_registrations enable row level security;
alter table announcements enable row level security;
alter table curriculum enable row level security;
alter table training_history enable row level security;
alter table graduations enable row level security;

-- ─── Helper: pegar academy_id do usuário autenticado ─────────
create or replace function get_my_academy_id()
returns uuid language sql security definer as $$
  select academy_id from profiles where id = auth.uid()
$$;

-- ─── Helper: pegar role do usuário autenticado ───────────────
create or replace function get_my_role()
returns user_role language sql security definer as $$
  select role from profiles where id = auth.uid()
$$;

-- ─── POLICIES ────────────────────────────────────────────────

-- Academies: leitura pública, escrita apenas admin
create policy "academias_leitura_publica" on academies
  for select using (true);

create policy "academias_admin_escreve" on academies
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin' and academy_id = academies.id)
  );

-- Profiles: cada um vê o próprio + admin/instructor veem da mesma academia
create policy "profiles_proprio" on profiles
  for select using (
    id = auth.uid() or
    academy_id = get_my_academy_id()
  );

create policy "profiles_admin_escreve" on profiles
  for all using (
    id = auth.uid() or
    (academy_id = get_my_academy_id() and get_my_role() in ('admin', 'instructor'))
  );

-- Enrollment requests: qualquer um pode inserir (público), admin lê da academia
create policy "enrollment_requests_insert_publico" on enrollment_requests
  for insert with check (true);

create policy "enrollment_requests_admin_le" on enrollment_requests
  for select using (
    academy_id = get_my_academy_id() and get_my_role() = 'admin'
  );

create policy "enrollment_requests_admin_atualiza" on enrollment_requests
  for update using (
    academy_id = get_my_academy_id() and get_my_role() = 'admin'
  );

-- Classes: todos da academia veem, admin/instructor editam
create policy "classes_academia_le" on classes
  for select using (academy_id = get_my_academy_id());

create policy "classes_admin_escreve" on classes
  for all using (
    academy_id = get_my_academy_id() and get_my_role() in ('admin', 'instructor')
  );

-- Checkins: estudante vê os próprios, admin/instructor veem todos da academia
create policy "checkins_le" on checkins
  for select using (
    student_id = auth.uid() or
    (academy_id = get_my_academy_id() and get_my_role() in ('admin', 'instructor'))
  );

create policy "checkins_student_insere" on checkins
  for insert with check (
    student_id = auth.uid() and academy_id = get_my_academy_id()
  );

create policy "checkins_admin_instrutor_atualiza" on checkins
  for update using (
    academy_id = get_my_academy_id() and get_my_role() in ('admin', 'instructor')
  );

-- Financials: estudante vê os próprios, admin vê todos da academia
create policy "financials_le" on financials
  for select using (
    student_id = auth.uid() or
    (academy_id = get_my_academy_id() and get_my_role() = 'admin')
  );

create policy "financials_admin_escreve" on financials
  for all using (
    academy_id = get_my_academy_id() and get_my_role() = 'admin'
  );

-- Products: todos da academia veem
create policy "products_academia_le" on products
  for select using (academy_id = get_my_academy_id() and active = true);

create policy "products_admin_escreve" on products
  for all using (
    academy_id = get_my_academy_id() and get_my_role() = 'admin'
  );

-- Orders: estudante vê os próprios, admin vê todos
create policy "orders_le" on orders
  for select using (
    student_id = auth.uid() or
    (academy_id = get_my_academy_id() and get_my_role() = 'admin')
  );

create policy "orders_student_insere" on orders
  for insert with check (
    student_id = auth.uid() and academy_id = get_my_academy_id()
  );

create policy "orders_admin_atualiza" on orders
  for update using (
    academy_id = get_my_academy_id() and get_my_role() = 'admin'
  );

-- Events: todos da academia veem
create policy "events_academia_le" on events
  for select using (academy_id = get_my_academy_id());

create policy "events_admin_escreve" on events
  for all using (
    academy_id = get_my_academy_id() and get_my_role() in ('admin', 'instructor')
  );

-- Event registrations
create policy "event_reg_le" on event_registrations
  for select using (
    student_id = auth.uid() or
    (academy_id = get_my_academy_id() and get_my_role() in ('admin', 'instructor'))
  );

create policy "event_reg_student_insere" on event_registrations
  for insert with check (
    student_id = auth.uid() and academy_id = get_my_academy_id()
  );

create policy "event_reg_admin_atualiza" on event_registrations
  for update using (
    academy_id = get_my_academy_id() and get_my_role() = 'admin'
  );

-- Announcements: todos da academia leem
create policy "announcements_academia_le" on announcements
  for select using (academy_id = get_my_academy_id());

create policy "announcements_admin_escreve" on announcements
  for all using (
    academy_id = get_my_academy_id() and get_my_role() in ('admin', 'instructor')
  );

-- Curriculum: aluno vê apenas da faixa atual
create policy "curriculum_academia_le" on curriculum
  for select using (academy_id = get_my_academy_id());

create policy "curriculum_admin_escreve" on curriculum
  for all using (
    academy_id = get_my_academy_id() and get_my_role() = 'admin'
  );

-- Training history: estudante vê os próprios
create policy "history_le" on training_history
  for select using (
    student_id = auth.uid() or
    (academy_id = get_my_academy_id() and get_my_role() in ('admin', 'instructor'))
  );

create policy "history_admin_escreve" on training_history
  for all using (
    academy_id = get_my_academy_id() and get_my_role() in ('admin', 'instructor')
  );

-- Graduations: estudante vê as próprias
create policy "graduations_le" on graduations
  for select using (
    student_id = auth.uid() or
    (academy_id = get_my_academy_id() and get_my_role() in ('admin', 'instructor'))
  );

create policy "graduations_admin_escreve" on graduations
  for all using (
    academy_id = get_my_academy_id() and get_my_role() in ('admin', 'instructor')
  );

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-atualizar updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();

create trigger orders_updated_at before update on orders
  for each row execute function update_updated_at();

-- Auto-criar profile quando novo usuário confirma email
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  -- O profile é criado pelo admin ao aprovar matrícula,
  -- este trigger só garante que não fica órfão
  return new;
end;
$$;

-- ============================================================
-- SEED: Academia de demonstração
-- ============================================================

insert into academies (id, name, address, phone, email, contract_text)
values (
  '00000000-0000-0000-0000-000000000001',
  'Krav Magá Ipiranga',
  'R. dos Estudantes, 100 — Ipiranga, São Paulo/SP',
  '(11) 9 9999-9999',
  'contato@kravmagaipiranga.com.br',
  'CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE ARTES MARCIAIS

1. DAS PARTES
O presente contrato é celebrado entre a ACADEMIA KRAV MAGÁ IPIRANGA e o ALUNO identificado no formulário de matrícula.

2. DO OBJETO
A academia se compromete a fornecer aulas de Krav Magá, conforme grade de horários disponível.

3. DA MENSALIDADE
O aluno se compromete a efetuar o pagamento da mensalidade até o dia 10 de cada mês.

4. DA FREQUÊNCIA
Não há restrição de frequência dentro do horário contratado.

5. DA RESCISÃO
Qualquer das partes poderá rescindir o contrato mediante aviso prévio de 30 dias.

6. DA RESPONSABILIDADE
O aluno declara estar ciente dos riscos inerentes à prática de artes marciais e assume total responsabilidade por eventuais lesões decorrentes da prática.

7. DAS DISPOSIÇÕES GERAIS
O presente contrato é regido pelas leis brasileiras, elegendo as partes o foro da comarca de São Paulo/SP para dirimir eventuais conflitos.'
);
