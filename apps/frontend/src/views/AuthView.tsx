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
    <div className="flex items-center justify-center min-h-screen bg-[#0d1117] relative overflow-hidden">
      {/* Sophisticated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_50%)]"></div>
      
      <div className="w-full max-w-[340px] p-8 rounded-xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-3xl relative z-10 shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <div className="w-10 h-10 rounded-md bg-bull flex items-center justify-center font-black italic text-[#0d1117] mb-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]">G</div>
          <h1 className="text-lg font-black tracking-tight uppercase text-white">
            GOON<span className="text-bull/80 font-medium">ECONOMY</span>
          </h1>
          <div className="flex items-center gap-2 mt-2">
             <span className="pro-label !text-[8px] opacity-50 tracking-[0.2em]">Institutional Access Terminal</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="pro-label px-1">Identity Identifier</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <User size={13} className="text-white/20 group-focus-within:text-bull/60 transition-colors" />
              </div>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.05] rounded-md py-2.5 pl-9 pr-4 text-[12px] text-white placeholder:text-white/10 focus:border-bull/30 transition-all outline-none"
                placeholder="ID_SECURE_KEY"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="pro-label px-1">Access Protocol</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Lock size={13} className="text-white/20 group-focus-within:text-bull/60 transition-colors" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.05] rounded-md py-2.5 pl-9 pr-4 text-[12px] text-white placeholder:text-white/10 focus:border-bull/30 transition-all outline-none"
                placeholder="PASSPHRASE"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-bear/5 border border-bear/10 text-bear text-[9px] font-medium uppercase tracking-wider leading-relaxed rounded-md">
              System Error: {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-bull hover:bg-bull/90 disabled:opacity-50 text-[#0d1117] font-black py-3 rounded-md flex items-center justify-center gap-2 transition-all uppercase tracking-wider group text-[11px] shadow-lg shadow-bull/10"
          >
            {loading ? 'Processing...' : (isLogin ? 'Initialize Session' : 'Register Terminal')}
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>

        <div className="mt-10 flex flex-col items-center gap-4">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="pro-label hover:text-bull transition-colors cursor-pointer"
          >
            {isLogin ? "Register New Access" : "Authenticate Existing"}
          </button>
          
          <div className="text-[7px] text-white/5 font-bold uppercase tracking-[0.4em] mt-2">
            Professional Terminal v0.1.0 // Auth Required
          </div>
        </div>
      </div>
      
      {/* Subtle Scan Line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-bull/10 shadow-[0_0_15px_rgba(16,185,129,0.2)] animate-scan z-50"></div>
    </div>
  );
};

export default AuthView;
