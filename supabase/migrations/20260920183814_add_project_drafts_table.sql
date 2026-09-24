/*
# InnoMap AI - Başvuru Taslakları ve Belge Yükleme

## Açıklama
Projeler için oluşturulan PRODİS başvuru taslaklarını kaydetme ve
kullanıcının başvuru belgelerini yükleyebilmesi için tablo.

## Yeni Tablo
1. `project_drafts` - Projeye ait başvuru taslakları
   - id (uuid, PK)
   - project_id (uuid, FK -> projects)
   - fund_id (uuid) - Hangi fon için oluşturulduğu
   - fund_name (text) - Fon adı (cache)
   - fund_provider (text) - Fon sağlayıcı (cache)
   - draft_content (jsonb) - Taslak içeriği (iş paketleri, riskler, vb.)
   - documents (text[]) - Kullanıcının yüklediği belge adları
   - created_at (timestamptz)

## Güvenlik
- RLS etkin, anon + authenticated tam CRUD
*/
CREATE TABLE IF NOT EXISTS project_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  fund_id uuid,
  fund_name text NOT NULL DEFAULT '',
  fund_provider text NOT NULL DEFAULT '',
  draft_content jsonb NOT NULL DEFAULT '{}',
  documents text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE project_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_project_drafts" ON project_drafts;
CREATE POLICY "anon_select_project_drafts" ON project_drafts FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_project_drafts" ON project_drafts;
CREATE POLICY "anon_insert_project_drafts" ON project_drafts FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_project_drafts" ON project_drafts;
CREATE POLICY "anon_update_project_drafts" ON project_drafts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_project_drafts" ON project_drafts;
CREATE POLICY "anon_delete_project_drafts" ON project_drafts FOR DELETE
  TO anon, authenticated USING (true);
