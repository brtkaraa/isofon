import { useState } from 'react';
import {
  ArrowLeft, RefreshCw, CheckCircle2, Loader2, CircleDollarSign,
  TrendingUp, FileText, ArrowRight, Upload, X,
} from 'lucide-react';
import { supabase, SECTORS, INVESTMENT_TYPES, INVESTMENT_TYPE_LABELS, type Project, type ReverseCall } from '@/lib/supabase';

type Props = {
  project: Project;
  onBack: () => void;
  onComplete: () => void;
};

export default function ReverseCallForm({ project, onBack, onComplete }: Props) {
  const [title, setTitle] = useState(`${project.title} - Yatırım Çağrısı`);
  const [summary, setSummary] = useState('');
  const [requestedBudget, setRequestedBudget] = useState('');
  const [investmentType, setInvestmentType] = useState('hisse');
  const [targetSectors, setTargetSectors] = useState<string[]>([project.sector]);
  const [minTrl, setMinTrl] = useState(Math.max(1, project.trl_level - 1));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleToggleSector = (sector: string) => {
    if (targetSectors.includes(sector)) {
      setTargetSectors(targetSectors.filter((s) => s !== sector));
    } else {
      setTargetSectors([...targetSectors, sector]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const names = Array.from(e.target.files).map((f) => f.name);
      setUploadedFiles([...uploadedFiles, ...names]);
    }
  };

  const removeFile = (name: string) => {
    setUploadedFiles(uploadedFiles.filter((f) => f !== name));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !summary.trim() || !requestedBudget.trim()) {
      setError('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }
    if (targetSectors.length === 0) {
      setError('En az bir hedef sektör seçin.');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase
      .from('reverse_calls')
      .insert({
        project_id: project.id,
        title,
        summary,
        requested_budget: requestedBudget,
        investment_type: investmentType,
        target_sectors: targetSectors,
        min_trl: minTrl,
        status: 'active',
        documents: uploadedFiles,
      });

    if (insertError) {
      setError('Tersine çağrı oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
      return;
    }

    setLoading(false);
    setSuccess(true);
    setTimeout(() => onComplete(), 2000);
  };

  if (success) {
    return (
      <div className="p-6 md:p-10">
        <div className="max-w-xl mx-auto text-center py-20">
          <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Tersine Çağrınız Yayınlandı!</h2>
          <p className="text-gray-500 mb-2">Tersine çağrınız yatırımcıların görümüne açıldı.</p>
          <p className="text-sm text-gray-400">Yatırımcılar projenize ilgi gösterdiğinde burada görünecek.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition mb-6 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" /> Fon Eşleşmesine Geri Dön
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#fbe8e9] flex items-center justify-center">
              <RefreshCw className="h-5 w-5 text-[#d71920]" />
            </div>
            <h1 className="text-3xl font-extrabold">Tersine Çağrı Oluştur</h1>
          </div>
          <p className="text-gray-500">
            Projeniz mevcut çağrılara uymuyor mu? Yatırımcılara doğrudan ulaşmak için tersine çağrı oluşturun.
          </p>
        </div>

        {/* Project info */}
        <div className="bg-[#fbe8e9] rounded-xl border border-[#f5d0d3] p-4 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-[#d71920]" />
            <span className="text-sm font-semibold text-[#a01218]">İlişkili Proje</span>
          </div>
          <p className="text-sm text-[#a01218] font-medium">{project.title}</p>
          <p className="text-xs text-[#d71920] mt-1">TRL {project.trl_level} • {SECTORS.find((s) => s.value === project.sector)?.label}</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Çağrı Başlığı *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Yatırımcılar göreceği başlık"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Yatırım Talebi Özeti *</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Projenizin yatırım değerini ve ne için finansman aradığınızı açıklayın. Hangi pazar fırsatı var? Hangi aşamadasınız?"
              rows={5}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4 text-gray-400" /> Talep Edilen Bütçe *
              </label>
              <input
                type="text"
                value={requestedBudget}
                onChange={(e) => setRequestedBudget(e.target.value)}
                placeholder="Örn: 500.000 TL"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gray-400" /> Minimum TRL
              </label>
              <select
                value={minTrl}
                onChange={(e) => setMinTrl(parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((trl) => (
                  <option key={trl} value={trl}>TRL {trl}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Yatırım Tipi</label>
            <div className="grid grid-cols-2 gap-3">
              {INVESTMENT_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setInvestmentType(t.value)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition text-left ${investmentType === t.value ? 'border-[#ed1c24] bg-[#fbe8e9] text-[#d71920]' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                >
                  <span className="text-lg">{t.icon}</span>
                  <span className="text-sm font-medium">{t.label}</span>
                  {investmentType === t.value && <CheckCircle2 className="h-4 w-4 text-[#ed1c24] ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Hedef Sektörler</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SECTORS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => handleToggleSector(s.value)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition text-left ${targetSectors.includes(s.value) ? 'border-[#ed1c24] bg-[#fbe8e9] text-[#d71920]' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                >
                  <span className="text-lg">{s.icon}</span>
                  <span className="text-sm font-medium">{s.label}</span>
                  {targetSectors.includes(s.value) && <CheckCircle2 className="h-4 w-4 text-[#ed1c24] ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Belge Yükle</label>
            <label className="block">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#ed1c24] transition cursor-pointer">
                <Upload className="h-7 w-7 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Belge yüklemek için tıklayın</p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX (opsiyonel)</p>
                <input type="file" multiple className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx" />
              </div>
            </label>
            {uploadedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[#fbe8e9] rounded-lg p-3">
                    <FileText className="h-5 w-5 text-[#d71920] flex-shrink-0" />
                    <span className="text-sm text-gray-700 flex-1 truncate">{file}</span>
                    <button onClick={() => removeFile(file)} className="text-gray-400 hover:text-red-500 transition">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#ed1c24] hover:bg-[#c91018] disabled:bg-gray-300 text-white font-bold py-4 px-8 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-[#ed1c24]/20"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
            {loading ? 'Oluşturuluyor...' : 'Tersine Çağrıyı Yayınla'}
            {!loading && <ArrowRight className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
