import { useState } from 'react';
import { ArrowRight, Loader2, Mail, Lock, User, Building2, ChevronLeft } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { supabase } from '@/lib/supabase';

type Props = {
  onAuthSuccess: () => void;
  onBack: () => void;
};

export default function AuthScreen({ onAuthSuccess, onBack }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Lütfen e-posta ve şifre alanlarını doldurun.');
      return;
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'register') {
        const { error: signUpError } = await supabase.auth.signUp({ email: email.trim(), password });
        if (signUpError) throw signUpError;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (signInError) throw signInError;
      }
      onAuthSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bir hata oluştu.';
      if (message.includes('Invalid login')) {
        setError('E-posta veya şifre hatalı.');
      } else if (message.includes('already registered') || message.includes('User already registered')) {
        setError('Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.');
      } else if (message.includes('Email rate limit')) {
        setError('Çok fazla deneme yapıldı. Lütfen biraz bekleyin.');
      } else {
        setError('İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9] flex flex-col">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-[#181818] transition text-sm">
          <ChevronLeft className="h-4 w-4" /> Ana Sayfa
        </button>
        <BrandLogo compact />
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#fbe8e9] mb-4">
              {mode === 'login' ? <Lock className="h-8 w-8 text-[#d71920]" /> : <Building2 className="h-8 w-8 text-[#d71920]" />}
            </div>
            <h1 className="text-2xl font-extrabold text-[#181818] mb-2">{mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}</h1>
            <p className="text-sm text-gray-500">{mode === 'login' ? 'Hesabınıza giriş yaparak devam edin.' : 'Yeni bir hesap oluşturun ve başlayın.'}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex bg-[#f6f7f9] rounded-lg p-1 mb-6">
              <button onClick={() => { setMode('login'); setError(null); }} className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition ${mode === 'login' ? 'bg-[#ed1c24] text-white shadow-sm' : 'text-gray-500'}`}>Giriş Yap</button>
              <button onClick={() => { setMode('register'); setError(null); }} className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition ${mode === 'register' ? 'bg-[#ed1c24] text-white shadow-sm' : 'text-gray-500'}`}>Kayıt Ol</button>
            </div>

            <div className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2"><User className="h-4 w-4 text-gray-400" /> Ad Soyad</label>
                  <input type="text" placeholder="Adınız Soyadınız" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition" />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" /> E-posta</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@firma.com.tr" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2"><Lock className="h-4 w-4 text-gray-400" /> Şifre</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#ed1c24] focus:ring-2 focus:ring-[#fbe8e9] outline-none transition" />
              </div>

              {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">{error}</div>}

              <button onClick={handleSubmit} disabled={loading} className="w-full bg-[#ed1c24] hover:bg-[#c91018] disabled:bg-gray-300 text-white font-bold py-3.5 px-8 rounded-lg flex items-center justify-center gap-2 transition shadow-lg shadow-[#ed1c24]/20">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                {loading ? 'İşleniyor...' : mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 mt-6">
              {mode === 'login' ? 'Hesabınız yok mu? ' : 'Zaten hesabınız var mı? '}
              <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }} className="text-[#d71920] font-semibold hover:underline">
                {mode === 'login' ? 'Kayıt olun' : 'Giriş yapın'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
