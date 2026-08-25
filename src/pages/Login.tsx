import { useState } from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (isSignUp) {
        await signUp(email, password);
        setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
        setIsSignUp(false);
        setEmail('');
        setPassword('');
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07111f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1e3a5f] shadow-lg shadow-blue-950/30">
              <ShieldCheck className="h-8 w-8 text-[#c9a227]" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white">SUAREZ AI AUDIT</h1>
          <p className="mt-2 text-sm text-slate-500">Plataforma inteligente de auditoría y riesgo</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0b1928] p-8">
          <h2 className="text-xl font-bold text-white mb-6">{isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Correo electrónico</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-white focus:border-[#c9a227] focus:outline-none transition" placeholder="tu@email.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-1.5">Contraseña</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-white focus:border-[#c9a227] focus:outline-none transition" placeholder="••••••••" minLength={6} />
            </div>
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              </div>
            )}
            {success && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                  <p className="text-sm text-emerald-400">{success}</p>
                </div>
              </div>
            )}
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-[#c9a227] py-3 text-[#07111f] font-bold hover:bg-[#d8b43c] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-[#07111f] border-t-transparent rounded-full" />
                  {isSignUp ? 'Creando cuenta...' : 'Iniciando sesión...'}
                </>
              ) : (isSignUp ? 'Crear cuenta' : 'Iniciar sesión')}
            </button>
            <div className="text-center">
              <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(null); setSuccess(null); }} className="text-sm text-slate-500 hover:text-[#c9a227] transition">
                {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
