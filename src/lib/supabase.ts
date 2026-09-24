import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Project = {
  id: string;
  title: string;
  description: string;
  sector: string;
  trl_level: number;
  status: string;
  created_at: string;
  selected_fund_id: string | null;
};

export type Fund = {
  id: string;
  name: string;
  provider: string;
  type: string;
  budget: string;
  min_trl: number;
  max_trl: number;
  sectors: string[];
  description: string;
  code: string;
  application_url: string;
  deadline: string;
  duration: string;
  max_budget_per_project: string;
  support_rate: string;
  eligibility: string[];
  required_docs: string[];
  technical_scope: string;
  status: string;
};

export type Company = {
  id: string;
  name: string;
  sector: string;
  employee_count: string;
  city: string;
  website: string;
  description: string;
  contact_name: string;
  contact_email: string;
  created_at: string;
};

export const SECTORS = [
  { value: 'yazilim', label: 'Yazılım & Bilişim', icon: '💻' },
  { value: 'imalat', label: 'İleri İmalat', icon: '🏭' },
  { value: 'biyoteknoloji', label: 'Biyoteknoloji', icon: '🧬' },
  { value: 'enerji', label: 'Enerji & Çevre', icon: '⚡' },
  { value: 'savunma', label: 'Savunma Sanayi', icon: '🛡️' },
  { value: 'tarim', label: 'Tarım Teknolojileri', icon: '🌾' },
];

export const EMPLOYEE_COUNTS = [
  '1-10',
  '11-50',
  '51-250',
  '251-500',
  '500+',
];

export type ReverseCall = {
  id: string;
  project_id: string;
  title: string;
  summary: string;
  requested_budget: string;
  investment_type: string;
  target_sectors: string[];
  min_trl: number;
  status: string;
  created_at: string;
  documents: string[];
};

export type ViewRequest = {
  id: string;
  reverse_call_id: string;
  requester_name: string;
  requester_company: string;
  requester_email: string;
  message: string;
  status: string;
  created_at: string;
};

export type ProjectNotification = {
  id: string;
  project_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

export type CompanyCall = {
  id: string;
  company_id: string;
  title: string;
  description: string;
  sector: string;
  budget: string;
  duration: string;
  deadline: string;
  eligibility: string[];
  technical_scope: string;
  status: string;
  created_at: string;
};

export type ProjectDraft = {
  id: string;
  project_id: string;
  fund_id: string | null;
  fund_name: string;
  fund_provider: string;
  draft_content: Record<string, unknown>;
  documents: string[];
  created_at: string;
};

export const FUND_TYPE_LABELS: Record<string, string> = {
  kamu: 'Kamu Fonu',
  ozel_sektor: 'Özel Sektör (PoC)',
  ab: 'AB Fonu',
};

export const INVESTMENT_TYPES = [
  { value: 'hisse', label: 'Hisse (Özkaynak)', icon: '📊' },
  { value: 'geri_odemeli', label: 'Geri Ödemeli', icon: '🔄' },
  { value: 'hibe', label: 'Hibe', icon: '🎁' },
  { value: 'poc', label: 'PoC (Konsept Kanıtlama)', icon: '🔬' },
];

export const INVESTMENT_TYPE_LABELS: Record<string, string> = {
  hisse: 'Hisse (Özkaynak)',
  geri_odemeli: 'Geri Ödemeli',
  hibe: 'Hibe',
  poc: 'PoC (Konsept Kanıtlama)',
};
