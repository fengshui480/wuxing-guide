CREATE TABLE used_codes (
  id SERIAL PRIMARY KEY,
  code_hash TEXT UNIQUE NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE used_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_select" ON used_codes FOR SELECT USING (true);
CREATE POLICY "anon_insert" ON used_codes FOR INSERT WITH CHECK (true);
