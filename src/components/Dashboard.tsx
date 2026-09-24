import { useState, useEffect } from 'react';
import {
  ArrowLeft, Plus, FileText, Cpu, Award, Layers,
  TrendingUp, Loader2, Trash2, ArrowRight, Search, Building2,
} from 'lucide-react';
import { supabase, SECTORS, FUND_TYPE_LABELS, type Project, type Fund } from '@/lib/supabase';
import BrandLogo from '@/components/BrandLogo';

type Props = {
  onNewProject: () => void;
  onNewCompany: () => void;
  onBackToLanding: () => void;
  onSelectProject: (project: Project) => void;
};

export default function Dashboard({ onNewProject, onNewCompany, onBackToLanding, onSelectProject }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'company'>('dashboard');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setProjects(data as Project[]);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('projects').delete().eq('id', id);
    setProjects(projects.filter((p) => p.id !== id));
  };

  const sectorLabel = (val: string) => SECTORS.find((s) => s.value === val)?.label || val;
  const sectorIcon = (val: string) => SECTORS.find((s) => s.value === val)?.icon || '📦';

  if (view === 'company') {
    return <CompanyCallView onBack={() => setView('dashboard')} onSubmit={onNewCompany} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* NAVBAR */}
      <nav className="bg-iso-navy-800 text-white py-4 px-6 md:px-8 sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button onClick={onBackToLanding} className="flex items-center gap-2 text-iso-navy-200 hover:text-white transition">
            <ArrowLeft className="h-5 w-5" /> Ana Sayfa
          </button>
          <BrandLogo compact />
          <button
            onClick={() => setView('company')}
            className="flex items-center gap-2 text-iso-navy-200 hover:text-white transition text-sm font-medium"
          >
            <Building2 className="h-4 w-4" /> Kurumsal Çağrı
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-iso-navy-800">Proje Panelim</h1>
            <p className="text-iso-navy-400 mt-1">Ar-Ge projelerinizi yönetin ve fon eşleştirmelerini takip edin.</p>
          </div>
          <button
            onClick={onNewProject}
            className="bg-iso-gold-500 hover:bg-iso-gold-400 text-iso-navy-900 font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition shadow-lg shadow-iso-gold-500/20"
          >
            <Plus className="h-5 w-5" /> Yeni Proje
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Toplam Proje', value: projects.length, icon: FileText, color: 'blue' },
            { label: 'Eşleşen', value: projects.filter((p) => p.status === 'matched').length, icon: Award, color: 'green' },
            { label: 'Ortalama TRL', value: projects.length ? (projects.reduce((s, p) => s + p.trl_level, 0) / projects.length).toFixed(1) : '-', icon: TrendingUp, color: 'cyan' },
            { label: 'Sektör Sayısı', value: new Set(projects.map((p) => p.sector)).size, icon: Layers, color: 'amber' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            const colorMap: Record<string, string> = {
              blue: 'bg-iso-navy-50 text-iso-navy-700',
              green: 'bg-iso-gold-50 text-iso-gold-700',
              cyan: 'bg-iso-gold-100 text-iso-gold-700',
              amber: 'bg-iso-navy-50 text-iso-navy-600',
            };
            return (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-iso-navy-100 p-5">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorMap[stat.color]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-2xl font-extrabold text-iso-navy-800">{stat.value}</div>
                <div className="text-sm text-iso-navy-400">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Projects List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-iso-gold-500 animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md border border-iso-navy-100 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-iso-navy-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-iso-navy-400" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-iso-navy-800">Henüz projeniz yok</h3>
            <p className="text-iso-navy-400 mb-6">İlk Ar-Ge projenizi oluşturun ve yapay zeka ile fon eşleştirin.</p>
            <button
              onClick={onNewProject}
              className="bg-iso-gold-500 hover:bg-iso-gold-400 text-iso-navy-900 font-bold px-6 py-3 rounded-lg inline-flex items-center gap-2 transition shadow-md"
            >
              <Plus className="h-5 w-5" /> Yeni Proje Oluştur
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow-md border border-iso-navy-100 p-6 hover:shadow-xl transition cursor-pointer group"
                onClick={() => onSelectProject(project)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-iso-navy-100 flex items-center justify-center text-lg">
                      {sectorIcon(project.sector)}
                    </div>
                    <div>
                      <h3 className="font-bold text-iso-navy-800 group-hover:text-iso-gold-600 transition">{project.title}</h3>
                      <p className="text-xs text-iso-navy-400">{sectorLabel(project.sector)}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                    className="text-iso-navy-300 hover:text-red-500 transition p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-sm text-iso-navy-400 line-clamp-2 mb-4">{project.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="bg-iso-navy-50 text-iso-navy-700 text-xs font-bold px-3 py-1 rounded-full">TRL {project.trl_level}</span>
                    <span className="bg-iso-gold-50 text-iso-gold-700 text-xs font-bold px-3 py-1 rounded-full">Eşleşti</span>
                  </div>
                  <span className="text-xs text-iso-navy-400">
                    {new Date(project.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-iso-navy-100 flex items-center gap-1 text-sm text-iso-gold-600 font-medium group-hover:gap-2 transition-all">
                  Fonları Gör <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Company call view (simple form)
function CompanyCallView({ onBack, onSubmit }: { onBack: () => void; onSubmit: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [sector, setSector] = useState('imalat');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="min-h-screen bg-iso-navy-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-iso-gold-500 flex items-center justify-center mx-auto mb-6">
            <Award className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-iso-navy-800">Çağrınız Alındı!</h2>
          <p className="text-iso-navy-400 mb-8">Yapay zeka çağrınızı analiz ediyor ve en uygun Ar-Ge ekipleriyle eşleştiriyor. Eşleşmeler panelinizde görünecek.</p>
          <button onClick={onBack} className="bg-iso-gold-500 hover:bg-iso-gold-400 text-iso-navy-900 font-bold px-6 py-3 rounded-lg transition">Panele Dön</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-iso-navy-50 font-sans text-iso-navy-800">
      <nav className="bg-iso-navy-800 text-white py-4 px-6 md:px-8 sticky top-0 z-50 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button onClick={onBack} className="flex items-center gap-2 text-iso-navy-200 hover:text-white transition">
            <ArrowLeft className="h-5 w-5" /> Geri
          </button>
          <BrandLogo compact />
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-iso-navy-800 mb-4">
            <Building2 className="h-8 w-8 text-iso-gold-400" />
          </div>
          <h1 className="text-3xl font-extrabold mb-3 text-iso-navy-800">Kurumsal Çözüm Ortaklığı Çağrısı</h1>
          <p className="text-iso-navy-400">İhtiyaç duyduğunuz inovatif teknolojiyi tanımlayın, yapay zeka en uygun Ar-Ge ekiplerini bulsun.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-iso-navy-100 p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-iso-navy-600 mb-2">Çağrı Başlığı</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Akıllı üretim hattı optimizasyonu"
              className="w-full px-4 py-3 rounded-lg border border-iso-navy-200 focus:border-iso-gold-500 focus:ring-2 focus:ring-iso-gold-100 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-iso-navy-600 mb-2">İhtiyaç Açıklaması</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Çözmek istediğiniz problemi detaylıca anlatın..."
              rows={5}
              className="w-full px-4 py-3 rounded-lg border border-iso-navy-200 focus:border-iso-gold-500 focus:ring-2 focus:ring-iso-gold-100 outline-none transition resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-iso-navy-600 mb-3">Hedef Sektör</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SECTORS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSector(s.value)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition text-left ${sector === s.value ? 'border-iso-navy-800 bg-iso-navy-50 text-iso-navy-800' : 'border-iso-navy-200 hover:border-iso-navy-300 text-iso-navy-500'}`}
                >
                  <span className="text-lg">{s.icon}</span>
                  <span className="text-sm font-medium">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-iso-navy-600 mb-2">PoC Bütçesi (TL)</label>
            <input
              type="text"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Örn: 500.000 TL"
              className="w-full px-4 py-3 rounded-lg border border-iso-navy-200 focus:border-iso-gold-500 focus:ring-2 focus:ring-iso-gold-100 outline-none transition"
            />
          </div>
          <button
            onClick={() => { if (title.trim() && description.trim()) setSubmitted(true); }}
            disabled={!title.trim() || !description.trim()}
            className="w-full bg-iso-navy-800 hover:bg-iso-navy-700 disabled:bg-iso-navy-200 text-white font-bold py-4 px-8 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Cpu className="h-5 w-5" /> Çağrıyı Yayınla
          </button>
        </div>
      </div>
    </div>
  );
}
