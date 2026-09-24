import { LayoutDashboard, FileText, Building2, LogOut, Menu, X, RefreshCw, Megaphone, ChevronDown, Landmark, User, Home } from 'lucide-react';
import { useState, type ReactNode, useRef, useEffect } from 'react';
import type { Company } from '@/lib/supabase';
import BrandLogo from '@/components/BrandLogo';

export type PageId = 'home' | 'funds' | 'reverse-calls' | 'my-calls' | 'projects' | 'profile';

type Props = {
  company: Company | null;
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onExit: () => void;
  children: ReactNode;
};

export default function AppLayout({ company, currentPage, onNavigate, onExit, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navItems: { id: PageId; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'home', label: 'Ana Sayfa', icon: Home },
    { id: 'funds', label: 'Çağrılar', icon: Landmark },
    { id: 'reverse-calls', label: 'Tersine Çağrılar', icon: RefreshCw },
    { id: 'my-calls', label: 'Çağrılarım', icon: Megaphone },
    { id: 'projects', label: 'Projelerim', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#f6f7f9] font-sans text-[#181818]">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white text-[#181818] shadow-md border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button onClick={() => onNavigate('home')} className="flex items-center gap-3 shrink-0">
              <BrandLogo compact />
            </button>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = currentPage === item.id;
                return (
                  <button key={item.id} onClick={() => onNavigate(item.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${active ? 'bg-[#ed1c24] text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-[#181818]'}`}>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Profile dropdown */}
            <div className="hidden lg:flex items-center gap-3 relative" ref={profileRef}>
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition">
                <div className="w-8 h-8 rounded-full bg-[#ed1c24] flex items-center justify-center text-sm font-bold">{company?.name?.charAt(0).toUpperCase() || 'K'}</div>
                <span className="text-sm font-medium max-w-[120px] truncate">{company?.name || 'Profilim'}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white text-[#181818] rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in">
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-bold text-sm truncate">{company?.name || 'Kullanıcı'}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{company?.contact_email || ''}</p>
                  </div>
                  <button onClick={() => { onNavigate('profile'); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-[#f6f7f9] transition">
                    <Building2 className="h-4 w-4 text-gray-500" /> Firma Profilim
                  </button>
                  <button onClick={onExit} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition border-t border-gray-100">
                    <LogOut className="h-4 w-4" /> Çıkış Yap
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-[#181818]">
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentPage === item.id;
              return (
                <button key={item.id} onClick={() => { onNavigate(item.id); setMobileOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${active ? 'bg-[#ed1c24] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <button onClick={() => { onNavigate('profile'); setMobileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition">
                <User className="h-5 w-5" /> Firma Profilim
              </button>
              <button onClick={onExit} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-600 hover:bg-red-50 transition">
                <LogOut className="h-5 w-5" /> Çıkış Yap
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}
