import { useState, useEffect } from 'react';
import {
  ArrowRight, ArrowLeft, Award, CheckCircle2, XCircle,
  TrendingUp, Building2, Globe, Landmark, FileText, Loader2, Target,
  RefreshCw, Info,
} from 'lucide-react';
import { supabase, FUND_TYPE_LABELS, type Project, type Fund } from '@/lib/supabase';

type Props = {
  project: Project;
  onBack: () => void;
  onGenerateDoc: (fund: Fund) => void;
  onCreateReverseCall: () => void;
};

type MatchedFund = Fund & { compatibility: number };

export default function FundMatching({ project, onBack, onGenerateDoc, onCreateReverseCall }: Props) {
  const [funds, setFunds] = useState<MatchedFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFund, setSelectedFund] = useState<MatchedFund | null>(null);
  const [savedFundId, setSavedFundId] = useState<string | null>(null);

  useEffect(() => {
    const loadFunds = async () => {
      const { data, error } = await supabase.from('funds').select('*');
      if (error || !data) {
        setLoading(false);
        return;
      }

      // Calculate compatibility
      const matched: MatchedFund[] = (data as Fund[]).map((fund) => {
        let score = 0;
        if (project.trl_level >= fund.min_trl && project.trl_level <= fund.max_trl) {
          score += 50;
        } else {
          const distance = Math.min(Math.abs(project.trl_level - fund.min_trl), Math.abs(project.trl_level - fund.max_trl));
          score += Math.max(0, 50 - distance * 15);
        }
        if (fund.sectors.includes(project.sector)) {
          score += 50;
        }
        return { ...fund, compatibility: Math.round(score) };
      });

      matched.sort((a, b) => b.compatibility - a.compatibility);
      setFunds(matched);

      // Restore previously selected fund
      if (project.selected_fund_id) {
        setSavedFundId(project.selected_fund_id);
        const saved = matched.find((f) => f.id === project.selected_fund_id);
        if (saved) setSelectedFund(saved);
      }

      setLoading(false);
    };
    loadFunds();
  }, [project]);

  const handleSelectFund = (fund: MatchedFund) => {
    setSelectedFund(fund);
    setSavedFundId(fund.id);
    // Persist selection to project
    supabase
      .from('projects')
      .update({ selected_fund_id: fund.id })
      .eq('id', project.id)
      .then();
  };

  const fundTypeIcons: Record<string, typeof Landmark> = {
    kamu: Landmark,
    ozel_sektor: Building2,
    ab: Globe,
  };

  const fundTypeColors: Record<string, { bg: string; text: string; border: string }> = {
    kamu: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-500' },
    ozel_sektor: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-500' },
    ab: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-500' },
  };

  if (loading) {
    return (
      <div className="p-6 md:p-10 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Fon kataloğu taranıyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Project Summary */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Proje Analizi Tamamlandı</span>
              <h1 className="text-2xl font-extrabold mt-1 mb-2">{project.title}</h1>
              <p className="text-slate-500 text-sm line-clamp-2">{project.description}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center min-w-[120px]">
              <div className="text-xs text-slate-500 mb-1">Tespit Edilen</div>
              <div className="text-3xl font-extrabold text-blue-600">TRL {project.trl_level}</div>
              <div className="text-xs text-slate-500 mt-1">Hazırlık Seviyesi</div>
            </div>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
            <CheckCircle2 className="h-5 w-5" /> Proje Bilgisi
          </div>
          <div className="flex-1 h-px bg-slate-200" />
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</div>
            Fon Eşleşmesi
          </div>
          <div className="flex-1 h-px bg-slate-200" />
          <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs font-bold">3</div>
            Doküman
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" /> Eşleşen Fonlar
          </h2>
          <p className="text-slate-500 text-sm">{funds.length} fon bulundu, uyumluluk skoruna göre sıralandı.</p>
        </div>

        {/* Fund Cards */}
        <div className="space-y-4">
          {funds.map((fund, i) => {
            const Icon = fundTypeIcons[fund.type] || Award;
            const c = fundTypeColors[fund.type];
            const isHigh = fund.compatibility >= 70;
            const isMedium = fund.compatibility >= 40 && fund.compatibility < 70;
            return (
              <div
                key={fund.id}
                className={`bg-white rounded-xl shadow-md border border-slate-100 p-6 hover:shadow-xl transition cursor-pointer ${selectedFund?.id === fund.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => handleSelectFund(fund)}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-4 flex-1 min-w-[200px]">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg} ${c.text}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold">{fund.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.bg} ${c.text}`}>
                          {FUND_TYPE_LABELS[fund.type]}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{fund.provider} • Bütçe: {fund.budget}</p>
                      <p className="text-sm text-slate-400 mt-2">{fund.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                        <span>TRL: {fund.min_trl}-{fund.max_trl}</span>
                        <span>Sektörler: {fund.sectors.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Compatibility Score */}
                  <div className="text-center min-w-[100px]">
                    <div className={`text-3xl font-extrabold ${isHigh ? 'text-green-600' : isMedium ? 'text-amber-600' : 'text-slate-400'}`}>
                      %{fund.compatibility}
                    </div>
                    <div className="text-xs text-slate-500 mb-2">Uyumluluk</div>
                    <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden mx-auto">
                      <div
                        className={`h-2 rounded-full transition-all duration-700 ${isHigh ? 'bg-green-500' : isMedium ? 'bg-amber-500' : 'bg-slate-300'}`}
                        style={{ width: `${fund.compatibility}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action button (only for selected) */}
                {selectedFund?.id === fund.id && fund.compatibility >= 40 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in">
                    <div className="flex items-center gap-2 mb-3">
                      {savedFundId === fund.id && (
                        <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Seçili fon olarak kaydedildi
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onGenerateDoc(fund); }}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition shadow-md"
                    >
                      <FileText className="h-5 w-5" />
                      PRODİS Başvuru Taslağı Oluştur
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
                {selectedFund?.id === fund.id && fund.compatibility < 40 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <XCircle className="h-4 w-4" />
                      Uyumluluk düşük — bu fon için doküman üretimi önerilmez.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tersine Çağrı Bölümü */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">Mevcut çağrılara uymuyor mu?</h3>
              <p className="text-sm text-slate-600 mb-4">
                Projeniz yukarıdaki fonlarla düşük uyumluluk gösteriyorsa, doğrudan yatırımcılara ulaşmak için bir <span className="font-semibold">tersine çağrı</span> oluşturabilirsiniz. Yatırım tipi, bütçe ve hedef sektörleri belirleyerek çağrınızı yayınlayın.
              </p>
              <button
                onClick={onCreateReverseCall}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition shadow-md"
              >
                <RefreshCw className="h-5 w-5" /> Tersine Çağrı Oluştur
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
