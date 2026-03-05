import React from 'react';
import { useMarketStore } from '../store/useMarketStore';

const PortfolioView: React.FC = () => {
  const { leaderboard, user, positions } = useMarketStore();

  const unrealizedPnL = positions.reduce((acc, p) => acc + (p.pnl || 0), 0);
  const netWorth = (user?.cashBalance || 0) + unrealizedPnL;

  return (
    <div className="flex-1 p-8 flex flex-col gap-8 overflow-hidden">
      <div className="grid grid-cols-12 gap-8">
        {/* User Stats Card */}
        <section className="col-span-4 glass-panel p-8 flex flex-col gap-6">
          <h2 className="text-xl font-black italic tracking-tighter uppercase text-white/50">Your Identity</h2>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold text-white/30 uppercase tracking-widest">Username</p>
            <p className="text-3xl font-black text-white">{user?.username}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold text-white/30 uppercase tracking-widest">Global Rank</p>
            <p className="text-4xl font-black text-cyan-400">#{leaderboard.find(l => l.username === user?.username)?.rank || '---'}</p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold text-white/30 uppercase tracking-widest">Status Score</p>
            <p className="text-2xl font-black text-yellow-400">{user?.statusScore?.toLocaleString()} PTS</p>
          </div>
        </section>

        {/* Wealth Breakdown */}
        <section className="col-span-8 glass-panel p-8 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-black italic tracking-tighter uppercase text-white/50">Financial Performance</h2>
            <div className="px-4 py-1 glass-panel bg-cyan-500/10 border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase">Liquid Economy</div>
          </div>
          
          <div className="grid grid-cols-2 gap-8 mt-8">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Total Net Worth</p>
              <p className="text-5xl font-black text-white">${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Liquid Cash</p>
              <p className="text-5xl font-black text-white/70">${user?.cashBalance?.toLocaleString()}</p>
            </div>
          </div>

          <div className="h-2 w-full bg-white/5 rounded-full mt-8 overflow-hidden flex">
            <div className="h-full bg-cyan-400" style={{ width: `${(user?.cashBalance / netWorth) * 100}%` }}></div>
            <div className="h-full bg-yellow-400" style={{ width: `${(unrealizedPnL / netWorth) * 100}%` }}></div>
          </div>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <span className="text-[10px] font-bold text-white/30 uppercase">Cash</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-[10px] font-bold text-white/30 uppercase">Active Risk</span>
            </div>
          </div>
        </section>
      </div>

      {/* Leaderboard Section */}
      <section className="flex-1 glass-panel flex flex-col overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-black italic tracking-tighter uppercase text-white/50">Global Hierarchy</h2>
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">The Top 1% of Goons</span>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-black/20 backdrop-blur-md z-10">
              <tr className="text-[10px] font-black uppercase text-white/30 tracking-widest">
                <th className="px-8 py-4">Rank</th>
                <th className="px-8 py-4">Goon Name</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Net Worth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leaderboard.map((entry) => (
                <tr key={entry.rank} className={`hover:bg-white/[0.02] transition-colors ${entry.username === user?.username ? 'bg-cyan-500/5' : ''}`}>
                  <td className="px-8 py-6 font-mono text-cyan-400 font-black">#{entry.rank}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-xs font-black">
                        {entry.username.charAt(0)}
                      </div>
                      <span className="font-bold">{entry.username}</span>
                      {entry.username === user?.username && <span className="text-[8px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-black border border-cyan-500/30 uppercase ml-2">YOU</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${entry.statusScore > 400 ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10' : 'border-white/20 text-white/50 bg-white/5'}`}>
                      {entry.statusScore > 400 ? 'GOLDEN GOON' : 'SILVER GOON'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right font-mono font-black text-white/80">
                    ${entry.netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default PortfolioView;
