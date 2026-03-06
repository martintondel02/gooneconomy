import React, { useState } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { Lock, User, ArrowRight } from 'lucide-react';

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
    <div className="flex items-center justify-center min-h-screen bg-[#050508] relative overflow-hidden font-mono">
      {/* Matrix-style overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#1af_1px,transparent_1px)] [background-size:20px_20px]"></div>
      
      <div className="w-full max-w-sm p-8 glass-panel border-[#1af]/10 bg-black/80 relative z-10 backdrop-blur-2xl">
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 rounded bg-cyan-500 flex items-center justify-center font-black italic text-black mb-4 shadow-[0_0_20px_rgba(6,182,212,0.5)]">G</div>
          <h1 className="text-xl font-black tracking-tighter uppercase italic text-white">
            GOON<span className="text-cyan-400">ECONOMY</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
             <div className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse"></div>
             <span className="text-[9px] text-cyan-500/50 font-bold uppercase tracking-[0.2em]">System Status: Online</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
               <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">User Identity</label>
               <span className="text-[8px] text-white/10 italic">#SECURE_CHANNEL</span>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <User size={14} className="text-white/20 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-white/5 rounded py-3 pl-10 pr-4 text-xs text-white placeholder:text-white/10 focus:border-cyan-500/40 focus:bg-cyan-500/5 transition-all outline-none"
                placeholder="AUTHENTICATION_ID"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
             <div className="flex justify-between items-center px-1">
               <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Access Protocol</label>
               <span className="text-[8px] text-white/10 italic">#ENCRYPTED</span>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Lock size={14} className="text-white/20 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0a0a0f] border border-white/5 rounded py-3 pl-10 pr-4 text-xs text-white placeholder:text-white/10 focus:border-cyan-500/40 focus:bg-cyan-500/5 transition-all outline-none"
                placeholder="PASSPHRASE"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/5 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-tight leading-relaxed">
              [CRITICAL_FAILURE]: {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-black py-3.5 rounded flex items-center justify-center gap-2 transition-all uppercase tracking-tighter group text-xs shadow-[0_4px_12px_rgba(6,182,212,0.2)]"
          >
            {loading ? 'INITIALIZING...' : (isLogin ? 'Establish Session' : 'Deploy Credentials')}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-10 flex flex-col items-center gap-4">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] font-bold text-white/20 hover:text-cyan-400 transition-colors uppercase tracking-widest border-b border-transparent hover:border-cyan-400/30 pb-0.5"
          >
            {isLogin ? "> Request New Terminal Access" : "> Authenticate Existing Terminal"}
          </button>
          
          <div className="text-[8px] text-white/5 font-bold uppercase tracking-[0.3em] mt-2">
            Goon OS v0.0.1 // Authorization Required
          </div>
        </div>
      </div>
      
      {/* Decorative Scanner Line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.5)] animate-scan z-50"></div>
    </div>
  );
};

export default AuthView;
