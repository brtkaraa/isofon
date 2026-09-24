import { useState, useEffect } from 'react';
import {
  Plus, FileText, Award, Layers, TrendingUp, Loader2,
  Trash2, ArrowRight, Bell, Eye, FileCheck, ChevronDown, ChevronUp,
} from 'lucide-react';
import { supabase, SECTORS, type Project, type ProjectNotification, type ProjectDraft } from '@/lib/supabase';

type Props = {
  onNewProject: () => void;
  onSelectProject: (project: Project) => void;
  onSelectDraft: (project: Project, draft: ProjectDraft) => void;
};

export default function ProjectsPage({ onNewProject, onSelectProject, onSelectDraft }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Record<string, ProjectNotification[]>>({});
  const [drafts, setDrafts] = useState<Record<string, ProjectDraft[]>>({});
  const [showNotifications, setShowNotifications] = useState<string | null>(null);
  const [showDrafts, setShowDrafts] = useState<string | null>(null);

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
      const projs = data as Project[];
      setProjects(projs);
      // Load notifications for each project
      const notifMap: Record<string, ProjectNotification[]> = {};
      const draftMap: Record<string, ProjectDraft[]> = {};
      for (const proj of projs) {
        const [notifsRes, draftsRes] = await Promise.all([
          supabase.from('project_notifications').select('*').eq('project_id', proj.id).order('created_at', { ascending: false }),
          supabase.from('project_drafts').select('*').eq('project_id', proj.id).order('created_at', { ascending: false }),
        ]);
        if (notifsRes.data) notifMap[proj.id] = notifsRes.data as ProjectNotification[];
        if (draftsRes.data) draftMap[proj.id] = draftsRes.data as ProjectDraft[];
      }
      setNotifications(notifMap);
      setDrafts(draftMap);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('projects').delete().eq('id', id);
    setProjects(projects.filter((p) => p.id !== id));
  };

  const handleMarkRead = async (notifId: string, projectId: string) => {
    await supabase.from('project_notifications').update({ read: true }).eq('id', notifId);
    const projNotifs = notifications[projectId] || [];
    setNotifications({
      ...notifications,
      [projectId]: projNotifs.map((n) => (n.id === notifId ? { ...n, read: true } : n)),
    });
  };

  const sectorLabel = (val: string) => SECTORS.find((s) => s.value === val)?.label || val;
  const sectorIcon = (val: string) => SECTORS.find((s) => s.value === val)?.icon || '📦';

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold mb-2">Projelerim</h1>
            <p className="text-slate-500">Ar-Ge projelerinizi yönetin ve fon eşleştirmelerini takip edin.</p>
          </div>
          <button
            onClick={onNewProject}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition shadow-lg shadow-blue-500/20"
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
              blue: 'bg-blue-50 text-blue-600',
              green: 'bg-green-50 text-green-600',
              cyan: 'bg-cyan-50 text-cyan-600',
              amber: 'bg-amber-50 text-amber-600',
            };
            return (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorMap[stat.color]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-2xl font-extrabold">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Projects List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Henüz projeniz yok</h3>
            <p className="text-slate-500 mb-6">İlk Ar-Ge projenizi oluşturun ve yapay zeka ile fon eşleştirin.</p>
            <button
              onClick={onNewProject}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-lg inline-flex items-center gap-2 transition shadow-md"
            >
              <Plus className="h-5 w-5" /> Yeni Proje Oluştur
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow-md border border-slate-100 p-6 hover:shadow-xl transition cursor-pointer group"
                onClick={() => onSelectProject(project)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-lg">
                      {sectorIcon(project.sector)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition">{project.title}</h3>
                      <p className="text-xs text-slate-400">{sectorLabel(project.sector)}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                    className="text-slate-300 hover:text-red-500 transition p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-sm text-slate-500 line-clamp-2 mb-4">{project.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">TRL {project.trl_level}</span>
                    <span className="bg-green-50 text-green-600 text-xs font-bold px-3 py-1 rounded-full">Eşleşti</span>
                    {(drafts[project.id] || []).length > 0 && (
                      <span className="bg-cyan-50 text-cyan-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <FileCheck className="h-3 w-3" /> {(drafts[project.id] || []).length} Taslak
                      </span>
                    )}
                    {(notifications[project.id] || []).filter((n) => !n.read).length > 0 && (
                      <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
                        <Bell className="h-3 w-3" /> {(notifications[project.id] || []).filter((n) => !n.read).length}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(project.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>

                {/* Drafts dropdown */}
                {showDrafts === project.id && (drafts[project.id] || []).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Başvuru Taslakları</div>
                    {(drafts[project.id] || []).map((draft) => (
                      <div
                        key={draft.id}
                        onClick={(e) => { e.stopPropagation(); onSelectDraft(project, draft); }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-cyan-50 border border-cyan-100 hover:bg-cyan-100 hover:border-cyan-300 transition cursor-pointer group/draft"
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-cyan-100">
                          <FileCheck className="h-4 w-4 text-cyan-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-800">{draft.fund_name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{draft.fund_provider}</p>
                          <p className="text-xs text-slate-400 mt-1">{new Date(draft.created_at).toLocaleDateString('tr-TR')}</p>
                          {draft.documents.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {draft.documents.map((doc, di) => (
                                <span key={di} className="text-xs bg-white text-slate-600 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                                  <FileText className="h-3 w-3" /> {doc}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Notifications dropdown */}
                {showNotifications === project.id && (notifications[project.id] || []).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bildirimler</div>
                    {(notifications[project.id] || []).map((notif) => (
                      <div key={notif.id} className={`flex items-start gap-3 p-3 rounded-lg ${notif.read ? 'bg-slate-50' : 'bg-blue-50 border border-blue-100'}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${notif.read ? 'bg-slate-200' : 'bg-blue-100'}`}>
                          <Bell className={`h-4 w-4 ${notif.read ? 'text-slate-400' : 'text-blue-600'}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${notif.read ? 'text-slate-500' : 'text-slate-800'}`}>{notif.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                          <p className="text-xs text-slate-400 mt-1">{new Date(notif.created_at).toLocaleDateString('tr-TR')}</p>
                        </div>
                        {!notif.read && (
                          <button
                            onClick={() => handleMarkRead(notif.id, project.id)}
                            className="text-xs text-blue-600 font-medium hover:underline"
                          >Okundu</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button className="text-sm text-blue-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Fonları Gör <ArrowRight className="h-4 w-4" />
                    </button>
                    {(drafts[project.id] || []).length > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowDrafts(showDrafts === project.id ? null : project.id); }}
                        className="text-sm text-cyan-600 font-medium flex items-center gap-1 hover:text-cyan-700 transition"
                      >
                        <FileCheck className="h-4 w-4" /> {(drafts[project.id] || []).length} Taslak
                        {showDrafts === project.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    )}
                    {(notifications[project.id] || []).length > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowNotifications(showNotifications === project.id ? null : project.id); }}
                        className="text-sm text-slate-500 font-medium flex items-center gap-1 hover:text-slate-700 transition"
                      >
                        <Bell className="h-4 w-4" /> {(notifications[project.id] || []).filter((n) => !n.read).length > 0 ? `${(notifications[project.id] || []).filter((n) => !n.read).length} yeni` : 'Bildirimler'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
