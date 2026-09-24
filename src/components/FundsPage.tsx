import { useState, useEffect, useRef } from 'react';
import {
  Landmark, Building2, Globe, Award, ArrowRight, Loader2,
  Calendar, Clock, CircleDollarSign, TrendingUp, Search,
  AlertCircle, Megaphone, ChevronDown, X,
} from 'lucide-react';
import { supabase, FUND_TYPE_LABELS, SECTORS, type Fund, type CompanyCall } from '@/lib/supabase';

type Props = {
  onSelectFund: (fund: Fund) => void;
};

type CallItem =
  | { kind: 'fund'; data: Fund }
  | { kind: 'company'; data: CompanyCall };

const fundTypeIcons: Record<string, typeof Landmark> = {
  kamu: Landmark,
  ozel_sektor: Building2,
  ab: Globe,
};

const fundTypeColors: Record<string, { bg: string; text: string; badge: string }> = {
  kamu: { bg: 'bg-[#fbe8e9]', text: 'text-[#d71920]', badge: 'bg-[#f3f3f3] text-gray-600' },
  ozel_sektor: { bg: 'bg-amber-50', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
  ab: { bg: 'bg-cyan-50', text: 'text-cyan-600', badge: 'bg-cyan-100 text-cyan-700' },
  company: { bg: 'bg-blue-50', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
};

const typeFilterOptions = [
  { value: 'all', label: 'Tüm türler' },
  { value: 'kamu', label: 'Kamu fonları' },
  { value: 'ozel_sektor', label: 'Özel sektör' },
  { value: 'ab', label: 'AB fonları' },
  { value: 'company', label: 'Şirket çağrıları' },
];

const statusFilterOptions = [
  { value: 'all', label: 'Tüm durumlar' },
  { value: 'open', label: 'Başvuruya açık' },
  { value: 'upcoming', label: 'Başvuruya kapalı' },
  { value: 'ending', label: 'Yakında bitecek' },
];

const getDeadlineDate = (deadline: string | null | undefined): Date | null => {
  if (!deadline) return null;
  const parts = deadline.split(/[./-]/).map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  const [first, second, third] = parts;
  const date = first > 31 ? new Date(first, second - 1, third) : new Date(third, second - 1, first);
  return Number.isNaN(date.getTime()) ? null : date;
};

const statusLabels: Record<string, string> = {
  open: 'Açık',
  upcoming: 'Yakında',
  ending: 'Bitiyor',
};

const statusBadgeColors: Record<string, string> = {
  open: 'bg-green-100 text-green-700',
  upcoming: 'bg-gray-200 text-gray-600',
  ending: 'bg-red-100 text-red-700',
};

const getCallStatus = (item: CallItem): 'open' | 'upcoming' | 'ending' => {
  const raw = item.kind === 'fund' ? item.data : item.data;
  const dbStatus = raw.status;
  const deadline = raw.deadline;
  const lower = (deadline || '').toLowerCase();
  const isTextClosed = lower.includes('kapalı') || lower.includes('bekleniyor') || lower.includes('bilgi yok');
  const now = new Date();

  if (dbStatus && dbStatus !== 'open') return 'upcoming';
  if (isTextClosed) return 'upcoming';

  const deadlineDate = getDeadlineDate(deadline);
  if (deadlineDate && deadlineDate < now) return 'upcoming';
  if (deadlineDate && deadlineDate >= now && deadlineDate.getTime() - now.getTime() <= 30 * 24 * 60 * 60 * 1000) return 'ending';

  return 'open';
};

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

export default function FundsPage({ onSelectFund }: Props) {
  const [items, setItems] = useState<CallItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    const [fundsRes, companyCallsRes] = await Promise.all([
      supabase.from('funds').select('*').order('created_at', { ascending: false }),
      supabase.from('company_calls').select('*').order('created_at', { ascending: false }),
    ]);

    const fundItems: CallItem[] = (fundsRes.data as Fund[] | null)?.map((f) => ({ kind: 'fund', data: f })) || [];
    const companyItems: CallItem[] = (companyCallsRes.data as CompanyCall[] | null)?.map((c) => ({ kind: 'company', data: c })) || [];
    setItems([...fundItems, ...companyItems]);
    setLoading(false);
  };

  const filtered = items.filter((item) => {
    const type = item.kind === 'fund' ? item.data.type : 'company';
    if (filter !== 'all' && type !== filter) return false;
    if (statusFilter !== 'all' && getCallStatus(item) !== statusFilter) return false;
    const sectors = item.kind === 'fund' ? item.data.sectors : [item.data.sector];
    if (sectorFilter !== 'all' && !sectors.includes(sectorFilter)) return false;
    const name = item.kind === 'fund' ? item.data.name : item.data.title;
    const provider = item.kind === 'fund' ? item.data.provider : '';
    if (search && !name.toLowerCase().includes(search.toLowerCase()) && !provider.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-2 text-[#181818]">Çağrılar</h1>
          <p className="text-gray-500">Başvuruya açık tüm fon, hibe ve açık inovasyon çağrılarını burada inceleyin.</p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8">
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Çağrı veya kurum ara..."
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
              value={filter}
              onChange={setFilter}
            />
            <FilterDropdown
              label="Sektör"
              options={[{ value: 'all', label: 'Tüm sektörler' }, ...SECTORS.map((s) => ({ value: s.value, label: s.label }))]}
              value={sectorFilter}
              onChange={setSectorFilter}
            />
            {(statusFilter !== 'all' || filter !== 'all' || sectorFilter !== 'all' || search !== '') && (
              <button
                onClick={() => { setStatusFilter('all'); setFilter('all'); setSectorFilter('all'); setSearch(''); }}
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
            <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aramanıza uygun çağrı bulunamadı.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item) => {
              if (item.kind === 'company') {
                const call = item.data;
                const sec = SECTORS.find((s) => s.value === call.sector);
                const c = fundTypeColors.company;
                return (
                  <article
                    key={call.id}
                    className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#ed1c24]/30 hover:shadow-lg cursor-pointer"
                    onClick={() => onSelectFund(call as unknown as Fund)}
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Megaphone className="h-5 w-5" /></div>
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">Şirket Çağrısı</span>
                    {(() => { const st = getCallStatus(item); return <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${statusBadgeColors[st]}`}>{statusLabels[st]}</span>; })()}
                    </div>
                    <h3 className="text-lg font-extrabold leading-snug text-[#202020]">{call.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">Açık İnovasyon</p>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-500">{call.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
                      {call.budget && <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md"><CircleDollarSign className="h-3 w-3" /> {call.budget}</span>}
                      {call.duration && <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md"><Clock className="h-3 w-3" /> {call.duration}</span>}
                      {call.deadline && <span className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-md"><Calendar className="h-3 w-3" /> {call.deadline}</span>}
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-4 border-t border-gray-100 pt-5">
                      <div className="flex flex-wrap gap-1">
                        {sec && <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md font-medium">{sec.icon} {sec.label}</span>}
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ed1c24] transition group-hover:gap-2.5">Detay <ArrowRight className="h-3.5 w-3.5" /></span>
                    </div>
                  </article>
                );
              }

              const fund = item.data;
              const Icon = fundTypeIcons[fund.type] || Award;
              const c = fundTypeColors[fund.type] || fundTypeColors.kamu;
              return (
                <article
                  key={fund.id}
                  className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#ed1c24]/30 hover:shadow-lg cursor-pointer"
                  onClick={() => onSelectFund(fund)}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${c.bg} ${c.text}`}><Icon className="h-5 w-5" /></div>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${c.badge}`}>{FUND_TYPE_LABELS[fund.type]}</span>
                    {(() => { const st = getCallStatus(item); return <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${statusBadgeColors[st]}`}>{statusLabels[st]}</span>; })()}
                  </div>
                  <h3 className="text-lg font-extrabold leading-snug text-[#202020]">{fund.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{fund.provider}</p>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-500">{fund.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
                    {fund.max_budget_per_project && <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md"><CircleDollarSign className="h-3 w-3" /> {fund.max_budget_per_project}</span>}
                    {fund.support_rate && <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md"><TrendingUp className="h-3 w-3" /> {fund.support_rate}</span>}
                    {fund.duration && <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md"><Clock className="h-3 w-3" /> {fund.duration}</span>}
                    {fund.deadline && <span className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-md"><Calendar className="h-3 w-3" /> {fund.deadline}</span>}
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-4 border-t border-gray-100 pt-5">
                    <div className="flex flex-wrap gap-1">
                      {fund.sectors.slice(0, 2).map((sec) => {
                        const s = SECTORS.find((s) => s.value === sec);
                        return s ? <span key={sec} className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md font-medium">{s.icon} {s.label}</span> : null;
                      })}
                    </div>
                    <button className="inline-flex items-center gap-1.5 rounded-md bg-[#ed1c24] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#c91018]">Fonu İncele <ArrowRight className="h-3.5 w-3.5" /></button>
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
