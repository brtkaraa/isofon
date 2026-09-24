/*
# InnoMap AI - Tersine Çağrı Tablosu

## Açıklama
Proje sahiplerinin, mevcut çağrılara uymayan projeleri için yatırımcılara yönelik "tersine çağrı" oluşturmasını sağlar.
Yatırımcılar bu tersine çağrıları görüp ilgilendikleri projelere geri bildirim verebilir.

## Yeni Tablo
1. `reverse_calls` - Tersine çağrılar
   - id (uuid, PK)
   - project_id (uuid) - İlişkili proje (projects tablosuna foreign key)
   - title (text) - Tersine çağrı başlığı
   - summary (text) - Proje özeti / yatırım talebi açıklaması
   - requested_budget (text) - Talep edilen bütçe
   - investment_type (text) - Yatırım tipi (hisse, geri ödemeli, hibe, poc)
   - target_sectors (text[]) - Hedef sektörler
   - min_trl (int) - Minimum TRL
   - status (text) - Durum (active, matched, closed)
   - created_at (timestamptz)

## Güvenlik
- RLS etkin, anon + authenticated tam CRUD (tek-kullanıcı uygulama)

## Önemli Notlar
1. project_id alanı projects tablosuna foreign key olarak bağlanır (CASCADE)
2. Tersine çağrılar "active" durumunda başlar
3. Yatırımcılar tüm tersine çağrıları görebilir
*/

CREATE TABLE IF NOT EXISTS reverse_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  requested_budget text NOT NULL DEFAULT '',
  investment_type text NOT NULL DEFAULT 'hisse',
  target_sectors text[] NOT NULL DEFAULT '{}',
  min_trl int NOT NULL DEFAULT 3,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reverse_calls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_reverse_calls" ON reverse_calls;
CREATE POLICY "anon_select_reverse_calls" ON reverse_calls FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reverse_calls" ON reverse_calls;
CREATE POLICY "anon_insert_reverse_calls" ON reverse_calls FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_reverse_calls" ON reverse_calls;
CREATE POLICY "anon_update_reverse_calls" ON reverse_calls FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_reverse_calls" ON reverse_calls;
CREATE POLICY "anon_delete_reverse_calls" ON reverse_calls FOR DELETE
  TO anon, authenticated USING (true);
