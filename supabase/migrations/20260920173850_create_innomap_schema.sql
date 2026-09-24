/*
# InnoMap AI - Proje ve Fon Veritabanı Şeması

## Açıklama
InnoMap AI platformu için proje ve fon eşleştirme veritabanı oluşturur.
Kullanıcılar (giriş yapmadan) Ar-Ge projelerini kaydedebilir, TRL analiz sonuçlarını görebilir ve fonlarla eşleşebilir.

## Yeni Tablolar
1. `projects` - Kullanıcı projeleri
   - id (uuid, PK)
   - title (text) - Proje başlığı
   - description (text) - Proje açıklaması
   - sector (text) - Sektör (yazılım, imalat, biyoteknoloji, enerji, savunma, tarim)
   - trl_level (int) - Teknoloji Hazırlık Seviyesi (1-9)
   - status (text) - Proje durumu (analyzing, matched, document_ready)
   - created_at (timestamptz)

2. `funds` - Fon kataloğu (önceden doldurulur)
   - id (uuid, PK)
   - name (text) - Fon adı
   - provider (text) - Sağlayıcı kurum
   - type (text) - Fon tipi (kamu, ozel_sektor, ab)
   - budget (text) - Bütçe bilgisi
   - min_trl (int) - Minimum TRL gereksinimi
   - max_trl (int) - Maksimum TRL gereksinimi
   - sectors (text[]) - Uygun sektörler
   - description (text) - Açıklama
   - created_at (timestamptz)

## Güvenlik
- Her iki tabloda da RLS etkinleştirildi.
- Tek-kullanıcı (giriş yok) uygulama olduğu için anon + authenticated erişimine açık.
- `funds` tablosu herkese okunabilir (katalog).
- `projects` tablosu anon tarafından tam CRUD yapılabilir.

## Önemli Notlar
1. `funds` tablosu 6 örnek fon ile doldurulur (TÜBİTAK 1507, 1512, Horizon Europe, Oyak Renault, Vestel, Aselsan)
2. TRL ve sektör bazlı eşleştirme istemci tarafında hesaplanır
*/

-- Projects tablosu
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  sector text NOT NULL DEFAULT 'yazilim',
  trl_level int NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'analyzing',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_projects" ON projects;
CREATE POLICY "anon_select_projects" ON projects FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_projects" ON projects;
CREATE POLICY "anon_insert_projects" ON projects FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_projects" ON projects;
CREATE POLICY "anon_update_projects" ON projects FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_projects" ON projects;
CREATE POLICY "anon_delete_projects" ON projects FOR DELETE
  TO anon, authenticated USING (true);

-- Funds tablosu
CREATE TABLE IF NOT EXISTS funds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provider text NOT NULL,
  type text NOT NULL DEFAULT 'kamu',
  budget text NOT NULL,
  min_trl int NOT NULL DEFAULT 1,
  max_trl int NOT NULL DEFAULT 9,
  sectors text[] NOT NULL DEFAULT '{}',
  description text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE funds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_funds" ON funds;
CREATE POLICY "anon_select_funds" ON funds FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_funds" ON funds;
CREATE POLICY "anon_insert_funds" ON funds FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_funds" ON funds;
CREATE POLICY "anon_update_funds" ON funds FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Örnek fon verileri
INSERT INTO funds (name, provider, type, budget, min_trl, max_trl, sectors, description) VALUES
('TÜBİTAK 1507', 'TÜBİTAK', 'kamu', '1.2M TL', 3, 7, ARRAY['yazilim', 'imalat', 'enerji', 'savunma', 'biyoteknoloji'], 'KOBİ Ar-Ge yenilik destek programı. TRL 3-7 arası projeler için uygun.'),
('TÜBİTAK 1512', 'TÜBİTAK', 'kamu', '750K TL', 1, 5, ARRAY['yazilim', 'imalat', 'tarim', 'biyoteknoloji'], 'Teknogirişim sermaye desteği. Erken aşama startuplar için.'),
('Horizon Europe SME', 'Avrupa Birliği', 'ab', '2.5M EUR', 4, 8, ARRAY['yazilim', 'enerji', 'biyoteknoloji', 'imalat'], 'AB SME instrument programı. Uluslararası ölçek projeler için.'),
('Oyak Renault İleri İmalat', 'Oyak Renault', 'ozel_sektor', '500K TL', 4, 8, ARRAY['imalat', 'yazilim'], 'Açık inovasyon PoC çağrısı. İleri imalat teknolojileri için.'),
('Vestel Dijital Dönüşüm', 'Vestel', 'ozel_sektor', '400K TL', 3, 7, ARRAY['yazilim', 'imalat'], 'Dijital dönüşüm ve IoT çözümleri için PoC bütçesi.'),
('Aselsan Savunma Sanayi', 'Aselsan', 'ozel_sektor', '800K TL', 5, 9, ARRAY['savunma', 'yazilim', 'imalat'], 'Savunma sanayi Ar-Ge iş ortaklığı çağrısı.')
ON CONFLICT DO NOTHING;
