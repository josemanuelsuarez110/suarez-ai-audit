import { type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';

interface LayoutProps { children: ReactNode; }

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  return (
    <div className="min-h-screen bg-[#07111f]">
      <header className="border-b border-white/10 bg-[#07111f]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e3a5f]">
              <span className="text-[#c9a227] font-black text-sm">SA</span>
            </div>
            <div>
              <div className="font-bold text-white text-sm">SUAREZ AI AUDIT</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Plataforma de auditoría</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-[#1e3a5f] flex items-center justify-center">
                <User className="h-4 w-4 text-[#c9a227]" />
              </div>
              <span className="text-sm text-slate-300 hidden sm:block">
                {user?.email?.split('@')[0] || 'Usuario'}
              </span>
            </div>
            <button onClick={signOut} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white transition">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
