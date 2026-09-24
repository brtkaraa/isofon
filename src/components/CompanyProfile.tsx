import { useState, useEffect } from 'react';
import {
  Building2, Users, MapPin, Globe, Mail, User, Save, Loader2,
  CheckCircle2, FileText, Award,
} from 'lucide-react';
import { supabase, SECTORS, EMPLOYEE_COUNTS, type Company } from '@/lib/supabase';

type Props = {
  company: Company;
};

export default function CompanyProfile({ company }: Props) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [projectCount, setProjectCount] = useState(0);

  const [name, setName] = useState(company.name);
  const [sector, setSector] = useState(company.sector);
  const [employeeCount, setEmployeeCount] = useState(company.employee_count);
  const [city, setCity] = useState(company.city);
  const [website, setWebsite] = useState(company.website);
  const [description, setDescription] = useState(company.description);
  const [contactName, setContactName] = useState(company.contact_name);
  const [contactEmail, setContactEmail] = useState(company.contact_email);

  useEffect(() => {
    const count = async () => {
      const { count } = await supabase.from('projects').select('*', { count: 'exact', head: true });
      setProjectCount(count || 0);
    };
    count();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('companies')
      .update({
        name,
        sector,
        employee_count: employeeCount,
        city,
        website,
        description,
        contact_name: contactName,
        contact_email: contactEmail,
      })
      .eq('id', company.id);

    if (!error) {
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    }
    setLoading(false);
  };

  const sectorLabel = SECTORS.find((s) => s.value === sector)?.label || sector;
  const sectorIcon = SECTORS.find((s) => s.value === sector)?.icon || '📦';

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold mb-2">Firma Profilim</h1>
            <p className="text-gray-500">Firma bilgilerinizi görüntüleyin ve düzenleyin.</p>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="bg-[#ed1c24] hover:bg-[#c91018] text-white font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 transition shadow-md"
            >
              <Building2 className="h-4 w-4" /> Düzenle
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-[#ed1c24] hover:bg-[#c91018] disabled:bg-gray-300 text-white font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 transition shadow-md"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          )}
        </div>

        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-2 text-green-700 animate-fade-in">
            <CheckCircle2 className="h-5 w-5" /> Profil bilgileriniz güncellendi.
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          {/* Banner */}
          <div className="bg-[#fbe8e9] h-24 relative">
            <div className="absolute inset-0 grid-pattern" />
          </div>

          {/* Avatar + Name */}
          <div className="px-8 pb-6 -mt-12">
            <div className="w-20 h-20 rounded-2xl bg-[#ed1c24] flex items-center justify-center text-white text-3xl mb-4 shadow-lg">
              {sectorIcon}
            </div>
            {editing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-2xl font-extrabold border-b-2 border-[#ed1c24] outline-none pb-1 mb-2"
              />
            ) : (
              <h2 className="text-2xl font-extrabold mb-1">{name}</h2>
            )}
            <p className="text-gray-500 text-sm">{sectorLabel} • {city}</p>
          </div>

          {/* Info Grid */}
          <div className="px-8 pb-8 space-y-6">
            {/* Sector */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Sektör</label>
              {editing ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SECTORS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSector(s.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition text-left text-sm ${sector === s.value ? 'border-[#ed1c24] bg-[#fbe8e9] text-[#d71920]' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                    >
                      <span>{s.icon}</span> {s.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-700 flex items-center gap-2"><Building2 className="h-4 w-4 text-gray-400" /> {sectorLabel}</p>
              )}
            </div>

            {/* Employee count */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Çalışan Sayısı</label>
              {editing ? (
                <select
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition bg-white"
                >
                  {EMPLOYEE_COUNTS.map((c) => <option key={c} value={c}>{c} kişi</option>)}
                </select>
              ) : (
                <p className="text-gray-700 flex items-center gap-2"><Users className="h-4 w-4 text-gray-400" /> {employeeCount} kişi</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Şehir</label>
              {editing ? (
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition" />
              ) : (
                <p className="text-gray-700 flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" /> {city}</p>
              )}
            </div>

            {/* Website */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Web Sitesi</label>
              {editing ? (
                <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition" />
              ) : (
                <p className="text-gray-700 flex items-center gap-2"><Globe className="h-4 w-4 text-gray-400" /> {website || 'Belirtilmemiş'}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Firma Açıklaması</label>
              {editing ? (
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition resize-none" />
              ) : (
                <p className="text-gray-700 leading-relaxed">{description || 'Belirtilmemiş'}</p>
              )}
            </div>

            <div className="border-t border-gray-100 pt-6 grid sm:grid-cols-2 gap-6">
              {/* Contact name */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">İletişim Kişisi</label>
                {editing ? (
                  <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition" />
                ) : (
                  <p className="text-gray-700 flex items-center gap-2"><User className="h-4 w-4 text-gray-400" /> {contactName}</p>
                )}
              </div>

              {/* Contact email */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">E-posta</label>
                {editing ? (
                  <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition" />
                ) : (
                  <p className="text-gray-700 flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" /> {contactEmail}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="w-10 h-10 rounded-lg bg-[#fbe8e9] flex items-center justify-center mb-3">
              <FileText className="h-5 w-5 text-[#d71920]" />
            </div>
            <div className="text-2xl font-extrabold">{projectCount}</div>
            <div className="text-sm text-gray-500">Toplam Proje</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-3">
              <Award className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-extrabold">6</div>
            <div className="text-sm text-gray-500">Açık Çağrı</div>
          </div>
        </div>
      </div>
    </div>
  );
}
