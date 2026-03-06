import React from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { User, Trophy, BarChart3, ShieldCheck, ChevronRight } from 'lucide-react';

const PortfolioView: React.FC = () => {
  const { leaderboard, user, positions } = useMarketStore();

  const unrealizedPnL = positions.reduce((acc, p) => acc + (p.pnl || 0), 0);
  const netWorth = (user?.cashBalance || 0) + unrealizedPnL;

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#08090D] p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Institutional Identity & Overview */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* Identity Card */}
          <section className="col-span-12 lg:col-span-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <ShieldCheck size={120} />
            </div>
            
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-apex to-bull flex items-center justify-center shadow-2xl">
                  <User size={32} className="text-[#08090D]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">{user?.username}</h2>
                  <span className="pro-label !text-apex">Active Terminal Node</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <span className="pro-label !text-[8px]">Global Rank</span>
                  <p className="text-2xl font-mono font-black text-bull">#{leaderboard.find(l => l.username === user?.username)?.rank || '---'}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <span className="pro-label !text-[8px]">Status Pts</span>
                  <p className="text-2xl font-mono font-black text-apex">{user?.statusScore?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Asset Allocation Widget */}
          <section className="col-span-12 lg:col-span-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Financial Position</h2>
                <p className="text-xs text-white/30 font-medium mt-1 uppercase tracking-widest">Real-time Asset Allocation</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-bull/10 border border-bull/20">
                <div className="w-1.5 h-1.5 rounded-full bg-bull animate-pulse"></div>
                <span className="text-[9px] font-bold text-bull uppercase tracking-widest">System Nominal</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-1">
                <span className="pro-label">Net Worth Vault</span>
                <p className="text-5xl font-mono font-black text-white leading-tight">
                  <span className="text-white/20 text-3xl mr-1">$</span>
                  {netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="space-y-1">
                <span className="pro-label">Available Liquidity</span>
                <p className="text-5xl font-mono font-black text-white/60 leading-tight">
                  <span className="text-white/10 text-3xl mr-1">$</span>
                  {user?.cashBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="mt-10">
              <div className="flex justify-between items-end mb-3 px-1">
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Risk vs Liquidity</span>
                <span className="text-[10px] font-mono text-white/40">{((user?.cashBalance / netWorth) * 100).toFixed(1)}% Liquid</span>
              </div>
              <div className="h-3 w-full bg-white/[0.03] rounded-full overflow-hidden flex p-0.5 border border-white/[0.05]">
                <div className="h-full bg-apex rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,163,255,0.3)]" style={{ width: `${(user?.cashBalance / netWorth) * 100}%` }}></div>
                <div className="h-full bg-bull rounded-full transition-all duration-1000 ml-0.5" style={{ width: `${(Math.max(0, unrealizedPnL) / netWorth) * 100}%` }}></div>
              </div>
            </div>
          </section>
        </div>

        {/* Global Hierarchy Widget */}
        <section className="rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden">
          <div className="px-8 py-6 border-b border-white/[0.05] bg-white/[0.01] flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Trophy className="text-bull" size={20} />
              <h2 className="text-lg font-bold text-white tracking-tight uppercase">Global Hierarchy</h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Validated Network Nodes</span>
              <div className="w-px h-4 bg-white/[0.05]"></div>
              <span className="text-[10px] font-mono text-apex font-bold tracking-tighter">TOTAL_GOONS: {leaderboard.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.01]">
                  <th className="px-8 py-4 pro-label !text-white/20">Standing</th>
                  <th className="px-8 py-4 pro-label !text-white/20">Goon Identifier</th>
                  <th className="px-8 py-4 pro-label !text-white/20">Protocol Status</th>
                  <th className="px-8 py-4 pro-label !text-white/20 text-right">Net Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {leaderboard.map((entry) => {
                  const isUser = entry.username === user?.username;
                  return (
                    <tr key={entry.rank} className={`hover:bg-white/[0.01] transition-all group ${isUser ? 'bg-apex/[0.03]' : ''}`}>
                      <td className="px-8 py-6">
                        <span className={`text-lg font-mono font-black ${entry.rank <= 3 ? 'text-bull' : 'text-white/40'}`}>
                          {entry.rank.toString().padStart(2, '0')}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black border transition-all ${isUser ? 'bg-apex text-[#08090D] border-apex' : 'bg-white/[0.03] border-white/[0.05] text-white/60 group-hover:border-white/20'}`}>
                            {entry.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className={`font-bold ${isUser ? 'text-white' : 'text-white/80'}`}>{entry.username}</span>
                            {isUser && <span className="text-[8px] text-apex font-black uppercase tracking-widest mt-0.5">Primary Node</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${entry.netWorth > 10000 ? 'bg-bull shadow-[0_0_8px_rgba(0,255,148,0.4)]' : 'bg-white/20'}`}></div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${entry.netWorth > 10000 ? 'text-bull' : 'text-white/40'}`}>
                            {entry.netWorth > 50000 ? 'WHALE_GOON' : (entry.netWorth > 10000 ? 'ALPHA_GOON' : 'NODE_GOON')}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className={`text-base font-mono font-black ${isUser ? 'text-bull' : 'text-white/90'}`}>
                          ${entry.netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer info */}
        <div className="flex justify-between items-center opacity-20 pt-10 pb-20">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            <span className="text-[9px] font-bold uppercase tracking-[0.4em]">Secured by LiquidGlass Protocol</span>
          </div>
          <span className="text-[9px] font-mono">v0.3.0 // END_OF_LOG</span>
        </div>
      </div>
    </div>
  );
};

export default PortfolioView;
