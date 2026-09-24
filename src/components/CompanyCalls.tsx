import { useState, useEffect } from 'react';
import {
  Megaphone, Plus, ArrowLeft, Loader2, Trash2, ArrowRight,
  CircleDollarSign, Clock, Calendar, Target, ListChecks,
  CheckCircle2, Building2, X,
} from 'lucide-react';
import { supabase, SECTORS, type Company, type CompanyCall } from '@/lib/supabase';

type Props = {
  company: Company;
};

export default function CompanyCalls({ company }: Props) {
  const [calls, setCalls] = useState<CompanyCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCall, setSelectedCall] = useState<CompanyCall | null>(null);

  useEffect(() => {
    loadCalls();
  }, []);

  const loadCalls = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('company_calls')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setCalls(data as CompanyCall[]);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('company_calls').delete().eq('id', id);
    setCalls(calls.filter((c) => c.id !== id));
  };

  const handleCreated = () => {
    setShowForm(false);
    loadCalls();
  };

  const sectorLabel = (val: string) => SECTORS.find((s) => s.value === val)?.label || val;
  const sectorIcon = (val: string) => SECTORS.find((s) => s.value === val)?.icon || '📦';

  if (showForm) {
    return <CompanyCallForm company={company} onBack={() => setShowForm(false)} onComplete={handleCreated} />;
  }

  if (selectedCall) {
    return (
      <div className="p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setSelectedCall(null)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition mb-6 text-sm font-medium">
            <ArrowLeft className="h-4 w-4" /> Çağrılarıma Geri Dön
          </button>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
            <div className="bg-[#181818] text-white p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-[#ed1c24] flex items-center justify-center flex-shrink-0">
                  <Megaphone className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#ed1c24]/20 text-[#ff6b72]">
                      {sectorLabel(selectedCall.sector)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selectedCall.status === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {selectedCall.status === 'open' ? 'Açık' : 'Kapalı'}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold mb-1">{selectedCall.title}</h1>
                  <p className="text-gray-400 text-sm">{company.name} • {new Date(selectedCall.created_at).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-gray-100">
              {[
                { icon: CircleDollarSign, label: 'Bütçe', value: selectedCall.budget || '-' },
                { icon: Clock, label: 'Süre', value: selectedCall.duration || '-' },
                { icon: Calendar, label: 'Son Başvuru', value: selectedCall.deadline || '-' },
              ].map((item, i) => {
                const ItemIcon = item.icon;
                return (
                  <div key={i} className="bg-white p-4 text-center">
                    <ItemIcon className="h-5 w-5 text-[#ed1c24] mx-auto mb-2" />
                    <div className="text-xs text-gray-400 mb-1">{item.label}</div>
                    <div className="text-sm font-bold text-gray-800">{item.value}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedCall.description && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-bold mb-3">Çağrı Açıklaması</h2>
              <p className="text-gray-600 leading-relaxed">{selectedCall.description}</p>
            </div>
          )}

          {selectedCall.technical_scope && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-[#ed1c24]" /> Teknik Kapsam
              </h2>
              <p className="text-gray-600 leading-relaxed">{selectedCall.technical_scope}</p>
            </div>
          )}

          {selectedCall.eligibility.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-[#ed1c24]" /> Başvuru Koşulları
              </h2>
              <ul className="space-y-3">
                {selectedCall.eligibility.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => { handleDelete(selectedCall.id); setSelectedCall(null); }}
              className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition"
            >
              <Trash2 className="h-4 w-4" /> Çağrıyı Sil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold mb-2 text-[#181818]">Çağrılarım</h1>
            <p className="text-gray-500">Firmanızın açık inovasyon çağrılarını oluşturun ve yönetin.</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#ed1c24] hover:bg-[#c91018] text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition shadow-lg shadow-[#ed1c24]/20"
          >
            <Plus className="h-5 w-5" /> Yeni Çağrı Oluştur
          </button>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-[#ed1c24] animate-spin" />
          </div>
        ) : calls.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Megaphone className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Henüz çağrınız yok</h3>
            <p className="text-gray-500 mb-6">İlk açık inovasyon çağrınızı oluşturun ve Ar-Ge ekiplerinin projelerle eşleşmesini sağlayın.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#ed1c24] hover:bg-[#c91018] text-white font-bold px-6 py-3 rounded-lg inline-flex items-center gap-2 transition shadow-md"
            >
              <Plus className="h-5 w-5" /> Yeni Çağrı Oluştur
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {calls.map((call) => (
              <article
                key={call.id}
                className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#ed1c24]/30 hover:shadow-lg cursor-pointer"
                onClick={() => setSelectedCall(call)}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#fbe8e9] text-[#d71920]">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end">
                    <span className="rounded-full bg-[#f3f3f3] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-600">
                      {sectorIcon(call.sector)} {sectorLabel(call.sector)}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${call.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                      {call.status === 'open' ? 'Açık' : 'Kapalı'}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-extrabold leading-snug text-[#202020] group-hover:text-[#ed1c24] transition">{call.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-500">{call.description}</p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
                  {call.budget && (
                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                      <CircleDollarSign className="h-3 w-3" /> {call.budget}
                    </span>
                  )}
                  {call.duration && (
                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                      <Clock className="h-3 w-3" /> {call.duration}
                    </span>
                  )}
                  {call.deadline && (
                    <span className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-md">
                      <Calendar className="h-3 w-3" /> {call.deadline}
                    </span>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between gap-4 border-t border-gray-100 pt-5">
                  <span className="text-xs text-gray-400">
                    {new Date(call.created_at).toLocaleDateString('tr-TR')}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(call.id); }}
                      className="text-gray-300 hover:text-red-500 transition p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ed1c24] transition group-hover:gap-2.5">
                      Detay <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Company Call Form ---
function CompanyCallForm({ company, onBack, onComplete }: { company: Company; onBack: () => void; onComplete: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState(company.sector);
  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState('');
  const [deadline, setDeadline] = useState('');
  const [technicalScope, setTechnicalScope] = useState('');
  const [eligibility, setEligibility] = useState<string[]>([]);
  const [eligibilityInput, setEligibilityInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddEligibility = () => {
    if (eligibilityInput.trim()) {
      setEligibility([...eligibility, eligibilityInput.trim()]);
      setEligibilityInput('');
    }
  };

  const handleRemoveEligibility = (idx: number) => {
    setEligibility(eligibility.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      setError('Lütfen çağrı başlığı ve açıklamasını doldurun.');
      return;
    }
    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase.from('company_calls').insert({
      company_id: company.id,
      title,
      description,
      sector,
      budget,
      duration,
      deadline,
      technical_scope: technicalScope,
      eligibility,
      status: 'open',
    });

    if (insertError) {
      setError('Çağrı oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
      return;
    }

    setLoading(false);
    onComplete();
  };

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition mb-6 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" /> Çağrılarıma Geri Dön
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#fbe8e9] flex items-center justify-center">
              <Megaphone className="h-5 w-5 text-[#d71920]" />
            </div>
            <h1 className="text-3xl font-extrabold text-[#181818]">Yeni Çağrı Oluştur</h1>
          </div>
          <p className="text-gray-500">
            Ar-Ge ekiplerinin çözebileceği bir teknoloji ihtiyacı tanımlayın. Tıpkı Oyak Renault veya Vestel'in yaptığı gibi açık inovasyon çağrısı yayınlayın.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Çağrı Başlığı *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Akıllı Üretim Hattı Optimizasyonu"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">İhtiyaç Açıklaması *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Çözmek istediğiniz problemi detaylıca anlatın. Hangi teknolojiye ihtiyacınız var?"
              rows={5}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Hedef Sektör</label>
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

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4 text-gray-400" /> Bütçe
              </label>
              <input type="text" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Örn: 500.000 TL" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" /> Süre
              </label>
              <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Örn: 6 ay" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" /> Son Başvuru
              </label>
              <input type="text" value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="Örn: 2026-12-31" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-400" /> Teknik Kapsam
            </label>
            <textarea
              value={technicalScope}
              onChange={(e) => setTechnicalScope(e.target.value)}
              placeholder="Teknik olarak hangi alanlarda çözüm arıyorsunuz? (Örn: robotik, IoT, verimlilik optimizasyonu)"
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-gray-400" /> Başvuru Koşulları
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={eligibilityInput}
                onChange={(e) => setEligibilityInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddEligibility(); } }}
                placeholder="Koşul ekleyin ve Enter'a basın"
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition"
              />
              <button
                onClick={handleAddEligibility}
                type="button"
                className="bg-[#ed1c24] hover:bg-[#c91018] text-white font-medium px-4 py-2.5 rounded-lg transition"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {eligibility.length > 0 && (
              <div className="space-y-2">
                {eligibility.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 flex-1">{item}</span>
                    <button onClick={() => handleRemoveEligibility(i)} className="text-gray-400 hover:text-red-500 transition">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">{error}</div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#ed1c24] hover:bg-[#c91018] disabled:bg-gray-300 text-white font-bold py-4 px-8 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-[#ed1c24]/20"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Megaphone className="h-5 w-5" />}
            {loading ? 'Oluşturuluyor...' : 'Çağrıyı Yayınla'}
            {!loading && <ArrowRight className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
