import React, { useState } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

const AuthView: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useMarketStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = isLogin 
      ? await login(username, password)
      : await register(username, password);

    if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#08090D] relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00A3FF]/5 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00FF94]/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="w-full max-w-[380px] p-10 rounded-2xl border border-white/[0.06] bg-white/[0.01] backdrop-blur-[32px] relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-apex to-bull flex items-center justify-center mb-6 shadow-xl">
            <ShieldCheck size={28} className="text-[#08090D]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
            Goon<span className="text-bull font-medium">Economy</span>
          </h1>
          <p className="text-[11px] font-medium text-white/30 uppercase tracking-[0.2em]">Institutional Grade Terminal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="pro-label px-1">Access Identity</label>
            <div className="relative group">
              {/* FIXED ICON POSITIONING */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                <User size={16} className="text-white/20 group-focus-within:text-bull transition-colors" />
              </div>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.05] rounded-lg py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/10 focus:border-bull/40 focus:bg-bull/5 transition-all outline-none"
                placeholder="Unique Identifier"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="pro-label px-1">Security Key</label>
            <div className="relative group">
              {/* FIXED ICON POSITIONING */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                <Lock size={16} className="text-white/20 group-focus-within:text-bull transition-colors" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.05] rounded-lg py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/10 focus:border-bull/40 focus:bg-bull/5 transition-all outline-none"
                placeholder="Passphrase"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-bear/5 border border-bear/10 text-bear text-[10px] font-semibold uppercase tracking-wider rounded-lg text-center leading-relaxed">
              Authentication Error: {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className={`w-full bg-bull hover:bg-bull/90 disabled:opacity-50 text-[#08090D] font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-[12px] shadow-lg shadow-bull/10 active:scale-[0.98]`}
          >
            {loading ? 'Initializing...' : (isLogin ? 'Connect Terminal' : 'Register Access')}
            <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>

        <div className="mt-10 flex flex-col items-center gap-4">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="pro-label hover:text-white transition-colors cursor-pointer"
          >
            {isLogin ? "Request New Access Node" : "Authenticate Session"}
          </button>
          
          <div className="flex items-center gap-2 mt-2 opacity-20">
            <div className="w-1 h-1 rounded-full bg-white animate-pulse"></div>
            <span className="text-[8px] font-bold uppercase tracking-[0.4em]">Node Status: Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
