-- ============================================================
-- Krav Magá Platform — Schema inicial
-- Execute no SQL Editor do Supabase
-- ============================================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ACADEMIAS
-- ============================================================
CREATE TABLE academies (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,        -- ex: "ipiranga"
  address     TEXT,
  city        TEXT,
  state       TEXT,
  phone       TEXT,
  email       TEXT,
  logo_url    TEXT,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USERS (perfis além do auth.users do Supabase)
-- ============================================================
CREATE TYPE user_role AS ENUM ('admin', 'instructor', 'student');
CREATE TYPE belt_level AS ENUM ('white','yellow','orange','green','blue','brown','black');
CREATE TYPE enrollment_status AS ENUM ('pending','active','suspended','cancelled');

CREATE TABLE profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  academy_id        UUID NOT NULL REFERENCES academies(id),
  role              user_role NOT NULL DEFAULT 'student',
  full_name         TEXT NOT NULL,
  birth_date        DATE,
  cpf               TEXT,
  phone             TEXT,
  shirt_size        TEXT,
  pants_size        TEXT,
  belt_level        belt_level NOT NULL DEFAULT 'white',
  enrollment_status enrollment_status NOT NULL DEFAULT 'pending',
  avatar_url        TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MATRÍCULAS (formulário público — antes de ter auth.user)
-- ============================================================
CREATE TYPE enrollment_request_status AS ENUM ('pending','approved','rejected');

CREATE TABLE enrollment_requests (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academy_id          UUID NOT NULL REFERENCES academies(id),

  -- Dados da ficha
  full_name           TEXT NOT NULL,
  birth_date          DATE NOT NULL,
  cpf                 TEXT NOT NULL,
  phone               TEXT NOT NULL,
  email               TEXT NOT NULL,
  shirt_size          TEXT NOT NULL,
  pants_size          TEXT NOT NULL,
  emergency_contacts  JSONB NOT NULL DEFAULT '[]',
  accepted_terms      BOOLEAN NOT NULL DEFAULT false,
  declared_truth      BOOLEAN NOT NULL DEFAULT false,

  -- Controle
  status              enrollment_request_status NOT NULL DEFAULT 'pending',
  reviewed_by         UUID REFERENCES profiles(id),
  reviewed_at         TIMESTAMPTZ,
  rejection_reason    TEXT,
  notes               TEXT,
  submitted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TURMAS / HORÁRIOS
-- ============================================================
CREATE TABLE classes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academy_id    UUID NOT NULL REFERENCES academies(id),
  instructor_id UUID REFERENCES profiles(id),
  name          TEXT NOT NULL,
  description   TEXT,
  day_of_week   SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Dom
  start_time    TIME NOT NULL,
  duration_min  SMALLINT NOT NULL DEFAULT 60,
  max_students  SMALLINT,
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CHECK-INS
-- ============================================================
CREATE TYPE checkin_status AS ENUM ('pending','approved','rejected');

CREATE TABLE checkins (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academy_id    UUID NOT NULL REFERENCES academies(id),
  student_id    UUID NOT NULL REFERENCES profiles(id),
  class_id      UUID REFERENCES classes(id),
  status        checkin_status NOT NULL DEFAULT 'pending',
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by   UUID REFERENCES profiles(id),
  reviewed_at   TIMESTAMPTZ
);

-- ============================================================
-- HISTÓRICO DE TREINOS
-- ============================================================
CREATE TYPE training_type AS ENUM ('class','seminar','event','graduation');

CREATE TABLE training_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academy_id  UUID NOT NULL REFERENCES academies(id),
  student_id  UUID NOT NULL REFERENCES profiles(id),
  type        training_type NOT NULL DEFAULT 'class',
  ref_id      UUID,          -- id da turma, evento, etc
  title       TEXT NOT NULL,
  date        DATE NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- GRADUAÇÕES
-- ============================================================
CREATE TABLE graduations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academy_id   UUID NOT NULL REFERENCES academies(id),
  student_id   UUID NOT NULL REFERENCES profiles(id),
  from_belt    belt_level NOT NULL,
  to_belt      belt_level NOT NULL,
  promoted_by  UUID NOT NULL REFERENCES profiles(id),
  date         DATE NOT NULL,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FINANCEIRO
-- ============================================================
CREATE TYPE payment_status AS ENUM ('pending','paid','overdue','cancelled');

CREATE TABLE financials (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academy_id   UUID NOT NULL REFERENCES academies(id),
  student_id   UUID NOT NULL REFERENCES profiles(id),
  description  TEXT NOT NULL DEFAULT 'Mensalidade',
  amount       NUMERIC(10,2) NOT NULL,
  due_date     DATE NOT NULL,
  paid_at      DATE,
  status       payment_status NOT NULL DEFAULT 'pending',
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LOJA — PRODUTOS
-- ============================================================
CREATE TABLE products (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academy_id   UUID NOT NULL REFERENCES academies(id),
  name         TEXT NOT NULL,
  description  TEXT,
  price        NUMERIC(10,2) NOT NULL,
  sizes        TEXT[] DEFAULT '{}',
  image_url    TEXT,
  stock        INTEGER NOT NULL DEFAULT 0,
  active       BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LOJA — PEDIDOS
-- ============================================================
CREATE TYPE order_status AS ENUM ('pending','processing','ready','delivered','cancelled');

CREATE TABLE orders (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academy_id   UUID NOT NULL REFERENCES academies(id),
  student_id   UUID NOT NULL REFERENCES profiles(id),
  items        JSONB NOT NULL DEFAULT '[]', -- [{product_id, name, size, qty, price}]
  total        NUMERIC(10,2) NOT NULL,
  status       order_status NOT NULL DEFAULT 'pending',
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EVENTOS & SEMINÁRIOS
-- ============================================================
CREATE TYPE event_type AS ENUM ('seminar','event','workshop','competition');

CREATE TABLE events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academy_id    UUID NOT NULL REFERENCES academies(id),
  type          event_type NOT NULL DEFAULT 'event',
  title         TEXT NOT NULL,
  description   TEXT,
  date          DATE NOT NULL,
  time          TIME,
  location      TEXT,
  price         NUMERIC(10,2) DEFAULT 0,
  max_capacity  INTEGER,
  image_url     TEXT,
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE event_reg_status AS ENUM ('pending','approved','rejected','cancelled');

CREATE TABLE event_registrations (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academy_id     UUID NOT NULL REFERENCES academies(id),
  event_id       UUID NOT NULL REFERENCES events(id),
  student_id     UUID NOT NULL REFERENCES profiles(id),
  status         event_reg_status NOT NULL DEFAULT 'pending',
  registered_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by    UUID REFERENCES profiles(id),
  reviewed_at    TIMESTAMPTZ
);

-- ============================================================
-- AVISOS
-- ============================================================
CREATE TABLE announcements (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academy_id   UUID NOT NULL REFERENCES academies(id),
  author_id    UUID NOT NULL REFERENCES profiles(id),
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  pinned       BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CURRICULUM POR FAIXA
-- ============================================================
CREATE TABLE curriculum (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academy_id   UUID NOT NULL REFERENCES academies(id),
  belt         belt_level NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  techniques   JSONB NOT NULL DEFAULT '[]', -- [{name, description, video_url?}]
  sort_order   SMALLINT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (academy_id, belt, title)
);

-- ============================================================
-- ROW LEVEL SECURITY — Configuração base
-- ============================================================

ALTER TABLE academies            ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollment_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins             ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_history     ENABLE ROW LEVEL SECURITY;
ALTER TABLE graduations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE financials           ENABLE ROW LEVEL SECURITY;
ALTER TABLE products             ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE events               ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements        ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum           ENABLE ROW LEVEL SECURITY;

-- Formulário de matrícula é público (INSERT sem auth)
CREATE POLICY "enrollment_requests_public_insert"
  ON enrollment_requests FOR INSERT
  WITH CHECK (true);

-- Aluno vê apenas as próprias matrículas
CREATE POLICY "enrollment_requests_own_select"
  ON enrollment_requests FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Admin vê tudo da sua academia
CREATE POLICY "profiles_admin_all"
  ON profiles FOR ALL
  USING (
    academy_id = (SELECT academy_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin','instructor')
  );

-- Aluno vê apenas o próprio perfil
CREATE POLICY "profiles_own_select"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- ============================================================
-- FUNÇÃO: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- DADO INICIAL: academia de exemplo
-- ============================================================
INSERT INTO academies (name, slug, city, state, phone, email)
VALUES ('Krav Magá Ipiranga', 'ipiranga', 'São Paulo', 'SP', '(11) 99999-9999', 'contato@kravmagaipiranga.com.br');
