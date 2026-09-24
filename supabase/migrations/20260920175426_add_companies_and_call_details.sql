/*
# InnoMap AI - Firma Profili ve Çağrı Detayları

## Açıklama
Firma kaydı (şirket profili) ve detaylı çağrı (fon) bilgileri ekler.
TÜBİTAK 1507 formatına benzer detaylı çağrı sayfaları için alanlar ekler.

## Yeni Tablolar
1. `companies` - Firma profilleri
   - id (uuid, PK)
   - name (text) - Firma adı
   - sector (text) - Ana sektör
   - employee_count (text) - Çalışan sayısı aralığı
   - city (text) - Şehir
   - website (text) - Web sitesi
   - description (text) - Firma açıklaması
   - contact_name (text) - İletişim kişisi
   - contact_email (text) - İletişim e-postası
   - created_at (timestamptz)

## Değiştirilen Tablolar
2. `funds` tablosuna yeni alanlar eklendi:
   - code (text) - Çağrı kodu (Örn: 1507, 1512)
   - application_url (text) - Başvuru bağlantısı
   - deadline (text) - Son başvuru tarihi
   - duration (text) - Proje süresi
   - max_budget_per_project (text) - Proje başına maksimum bütçe
   - support_rate (text) - Destek oranı
   - eligibility (text[]) - Başvuru koşulları listesi
   - required_docs (text[]) - Gerekli belgeler listesi
   - technical_scope (text) - Teknik kapsam detayı
   - status (text) - Çağrı durumu (open/closed)

## Güvenlik
- `companies` tablosunda RLS etkin, anon + authenticated tam CRUD
- `funds` tablosuna update/insert policy eklendi (zaten select vardı)

## Önemli Notlar
1. Mevcut funds tablosu ALTER TABLE ile genişletilir, veri kaybı yok
2. 6 fon kaydı yeni alanlarla güncellenir
3. TÜBİTAK 1507 detayları (koşullar, belgeler, teknik kapsam) örnek olarak eklenir
*/

-- Companies tablosu
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sector text NOT NULL DEFAULT 'yazilim',
  employee_count text NOT NULL DEFAULT '1-10',
  city text NOT NULL DEFAULT 'Istanbul',
  website text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  contact_name text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_companies" ON companies;
CREATE POLICY "anon_select_companies" ON companies FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_companies" ON companies;
CREATE POLICY "anon_insert_companies" ON companies FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_companies" ON companies;
CREATE POLICY "anon_update_companies" ON companies FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_companies" ON companies;
CREATE POLICY "anon_delete_companies" ON companies FOR DELETE
  TO anon, authenticated USING (true);

-- Funds tablosuna yeni alanlar
ALTER TABLE funds ADD COLUMN IF NOT EXISTS code text NOT NULL DEFAULT '';
ALTER TABLE funds ADD COLUMN IF NOT EXISTS application_url text NOT NULL DEFAULT '';
ALTER TABLE funds ADD COLUMN IF NOT EXISTS deadline text NOT NULL DEFAULT '';
ALTER TABLE funds ADD COLUMN IF NOT EXISTS duration text NOT NULL DEFAULT '';
ALTER TABLE funds ADD COLUMN IF NOT EXISTS max_budget_per_project text NOT NULL DEFAULT '';
ALTER TABLE funds ADD COLUMN IF NOT EXISTS support_rate text NOT NULL DEFAULT '';
ALTER TABLE funds ADD COLUMN IF NOT EXISTS eligibility text[] NOT NULL DEFAULT '{}';
ALTER TABLE funds ADD COLUMN IF NOT EXISTS required_docs text[] NOT NULL DEFAULT '{}';
ALTER TABLE funds ADD COLUMN IF NOT EXISTS technical_scope text NOT NULL DEFAULT '';
ALTER TABLE funds ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'open';

-- Fonları güncelle (detaylı bilgiler)
UPDATE funds SET
  code = '1507',
  application_url = 'https://tubitak.gov.tr/tr/destekler/sanayi/ulusal-destek-programlari/1507-tubitak-kobi-ar-ge-baslangic-destek-programi',
  deadline = '2026-12-31',
  duration = '12-24 ay',
  max_budget_per_project = '1.200.000 TL',
  support_rate = '%75',
  eligibility = ARRAY[
    'KOBİ statüsünde olması (10-250 çalışan, 10M-125M TL ciro)',
    'Türkiye''de faaliyet gösteren bir firma olması',
    'Ar-Ge birimi olması veya oluşturması',
    'En az 1 üniversite/araştırma kuruluşu ile işbirliği',
    'Proje TRL 3-7 aralığında olması'
  ],
  required_docs = ARRAY[
    'Proje başvuru formu (PRODİS formatında)',
    'Firma bilançosu (son 2 yıl)',
    'Ar-Ge birimi kuruluş belgesi',
    'İşbirliği protokolü (varsa)',
    'Teknik doküman ve tasarım raporu',
    'Bütçe planlaması'
  ],
  technical_scope = 'KOBİ''lerin Ar-Ge yenilik faaliyetlerini desteklemek. Ürün, süreç veya hizmet geliştirme. Yazılım, imalat, biyoteknoloji, enerji, savunma ve tarım teknolojileri kapsamında projeler değerlendirilir.',
  status = 'open'
