import React, { useState } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { Lock, User, ArrowRight, Github } from 'lucide-react';

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
    <div className="flex items-center justify-center min-h-screen bg-[#050508] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-magenta-500/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md p-8 glass-panel relative z-10 border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black italic tracking-tighter text-2xl text-black shadow-[0_0_30px_rgba(0,243,255,0.3)] mb-4">G</div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">
            Goon<span className="text-cyan-400">Economy</span>
          </h1>
          <p className="text-[10px] text-white/30 font-mono tracking-widest uppercase mt-2">Professional Degenerate Terminal v0.0.1</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Terminal ID</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-lg py-3 pl-10 pr-4 text-sm font-mono focus:border-cyan-500/50 focus:outline-none transition-all"
                placeholder="USERNAME"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Access Key</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-lg py-3 pl-10 pr-4 text-sm font-mono focus:border-cyan-500/50 focus:outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded bg-bear/10 border border-bear/20 text-bear text-[10px] font-bold uppercase tracking-tight">
              Error: {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-black py-3 rounded-lg flex items-center justify-center gap-2 transition-all uppercase tracking-tighter group"
          >
            {loading ? 'Processing...' : (isLogin ? 'Initialize Session' : 'Create Credentials')}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-4">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] font-black text-white/40 hover:text-cyan-400 transition-colors uppercase tracking-widest"
          >
            {isLogin ? "Don't have an ID? Register Terminal" : "Already have an ID? Authenticate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
