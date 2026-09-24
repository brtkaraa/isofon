/*
# InnoMap AI - Şirket Çağrıları (Çağrılarım)

## Açıklama
Şirketlerin kendi açık inovasyon çağrılarını oluşturup yönetebileceği tablo.
Oyak Renault, Vestel gibi şirketlerin yaptığı çağrılara benzer şekilde,
kullanıcı firma da kendi çağrısını yayınlayabilir.

## Yeni Tablo
1. `company_calls` - Şirket tarafından oluşturulan çağrılar
   - id (uuid, PK)
   - company_id (uuid, FK -> companies)
   - title (text) - Çağrı başlığı
   - description (text) - Çağrı açıklaması / ihtiyaç tanımı
   - sector (text) - Hedef sektör
   - budget (text) - PoC/destek bütçesi
   - duration (text) - Proje süresi
   - deadline (text) - Son başvuru tarihi
   - eligibility (text[]) - Başvuru koşulları
   - technical_scope (text) - Teknik kapsam
   - status (text) - open/closed
   - created_at (timestamptz)

## Güvenlik
- RLS etkin, anon + authenticated tam CRUD
*/
CREATE TABLE IF NOT EXISTS company_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  sector text NOT NULL DEFAULT 'imalat',
  budget text NOT NULL DEFAULT '',
  duration text NOT NULL DEFAULT '',
  deadline text NOT NULL DEFAULT '',
  eligibility text[] NOT NULL DEFAULT '{}',
  technical_scope text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE company_calls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_company_calls" ON company_calls;
CREATE POLICY "anon_select_company_calls" ON company_calls FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_company_calls" ON company_calls;
CREATE POLICY "anon_insert_company_calls" ON company_calls FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_company_calls" ON company_calls;
CREATE POLICY "anon_update_company_calls" ON company_calls FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_company_calls" ON company_calls;
CREATE POLICY "anon_delete_company_calls" ON company_calls FOR DELETE
  TO anon, authenticated USING (true);
