/*
# Add user_id and owner-scoped RLS for auth

## Açıklama
Kullanıcı giriş/kayıt akışı eklendiğinde her kullanıcının yalnızca kendi
verisini görebilmesi için companies ve projects tablolarına user_id kolonu
eklenir ve RLS politikaları owner-scoped olarak güncellenir.
project_drafts ve diğer tablolarda zaten cascade/okuma açık olduğundan
onların politikaları anon+authenticated okuma olarak kalır.

## Değiştirilen Tablolar
1. `companies` - user_id uuid kolonu eklendi (auth.users'a FK)
2. `projects` - user_id uuid kolonu eklendi (auth.users'a FK)

## Güvenlik
- companies ve projects için RLS politikaları owner-scoped (auth.uid() = user_id) olarak değiştirildi.
- funds, project_drafts, reverse_calls, view_requests, company_calls tabloları
  anon+authenticated okuma/yazma politikalarıyla korunmaya devam eder.
*/

-- companies tablosuna user_id ekle
ALTER TABLE companies ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- projects tablosuna user_id ekle
ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- companies RLS politikalarını güncelle (owner-scoped)
DROP POLICY IF EXISTS "anon_select_companies" ON companies;
CREATE POLICY "select_own_companies" ON companies FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "anon_insert_companies" ON companies;
CREATE POLICY "insert_own_companies" ON companies FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "anon_update_companies" ON companies;
CREATE POLICY "update_own_companies" ON companies FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "anon_delete_companies" ON companies;
CREATE POLICY "delete_own_companies" ON companies FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- projects RLS politikalarını güncelle (owner-scoped)
DROP POLICY IF EXISTS "anon_select_projects" ON projects;
CREATE POLICY "select_own_projects" ON projects FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "anon_insert_projects" ON projects;
CREATE POLICY "insert_own_projects" ON projects FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "anon_update_projects" ON projects;
CREATE POLICY "update_own_projects" ON projects FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "anon_delete_projects" ON projects;
CREATE POLICY "delete_own_projects" ON projects FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- project_drafts: owner-scoped (project üzerinden)
DROP POLICY IF EXISTS "anon_select_project_drafts" ON project_drafts;
CREATE POLICY "select_own_project_drafts" ON project_drafts FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_drafts.project_id AND projects.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "anon_insert_project_drafts" ON project_drafts;
CREATE POLICY "insert_own_project_drafts" ON project_drafts FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_drafts.project_id AND projects.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "anon_update_project_drafts" ON project_drafts;
CREATE POLICY "update_own_project_drafts" ON project_drafts FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_drafts.project_id AND projects.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_drafts.project_id AND projects.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "anon_delete_project_drafts" ON project_drafts;
CREATE POLICY "delete_own_project_drafts" ON project_drafts FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_drafts.project_id AND projects.user_id = auth.uid())
  );

-- funds: hala herkese okunabilir (katalog) ama yazma authenticated'a kapalı
-- mevcut anon_select_funds politikası zaten public okuma
