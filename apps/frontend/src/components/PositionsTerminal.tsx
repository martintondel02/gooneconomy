import React from 'react';
import { useMarketStore } from '../store/useMarketStore';

const PositionsTerminal: React.FC = () => {
  const { positions, assets, closePosition } = useMarketStore();

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-black/20">
      <div className="flex gap-6 px-6 terminal-border-b bg-white/[0.01]">
        <button className="py-3 text-[10px] font-black uppercase tracking-widest text-cyan-400 border-b-2 border-cyan-400">Active Positions ({positions.length})</button>
        <button className="py-3 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white/50">Trade History</button>
        <button className="py-3 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white/50">Assets</button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        {positions.length === 0 ? (
          <div className="h-full flex items-center justify-center opacity-20">
            <p className="text-xs font-black uppercase tracking-[0.5em]">No Active Trades Found</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 bg-[#0a0a0f] text-[9px] font-black uppercase text-white/30 tracking-tighter">
              <tr>
                <th className="px-6 py-3">Contract</th>
                <th className="px-6 py-3">Side</th>
                <th className="px-6 py-3">Size</th>
                <th className="px-6 py-3">Entry Price</th>
                <th className="px-6 py-3">Mark Price</th>
                <th className="px-6 py-3">Liq. Price</th>
                <th className="px-6 py-3">Unrealized PnL</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[11px] font-mono font-bold divide-y divide-white/5">
              {positions.map((pos) => {
                const asset = assets.find(a => a.id === pos.assetId);
                const isProfit = pos.pnl >= 0;

                return (
                  <tr key={pos.id} className="hover:bg-white/[0.02] group">
                    <td className="px-6 py-4 text-white font-black">{asset?.ticker}USDT</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-sm ${pos.side === 'LONG' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-magenta-500/10 text-magenta-400'}`}>
                        {pos.side} {pos.leverage}x
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/70">${pos.margin.toFixed(2)}</td>
                    <td className="px-6 py-4 text-white/50">${pos.entryPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 text-white/50">${pos.currentPrice?.toFixed(2) || '---'}</td>
                    <td className="px-6 py-4 text-magenta-400/50">${pos.liquidationPrice?.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className={`flex flex-col ${isProfit ? 'text-cyan-400' : 'text-magenta-400'}`}>
                        <span>{isProfit ? '+' : ''}{pos.pnl.toFixed(4)} USDT</span>
                        <span className="text-[9px] opacity-50">({(pos.pnl / pos.margin * 100).toFixed(2)}%)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => closePosition(pos.id)}
                        className="px-4 py-1.5 rounded bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white transition-all uppercase text-[9px] font-black"
                      >
                        Market Close
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PositionsTerminal;
