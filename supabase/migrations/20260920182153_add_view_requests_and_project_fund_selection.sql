/*
# InnoMap AI - Tersine Çağrı Detay, Görüntüleme Talebi ve Proje-Fon Seçimi

## Açıklama
1. Tersine çağrıların detaylı görüntülenmesi ve dosya ekleme
2. Yatırımcıların tersine çağrıları görüntülemek için "görüntüleme talebi" oluşturması
3. Projelerin seçilen fonunu kaydetme (selected_fund_id)
4. Görüntüleme talepleri proje sahibine bildirim olarak düşmesi

## Değişiklikler
1. `projects` tablosuna `selected_fund_id` (uuid) eklendi - seçilen fon kaydedilir
2. `reverse_calls` tablosuna `documents` (text[]) eklendi - yüklenen dosya adları
3. Yeni tablo `view_requests`:
   - id (uuid, PK)
   - reverse_call_id (uuid, FK -> reverse_calls)
   - requester_name (text) - Talep eden yatırımcı adı
   - requester_company (text) - Yatırımcı firma
   - requester_email (text) - İletişim
   - message (text) - Talep mesajı
   - status (text) - pending/approved/rejected
   - created_at (timestamptz)
4. Yeni tablo `project_notifications`:
   - id (uuid, PK)
   - project_id (uuid, FK -> projects)
   - type (text) - view_request/reverse_call/etc
   - title (text)
   - message (text)
   - read (boolean)
   - created_at (timestamptz)

## Güvenlik
- Tüm yeni tablolarda RLS etkin, anon + authenticated tam CRUD
- Mevcut tablolara güvenli ALTER

## Önemli Notlar
1. projects tablosuna selected_fund_id nullable alan eklendi
2. reverse_calls tablosuna documents array eklendi
3. view_requests tersine çağrıya bağlı, CASCADE silme
4. project_notifications projeye bağlı, CASCADE silme
*/

-- projects tablosuna selected_fund_id
ALTER TABLE projects ADD COLUMN IF NOT EXISTS selected_fund_id uuid;

-- reverse_calls tablosuna documents
ALTER TABLE reverse_calls ADD COLUMN IF NOT EXISTS documents text[] NOT NULL DEFAULT '{}';

-- view_requests tablosu
CREATE TABLE IF NOT EXISTS view_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reverse_call_id uuid REFERENCES reverse_calls(id) ON DELETE CASCADE,
  requester_name text NOT NULL,
  requester_company text NOT NULL DEFAULT '',
  requester_email text NOT NULL,
  message text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE view_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_view_requests" ON view_requests;
CREATE POLICY "anon_select_view_requests" ON view_requests FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_view_requests" ON view_requests;
CREATE POLICY "anon_insert_view_requests" ON view_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_view_requests" ON view_requests;
CREATE POLICY "anon_update_view_requests" ON view_requests FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_view_requests" ON view_requests;
CREATE POLICY "anon_delete_view_requests" ON view_requests FOR DELETE
  TO anon, authenticated USING (true);

-- project_notifications tablosu
CREATE TABLE IF NOT EXISTS project_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'view_request',
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE project_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_project_notifications" ON project_notifications;
CREATE POLICY "anon_select_project_notifications" ON project_notifications FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_project_notifications" ON project_notifications;
CREATE POLICY "anon_insert_project_notifications" ON project_notifications FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_project_notifications" ON project_notifications;
CREATE POLICY "anon_update_project_notifications" ON project_notifications FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_project_notifications" ON project_notifications;
CREATE POLICY "anon_delete_project_notifications" ON project_notifications FOR DELETE
  TO anon, authenticated USING (true);
