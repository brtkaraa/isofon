import {
  Search, Target, FileText, Building2, Users, ArrowRight,
  CheckCircle2, LayoutDashboard, Menu, X, TrendingUp, Shield,
  Zap, Brain, Layers, PieChart, Award, ChevronDown,
  Cpu, Lightbulb, Handshake, CircleDollarSign, Radar, Landmark,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase, type Fund } from '@/lib/supabase';
import BrandLogo from '@/components/BrandLogo';

type Props = {
  onStart: () => void;
  onStartCompany: () => void;
  embedded?: boolean;
  onNavigate?: (page: 'funds' | 'reverse-calls' | 'projects') => void;
  onNewProject?: () => void;
};

const formatFundType = (type: string) => {
  if (type === 'ab') return 'AB Fonu';
  if (type === 'ozel_sektor') return 'Özel Sektör';
  return 'Kamu Fonu';
};

export default function Landing({ onStart, onStartCompany, embedded = false, onNavigate, onNewProject }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<'kobi' | 'sirket'>('kobi');
  const [animatedTrl, setAnimatedTrl] = useState(0);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [fundsLoading, setFundsLoading] = useState(true);
  const [fundsError, setFundsError] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedTrl((prev) => (prev >= 4 ? 0 : prev + 1));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadFunds = async () => {
      const { data, error } = await supabase
        .from('funds')
        .select('id, name, provider, type, budget, min_trl, max_trl, sectors, description, code, application_url, deadline, duration, max_budget_per_project, support_rate, eligibility, required_docs, technical_scope, status')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        setFundsError(true);
      } else {
        setFunds((data ?? []) as Fund[]);
      }
      setFundsLoading(false);
    };
    loadFunds();
  }, []);

  const stats = [
    { value: '500+', label: 'Eşleştirilen Proje', icon: CheckCircle2 },
    { value: '120M+', label: 'TL Fon Havuzu', icon: CircleDollarSign },
    { value: '45', label: 'Kurumsal İş Ortağı', icon: Building2 },
    { value: '%87', label: 'Başvuru Başarı Oranı', icon: TrendingUp },
  ];

  const features = [
    { icon: Brain, title: 'Yapay Zeka TRL Analizi', desc: 'Projenizin Teknoloji Hazırlık Seviyesini (TRL 1-9) yapay zeka ile otomatik belirleyin.' },
    { icon: Layers, title: 'PRODİS Uyumlu Çıktı', desc: 'TÜBİTAK PRODİS formatına birebir uygun iş paketleri, bütçe ve risk matrisi.' },
    { icon: Radar, title: 'Fon Radarı', desc: 'Kamu hibeleri, AB fonları ve özel sektör PoC bütçelerini tek ekranda izleyin.' },
    { icon: Zap, title: 'Saniyeler İçinde Taslak', desc: 'Saatlerce süren bürokratik başvuru formlarını yapay zeka dakikalar içinde yazsın.' },
    { icon: Handshake, title: 'Akıllı Eşleştirme', desc: 'Reverse matching algoritması ile en uygun fon ve şirket çağrılarıyla eşleşin.' },
    { icon: Shield, title: 'Güvenli & Gizli', desc: 'Proje verileriniz uçtan uca şifrelidir. Sadece sizin izninizle paylaşılır.' },
  ];

  const faqs = [
    { q: 'İSOfon tam olarak ne yapar?', a: 'İSOfon, Ar-Ge projelerinizin teknoloji hazırlık seviyesini (TRL) analiz eder, Türkiye ve AB kaynaklı en uygun fonlarla eşleştirir ve kurumların resmi formatlarına (PRODİS vb.) uygun başvuru taslağını otomatik olarak oluşturur.' },
    { q: 'Hangi tür fonlarla eşleşebilirim?', a: 'TÜBİTAK 1507, 1512, 1005 gibi kamu fonları, Horizon Europe AB fonları ve büyük sanayi şirketlerinin açtığı Açık İnovasyon ve PoC (Konsept Kanıtlama) bütçeleri ile eşleşebilirsiniz.' },
    { q: 'Proje verilerim güvende mi?', a: 'Evet. Tüm proje verileri uçtan uca şifreli olarak saklanır ve sizin açık izniniz olmadan hiçbir üçüncü tarafla paylaşılmaz. KVKK uyumludur.' },
    { q: 'Kurumsal şirket olarak nasıl faydalanırım?', a: 'Kurumsal sanayi şirketleri, ihtiyaç duydukları inovatif teknolojiler için "Çözüm Ortaklığı Çağrısı" açabilir ve yapay zeka tarafından en uygun yerli Ar-Ge ekipleriyle eşleşebilir.' },
    { q: 'Ücretsiz deneyebilir miyim?', a: 'Evet, temel TRL analizi ve fon eşleştirme özelliklerini ücretsiz deneyebilirsiniz. PRODİS formatında doküman üretimi premium planlarda mevcuttur.' },
  ];

  const trlLevels = ['TRL 1', 'TRL 2', 'TRL 3', 'TRL 4', 'TRL 5'];
  const trlColors = ['bg-gray-400', 'bg-gray-600', 'bg-[#d71920]', 'bg-[#ed1c24]', 'bg-[#c91018]'];

  const heroAction = embedded ? (onNewProject ?? (() => {})) : onStart;

  return (
    <div className={`bg-white font-sans text-[#181818] overflow-x-hidden ${embedded ? '' : 'min-h-screen'}`}>
      {/* NAVBAR - only in standalone mode */}
      {!embedded && (
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-white py-4'} text-[#181818] px-6 md:px-8`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <BrandLogo />
          <div className="hidden md:flex gap-6 font-medium text-gray-600 items-center">
            <a href="#nasil-calisir" className="hover:text-[#ed1c24] transition">Nasıl Çalışır?</a>
            <a href="#ozellikler" className="hover:text-[#ed1c24] transition">Özellikler</a>
            <a href="#pazaryeri" className="hover:text-[#ed1c24] transition">İnovasyon</a>
            <a href="#sss" className="hover:text-[#ed1c24] transition">S.S.S.</a>
            <button onClick={onStart} className="bg-[#ed1c24] hover:bg-[#c91018] text-white font-semibold px-5 py-2 rounded-lg transition shadow-lg shadow-[#ed1c24]/20">Giriş Yap</button>
          </div>
          <button className="md:hidden text-[#181818]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col gap-4 border-t border-gray-200 pt-4 animate-fade-in">
            <a href="#nasil-calisir" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#ed1c24] transition text-gray-600">Nasıl Çalışır?</a>
            <a href="#ozellikler" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#ed1c24] transition text-gray-600">Özellikler</a>
            <a href="#pazaryeri" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#ed1c24] transition text-gray-600">İnovasyon</a>
            <a href="#sss" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#ed1c24] transition text-gray-600">S.S.S.</a>
            <button onClick={() => { setMobileMenuOpen(false); onStart(); }} className="bg-[#ed1c24] hover:bg-[#c91018] text-white font-semibold px-5 py-2 rounded-lg transition">Giriş Yap</button>
          </div>
        )}
      </nav>
      )}

      {/* HERO */}
      <section className={`bg-white text-[#181818] ${embedded ? 'pt-12 pb-20 rounded-2xl' : 'pt-32 pb-32'} px-6 md:px-8 text-center relative overflow-hidden`}>
        <div className="absolute inset-0 grid-pattern pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[30%] -right-[10%] w-[800px] h-[800px] rounded-full bg-[#ed1c24]/10 blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-gray-200/40 blur-3xl animate-pulse-slow" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight animate-fade-in-up">Fikirden Fona Giden <br /><span className="text-[#ed1c24]">En Kısa ve Akıllı Yol</span></h1>
          <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>İSOfon; Ar-Ge projelerinizin teknoloji hazırlık seviyesini (TRL) analiz eder, en uygun kamu/özel sektör fonunu bulur ve resmi başvuru taslağınızı saniyeler içinde otomatik yazar.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <button onClick={heroAction} className="bg-[#ed1c24] hover:bg-[#c91018] text-white font-bold py-4 px-8 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-[#ed1c24]/30 hover:scale-105 hover:shadow-[#ed1c24]/40">
              <Search className="h-5 w-5" /> {embedded ? 'Yeni Proje Başlat' : 'Hemen Başla'}
            </button>
            <button onClick={() => embedded ? (onNavigate?.('funds') ?? onStart()) : onStartCompany()} className="bg-white hover:bg-gray-50 border border-gray-300 text-[#181818] font-bold py-4 px-8 rounded-lg flex items-center justify-center gap-2 transition hover:scale-105 shadow-sm">
              <Building2 className="h-5 w-5" /> {embedded ? 'Fonları İncele' : 'İnovasyon Çağrısı Aç (Şirket)'}
            </button>
          </div>
        </div>
      </section>

      {/* RED DIVIDER */}
      <div className="h-1 bg-[#ed1c24]" />

      {/* FONLAR - Dynamic fund showcase */}
      <section id="fonlar" className="scroll-mt-24 bg-[#f6f7f9] border-b border-gray-200 py-16 px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[#ed1c24] font-semibold text-sm uppercase tracking-wider">Finansman Fırsatları</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-2 mb-3 text-[#181818]">Mevcut Çağrılar</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Projeniz için uygun kamu, AB ve özel sektör çağrılarını keşfedin.</p>
          </div>
          {fundsLoading ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((i) => <div key={i} className="h-64 animate-pulse rounded-xl border border-gray-200 bg-gray-100" />)}</div>
          ) : fundsError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">Fonlar şu anda yüklenemedi. Lütfen tekrar deneyin.</div>
          ) : funds.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">Henüz yayınlanmış bir fon bulunmuyor.</div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {funds.map((fund) => (
                <article key={fund.id} className="group flex min-h-[260px] flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-[0_5px_20px_rgba(0,0,0,.04)] transition duration-300 hover:-translate-y-1 hover:border-[#ed1c24]/40 hover:shadow-[0_14px_32px_rgba(0,0,0,.09)]">
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#fbe8e9] text-[#d71920]"><Landmark className="h-5 w-5" /></div>
                    <span className="rounded-full bg-[#f3f3f3] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-600">{formatFundType(fund.type)}</span>
                  </div>
                  <h3 className="text-lg font-extrabold leading-snug text-[#202020]">{fund.name}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-500">{fund.description}</p>
                  <div className="mt-auto flex items-end justify-between gap-4 border-t border-gray-100 pt-5">
                    <div><p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Ayrılan Bütçe / Hedef</p><p className="mt-1 text-sm font-extrabold text-[#202020]">{fund.max_budget_per_project || fund.budget}</p></div>
                    <button onClick={() => embedded ? (onNavigate?.('funds') ?? onStart()) : onStart()} className="inline-flex items-center gap-1.5 rounded-md bg-[#ed1c24] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#c91018]">Fonu İncele <ArrowRight className="h-3.5 w-3.5" /></button>
                  </div>
                </article>
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <button onClick={() => embedded ? (onNavigate?.('funds') ?? onStart()) : onStart()} className="inline-flex items-center gap-2 text-sm font-bold text-[#ed1c24] transition hover:gap-3">Tüm fonları keşfet <ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-white border-b border-gray-200 py-12 px-6 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#fbe8e9] mb-3"><Icon className="h-6 w-6 text-[#d71920]" /></div>
                <div className="text-3xl md:text-4xl font-extrabold text-[#181818]">{stat.value}</div>
                <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* NASIL ÇALIŞIR */}
      <section id="nasil-calisir" className="py-20 px-6 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[#ed1c24] font-semibold text-sm uppercase tracking-wider">Nasıl Çalışır?</span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-2 mb-4 text-[#181818]">3 Adımda Fonunu Bul</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">Fikrinizi anlatın, yapay zeka en uygun fonu bulsun ve başvuru taslağınızı otomatik oluştursun.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: FileText, title: '1. Projeni Anlat', desc: 'Teknik dokümanını yükle veya fikrini serbest metin olarak yaz. Yapay zeka motorumuz projenin teknik detaylarını ve TRL aşamasını saniyeler içinde anlasın.', step: '01' },
            { icon: Target, title: '2. Doğru Fonla Eşleş', desc: 'Sadece TÜBİTAK ve AB fonları değil; büyük sanayi şirketlerinin açtığı "Açık İnovasyon" ve "PoC" bütçeleriyle anında ve en yüksek uyumla eşleş.', step: '02' },
            { icon: CheckCircle2, title: '3. Yol Haritanı Üret', desc: 'Kurumların resmi formatına (Örn: PRODİS) uygun iş paketleri, bütçe dağılımı ve risk matrisi içeren başvuru taslağın (PDF/Word) otomatik hazırlansın.', step: '03' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-white rounded-xl p-8 shadow-xl border border-gray-200 transform hover:-translate-y-2 transition duration-300 relative overflow-hidden group">
                <div className="absolute top-4 right-4 text-6xl font-extrabold text-gray-100 group-hover:text-gray-200 transition">{item.step}</div>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-[#fbe8e9] text-[#d71920] relative z-10"><Icon className="h-8 w-8" /></div>
                <h3 className="text-2xl font-bold mb-4 relative z-10 text-[#181818]">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed relative z-10">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ÖZELLİKLER */}
      <section id="ozellikler" className="py-20 px-6 md:px-8 bg-[#f6f7f9]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#ed1c24] font-semibold text-sm uppercase tracking-wider">Özellikler</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-2 mb-4 text-[#181818]">Neden İSOfon?</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Yapay zeka destekli platformumuz Ar-Ge ekosisteminin tüm ihtiyaçlarını tek çatı altında toplar.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:border-[#ed1c24]/30 transition duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-[#fbe8e9] text-[#d71920]"><Icon className="h-6 w-6" /></div>
                  <h3 className="text-lg font-bold mb-2 text-[#181818]">{feature.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PAZARYERİ */}
      <section id="pazaryeri" className="py-20 px-6 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <span className="text-[#ed1c24] font-semibold text-sm uppercase tracking-wider">Açık İnovasyon</span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-2 mb-4 text-[#181818]">Çift Yönlü İnovasyon Ekosistemi</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">İSOfon sadece bir arama motoru değil, Türkiye'nin en büyük Ar-Ge eşleştirme pazaryeridir.</p>
        </div>
        <div className="max-w-md mx-auto flex bg-[#f6f7f9] rounded-full shadow-md p-1.5 mb-10 border border-gray-200">
          <button onClick={() => setActiveTab('kobi')} className={`flex-1 py-3 rounded-full font-semibold transition ${activeTab === 'kobi' ? 'bg-[#ed1c24] text-white shadow-md' : 'text-gray-400'}`}>Girişimciler & KOBİ'ler</button>
          <button onClick={() => setActiveTab('sirket')} className={`flex-1 py-3 rounded-full font-semibold transition ${activeTab === 'sirket' ? 'bg-[#181818] text-white shadow-md' : 'text-gray-400'}`}>Kurumsal Şirketler</button>
        </div>
        <div className="max-w-5xl mx-auto">
          {activeTab === 'kobi' ? (
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 md:p-12 animate-scale-in">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#f6f7f9] flex items-center justify-center"><Users className="text-[#ed1c24] h-7 w-7" /></div>
                <div><h3 className="text-2xl font-bold text-[#181818]">Girişimciler & KOBİ'ler</h3><p className="text-gray-400 text-sm">Bürokrasiyle uğraşma, mühendisliğe odaklan.</p></div>
              </div>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">Sadece devlet hibelerini değil, büyük şirketlerin PoC (Konsept Kanıtlama) bütçelerini tek ekranda yakala. İlk taslağını yapay zeka yazsın.</p>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[{ icon: Brain, text: 'Otomatik TRL Analizi' }, { icon: FileText, text: 'PRODİS Uyumlu Doküman Üretimi' }, { icon: Radar, text: 'Özel Sektör Fon Radarı' }, { icon: Zap, text: 'Saniyeler İçinde Başvuru' }].map((item, i) => {
                  const Icon = item.icon;
                  return <div key={i} className="flex items-center gap-3 bg-[#f6f7f9] rounded-lg p-4 border border-gray-200"><Icon className="h-5 w-5 text-[#ed1c24] flex-shrink-0" /><span className="text-gray-700 font-medium">{item.text}</span></div>;
                })}
              </div>
              <button onClick={() => embedded ? (onNewProject?.() ?? onStart()) : onStart()} className="text-[#ed1c24] font-bold flex items-center gap-2 hover:gap-4 transition-all">Ar-Ge Fikrimi Gir <ArrowRight className="h-5 w-5" /></button>
            </div>
          ) : (
            <div className="bg-[#181818] text-white rounded-2xl shadow-2xl border border-[#333] p-8 md:p-12 animate-scale-in">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#2a2a2a] flex items-center justify-center"><Building2 className="text-[#ed1c24] h-7 w-7" /></div>
                <div><h3 className="text-2xl font-bold">Kurumsal Sanayi & Yatırımcılar</h3><p className="text-gray-400 text-sm">İhtiyacın olan teknoloji uzakta arama.</p></div>
              </div>
              <p className="text-gray-300 mb-8 text-lg leading-relaxed">İhtiyaç duyduğunuz inovatif teknolojiyi uzakta aramayın. Üretim veya yazılım probleminiz için "Çözüm Ortaklığı" çağrınızı açın, yapay zeka sizi en uygun yerli Ar-Ge ekibiyle eşleştirsin.</p>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[{ icon: CircleDollarSign, text: 'Özel Bütçeli (PoC) Fon Tanımlama' }, { icon: Target, text: 'Akıllı Filtreleme (Reverse Matching)' }, { icon: Lightbulb, text: 'Yeni Nesil Teknoloji Radarı' }, { icon: Handshake, text: 'Çözüm Ortaklığı Yönetimi' }].map((item, i) => {
                  const Icon = item.icon;
                  return <div key={i} className="flex items-center gap-3 bg-[#2a2a2a] rounded-lg p-4 border border-[#444]"><Icon className="h-5 w-5 text-[#ed1c24] flex-shrink-0" /><span className="text-gray-200 font-medium">{item.text}</span></div>;
                })}
              </div>
              <button onClick={() => embedded ? (onNavigate?.('reverse-calls') ?? onStartCompany()) : onStartCompany()} className="text-[#ed1c24] font-bold flex items-center gap-2 hover:gap-4 transition-all">Kurumsal Çağrı Aç <ArrowRight className="h-5 w-5" /></button>
            </div>
          )}
        </div>
      </section>

      {/* DASHBOARD MOCKUP */}
      <section className="py-20 px-6 md:px-8 bg-[#f6f7f9]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#ed1c24] font-semibold text-sm uppercase tracking-wider">Önizleme</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-2 mb-4 flex items-center justify-center gap-3 text-[#181818]"><LayoutDashboard className="text-[#ed1c24] h-8 w-8" /> Sistem Arayüzü Önizlemesi</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Proje analizinden fon eşleştirmesine, doküman üretiminden risk matrisine kadar her şey tek panelde.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col">
            <div className="bg-[#181818] px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" /><div className="w-3 h-3 rounded-full bg-yellow-500" /><div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="ml-4 text-gray-300 text-sm font-mono">app.isofon.ai/dashboard</div>
            </div>
            <div className="p-6 md:p-8 grid md:grid-cols-2 gap-6 bg-[#f6f7f9]">
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-gray-600 mb-3 text-xs uppercase tracking-wider flex items-center gap-2"><Cpu className="h-4 w-4" /> Proje Analizi</h4>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-sm font-semibold text-[#d71920] mb-1">Mevcut Seviye: TRL {animatedTrl + 1}</p>
                    <p className="text-[#181818] font-medium mb-3">Taşınabilir Kuru EDM Tezgahı - DFM ve Prototip Aşaması</p>
                    <div className="flex gap-1">
                      {trlLevels.map((trl, i) => (
                        <div key={i} className="flex-1">
                          <div className={`h-2 rounded-full transition-all duration-500 ${i <= animatedTrl ? trlColors[i] : 'bg-gray-200'}`} />
                          <div className={`text-[10px] text-center mt-1 ${i <= animatedTrl ? 'text-gray-700 font-semibold' : 'text-gray-300'}`}>{trl}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-600 mb-3 text-xs uppercase tracking-wider flex items-center gap-2"><Award className="h-4 w-4" /> Bulunan Fonlar</h4>
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-[#ed1c24]/20 border-l-4 border-l-[#ed1c24] flex justify-between items-center"><div><p className="font-bold text-[#181818]">TÜBİTAK 1507</p><p className="text-xs text-gray-400">Uygunluk: %92 • Bütçe: 1.2M TL</p></div><button className="text-xs bg-[#fbe8e9] text-[#d71920] px-3 py-1.5 rounded-full font-bold whitespace-nowrap">Yol Haritası</button></div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-amber-200 border-l-4 border-l-amber-500 flex justify-between items-center"><div><p className="font-bold text-[#181818]">Oyak Renault İleri İmalat</p><p className="text-xs text-gray-400">Uygunluk: %88 • Açık İnovasyon PoC</p></div><button className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full font-bold whitespace-nowrap">Eşleş</button></div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-gray-500 flex justify-between items-center"><div><p className="font-bold text-[#181818]">Horizon Europe SME</p><p className="text-xs text-gray-400">Uygunluk: %75 • AB Fonu</p></div><button className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full font-bold whitespace-nowrap">İncele</button></div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
                  <div className="w-16 h-16 rounded-2xl bg-[#f6f7f9] flex items-center justify-center mb-4"><FileText className="h-8 w-8 text-[#ed1c24]" /></div>
                  <h4 className="font-bold text-lg mb-2 text-[#181818]">PRODİS Başvuru Taslağı</h4>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3 overflow-hidden"><div className="bg-gradient-to-r from-[#ed1c24] to-[#ef4a50] h-2.5 rounded-full w-3/4 transition-all duration-1000" /></div>
                  <p className="text-sm text-gray-400">İş Paketleri ve Risk Matrisi yazılıyor...</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h4 className="font-bold text-gray-600 mb-3 text-xs uppercase tracking-wider flex items-center gap-2"><PieChart className="h-4 w-4" /> Bütçe Dağılımı</h4>
                  <div className="space-y-2">
                    {[{ label: 'Personel', pct: 45, color: 'bg-gray-700' }, { label: 'Ekipman', pct: 25, color: 'bg-[#ed1c24]' }, { label: 'Sarf Malzeme', pct: 15, color: 'bg-gray-400' }, { label: 'Dış Hizmet', pct: 10, color: 'bg-amber-400' }, { label: 'Diğer', pct: 5, color: 'bg-gray-300' }].map((item, i) => (
                      <div key={i} className="flex items-center gap-3"><span className="text-xs text-gray-400 w-24">{item.label}</span><div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden"><div className={`${item.color} h-2 rounded-full transition-all duration-700`} style={{ width: `${item.pct}%` }} /></div><span className="text-xs font-semibold text-gray-600 w-8">%{item.pct}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* S.S.S. */}
      <section id="sss" className="py-20 px-6 md:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#ed1c24] font-semibold text-sm uppercase tracking-wider">Sıkça Sorulan Sorular</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-2 mb-4 text-[#181818]">Aklında Soru mu Var?</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[#f6f7f9] rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full flex justify-between items-center p-5 text-left">
                  <span className="font-bold text-[#181818]">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-[#ed1c24] flex-shrink-0 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === i && <div className="px-5 pb-5 text-gray-600 leading-relaxed animate-fade-in">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 md:px-8 bg-[#181818] text-white relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none"><div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#ed1c24]/15 blur-3xl animate-pulse-slow" /></div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <Cpu className="h-12 w-12 text-[#ed1c24] mx-auto mb-6 animate-float" />
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Fikrini Fonla Buluştur</h2>
          <p className="text-lg text-gray-300 mb-10 max-w-xl mx-auto">Binlerce Ar-Ge projesi gibi siz de yapay zeka destekli platformumuzla en uygun fonu saniyeler içinde bulun.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => embedded ? (onNewProject?.() ?? onStart()) : onStart()} className="bg-[#ed1c24] hover:bg-[#c91018] text-white font-bold py-4 px-8 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-[#ed1c24]/30 hover:scale-105"><Search className="h-5 w-5" /> {embedded ? 'Yeni Proje Başlat' : 'Ücretsiz Analiz Et'}</button>
            <button onClick={() => embedded ? (onNavigate?.('funds') ?? onStartCompany()) : onStartCompany()} className="bg-[#2a2a2a] hover:bg-[#383838] border border-[#444] text-white font-bold py-4 px-8 rounded-lg flex items-center justify-center gap-2 transition hover:scale-105"><Building2 className="h-5 w-5" /> {embedded ? 'Fonları İncele' : 'Kurumsal İletişim'}</button>
          </div>
        </div>
      </section>

      {/* FOOTER - only in standalone mode */}
      {!embedded && (
      <footer className="bg-[#111] text-gray-300 py-12 px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4"><BrandLogo compact /><span className="font-bold text-white text-lg">İSO<span className="text-[#ed1c24]">FON</span></span></div>
              <p className="text-sm leading-relaxed">Fikirden fona giden en kısa ve akıllı yol. Türkiye'nin yapay zeka destekli Ar-Ge eşleştirme platformu.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#nasil-calisir" className="hover:text-[#ed1c24] transition">Nasıl Çalışır?</a></li>
                <li><a href="#ozellikler" className="hover:text-[#ed1c24] transition">Özellikler</a></li>
                <li><a href="#pazaryeri" className="hover:text-[#ed1c24] transition">Açık İnovasyon</a></li>
                <li><a href="#sss" className="hover:text-[#ed1c24] transition">S.S.S.</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Fonlar</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-[#ed1c24] transition cursor-pointer">TÜBİTAK 1507</li>
                <li className="hover:text-[#ed1c24] transition cursor-pointer">TÜBİTAK 1512</li>
                <li className="hover:text-[#ed1c24] transition cursor-pointer">Horizon Europe</li>
                <li className="hover:text-[#ed1c24] transition cursor-pointer">PoC Bütçeleri</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">İletişim</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-[#ed1c24] transition cursor-pointer">info@isofon.ai</li>
                <li className="hover:text-[#ed1c24] transition cursor-pointer">İstanbul, Türkiye</li>
                <li className="hover:text-[#ed1c24] transition cursor-pointer">KVKK Uyumlu</li>
              </ul>
            </div>
          </div>
          <div className="h-px bg-[#ed1c24] mb-6" />
          <div className="text-center text-sm"><p>© 2026 İSOFON. Tüm hakları saklıdır.</p></div>
        </div>
      </footer>
      )}
    </div>
  );
}
