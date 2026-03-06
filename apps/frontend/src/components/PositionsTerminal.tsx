import React, { useState } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { History, Activity, AlertCircle } from 'lucide-react';

const PositionsTerminal: React.FC = () => {
  const { positions, trades, closePosition, assets } = useMarketStore();
  const [activeTab, setActiveTab] = useState<'POSITIONS' | 'HISTORY'>('POSITIONS');

  const getTicker = (assetId: string) => assets.find(a => a.id === assetId)?.ticker || assetId;

  return (
    <div className="flex-1 flex flex-col bg-[#08090D] overflow-hidden border-t border-white/[0.04]">
      {/* Tabbed Header */}
      <div className="h-[42px] px-6 border-b border-white/[0.04] flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-8 h-full">
          <button 
            onClick={() => setActiveTab('POSITIONS')}
            className={`flex items-center gap-2 h-full px-1 border-b-2 transition-all ${activeTab === 'POSITIONS' ? 'border-apex text-white' : 'border-transparent text-white/20 hover:text-white/40'}`}
          >
            <Activity size={14} />
            <span className="pro-label !text-inherit">Active Nodes</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold font-mono ${activeTab === 'POSITIONS' ? 'bg-apex/10 text-apex' : 'bg-white/5 text-white/20'}`}>
              {positions.length}
            </span>
          </button>
          
          <button 
            onClick={() => setActiveTab('HISTORY')}
            className={`flex items-center gap-2 h-full px-1 border-b-2 transition-all ${activeTab === 'HISTORY' ? 'border-apex text-white' : 'border-transparent text-white/20 hover:text-white/40'}`}
          >
            <History size={14} />
            <span className="pro-label !text-inherit">Trade Archive</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold font-mono ${activeTab === 'HISTORY' ? 'bg-apex/10 text-apex' : 'bg-white/5 text-white/20'}`}>
              {trades.length}
            </span>
          </button>
        </div>
        
        <div className="flex items-center gap-4 opacity-20">
           <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
             <div className="w-1 h-1 rounded-full bg-bull shadow-[0_0_8px_rgba(0,255,148,0.4)]"></div>
             Engine v0.4.0
           </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        {activeTab === 'POSITIONS' ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="px-6 py-2.5 pro-label !text-[9px]">Instrument</th>
                <th className="px-6 py-2.5 pro-label !text-[9px]">Side / LVG</th>
                <th className="px-6 py-2.5 pro-label !text-[9px]">Net Size</th>
                <th className="px-6 py-2.5 pro-label !text-[9px]">Entry / Liq.</th>
                <th className="px-6 py-2.5 pro-label !text-[9px] text-right">Unrealized PnL</th>
                <th className="px-6 py-2.5 pro-label !text-[9px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {positions.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-apex/40"></div>
                      <span className="text-[12px] font-bold text-white/90">{getTicker(p.assetId)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className={`text-[11px] font-bold uppercase tracking-tight ${p.side === 'LONG' ? 'text-bull' : 'text-bear'}`}>
                        {p.side}
                      </span>
                      <span className="text-[10px] font-mono font-medium text-white/20">{p.leverage}x</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-mono font-bold text-white/70">${(p.margin * p.leverage).toFixed(2)}</span>
                      <span className="text-[10px] font-mono text-white/10">${p.margin.toFixed(2)} Margin</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-mono text-white/50">${p.entryPrice.toFixed(2)}</span>
                      <span className="text-[10px] font-mono text-bear/40 italic">LIQ. ${p.liquidationPrice.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end gap-0.5">
                      <span className={`text-[12px] font-mono font-bold ${p.pnl >= 0 ? 'text-bull' : 'text-bear'}`}>
                        {p.pnl >= 0 ? '+' : ''}{p.pnl.toFixed(2)}
                      </span>
                      <span className={`text-[10px] font-mono font-medium ${p.pnl >= 0 ? 'text-bull/30' : 'text-bear/30'}`}>
                        {((p.pnl / p.margin) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => closePosition(p.id)}
                      className="px-4 py-1.5 text-[10px] font-bold bg-white/[0.03] border border-white/[0.05] hover:bg-bear/10 hover:text-bear hover:border-bear/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 uppercase tracking-widest active:scale-95"
                    >
                      Close
                    </button>
                  </td>
                </tr>
              ))}
              {positions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-5">
                      <Activity size={32} />
                      <span className="text-[10px] font-bold uppercase tracking-[0.5em]">No Active Deployments</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.01]">
                <th className="px-6 py-2.5 pro-label !text-[9px]">Time</th>
                <th className="px-6 py-2.5 pro-label !text-[9px]">Asset</th>
                <th className="px-6 py-2.5 pro-label !text-[9px]">Type</th>
                <th className="px-6 py-2.5 pro-label !text-[9px]">Price</th>
                <th className="px-6 py-2.5 pro-label !text-[9px] text-right">PnL (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {trades.map((t) => (
                <tr key={t.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-4 text-[10px] font-mono text-white/30">
                    {new Date(t.timestamp).toLocaleString([], { hour12: false, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 font-bold text-white/70">{getTicker(t.assetId)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${t.type === 'BUY' ? 'bg-bull/5 border-bull/20 text-bull' : 'bg-bear/5 border-bear/20 text-bear'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-white/50">${t.priceAtExecution.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-mono font-bold ${t.pnl > 0 ? 'text-bull' : (t.pnl < 0 ? 'text-bear' : 'text-white/20')}`}>
                      {t.pnl !== 0 ? (t.pnl > 0 ? '+' : '') + t.pnl.toFixed(2) : '--'}
                    </span>
                  </td>
                </tr>
              ))}
              {trades.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-5">
                      <History size={32} />
                      <span className="text-[10px] font-bold uppercase tracking-[0.5em]">No Historical Data Found</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PositionsTerminal;
