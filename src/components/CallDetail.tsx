import { useState } from 'react';
import {
  ArrowLeft, Landmark, Building2, Globe, Award, Calendar, Clock,
  CircleDollarSign, TrendingUp, CheckCircle2, FileText, ExternalLink,
  Upload, AlertCircle, X, Target, ListChecks, FileCheck,
} from 'lucide-react';
import { FUND_TYPE_LABELS, SECTORS, type Fund } from '@/lib/supabase';

type Props = {
  fund: Fund;
  onBack: () => void;
  onApply: (fund: Fund) => void;
};

export default function CallDetail({ fund, onBack, onApply }: Props) {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [showUpload, setShowUpload] = useState(false);

  const fundTypeIcons: Record<string, typeof Landmark> = {
    kamu: Landmark,
    ozel_sektor: Building2,
    ab: Globe,
  };

  const Icon = fundTypeIcons[fund.type] || Award;

  const typeColors: Record<string, { bg: string; text: string }> = {
    kamu: { bg: 'bg-green-50', text: 'text-green-600' },
    ozel_sektor: { bg: 'bg-amber-50', text: 'text-amber-600' },
    ab: { bg: 'bg-cyan-50', text: 'text-cyan-600' },
  };
  const c = typeColors[fund.type];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const names = Array.from(e.target.files).map((f) => f.name);
      setUploadedFiles([...uploadedFiles, ...names]);
    }
  };

  const removeFile = (name: string) => {
    setUploadedFiles(uploadedFiles.filter((f) => f !== name));
  };

  const uploadedSet = new Set(uploadedFiles);
  const allDocsUploaded = fund.required_docs.every((doc) =>
    uploadedFiles.some((f) => f.toLowerCase().includes(doc.toLowerCase().split(' ')[0]))
  );

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition mb-6 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" /> Çağrılara Geri Dön
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden mb-6">
          <div className="bg-slate-900 text-white p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg} ${c.text}`}>
                <Icon className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {fund.code && <span className="text-sm font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{fund.code}</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.bg} ${c.text}`}>
                    {FUND_TYPE_LABELS[fund.type]}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-500/20 text-green-400">
                    Açık
                  </span>
                </div>
                <h1 className="text-2xl font-bold mb-1">{fund.name}</h1>
                <p className="text-slate-400 text-sm">{fund.provider}</p>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed">{fund.description}</p>
          </div>

          {/* Key Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-100">
            {[
              { icon: CircleDollarSign, label: 'Maks. Bütçe', value: fund.max_budget_per_project || '-' },
              { icon: TrendingUp, label: 'Destek Oranı', value: fund.support_rate || '-' },
              { icon: Clock, label: 'Süre', value: fund.duration || '-' },
              { icon: Calendar, label: 'Son Başvuru', value: fund.deadline || '-' },
            ].map((item, i) => {
              const ItemIcon = item.icon;
              return (
                <div key={i} className="bg-white p-4 text-center">
                  <ItemIcon className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                  <div className="text-xs text-slate-400 mb-1">{item.label}</div>
                  <div className="text-sm font-bold text-slate-800">{item.value}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technical Scope */}
        {fund.technical_scope && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" /> Teknik Kapsam
            </h2>
            <p className="text-slate-600 leading-relaxed">{fund.technical_scope}</p>
          </div>
        )}

        {/* Eligibility */}
        {fund.eligibility.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-blue-600" /> Başvuru Koşulları
            </h2>
            <ul className="space-y-3">
              {fund.eligibility.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-600 text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Required Documents */}
        {fund.required_docs.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-blue-600" /> Gerekli Belgeler
              </h2>
              <button
                onClick={() => setShowUpload(!showUpload)}
                className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                <Upload className="h-4 w-4" /> Belge Yükle
              </button>
            </div>

            {/* Upload area */}
            {showUpload && (
              <div className="mb-4 animate-fade-in">
                <label className="block">
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-400 transition cursor-pointer">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Belge yüklemek için tıklayın veya sürükleyin</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX (maks. 10MB)</p>
                    <input type="file" multiple className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx" />
                  </div>
                </label>
              </div>
            )}

            {/* Uploaded files */}
            {uploadedFiles.length > 0 && (
              <div className="mb-4 space-y-2">
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 bg-blue-50 rounded-lg p-3">
                    <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <span className="text-sm text-slate-700 flex-1 truncate">{file}</span>
                    <button onClick={() => removeFile(file)} className="text-slate-400 hover:text-red-500 transition">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Document checklist */}
            <ul className="space-y-2">
              {fund.required_docs.map((doc, i) => {
                const uploaded = uploadedFiles.some((f) =>
                  f.toLowerCase().includes(doc.toLowerCase().split(' ')[0])
                );
                return (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    {uploaded ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex-shrink-0" />
                    )}
                    <span className={uploaded ? 'text-slate-400 line-through' : 'text-slate-600'}>{doc}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* External link */}
        {fund.application_url && (
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 mb-6 flex items-center gap-3">
            <ExternalLink className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-blue-700">Resmi başvuru sayfası ve detaylı bilgi için:</p>
              <a
                href={fund.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 font-medium hover:underline"
              >
                {fund.application_url}
              </a>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => onApply(fund)}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/20"
          >
            <FileText className="h-5 w-5" /> Bu Çağrı ile Başvuru Hazırla
          </button>
          {fund.application_url && (
            <a
              href={fund.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <ExternalLink className="h-5 w-5" /> Resmi Sayfaya Git
            </a>
          )}
        </div>

        {/* Status note */}
        {uploadedFiles.length > 0 && !allDocsUploaded && (
          <div className="mt-4 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
            <AlertCircle className="h-4 w-4" />
            Tüm gerekli belgeleri yüklediğinizden emin olun.
          </div>
        )}
        {allDocsUploaded && fund.required_docs.length > 0 && (
          <div className="mt-4 flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg p-3">
            <CheckCircle2 className="h-4 w-4" />
            Tüm gerekli belgeler yüklendi. Başvuruya hazırsınız!
          </div>
        )}
      </div>
    </div>
  );
}
