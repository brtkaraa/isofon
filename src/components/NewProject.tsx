import { useMemo, useState } from 'react';
import { ArrowRight, Cpu, FileText, Loader2, CheckCircle2, ChevronDown } from 'lucide-react';
import { supabase, SECTORS, type Project } from '@/lib/supabase';

type Props = {
  onBack: () => void;
  onComplete: (project: Project) => void;
  userId: string;
};

type Question = {
  id: string;
  label: string;
  hint?: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select';
  options?: string[];
  required?: boolean;
};

type QuestionSection = {
  title: string;
  description: string;
  questions: Question[];
};

const questionSections: QuestionSection[] = [
  {
    title: 'Kuruluş Bilgileri',
    description: 'Başvurunun kuruluş uygunluğunu ve destek geçmişini değerlendirmek için kullanılır.',
    questions: [
      { id: 'basvuran_turu', label: 'Kim adına başvuru yapıyorsunuz?', type: 'select', options: ['KOBİ', 'Büyük işletme', 'Girişim / startup', 'Üniversite veya araştırma kurumu'], required: true },
      { id: 'kurulus_olcek', label: 'Kuruluşunuzun ölçeği nedir?', type: 'select', options: ['Mikro işletme', 'Küçük işletme', 'Orta ölçekli işletme', 'Büyük işletme', 'Girişim / startup'], required: true },
      { id: 'kurulus_tarihi', label: 'Kuruluş tarihi', type: 'date', required: true },
      { id: 'sektor_turu', label: 'Kuruluşunuzun ana sektörü nedir?', type: 'select', options: ['İmalat', 'Yazılım / bilişim', 'Enerji / çevre', 'Sağlık / biyoteknoloji', 'Savunma / havacılık', 'Tarım / gıda', 'Diğer'], required: true },
      { id: 'arge_merkezi', label: 'Ar-Ge merkezi veya teknopark statünüz var mı?', type: 'select', options: ['Ar-Ge merkezi belgesi var', 'Tasarım merkezi belgesi var', 'Teknopark / kuluçka merkezindeyim', 'Başvuru aşamasında', 'Hayır'], required: true },
      { id: 'arge_merkezi_personel', label: 'Ar-Ge veya tasarım merkezinizde kaç kişi görev alıyor?', type: 'number' },
      { id: 'kurulus_bilgisi', label: 'Kuruluşunuzu ve ana faaliyet alanınızı kısaca tanıtın.', type: 'textarea', hint: 'Kuruluşun yetkinlikleri, üretim kapasitesi ve uzmanlık alanlarını belirtin.', required: true },
    ],
  },
  {
    title: 'Proje Bilgileri',
    description: 'Projenin kapsamını, yenilik düzeyini, süresini ve bütçesini netleştirin.',
    questions: [
      { id: 'proje_turu', label: 'Proje türü nedir?', type: 'select', options: ['Yeni ürün geliştirme', 'Yeni süreç / üretim yöntemi', 'Yazılım / dijital çözüm', 'Sürdürülebilirlik / yeşil dönüşüm', 'Diğer'], required: true },
      { id: 'proje_baslangic', label: 'Proje başlangıç tarihi', type: 'date', required: true },
      { id: 'proje_hedef', label: 'Projenin temel hedefi nedir?', type: 'textarea', hint: 'Çözmek istediğiniz problemi ve ortaya çıkacak ürünü, süreci veya hizmeti anlatın.', required: true },
      { id: 'proje_suresi', label: 'Proje süresi (ay)', type: 'number', required: true },
      { id: 'proje_butcesi', label: 'Toplam proje bütçesi (TL)', type: 'number', required: true },
      { id: 'oncelikli_alan', label: 'Proje öncelikli bir teknoloji veya stratejik alana giriyor mu?', type: 'select', options: ['Yapay zeka / makine öğrenmesi', 'Dijital dönüşüm', 'Yeşil dönüşüm / enerji verimliliği', 'İleri malzeme / imalat', 'Biyoteknoloji / sağlık', 'Savunma / havacılık', 'Hayır / emin değilim'], required: true },
      { id: 'ortaklik_yapisi', label: 'Projede ortak veya çözüm ortağı bulunuyor mu?', type: 'select', options: ['Tek kuruluş', 'Üniversite ortaklı', 'Sanayi ortaklı', 'Üniversite ve sanayi ortaklı', 'Uluslararası ortaklı'], required: true },
      { id: 'teknik_yol_haritasi', label: 'Teknik yol haritanızı ve beklenen çıktıları anlatın.', type: 'textarea', hint: 'Ana iş paketleri, kilometre taşları, prototip ve ticarileşme hedeflerini yazın.', required: true },
      { id: 'daha_once_destek', label: 'Bu proje veya benzer bir proje daha önce destek aldı mı?', type: 'select', options: ['Evet, tamamlandı', 'Evet, devam ediyor', 'Başvuru yapıldı ancak desteklenmedi', 'Hayır'], required: true },
      { id: 'talep_edilen_destek', label: 'Talep edilen destek türü nedir?', type: 'select', options: ['Hibe', 'Geri ödemeli destek', 'Hisse / yatırım', 'PoC / pilot destek', 'Henüz karar vermedim'], required: true },
      { id: 'basvuru_donemi', label: 'Hangi başvuru dönemi veya çağrı için hazırlanıyorsunuz?', type: 'text', hint: 'Biliyorsanız program veya çağrı adını yazın.' },
    ],
  },
  {
    title: 'Ekip ve Girişim Bilgileri',
    description: 'Projenin uygulama kapasitesini ve ekip deneyimini değerlendirin.',
    questions: [
      { id: 'uzman_personel', label: 'Projede görev alacak uzman personel sayısı', type: 'number', required: true },
      { id: 'doktora_personeli', label: 'Projede görev alacak doktora veya yüksek lisans mezunu sayısı', type: 'number', required: true },
      { id: 'ogrenci_stajyer', label: 'Projede öğrenci veya stajyer görevlendirilecek mi?', type: 'select', options: ['Evet', 'Hayır'], required: true },
      { id: 'basvuru_sirket', label: 'Başvuru sahibi kuruluş ile proje ekibi aynı kuruluş mu?', type: 'select', options: ['Evet', 'Hayır, bağlı kuruluş / ortak başvurusu', 'Hayır, danışmanlık veya çözüm ortağı'], required: true },
      { id: 'baska_sirket_ortakligi', label: 'Başka bir şirketle ortaklığınız veya iş birliğiniz var mı?', type: 'select', options: ['Evet', 'Hayır'] },
      { id: 'takim_deneyimi', label: 'Ekibin benzer Ar-Ge ve ürün geliştirme deneyimini açıklayın.', type: 'textarea', required: true },
    ],
  },
  {
    title: 'Kadın, Yeşil ve Dijital Dönüşüm',
    description: 'Exceldeki yatay politika göstergelerine göre projenin dönüşüm etkisini ölçün.',
    questions: [
      { id: 'kadin_yonetici_orani', label: 'Kadın yönetici oranı (%)', type: 'number' },
      { id: 'kadin_ust_yonetici_orani', label: 'Üst düzey yöneticilikte kadın oranı (%)', type: 'number' },
      { id: 'kadin_calisan_orani', label: 'Kadın çalışan oranı (%)', type: 'number' },
      { id: 'kadin_yetkili', label: 'Kuruluşun yetkili temsilcisi kadın mı?', type: 'select', options: ['Evet', 'Hayır'] },
      { id: 'uluslararasi_ortaklik', label: 'Uluslararası ortaklı proje geçmişiniz var mı?', type: 'select', options: ['Evet', 'Hayır'] },
      { id: 'yesil_donusum', label: 'Projenin yeşil dönüşüm göstergesi nedir?', type: 'select', options: ['Enerji verimliliği', 'Karbon emisyonu azaltımı', 'Atık ve kaynak verimliliği', 'Döngüsel ekonomi', 'Su verimliliği', 'Yeşil dönüşüm etkisi yok / belirsiz'] },
      { id: 'yesil_kaynak', label: 'Proje hangi çevresel kaynağın kullanımını azaltacak?', type: 'textarea', hint: 'Enerji, su, ham madde, yakıt, atık veya emisyon etkisini mümkünse ölçülebilir şekilde yazın.' },
      { id: 'yesil_maliyet_etkisi', label: 'Yeşil dönüşümün maliyet veya kaynak verimliliği etkisi nedir?', type: 'textarea' },
      { id: 'yesil_kapasite_etkisi', label: 'Proje kuruluşun yeşil dönüşüm kapasitesini nasıl artıracak?', type: 'textarea' },
      { id: 'dijital_donusum', label: 'Projenin dijital dönüşüm alanı nedir?', type: 'select', options: ['Yapay zeka', 'Büyük veri / analitik', 'IoT / sensörler', 'Otomasyon / robotik', 'Siber güvenlik', 'Bulut / platform', 'Dijital dönüşüm etkisi yok / belirsiz'] },
      { id: 'yapay_zeka_kullanimi', label: 'Proje yapay zeka veya makine öğrenmesi kullanıyor mu?', type: 'select', options: ['Evet, çözümün ana parçası', 'Evet, yardımcı bir özellik olarak', 'Hayır', 'Değerlendiriyoruz'] },
      { id: 'yapay_zeka_alani', label: 'Yapay zeka hangi amaçla kullanılacak?', type: 'textarea', hint: 'Tahmin, sınıflandırma, optimizasyon, üretken yapay zeka veya başka kullanım alanını açıklayın.' },
      { id: 'yapay_zeka_teknoloji_seviyesi', label: 'Yapay zeka teknolojisinin olgunluk seviyesi nedir?', type: 'select', options: ['Hazır bir model / servis kullanımı', 'Kuruluşa özel model geliştirilecek', 'Veri toplama ve modelleme aşamasında', 'Üretim ortamında çalışıyor', 'Belirsiz'] },
    ],
  },
  {
    title: 'Patent, Fikri Mülkiyet ve Proje Geçmişi',
    description: 'Teknolojinin özgünlüğünü, korunabilirliğini ve kuruluşun Ar-Ge performansını belirleyin.',
    questions: [
      { id: 'patent_durumu', label: 'Projeniz için fikri mülkiyet durumunuz nedir?', type: 'select', options: ['Patent başvurusu yapıldı', 'Patent alındı', 'Faydalı model / tasarım tescili var', 'Ticari sır / know-how', 'Henüz koruma başvurusu yapılmadı', 'Korunabilir bir çıktı yok / emin değilim'] },
      { id: 'uluslararasi_patent', label: 'Uluslararası patent sayısı', type: 'number' },
      { id: 'uluslararasi_patent_kurulus', label: 'Kuruluşunuzun toplam uluslararası patent sayısı', type: 'number' },
      { id: 'ulusal_patent', label: 'Ulusal patent veya faydalı model sayısı', type: 'number' },
      { id: 'onceki_proje_durumu', label: 'Önceki Ar-Ge projelerinizin ticarileşme durumu nedir?', type: 'select', options: ['Ticarileşti ve gelir üretiyor', 'Pilot müşteri / ilk satış aşamasında', 'Prototip aşamasında', 'Ticarileşmedi', 'Önceki proje yok'] },
      { id: 'desteklenen_proje', label: 'Daha önce desteklenen Ar-Ge projesi sayısı', type: 'number' },
      { id: 'tamamlanan_proje', label: 'Başarıyla tamamlanan Ar-Ge projesi sayısı', type: 'number' },
      { id: 'ticarilesme_basarisi', label: 'Önceki projelerinizin ticarileşme başarısını açıklayın.', type: 'textarea' },
      { id: 'arge_harcama', label: 'Son mali yılda Ar-Ge harcamanızın yaklaşık tutarı (TL)', type: 'number' },
      { id: 'arge_harcama_orani', label: 'Ar-Ge harcamasının ciroya oranı (%)', type: 'number' },
      { id: 'tubitak_finansmani', label: 'TÜBİTAK finansmanı veya desteği kullandınız mı?', type: 'select', options: ['Evet', 'Hayır'] },
      { id: 'arge_yeni_basladi', label: 'Ar-Ge faaliyetleriniz yeni mi başladı?', type: 'select', options: ['Evet', 'Hayır'] },
      { id: 'onceki_destek_sayisi', label: 'Önceki destek başvurularınızın sayısı', type: 'number' },
      { id: 'ardeb_cagri', label: 'Daha önce ARDEB çağrısına başvurdunuz mu?', type: 'select', options: ['Evet', 'Hayır'] },
      { id: 'devam_eden_arge', label: 'Halen devam eden Ar-Ge projesi sayısı', type: 'number' },
    ],
  },
  {
    title: 'Üniversite, Kurum ve Finansman',
    description: 'İş birliği ağınızı ve projenin finansal uygulanabilirliğini değerlendirin.',
    questions: [
      { id: 'universite_ortagi', label: 'Projede üniversite ortağı var mı?', type: 'select', options: ['Evet', 'Hayır'] },
      { id: 'universite_ortak_turu', label: 'Üniversite ortaklığının türü nedir?', type: 'select', options: ['Proje ortağı', 'Danışmanlık', 'Araştırma hizmeti', 'Ortak laboratuvar / altyapı', 'Üniversite ortağı yok'] },
      { id: 'platform_ortagi', label: 'Projede araştırma altyapısı, platform veya teknoloji ortağı var mı?', type: 'select', options: ['Evet', 'Hayır'] },
      { id: 'platform_ortak_turu', label: 'Platform veya teknoloji ortağının rolü nedir?', type: 'text' },
      { id: 'kuluçka_destegi', label: 'Bir kuluçka, hızlandırma veya mentorluk programından yararlandınız mı?', type: 'select', options: ['Evet, halen yararlanıyorum', 'Evet, tamamladım', 'Hayır'] },
      { id: 'spinoff', label: 'Proje sonucunda yeni bir girişim veya spin-off kurulacak mı?', type: 'select', options: ['Evet', 'Değerlendiriyoruz', 'Hayır'] },
      { id: 'kalkinmislik', label: 'Kuruluşunuzun bulunduğu ilin gelişmişlik düzeyi nedir?', type: 'select', options: ['1. bölge', '2. bölge', '3. bölge', '4. bölge', '5. bölge', '6. bölge', 'Bilmiyorum'] },
      { id: 'osb_sanayi_bolgesi', label: 'Kuruluşunuz bir OSB, sanayi sitesi veya teknoloji bölgesinde mi?', type: 'select', options: ['Evet', 'Hayır'] },
      { id: 'banka_teminat', label: 'Kuruluşunuzun geri ödemeli destekler için teminat kapasitesi var mı?', type: 'select', options: ['Evet', 'Kısmen', 'Hayır', 'Bilmiyorum'] },
      { id: 'finansman_kaynagi', label: 'Proje için mevcut eş finansman kaynağınız nedir?', type: 'select', options: ['Özkaynak hazır', 'Yatırımcı / ortak finansmanı', 'Banka kredisi', 'Henüz kaynak ayrılmadı', 'Diğer'] },
      { id: 'yatirim_turu', label: 'Proje için tercih ettiğiniz finansman türü nedir?', type: 'select', options: ['Hibe', 'Yatırım / özkaynak', 'Geri ödemeli destek', 'PoC bütçesi', 'Karışık finansman'] }
    ],
  },
];

