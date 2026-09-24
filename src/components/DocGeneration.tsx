import { useState, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, FileText, CheckCircle2, Loader2,
  Download, Layers, PieChart, AlertTriangle, Calendar,
  Upload, X, TrendingUp, TrendingDown, Sparkles, ClipboardList, XCircle,
} from 'lucide-react';
import { supabase, SECTORS, type Project, type Fund, type ProjectDraft } from '@/lib/supabase';

type Props = {
  project: Project;
  fund: Fund;
  onBack: () => void;
  onComplete: () => void;
  existingDraft?: ProjectDraft | null;
};

type WorkPackage = {
  name: string;
  duration: string;
  budget: number;
  tasks: string[];
};

type Risk = {
  description: string;
  level: 'Düşük' | 'Orta' | 'Yüksek';
  mitigation: string;
};

export default function DocGeneration({ project, fund, onBack, onComplete, existingDraft }: Props) {
  const [phase, setPhase] = useState<'generating' | 'done'>(existingDraft ? 'done' : 'generating');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [workPackages, setWorkPackages] = useState<WorkPackage[]>(
    existingDraft ? ((existingDraft.draft_content as { workPackages?: WorkPackage[] }).workPackages || []) : []
  );
  const [risks, setRisks] = useState<Risk[]>(
    existingDraft ? ((existingDraft.draft_content as { risks?: Risk[] }).risks || []) : []
  );
  const [draftId, setDraftId] = useState<string | null>(existingDraft?.id || null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(existingDraft?.documents || []);
  const [savingFiles, setSavingFiles] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  type AnalysisResult = {
    score: number;
    positives: string[];
    negatives: string[];
    summary: string;
  };

  const requiredDocs = [
    { name: 'Başvuru Formu (PRODİS)', desc: 'Doldurulmuş ve imzalanmış resmi başvuru formu', required: true },
    { name: 'Teknik Doküman', desc: 'Proje teknik detayları, metodoloji ve iş planı', required: true },
    { name: 'Bütçe Planı', desc: 'Detaylı bütçe dağılımı ve maliyet hesaplamaları', required: true },
    { name: 'Ekip Özgeçmişleri', desc: 'Proje ekibi üyelerinin CVleri ve uzmanlık alanları', required: true },
    { name: 'İş Planı / Ticarileştirme', desc: 'Pazar analizi ve ticarileştirme stratejisi', required: false },
    { name: 'Sürdürülebilirlik Planı', desc: 'Proje sonrası sürdürülebilirlik ve etki planı', required: false },
    { name: 'Fikri Mülkiyet Belgesi', desc: 'Patent/faydalı model başvuru belgeleri (varsa)', required: false },
    { name: 'Etik İzin / Regülasyon', desc: 'Gerekli etik kurul izinleri ve regülasyon uyumu', required: false },
  ];

  const guessDocType = (fileName: string): string => {
    const lower = fileName.toLowerCase();
    if (lower.includes('basvuru') || lower.includes('form') || lower.includes('prodis')) return 'Başvuru Formu (PRODİS)';
    if (lower.includes('teknik') || lower.includes('technical')) return 'Teknik Doküman';
    if (lower.includes('butce') || lower.includes('bütçe') || lower.includes('budget') || lower.includes('maliyet')) return 'Bütçe Planı';
    if (lower.includes('cv') || lower.includes('ozgecmis') || lower.includes('ekip') || lower.includes('team')) return 'Ekip Özgeçmişleri';
    if (lower.includes('is') || lower.includes('plan') || lower.includes('ticari') || lower.includes('pazar')) return 'İş Planı / Ticarileştirme';
    if (lower.includes('surdur') || lower.includes('etki') || lower.includes('impact')) return 'Sürdürülebilirlik Planı';
    if (lower.includes('patent') || lower.includes('fikri') || lower.includes('mulkiyet')) return 'Fikri Mülkiyet Belgesi';
    if (lower.includes('etik') || lower.includes('izin') || lower.includes('regul')) return 'Etik İzin / Regülasyon';
    return '';
  };

  const isDocUploaded = (docName: string): boolean => {
    return uploadedFiles.some((f) => guessDocType(f) === docName);
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    setAnalysis(null);
    await new Promise((r) => setTimeout(r, 2200));

    const requiredMatched = requiredDocs.filter((d) => d.required && isDocUploaded(d.name)).length;
    const requiredTotal = requiredDocs.filter((d) => d.required).length;
    const optionalMatched = requiredDocs.filter((d) => !d.required && isDocUploaded(d.name)).length;

    const baseScore = Math.round((requiredMatched / requiredTotal) * 60);
    const bonusScore = Math.min(optionalMatched * 8, 32);
    const seed = (project.trl_level * 7 + fund.min_trl * 3) % 100;
    const variance = (seed % 8) - 3;
    const score = Math.max(20, Math.min(95, baseScore + bonusScore + variance));

    const allPositives: string[] = [];
    const allNegatives: string[] = [];

    if (isDocUploaded('Başvuru Formu (PRODİS)')) allPositives.push('Başvuru formu eksiksiz teslim edilmiş');
    if (isDocUploaded('Teknik Doküman')) allPositives.push('Teknik doküman detaylı ve metodoloji açık');
    if (isDocUploaded('Bütçe Planı')) allPositives.push('Bütçe planı gerçekçi ve fon limitleri içinde');
    if (isDocUploaded('Ekip Özgeçmişleri')) allPositives.push('Ekip özgeçmişleri fon gereksinimlerini karşılıyor');
    if (isDocUploaded('İş Planı / Ticarileştirme')) allPositives.push('Ticarileştirme planı pazar potansiyelini gösteriyor');
    if (isDocUploaded('Sürdürülebilirlik Planı')) allPositives.push('Sürdürülebilirlik planı fon beklentilerini aşıyor');
    if (isDocUploaded('Fikri Mülkiyet Belgesi')) allPositives.push('Fikri mülkiyet stratejisi mevcut');
    if (project.trl_level >= fund.min_trl) allPositives.push(`Proje TRL ${project.trl_level} seviyesi fonun minimum TRL ${fund.min_trl} gereksinimini karşılıyor`);
    if (fund.sectors.includes(project.sector)) allPositives.push('Sektör uyumu yüksek — fon hedef sektörleriyle örtüşme var');

    if (!isDocUploaded('Başvuru Formu (PRODİS)')) allNegatives.push('Başvuru formu eksik — PRODİS formatında teslim edilmeli');
    if (!isDocUploaded('Teknik Doküman')) allNegatives.push('Teknik doküman eksik — metodoloji ve iş planı detaylandırılmalı');
    if (!isDocUploaded('Bütçe Planı')) allNegatives.push('Bütçe planı eksik — detaylı maliyet hesaplamaları gerekli');
    if (!isDocUploaded('Ekip Özgeçmişleri')) allNegatives.push('Ekip özgeçmişleri eksik — uzmanlık alanları belirtilmeli');
    if (!isDocUploaded('İş Planı / Ticarileştirme')) allNegatives.push('İş planı yetersiz — rakip analizi eklenmeli');
    if (!isDocUploaded('Etik İzin / Regülasyon')) allNegatives.push('Etik izinler ve regülasyon uyumu açıklanmamış');
    if (!isDocUploaded('Sürdürülebilirlik Planı')) allNegatives.push('Sürdürülebilirlik planı belirtilmemiş');
    if (project.trl_level < fund.min_trl) allNegatives.push(`Proje TRL ${project.trl_level} seviyesi fonun minimum TRL ${fund.min_trl} gereksiniminin altında`);
    if (uploadedFiles.length < 3) allNegatives.push('Belge sayısı yetersiz — daha kapsamlı bir dosya hazırlanması önerilir');

    if (allPositives.length === 0) allPositives.push('Belgeler teslim edilmiş, temel değerlendirme yapılabilir');
    if (allNegatives.length === 0) allNegatives.push('Küçük revizyonlar başvuruyu güçlendirebilir');

    const summary = score >= 75
      ? 'Belgeleriniz fonun gereksinimleriyle güçlü uyum gösteriyor. Başvuru için uygun.'
      : score >= 55
      ? 'Belgeleriniz kısmen uyumlu. Eksiklikleri giderdikten sonra başvuru yapılabilir.'
      : 'Belgeleriniz fon gereksinimleriyle uyumsuzluk gösteriyor. Önemli revizyonlar gerekli.';

    setAnalysis({ score, positives: allPositives, negatives: allNegatives, summary });
    setAnalyzing(false);
  };

  const sectorLabel = SECTORS.find((s) => s.value === project.sector)?.label || project.sector;

  const genSteps = [
    'PRODİS formatı yükleniyor...',
    'İş paketleri oluşturuluyor...',
    'Bütçe dağılımı hesaplanıyor...',
    'Risk matrisi hazırlanıyor...',
    'Zaman çizelgesi düzenleniyor...',
    'Doküman finalize ediliyor...',
  ];

  useEffect(() => {
    if (existingDraft) return; // Skip generation for existing drafts
    // Generate work packages based on TRL and sector
    const wps: WorkPackage[] = [
      { name: 'WP1: Proje Yönetimi', duration: '12 ay', budget: 8, tasks: ['Koordinasyon toplantıları', 'Ara raporlar', 'Bütçe takibi'] },
      { name: 'WP2: Teknik Geliştirme', duration: '8 ay', budget: 45, tasks: ['Tasarım ve simulasyon', 'Prototip üretimi', 'Laboratuvar testleri'] },
      { name: 'WP3: Doğrulama & Test', duration: '6 ay', budget: 25, tasks: ['Saha testleri', 'Performans ölçümü', 'Kullanıcı geri bildirim'] },
      { name: 'WP4: Dışa Dönük Yayılım', duration: '4 ay', budget: 12, tasks: ['Makale yayını', 'Konferans sunumu', 'Fikri mülkiyet'] },
      { name: 'WP5: Ticarileştirme', duration: '3 ay', budget: 10, tasks: ['Pazar analizi', 'İş modeli geliştirme', 'Müşteri bulma'] },
    ];

    const riskList: Risk[] = [
      { description: 'Teknik başarısızlık riski', level: 'Orta', mitigation: 'Aşamalı test yaklaşımı ve yedek tasarım planı' },
      { description: 'Bütçe aşımı riski', level: 'Düşük', mitigation: 'Aylık bütçe takibi ve %10 yedek bütçe ayrılması' },
      { description: 'Zaman gecikmesi riski', level: 'Orta', mitigation: 'Kritik yol analizi ve esnek zaman çizelgesi' },
      { description: 'Ekibin ayrılması riski', level: 'Düşük', mitigation: 'Bilgi transferi protokolleri ve yedek personel planı' },
    ];

    let p = 0;
    const interval = setInterval(() => {
      p += 100 / (genSteps.length * 10);
      setProgress(Math.min(p, 100));
      setProgressLabel(genSteps[Math.min(Math.floor(p / (100 / genSteps.length)), genSteps.length - 1)]);
      if (p >= 100) {
        clearInterval(interval);
        setWorkPackages(wps);
        setRisks(riskList);
        setTimeout(() => {
          setPhase('done');
          // Save draft to database
          supabase
            .from('project_drafts')
            .insert({
              project_id: project.id,
              fund_id: fund.id,
              fund_name: fund.name,
              fund_provider: fund.provider,
              draft_content: { workPackages: wps, risks: riskList },
              documents: [],
            })
            .select()
            .single()
            .then(({ data }) => {
              if (data) setDraftId((data as { id: string }).id);
            });
        }, 300);
      }
    }, 130);
  }, [project, fund]);

  const riskColors: Record<string, string> = {
    'Düşük': 'bg-green-100 text-green-700',
    'Orta': 'bg-amber-100 text-amber-700',
    'Yüksek': 'bg-red-100 text-red-700',
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

  const saveFiles = async () => {
    if (!draftId) return;
    setSavingFiles(true);
    await supabase.from('project_drafts').update({ documents: uploadedFiles }).eq('id', draftId);
    setSavingFiles(false);
  };

  if (phase === 'generating') {
    return (
      <div className="fixed inset-0 bg-slate-900 text-white flex items-center justify-center px-6 z-50">
        <div className="max-w-xl w-full text-center">
          <div className="w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-8 animate-pulse-slow">
            <FileText className="h-10 w-10 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3">PRODİS Başvuru Taslağı Oluşturuluyor</h2>
          <p className="text-slate-400 mb-8">{fund.name} için başvuru dokümanı hazırlanıyor...</p>
          <div className="w-full bg-slate-800 rounded-full h-3 mb-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-3 rounded-full transition-all duration-130" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {progressLabel}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
            <CheckCircle2 className="h-5 w-5" /> Proje Bilgisi
          </div>
          <div className="flex-1 h-px bg-slate-200" />
          <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
            <CheckCircle2 className="h-5 w-5" /> Fon Eşleşmesi
          </div>
          <div className="flex-1 h-px bg-slate-200" />
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</div>
            Doküman
          </div>
        </div>

        {/* Success Banner */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-green-800">PRODİS Başvuru Taslağı Hazır!</h2>
            <p className="text-green-600 text-sm mt-1">{fund.name} için başvuru dokümanı başarıyla oluşturuldu.</p>
          </div>
        </div>

        {/* Document Preview */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-8">
          {/* Document Header */}
          <div className="bg-slate-900 text-white p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-400" />
                <span className="text-sm text-slate-400 uppercase tracking-wider">PRODİS Başvuru Formu</span>
              </div>
              <span className="text-sm text-slate-400">{fund.provider}</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">{project.title}</h1>
            <p className="text-slate-400 text-sm">{sectorLabel} • TRL {project.trl_level} • {fund.name}</p>
          </div>

          <div className="p-8 space-y-8">
            {/* Project Summary */}
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Proje Özeti</h3>
              <p className="text-slate-700 leading-relaxed">{project.description}</p>
            </div>

            {/* Work Packages */}
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4" /> İş Paketeleri
              </h3>
              <div className="space-y-3">
                {workPackages.map((wp, i) => (
                  <div key={i} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-800">{wp.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {wp.duration}</span>
                        <span className="flex items-center gap-1"><PieChart className="h-3 w-3" /> %{wp.budget}</span>
                      </div>
                    </div>
                    <ul className="text-sm text-slate-600 space-y-1 ml-4">
                      {wp.tasks.map((task, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget Distribution */}
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <PieChart className="h-4 w-4" /> Bütçe Dağılımı
              </h3>
              <div className="space-y-2">
                {workPackages.map((wp, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-48">{wp.name}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-3 rounded-full transition-all duration-700" style={{ width: `${wp.budget}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 w-8">%{wp.budget}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Matrix */}
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Risk Matrisi
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 font-semibold text-slate-600">Risk</th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-600">Seviye</th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-600">Azaltma Stratejisi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {risks.map((risk, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="py-3 px-3 text-slate-700">{risk.description}</td>
                        <td className="py-3 px-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${riskColors[risk.level]}`}>{risk.level}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{risk.mitigation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Info */}
            <div className="border-t border-slate-200 pt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Fon Sağlayıcı</div>
                <div className="font-semibold text-slate-700">{fund.provider}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Bütçe</div>
                <div className="font-semibold text-slate-700">{fund.budget}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Sektör</div>
                <div className="font-semibold text-slate-700">{sectorLabel}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">TRL Seviyesi</div>
                <div className="font-semibold text-slate-700">TRL {project.trl_level}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Required Documents Checklist */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-blue-600" /> Gerekli Belgeler
          </h2>
          <p className="text-sm text-slate-500 mb-4">Başvuru için gerekli belgeler aşağıda listelenmiştir. Zorunlu belgeleri yükledikten sonra analiz yapabilirsiniz.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {requiredDocs.map((doc, i) => {
              const uploaded = isDocUploaded(doc.name);
              return (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border transition ${uploaded ? 'bg-green-50 border-green-200' : doc.required ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${uploaded ? 'bg-green-500' : doc.required ? 'bg-amber-400' : 'bg-slate-300'}`}>
                    {uploaded ? <CheckCircle2 className="h-4 w-4 text-white" /> : doc.required ? <span className="text-white text-xs font-bold">!</span> : <span className="text-white text-xs font-bold">?</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-700">{doc.name}</p>
                      {doc.required
                        ? <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">Zorunlu</span>
                        : <span className="text-xs bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-medium">İsteğe bağlı</span>
                      }
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{doc.desc}</p>
                    {uploaded && <p className="text-xs text-green-600 mt-1 font-medium">✓ Yüklendi</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" /> Belge Yükle
          </h2>
          <p className="text-sm text-slate-500 mb-4">Belgelerinizi yükleyin, ardından sistem bunları analiz edip size bir değerlendirme sunsun.</p>
          <label className="block mb-4">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-400 transition cursor-pointer">
              <Upload className="h-7 w-7 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Belge yüklemek için tıklayın</p>
              <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX, XLS</p>
              <input type="file" multiple className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.xls,.xlsx" />
            </div>
          </label>
          {uploadedFiles.length > 0 && (
            <div className="space-y-2 mb-4">
              {uploadedFiles.map((file, i) => (
                <div key={i} className="flex items-center gap-3 bg-blue-50 rounded-lg p-3">
                  <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate">{file}</p>
                    {guessDocType(file) && <span className="text-xs text-blue-500 font-medium">{guessDocType(file)}</span>}
                  </div>
                  <button onClick={() => removeFile(file)} className="text-slate-400 hover:text-red-500 transition">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            {uploadedFiles.length > 0 && (
              <button
                onClick={saveFiles}
                disabled={savingFiles}
                className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition"
              >
                {savingFiles ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {savingFiles ? 'Kaydediliyor...' : 'Belgeleri Kaydet'}
              </button>
            )}
            {uploadedFiles.length > 0 && (
              <button
                onClick={runAnalysis}
                disabled={analyzing}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition shadow-md shadow-blue-500/20"
              >
                {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {analyzing ? 'Analiz Ediliyor...' : 'Belgeleri Analiz Et'}
              </button>
            )}
          </div>
        </div>

        {/* Analysis Result */}
        {analyzing && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-6 text-center">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-bold text-blue-800 mb-1">Belgeleriniz Analiz Ediliyor</h3>
            <p className="text-sm text-blue-600">Yapay zeka, fon gereksinimleri, TRL uyumu, bütçe ve sektörel uygunluğu kontrol ediyor...</p>
          </div>
        )}

        {analysis && !analyzing && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden mb-6">
            <div className={`p-6 text-white ${analysis.score >= 75 ? 'bg-gradient-to-r from-green-600 to-emerald-500' : analysis.score >= 55 ? 'bg-gradient-to-r from-amber-600 to-orange-500' : 'bg-gradient-to-r from-red-600 to-rose-500'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-1 flex items-center gap-2"><Sparkles className="h-5 w-5" /> Başvuru Analiz Sonucu</h3>
                  <p className="text-sm opacity-90">{analysis.summary}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-extrabold">%{analysis.score}</div>
                  <div className="text-sm font-medium opacity-90">{analysis.score >= 75 ? 'Olumlu' : analysis.score >= 55 ? 'Orta' : 'Riskli'}</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium">Destek Alma Olasılığı</span>
                  <span className="text-sm font-bold">%{analysis.score}</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-white h-2.5 rounded-full transition-all duration-1000" style={{ width: `${analysis.score}%` }} />
                </div>
              </div>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-6">
              {/* Positives */}
              <div>
                <h4 className="text-sm font-bold text-green-700 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Olumlu Yönler ({analysis.positives.length})
                </h4>
                <ul className="space-y-2">
                  {analysis.positives.map((pos, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-600 leading-relaxed">{pos}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Negatives */}
              <div>
                <h4 className="text-sm font-bold text-red-700 mb-3 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" /> Geliştirilmesi Gereken Yönler ({analysis.negatives.length})
                </h4>
                <ul className="space-y-2">
                  {analysis.negatives.map((neg, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-600 leading-relaxed">{neg}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="px-6 pb-6">
              <div className={`rounded-lg p-4 text-sm font-medium ${analysis.score >= 75 ? 'bg-green-50 text-green-700' : analysis.score >= 55 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                {analysis.summary}
              </div>
              <p className="text-xs text-slate-400 mt-2">Bu analiz yapay zeka tarafından ön değerlendirme amaçlı oluşturulmuştur. Nihai değerlendirme fon sağlayıcı tarafından yapılacaktır.</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/20">
            <Download className="h-5 w-5" /> PDF İndir
          </button>
          <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition">
            <FileText className="h-5 w-5" /> Word İndir
          </button>
          <button
            onClick={onComplete}
            className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition"
          >
            Panele Dön <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
