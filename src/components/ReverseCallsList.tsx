import { useState, useEffect, useRef } from 'react';
import {
  RefreshCw, ArrowRight, Loader2, Search, AlertCircle,
  CircleDollarSign, TrendingUp, ChevronDown, X,
} from 'lucide-react';
import { supabase, INVESTMENT_TYPE_LABELS, SECTORS, type ReverseCall, type Project } from '@/lib/supabase';

type Props = {
  onSelectReverseCall: (reverseCall: ReverseCall) => void;
};

type ReverseCallWithProject = ReverseCall & { project?: Project | null };

const investmentTypeColors: Record<string, { bg: string; text: string; badge: string }> = {
  hisse: { bg: 'bg-amber-50', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
  geri_odemeli: { bg: 'bg-cyan-50', text: 'text-cyan-600', badge: 'bg-cyan-100 text-cyan-700' },
  hibe: { bg: 'bg-green-50', text: 'text-green-600', badge: 'bg-green-100 text-green-700' },
  poc: { bg: 'bg-[#fbe8e9]', text: 'text-[#d71920]', badge: 'bg-[#f3f3f3] text-gray-600' },
};

const statusBadgeColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  passive: 'bg-gray-200 text-gray-600',
};

const statusLabels: Record<string, string> = {
  active: 'Aktif',
  passive: 'Pasif',
};

const typeFilterOptions = [
  { value: 'all', label: 'Tüm türler' },
  { value: 'hisse', label: 'Hisse' },
  { value: 'geri_odemeli', label: 'Geri Ödemeli' },
  { value: 'hibe', label: 'Hibe' },
  { value: 'poc', label: 'PoC' },
];

const statusFilterOptions = [
  { value: 'all', label: 'Tüm durumlar' },
  { value: 'active', label: 'Aktif' },
  { value: 'passive', label: 'Pasif' },
];

function FilterDropdown({
  label, options, value, onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find((o) => o.value === value);
  const isActive = value !== 'all';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
          isActive ? 'bg-[#ed1c24] text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 shadow-sm'
        }`}
      >
        {isActive ? selected?.label : label}
        <ChevronDown className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 z-20 mt-2 min-w-[200px] rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                opt.value === value ? 'bg-[#fbe8e9] font-semibold text-[#d71920]' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ReverseCallsList({ onSelectReverseCall }: Props) {
  const [reverseCalls, setReverseCalls] = useState<ReverseCallWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadReverseCalls();
  }, []);

  const loadReverseCalls = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reverse_calls')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      setLoading(false);
      return;
    }

    const calls = data as ReverseCall[];
    const projectIds = [...new Set(calls.map((c) => c.project_id))];
    const { data: projectsData } = await supabase
      .from('projects')
      .select('*')
      .in('id', projectIds);

    const projectMap = new Map<string, Project>();
    (projectsData as Project[] | null)?.forEach((p) => projectMap.set(p.id, p));

    const withProjects: ReverseCallWithProject[] = calls.map((c) => ({
      ...c,
      project: projectMap.get(c.project_id) || null,
    }));

    setReverseCalls(withProjects);
    setLoading(false);
  };

  const filtered = reverseCalls.filter((rc) => {
    if (typeFilter !== 'all' && rc.investment_type !== typeFilter) return false;
    if (statusFilter !== 'all' && rc.status !== statusFilter) return false;
    if (sectorFilter !== 'all' && !rc.target_sectors.includes(sectorFilter)) return false;
    if (search && !rc.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-2 text-[#181818]">Tersine Çağrılar</h1>
          <p className="text-gray-500">
            Mevcut çağrılara uymayan projeler için yatırımcılara açılan tersine çağrıları keşfedin. Proje sahipleri yatırım taleplerini burada yayınlar.
          </p>
        </div>

        {/* Info banner */}
        <div className="bg-[#fbe8e9] border border-[#f5d0d3] rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-[#d71920] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-[#a01218]">
            <span className="font-semibold">Tersine Çağrı nedir?</span> — Mevcut fon çağrılarına uymayan projeleriniz için doğrudan yatırımcılara ulaşabileceğiniz bir yatırım talebi ilanıdır. Proje sahipleri bütçe, yatırım tipi ve hedef sektörleri belirterek çağrı oluşturur.
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mb-8">
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tersine çağrı ara..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-sm shadow-sm outline-none transition focus:border-[#ed1c24] focus:ring-2 focus:ring-[#ed1c24]/10"
            />
          </div>

          {/* Active filter chips */}
          <div className="flex flex-wrap items-center gap-2">
            <FilterDropdown
              label="Durum"
              options={statusFilterOptions}
              value={statusFilter}
              onChange={setStatusFilter}
            />
            <FilterDropdown
              label="Tür"
              options={typeFilterOptions}
              value={typeFilter}
              onChange={setTypeFilter}
            />
            <FilterDropdown
              label="Sektör"
              options={[{ value: 'all', label: 'Tüm sektörler' }, ...SECTORS.map((s) => ({ value: s.value, label: s.label }))]}
              value={sectorFilter}
              onChange={setSectorFilter}
            />
            {(typeFilter !== 'all' || statusFilter !== 'all' || sectorFilter !== 'all' || search !== '') && (
              <button
                onClick={() => { setTypeFilter('all'); setStatusFilter('all'); setSectorFilter('all'); setSearch(''); }}
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:bg-gray-200"
              >
                <X className="h-3 w-3" /> Temizle
              </button>
            )}
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 text-[#ed1c24] animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <RefreshCw className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aramanıza uygun tersine çağrı bulunamadı.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((rc) => {
              const c = investmentTypeColors[rc.investment_type] || investmentTypeColors.poc;
              const sectorItems = rc.target_sectors
                .map((sec) => SECTORS.find((s) => s.value === sec))
                .filter(Boolean);
              return (
                <article
                  key={rc.id}
                  className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#ed1c24]/30 hover:shadow-lg cursor-pointer"
                  onClick={() => onSelectReverseCall(rc)}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${c.bg} ${c.text}`}>
                      <RefreshCw className="h-5 w-5" />
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${c.badge}`}>
                        {INVESTMENT_TYPE_LABELS[rc.investment_type] || rc.investment_type}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${statusBadgeColors[rc.status] || statusBadgeColors.passive}`}>
                        {statusLabels[rc.status] || rc.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-extrabold leading-snug text-[#202020] group-hover:text-[#ed1c24] transition">{rc.title}</h3>

                  {rc.project && (
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                      <span className="bg-gray-50 px-2 py-0.5 rounded font-medium">Proje: {rc.project.title}</span>
                      <span className="bg-[#fbe8e9] text-[#d71920] px-2 py-0.5 rounded font-medium">TRL {rc.project.trl_level}</span>
                    </p>
                  )}

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-500">{rc.summary}</p>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
                    {rc.requested_budget && (
                      <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                        <CircleDollarSign className="h-3 w-3" /> {rc.requested_budget}
                      </span>
                    )}
                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                      <TrendingUp className="h-3 w-3" /> Min TRL {rc.min_trl}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-4 border-t border-gray-100 pt-5">
                    <div className="flex flex-wrap gap-1">
                      {sectorItems.slice(0, 2).map((s) => (
                        <span key={s!.value} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md font-medium">
                          {s!.icon} {s!.label}
                        </span>
                      ))}
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ed1c24] transition group-hover:gap-2.5">
                      Detay <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