const allQuestions = questionSections.flatMap((section) => section.questions);

export default function NewProject({ onComplete, userId }: Props) {
  const [step, setStep] = useState<'form' | 'analyzing'>('form');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState('yazilim');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [openSection, setOpenSection] = useState(0);

  const requiredQuestions = useMemo(() => allQuestions.filter((question) => question.required), []);
  const answeredRequired = requiredQuestions.filter((question) => answers[question.id]?.trim()).length;

  const analyzeProgressSteps = [
    'Proje ve kuruluş bilgileri okunuyor...',
    'Teknik anahtar kelimeler çıkarılıyor...',
    'TRL seviyesi hesaplanıyor...',
    'Dönüşüm ve uygunluk göstergeleri analiz ediliyor...',
    'Fon kataloğu taranıyor...',
    'Eşleştirme tamamlanıyor...',
  ];

  const setAnswer = (id: string, value: string) => {
    setAnswers((current) => ({ ...current, [id]: value }));
  };

  const handleAnalyze = async () => {
    const missingRequired = requiredQuestions.find((question) => !answers[question.id]?.trim());
    if (!title.trim() || !description.trim() || missingRequired) {
      setError(missingRequired ? `Lütfen "${missingRequired.label}" alanını doldurun.` : 'Lütfen proje başlığını ve özetini doldurun.');
      if (missingRequired) {
        const sectionIndex = questionSections.findIndex((section) => section.questions.some((question) => question.id === missingRequired.id));
        setOpenSection(sectionIndex);
      }
      return;
    }

    setLoading(true);
    setError(null);

    const questionnaireText = questionSections.map((section) => {
      const sectionAnswers = section.questions
        .filter((question) => answers[question.id]?.trim())
        .map((question) => `${question.label}: ${answers[question.id]}`)
        .join('\n');
      return `${section.title}\n${sectionAnswers}`;
    }).join('\n\n');
    const fullDescription = `${description.trim()}\n\nDetaylı başvuru bilgileri:\n${questionnaireText}`;

    const trlKeywords: Record<number, string[]> = {
      1: ['fikir', 'kavram', 'temel'],
      2: ['analiz', 'çalışma', 'literatür'],
      3: ['deney', 'laboratuvar', 'test'],
      4: ['prototip', 'laboratuvar ortam', 'doğrulama'],
      5: ['simülasyon', 'gerçek ortam', 'pilot'],
      6: ['saha', 'kullanıcı', 'deneme'],
      7: ['demo', 'müşteri', 'pilot üretim'],
      8: ['sertifikasyon', 'onay', 'tamamlanmış'],
      9: ['pazar', 'satış', 'ürün'],
    };

    let trl = 3;
    const textLower = fullDescription.toLowerCase();
    for (const [level, keywords] of Object.entries(trlKeywords)) {
      if (keywords.some((keyword) => textLower.includes(keyword))) trl = parseInt(level, 10);
    }

    const { data, error: insertError } = await supabase
      .from('projects')
      .insert({ title: title.trim(), description: fullDescription, sector, trl_level: trl, status: 'matched', user_id: userId })
      .select()
      .maybeSingle();

    if (insertError || !data) {
      setError('Proje kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
      return;
    }

    setStep('analyzing');
    let progressValue = 0;
    const interval = setInterval(() => {
      progressValue += 100 / (analyzeProgressSteps.length * 10);
      setProgress(Math.min(progressValue, 100));
      setProgressLabel(analyzeProgressSteps[Math.min(Math.floor(progressValue / (100 / analyzeProgressSteps.length)), analyzeProgressSteps.length - 1)]);
      if (progressValue >= 100) {
        clearInterval(interval);
        setTimeout(() => onComplete(data as Project), 500);
      }
    }, 150);
  };

  const renderQuestion = (question: Question) => {
    const value = answers[question.id] ?? '';
    const commonClass = 'w-full px-4 py-3 rounded-lg border border-iso-navy-200 focus:border-iso-gold-500 focus:ring-2 focus:ring-iso-gold-100 outline-none transition bg-white';

    if (question.type === 'textarea') {
      return <textarea value={value} onChange={(event) => setAnswer(question.id, event.target.value)} placeholder={question.hint} rows={4} className={`${commonClass} resize-none`} />;
    }
    if (question.type === 'select') {
      return (
        <select value={value} onChange={(event) => setAnswer(question.id, event.target.value)} className={commonClass}>
          <option value="">Seçiniz</option>
          {question.options?.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      );
    }
    return <input type={question.type} value={value} onChange={(event) => setAnswer(question.id, event.target.value)} placeholder={question.hint} className={commonClass} />;
  };

  if (step === 'analyzing') {
    return (
      <div className="fixed inset-0 bg-iso-navy-800 text-white flex items-center justify-center px-6 z-50">
        <div className="max-w-xl w-full text-center">
          <div className="w-20 h-20 rounded-2xl bg-iso-gold-500/10 border border-iso-gold-500/30 flex items-center justify-center mx-auto mb-8 animate-pulse-slow"><Cpu className="h-10 w-10 text-iso-gold-400" /></div>
          <h2 className="text-2xl font-bold mb-3">Yapay Zeka Analiz Ediyor</h2>
          <p className="text-iso-navy-200 mb-8">Projeniz, kuruluş bilgileriniz ve uygunluk göstergeleri değerlendiriliyor...</p>
          <div className="w-full bg-iso-navy-700 rounded-full h-3 mb-4 overflow-hidden"><div className="bg-gradient-to-r from-iso-gold-500 to-iso-gold-300 h-3 rounded-full transition-all duration-150" style={{ width: `${progress}%` }} /></div>
          <p className="text-sm text-iso-navy-200 flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />{progressLabel}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-iso-gold-50 mb-4"><FileText className="h-8 w-8 text-iso-gold-600" /></div>
          <h1 className="text-3xl font-extrabold mb-3 text-iso-navy-800">Yeni Ar-Ge Projesi</h1>
          <p className="text-iso-navy-400 max-w-2xl mx-auto">Daha doğru fon eşleşmesi için projenizi değerlendirme başlıklarına göre birlikte tanımlayalım.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-iso-navy-100 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="flex items-center gap-2 text-iso-gold-600 font-semibold text-sm"><div className="w-8 h-8 rounded-full bg-iso-gold-500 text-iso-navy-900 flex items-center justify-center text-xs font-bold">1</div> Proje Bilgisi</div>
            <div className="flex-1 h-px bg-iso-navy-200" />
            <div className="flex items-center gap-2 text-iso-navy-300 font-semibold text-sm"><div className="w-8 h-8 rounded-full bg-iso-navy-100 text-iso-navy-400 flex items-center justify-center text-xs font-bold">2</div> Fon Eşleşmesi</div>
            <div className="flex-1 h-px bg-iso-navy-200" />
            <div className="flex items-center gap-2 text-iso-navy-300 font-semibold text-sm"><div className="w-8 h-8 rounded-full bg-iso-navy-100 text-iso-navy-400 flex items-center justify-center text-xs font-bold">3</div> Doküman</div>
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-iso-navy-600 mb-2">Proje Başlığı *</label>
              <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Örn: Yeni Nesil Akıllı Kalp Pili" className="w-full px-4 py-3 rounded-lg border border-iso-navy-200 focus:border-iso-gold-500 focus:ring-2 focus:ring-iso-gold-100 outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-iso-navy-600 mb-2">Proje Özeti *</label>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Projenizi, çözmek istediğiniz problemi ve ortaya çıkacak yeniliği birkaç cümleyle anlatın." rows={5} className="w-full px-4 py-3 rounded-lg border border-iso-navy-200 focus:border-iso-gold-500 focus:ring-2 focus:ring-iso-gold-100 outline-none transition resize-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-iso-navy-600 mb-3">Ana Sektör *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SECTORS.map((item) => (
                  <button key={item.value} type="button" onClick={() => setSector(item.value)} className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition text-left ${sector === item.value ? 'border-iso-gold-500 bg-iso-gold-50 text-iso-gold-700' : 'border-iso-navy-200 hover:border-iso-navy-300 text-iso-navy-500'}`}>
                    <span className="text-lg">{item.icon}</span><span className="text-sm font-medium">{item.label}</span>{sector === item.value && <CheckCircle2 className="h-4 w-4 text-iso-gold-500 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-iso-navy-100 pb-3">
              <div><p className="text-sm font-bold text-iso-navy-800">Nitelikli değerlendirme soruları</p><p className="text-xs text-iso-navy-400">{answeredRequired}/{requiredQuestions.length} zorunlu alan tamamlandı</p></div>

            </div>
            {questionSections.map((section, sectionIndex) => {
              const sectionAnswered = section.questions.filter((question) => answers[question.id]?.trim()).length;
              const isOpen = openSection === sectionIndex;
              return (
                <div key={section.title} className="border border-iso-navy-100 rounded-xl overflow-hidden">
                  <button type="button" onClick={() => setOpenSection(isOpen ? -1 : sectionIndex)} className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-iso-navy-50 transition">
                    <span><span className="block font-bold text-iso-navy-800">{sectionIndex + 1}. {section.title}</span><span className="block text-xs text-iso-navy-400 mt-1">{sectionAnswered}/{section.questions.length} yanıtlandı</span></span>
                    <ChevronDown className={`h-5 w-5 text-iso-gold-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && <div className="border-t border-iso-navy-100 p-4 md:p-6 space-y-5 bg-iso-navy-50/40"><p className="text-sm text-iso-navy-500">{section.description}</p>{section.questions.map((question) => <div key={question.id}><label className="block text-sm font-semibold text-iso-navy-600 mb-2">{question.label}{question.required && <span className="text-iso-gold-600"> *</span>}</label>{renderQuestion(question)}{question.hint && question.type !== 'textarea' && <p className="text-xs text-iso-navy-400 mt-1">{question.hint}</p>}</div>)}</div>}
                </div>
              );
            })}
          </div>

          {error && <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">{error}</div>}
          <button type="button" onClick={handleAnalyze} disabled={loading} className="w-full mt-8 bg-iso-gold-500 hover:bg-iso-gold-400 disabled:bg-iso-navy-200 disabled:cursor-not-allowed text-iso-navy-900 font-bold py-4 px-8 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-iso-gold-500/20">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Cpu className="h-5 w-5" />}{loading ? 'Analiz Ediliyor...' : 'Yapay Zeka ile Analiz Et'}{!loading && <ArrowRight className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
