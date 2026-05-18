-- ============================================================
-- Сэтгэлзүйн Үнэлгээний Систем — Supabase Schema
-- Supabase dashboard → SQL Editor → New query → Run
-- ============================================================

-- 1. Сэтгэлзүйчийн профайл (auth.users-тэй холбоотой)
CREATE TABLE psychologists (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  email      text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. Үйлчлүүлэгчид
CREATE TABLE clients (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  psychologist_id  uuid NOT NULL REFERENCES psychologists(id) ON DELETE CASCADE,
  name             text NOT NULL,
  age              int  NOT NULL,
  gender           text NOT NULL CHECK (gender IN ('male','female','other')),
  email            text,
  phone            text,
  notes            text,
  access_code      text UNIQUE NOT NULL,
  assigned_tests   text[] DEFAULT '{}',
  created_at       timestamptz DEFAULT now()
);

-- 3. Тестийн дүн
CREATE TABLE test_results (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  test_id         text NOT NULL,
  answers         jsonb NOT NULL DEFAULT '[]',
  subscale_scores jsonb NOT NULL DEFAULT '{}',
  total_score     int  NOT NULL DEFAULT 0,
  interpretation  text NOT NULL DEFAULT '',
  severity        text NOT NULL DEFAULT 'minimal',
  completed_at    timestamptz DEFAULT now(),
  UNIQUE (client_id, test_id)
);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE psychologists ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients       ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results  ENABLE ROW LEVEL SECURITY;

-- Сэтгэлзүйч өөрийн профайлыг л харна
CREATE POLICY "psych_own"
  ON psychologists FOR ALL
  USING (auth.uid() = id);

-- Сэтгэлзүйч өөрийн үйлчлүүлэгчдийг бүгдийг удирдана
CREATE POLICY "psych_manage_clients"
  ON clients FOR ALL
  USING (psychologist_id = auth.uid());

-- Үйлчлүүлэгч нэвтрэх код ашиглан өөрийн мэдээллийг унших (нийтийн)
CREATE POLICY "client_lookup_by_code"
  ON clients FOR SELECT
  USING (true);

-- Сэтгэлзүйч өөрийн үйлчлүүлэгчдийн дүнг харна/удирдана
CREATE POLICY "psych_manage_results"
  ON test_results FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = test_results.client_id
        AND c.psychologist_id = auth.uid()
    )
  );

-- Үйлчлүүлэгч өөрийн дүнг бичих
CREATE POLICY "client_insert_result"
  ON test_results FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM clients WHERE id = client_id));

CREATE POLICY "client_update_result"
  ON test_results FOR UPDATE
  USING (EXISTS (SELECT 1 FROM clients WHERE id = client_id));

-- Үйлчлүүлэгч өөрийн дүнг унших
CREATE POLICY "client_read_results"
  ON test_results FOR SELECT
  USING (EXISTS (SELECT 1 FROM clients WHERE id = client_id));
