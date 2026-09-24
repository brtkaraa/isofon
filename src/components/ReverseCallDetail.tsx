import { useState, useEffect } from 'react';
import {
  ArrowLeft, RefreshCw, CircleDollarSign, TrendingUp, FileText,
  Building2, Users, MapPin, Globe, Mail, User, Clock, Calendar,
  CheckCircle2, XCircle, Loader2, Eye, Send, AlertCircle, Download,
} from 'lucide-react';
import {
  supabase, INVESTMENT_TYPE_LABELS, SECTORS,
  type ReverseCall, type Project, type Company, type ViewRequest,
} from '@/lib/supabase';

type Props = {
  reverseCall: ReverseCall;
  onBack: () => void;
};

export default function ReverseCallDetail({ reverseCall, onBack }: Props) {
  const [project, setProject] = useState<Project | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [viewRequests, setViewRequests] = useState<ViewRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Request form state
  const [reqName, setReqName] = useState('');
  const [reqCompany, setReqCompany] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqMessage, setReqMessage] = useState('');

  useEffect(() => {
    loadData();
  }, [reverseCall]);

  const loadData = async () => {
    setLoading(true);

    // Load project
    const { data: projData } = await supabase
      .from('projects')
      .select('*')
      .eq('id', reverseCall.project_id)
      .maybeSingle();
    if (projData) setProject(projData as Project);

    // Load company
    const { data: compData } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (compData) setCompany(compData as Company);

    // Load view requests
    const { data: reqData } = await supabase
      .from('view_requests')
      .select('*')
      .eq('reverse_call_id', reverseCall.id)
      .order('created_at', { ascending: false });
    if (reqData) setViewRequests(reqData as ViewRequest[]);

    setLoading(false);
  };

  const handleSubmitRequest = async () => {
    if (!reqName.trim() || !reqEmail.trim()) return;
    setSubmitting(true);

    const { error } = await supabase.from('view_requests').insert({
      reverse_call_id: reverseCall.id,
      requester_name: reqName,
      requester_company: reqCompany,
      requester_email: reqEmail,
      message: reqMessage,
      status: 'pending',
    });

    // Also create a project notification
    if (!error && project) {
      await supabase.from('project_notifications').insert({
        project_id: project.id,
        type: 'view_request',
        title: 'Yeni Görüntüleme Talebi',
        message: `${reqName} (${reqCompany || 'Firma belirtmemiş'}) tersine çağrınızı görüntülemek için talepte bulundu.`,
        read: false,
      });
    }

    setSubmitting(false);
    setSubmitted(true);
    setShowRequestForm(false);
    setTimeout(() => loadData(), 1000);
  };

  const sectorIcons = reverseCall.target_sectors
    .map((sec) => SECTORS.find((s) => s.value === sec))
    .filter(Boolean);

  if (loading) {
    return (
      <div className="p-6 md:p-10 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-[#ed1c24] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition mb-6 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" /> Tersine Çağrılara Geri Dön
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden mb-6">
          <div className="bg-[#181818] text-white p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-[#ed1c24] flex items-center justify-center flex-shrink-0">
                <RefreshCw className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#ed1c24]/20 text-[#ff6b72]">
                    {INVESTMENT_TYPE_LABELS[reverseCall.investment_type]}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-500/20 text-green-400">
                    {reverseCall.status === 'active' ? 'Aktif' : reverseCall.status}
                  </span>
                </div>
                <h1 className="text-2xl font-bold mb-1">{reverseCall.title}</h1>
                <p className="text-gray-400 text-sm">
                  {new Date(reverseCall.created_at).toLocaleDateString('tr-TR')} tarihinde yayınlandı
                </p>
              </div>
            </div>
          </div>

          {/* Key Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-slate-100">
            {[
              { icon: CircleDollarSign, label: 'Talep Edilen Bütçe', value: reverseCall.requested_budget || '-' },
              { icon: TrendingUp, label: 'Minimum TRL', value: `TRL ${reverseCall.min_trl}` },
              { icon: Clock, label: 'Yatırım Tipi', value: INVESTMENT_TYPE_LABELS[reverseCall.investment_type] || '-' },
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

        {/* Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#ed1c24]" /> Yatırım Talebi Özeti
          </h2>
          <p className="text-gray-600 leading-relaxed">{reverseCall.summary}</p>
        </div>

        {/* Target Sectors */}
        {sectorIcons.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
            <h2 className="text-lg font-bold mb-3">Hedef Sektörler</h2>
            <div className="flex flex-wrap gap-2">
              {sectorIcons.map((s) => (
                <span key={s!.value} className="text-sm bg-[#fbe8e9] text-[#d71920] px-3 py-1.5 rounded-lg font-medium">
                  {s!.icon} {s!.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        {reverseCall.documents.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#ed1c24]" /> Yüklenen Belgeler
            </h2>
            <div className="space-y-2">
              {reverseCall.documents.map((doc, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                  <FileText className="h-5 w-5 text-[#ed1c24] flex-shrink-0" />
                  <span className="text-sm text-gray-700 flex-1 truncate">{doc}</span>
                  <Download className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Company Info */}
        {company && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#ed1c24]" /> Firma Bilgileri
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <span className="text-gray-400">Firma:</span>
                  <span className="font-semibold text-gray-700">{company.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span className="text-gray-400">Çalışan:</span>
                  <span className="font-semibold text-gray-700">{company.employee_count} kişi</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="text-gray-400">Şehir:</span>
                  <span className="font-semibold text-gray-700">{company.city}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-slate-400" />
                  <span className="text-gray-400">Web:</span>
                  <span className="font-semibold text-gray-700">{company.website || 'Belirtilmemiş'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-gray-400">İletişim:</span>
                  <span className="font-semibold text-gray-700">{company.contact_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-gray-400">E-posta:</span>
                  <span className="font-semibold text-gray-700">{company.contact_email}</span>
                </div>
              </div>
            </div>
            {company.description && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-sm text-gray-600 leading-relaxed">{company.description}</p>
              </div>
            )}
          </div>
        )}

        {/* Related Project */}
        {project && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#ed1c24]" /> İlişkili Proje
            </h2>
            <div className="bg-[#fbe8e9] rounded-lg p-4">
              <h3 className="font-bold text-[#a01218] mb-1">{project.title}</h3>
              <p className="text-sm text-[#d71920] line-clamp-2 mb-2">{project.description}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-[#ed1c24]/10 text-[#d71920] px-2 py-0.5 rounded-full font-medium">
                  TRL {project.trl_level}
                </span>
                <span className="text-xs bg-[#ed1c24]/10 text-[#d71920] px-2 py-0.5 rounded-full font-medium">
                  {SECTORS.find((s) => s.value === project.sector)?.label || project.sector}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* View Requests */}
        {viewRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#ed1c24]" /> Görüntüleme Talepleri ({viewRequests.length})
            </h2>
            <div className="space-y-3">
              {viewRequests.map((req) => (
                <div key={req.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-semibold text-gray-800">{req.requester_name}</span>
                      {req.requester_company && (
                        <span className="text-sm text-gray-500 ml-2">• {req.requester_company}</span>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      req.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                      req.status === 'approved' ? 'bg-green-50 text-green-600' :
                      'bg-red-50 text-red-600'
                    }`}>
                      {req.status === 'pending' ? 'Beklemede' : req.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{req.requester_email}</p>
                  {req.message && <p className="text-sm text-gray-600">{req.message}</p>}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(req.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success message */}
        {submitted && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-semibold text-green-700">Görüntüleme talebiniz gönderildi!</p>
              <p className="text-xs text-green-600">Firma talebinizi inceleyip size geri dönecek.</p>
            </div>
          </div>
        )}

        {/* Viewing Request Form */}
        {showRequestForm ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 mb-6">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Send className="h-5 w-5 text-[#ed1c24]" /> Görüntüleme Talebi Oluştur
            </h2>
            <p className="text-sm text-gray-500 mb-6">Firma bilgilerini görüntülemek için talebinizi iletin.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ad Soyad *</label>
                <input type="text" value={reqName} onChange={(e) => setReqName(e.target.value)} placeholder="Adınız Soyadınız"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Firma Adı</label>
                <input type="text" value={reqCompany} onChange={(e) => setReqCompany(e.target.value)} placeholder="Yatırımcı firma adı"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">E-posta *</label>
                <input type="email" value={reqEmail} onChange={(e) => setReqEmail(e.target.value)} placeholder="ornek@firma.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mesaj</label>
                <textarea value={reqMessage} onChange={(e) => setReqMessage(e.target.value)} placeholder="Talebinizi kısaca açıklayın..." rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowRequestForm(false)} className="px-6 py-3 rounded-lg border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition">
                  İptal
                </button>
                <button
                  onClick={handleSubmitRequest}
                  disabled={!reqName.trim() || !reqEmail.trim() || submitting}
                  className="flex-1 bg-[#ed1c24] hover:bg-[#c91018] disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition shadow-md"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  {submitting ? 'Gönderiliyor...' : 'Talebi Gönder'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-4">
            <button
              onClick={() => setShowRequestForm(true)}
              className="flex-1 bg-[#ed1c24] hover:bg-[#c91018] text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-[#ed1c24]/20"
            >
              <Eye className="h-5 w-5" /> Görüntüleme Talebi Oluştur
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
