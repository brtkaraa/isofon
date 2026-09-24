import { useState } from 'react';
import { ArrowRight, Building2, CheckCircle2, Loader2, Users, MapPin, Globe, Mail, User, ChevronLeft } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { supabase, SECTORS, EMPLOYEE_COUNTS, type Company } from '@/lib/supabase';

type Props = {
  onComplete: (company: Company) => void;
  onBack: () => void;
  userId: string;
};

export default function CompanyRegistration({ onComplete, onBack, userId }: Props) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [sector, setSector] = useState('yazilim');
  const [employeeCount, setEmployeeCount] = useState('1-10');
  const [city, setCity] = useState('Istanbul');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !contactName.trim() || !contactEmail.trim()) {
      setError('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from('companies')
      .insert({
        name,
        sector,
        employee_count: employeeCount,
        city,
        website,
        description,
        contact_name: contactName,
        contact_email: contactEmail,
        user_id: userId,
      })
      .select()
      .maybeSingle();

    if (insertError) {
      setError(`Kayıt hatası: ${insertError.message}`);
      setLoading(false);
      return;
    }
    if (!data) {
      setError('Firma kaydı oluşturulamadı. Lütfen tekrar deneyin.');
      setLoading(false);
      return;
    }

    setLoading(false);
    onComplete(data as Company);
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9] font-sans text-[#181818]">
      <nav className="bg-[#181818] text-white px-6 py-4 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-300 hover:text-white transition text-sm">
          <ChevronLeft className="h-4 w-4" /> Geri
        </button>
        <BrandLogo compact />
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#fbe8e9] mb-4">
            <Building2 className="h-8 w-8 text-[#d71920]" />
          </div>
          <h1 className="text-3xl font-extrabold mb-3 text-[#181818]">Firmanızı Tanıyalım</h1>
          <p className="text-gray-500">Devam etmeden önce firma profilinizi oluşturun. Bu bilgi size en uygun çağrıları eşleştirmemize yardımcı olur.</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${step >= 1 ? 'bg-[#ed1c24] text-white' : 'bg-gray-200 text-gray-400'}`}>1</div>
          <div className={`w-12 h-1 rounded-full transition ${step >= 2 ? 'bg-[#ed1c24]' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${step >= 2 ? 'bg-[#ed1c24] text-white' : 'bg-gray-200 text-gray-400'}`}>2</div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" /> Firma Adı *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn: TeknoVasyon Ar-Ge Ltd. Şti."
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-3">Sektör</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {SECTORS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSector(s.value)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition text-left ${sector === s.value ? 'border-[#ed1c24] bg-[#fbe8e9] text-[#d71920]' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                    >
                      <span className="text-lg">{s.icon}</span>
                      <span className="text-sm font-medium">{s.label}</span>
                      {sector === s.value && <CheckCircle2 className="h-4 w-4 text-[#ed1c24] ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" /> Çalışan Sayısı
                  </label>
                  <select
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition bg-white"
                  >
                    {EMPLOYEE_COUNTS.map((c) => (
                      <option key={c} value={c}>{c} kişi</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" /> Şehir
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="İstanbul"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" /> Web Sitesi
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="www.ornek.com.tr"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Firma Açıklaması</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Firmanızın faaliyet alanını ve yetkinliklerini kısaca anlatın..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition resize-none"
                />
              </div>

              <button
                onClick={handleNext}
                disabled={!name.trim()}
                className="w-full bg-[#ed1c24] hover:bg-[#c91018] disabled:bg-gray-200 text-white font-bold py-4 px-8 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-[#ed1c24]/20"
              >
                Devam Et <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-[#fbe8e9] rounded-lg p-4 mb-2">
                <p className="text-sm text-[#d71920]">
                  <span className="font-semibold">{name}</span> firması için iletişim bilgilerini girin.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" /> İletişim Kişisi *
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Ad Soyad"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" /> E-posta *
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="ornek@firma.com.tr"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition"
                />
              </div>

              <div className="bg-[#f6f7f9] rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Firma:</span><span className="font-semibold text-[#181818]">{name}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Sektör:</span><span className="font-semibold text-[#181818]">{SECTORS.find((s) => s.value === sector)?.label}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Çalışan:</span><span className="font-semibold text-[#181818]">{employeeCount} kişi</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Şehir:</span><span className="font-semibold text-[#181818]">{city}</span></div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">{error}</div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-4 rounded-lg border border-gray-200 text-gray-500 font-bold hover:bg-gray-50 transition"
                >
                  Geri
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-[#ed1c24] hover:bg-[#c91018] disabled:bg-gray-200 text-white font-bold py-4 px-8 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-[#ed1c24]/20"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                  {loading ? 'Kaydediliyor...' : 'Profili Oluştur'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
