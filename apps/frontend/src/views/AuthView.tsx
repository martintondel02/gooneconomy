import React, { useState } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { Lock, User, ArrowRight, Activity } from 'lucide-react';

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
      {/* Institutional Auth Card */}
      <div className="w-full max-w-[360px] p-10 rounded-xl border border-white/[0.05] bg-[#11131A] relative z-10 shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-6">
            <Activity size={24} className="text-apex" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mb-2">
            GOON<span className="text-white/50 font-medium">ECONOMY</span>
          </h1>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em]">Terminal Authorization</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="pro-label px-1">Network ID</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <User size={14} className="text-white/20 group-focus-within:text-apex transition-colors" />
              </div>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#08090D] border border-white/[0.05] rounded-lg py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/10 focus:border-apex/30 focus:bg-white/[0.02] transition-all outline-none"
                placeholder="Identifier"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="pro-label px-1">Access Key</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Lock size={14} className="text-white/20 group-focus-within:text-apex transition-colors" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#08090D] border border-white/[0.05] rounded-lg py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/10 focus:border-apex/30 focus:bg-white/[0.02] transition-all outline-none"
                placeholder="Passphrase"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-bear/5 border border-bear/10 text-bear text-[10px] font-bold uppercase tracking-widest rounded-lg text-center">
              Error: {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-apex hover:bg-apex/90 disabled:opacity-50 text-[#08090D] font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all uppercase tracking-widest text-[11px] shadow-lg shadow-apex/10"
          >
            {loading ? 'Authenticating...' : (isLogin ? 'Connect Node' : 'Register Node')}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/[0.05] flex flex-col items-center gap-4">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="pro-label hover:text-white transition-colors cursor-pointer"
          >
            {isLogin ? "Provision New Node Instead" : "Authenticate Existing Node"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
