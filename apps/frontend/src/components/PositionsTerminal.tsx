import React from 'react';
import { useMarketStore } from '../store/useMarketStore';

const PositionsTerminal: React.FC = () => {
  const { positions, assets, closePosition } = useMarketStore();

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-black/20">
      <div className="flex gap-6 px-6 terminal-border-b bg-white/[0.01]">
        <button className="py-3 text-[10px] font-black uppercase tracking-widest text-bull border-b-2 border-bull">Active Positions ({positions.length})</button>
        <button className="py-3 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white/50">Trade History</button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        {positions.length === 0 ? (
          <div className="h-full flex items-center justify-center opacity-10">
            <p className="text-[10px] font-black uppercase tracking-[0.5em]">No Active Trades Found</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 bg-[#0b0e11] text-[9px] font-black uppercase text-white/30 tracking-widest">
              <tr>
                <th className="px-6 py-3">Contract</th>
                <th className="px-6 py-3">Side</th>
                <th className="px-6 py-3">Margin</th>
                <th className="px-6 py-3">Entry Price</th>
                <th className="px-6 py-3">Mark Price</th>
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
                      <span className={`px-2 py-0.5 rounded-sm text-[9px] ${pos.side === 'LONG' ? 'bg-bull/10 text-bull' : 'bg-bear/10 text-bear'}`}>
                        {pos.side} {pos.leverage}x
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/70">${pos.margin.toFixed(2)}</td>
                    <td className="px-6 py-4 text-white/40">${pos.entryPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 text-white/40">${pos.currentPrice?.toFixed(2) || '---'}</td>
                    <td className="px-6 py-4">
                      <div className={`flex flex-col ${isProfit ? 'text-bull' : 'text-bear'}`}>
                        <span>{isProfit ? '+' : ''}{pos.pnl.toFixed(4)} USDT</span>
                        <span className="text-[9px] opacity-50">({(pos.pnl / pos.margin * 100).toFixed(2)}%)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => closePosition(pos.id)}
                        className="px-3 py-1 rounded bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all uppercase text-[9px] font-black"
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