WHERE name = 'TÜBİTAK 1507';

UPDATE funds SET
  code = '1512',
  application_url = 'https://tubitak.gov.tr/tr/destekler/girisimcilik/1512-tubitak-teknogirisim-sermaye-destegi',
  deadline = '2026-10-31',
  duration = '12 ay',
  max_budget_per_project = '750.000 TL',
  support_rate = '%100 (Sermaye)',
  eligibility = ARRAY[
    'Teknogirişim sertifikasına sahip olması',
    'Son 5 yıl içinde kurulmuş olması',
    'TTM teknoloji tabanlı iş modeli',
    'En az 1 Ar-Ge personeli',
    'TRL 1-5 aralığında olması'
  ],
  required_docs = ARRAY[
    'Teknogirişim sertifikası',
    'Ticaret sicil gazetesi',
    'Proje teknik dokümanı',
    'Ar-Ge personeli özgeçmişleri',
    'Bütçe planlaması'
  ],
  technical_scope = 'Erken aşama teknoloji girişimlerine sermaye desteği. Yazılım, imalat, tarım ve biyoteknoloji alanlarında ürün geliştirme projeleri.',
  status = 'open'
WHERE name = 'TÜBİTAK 1512';

UPDATE funds SET
  code = 'H2020-SME',
  application_url = 'https://ec.europa.eu/programmes/horizon2020',
  deadline = '2026-09-30',
  duration = '24 ay',
  max_budget_per_project = '2.500.000 EUR',
  support_rate = '%70',
  eligibility = ARRAY[
    'AB üyesi veya ortak ülkeden KOBİ olması',
    'Uluslararası konsorsiyum (en az 3 ülke)',
    'TRL 4-8 aralığında olması',
    'İnovatif teknoloji içermesi'
  ],
  required_docs = ARRAY[
    'EU başvuru formu',
    'Konsorsiyum anlaşması',
    'Teknik doküman',
    'Etki değerlendirme raporu',
    'Bütçe planlaması (EUR)'
  ],
  technical_scope = 'Avrupa Birliği Horizon Europe programı kapsamında KOBİ instrument desteği. Uluslararası ölçekte Ar-Ge ve inovasyon projeleri.',
  status = 'open'
WHERE name = 'Horizon Europe SME';

UPDATE funds SET
  code = 'OR-PoC',
  application_url = 'https://www.renault.com.tr',
  deadline = '2026-11-15',
  duration = '6 ay',
  max_budget_per_project = '500.000 TL',
  support_rate = '%100 (PoC)',
  eligibility = ARRAY[
    'İleri imalat veya yazılım sektöründe olması',
    'TRL 4-8 aralığında olması',
    'Otomotiv/imalat teknolojilerine uygunluk'
  ],
  required_docs = ARRAY[
    'Konsept kanıtlama raporu',
    'Teknik doküman',
    'Şirket tanıtım dosyası',
    'Referans projeler'
  ],
  technical_scope = 'Oyak Renault''nun ileri imalat teknolojileri ihtiyaçları için açık inovasyon çağrısı. Robotik, otomasyon, IoT, verimlilik optimizasyonu konularında PoC projeleri.',
  status = 'open'
WHERE name = 'Oyak Renault İleri İmalat';

UPDATE funds SET
  code = 'VST-IoT',
  application_url = 'https://www.vestel.com.tr',
  deadline = '2026-12-01',
  duration = '6 ay',
  max_budget_per_project = '400.000 TL',
  support_rate = '%100 (PoC)',
  eligibility = ARRAY[
    'Yazılım veya imalat sektöründe olması',
    'TRL 3-7 aralığında olması',
    'IoT/dijital dönüşüm teknolojilerine uygunluk'
  ],
  required_docs = ARRAY[
    'Konsept kanıtlama raporu',
    'Teknik doküman',
    'Şirket tanıtım dosyası'
  ],
  technical_scope = 'Vestel''in dijital dönüşüm ve IoT çözümleri için PoC bütçesi. Akıllı ev, endüstriyel IoT, enerji yönetimi ve bağlı cihaz teknolojileri.',
  status = 'open'
WHERE name = 'Vestel Dijital Dönüşüm';

UPDATE funds SET
  code = 'ASL-SAV',
  application_url = 'https://www.aselsan.com.tr',
  deadline = '2027-01-31',
  duration = '12-24 ay',
  max_budget_per_project = '800.000 TL',
  support_rate = '%100 (Ar-Ge)',
  eligibility = ARRAY[
    'Savunma, yazılım veya imalat sektöründe olması',
    'TRL 5-9 aralığında olması',
    'Savunma sanayi teknolojilerine uygunluk',
    'SSB onaylı proje'
  ],
  required_docs = ARRAY[
    'Güvenlik clearance belgesi',
    'Teknik doküman',
    'Ar-Ge yetkinlik raporu',
    'Personel güvenlik belgeleri'
  ],
  technical_scope = 'Aselsan''ın savunma sanayi Ar-Ge iş ortaklığı çağrısı. Radar, elektronik harp, siber güvenlik, yapay zeka ve otonom sistemler konularında projeler.',
  status = 'open'
WHERE name = 'Aselsan Savunma Sanayi';
