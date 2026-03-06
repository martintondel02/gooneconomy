import React from 'react';
import { useMarketStore } from '../store/useMarketStore';

const PositionsTerminal: React.FC = () => {
  const { positions, closePosition } = useMarketStore();

  return (
    <div className="flex-1 flex flex-col bg-[#0d1117] overflow-hidden terminal-border-t">
      <div className="h-10 px-6 terminal-border-b flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-bull">Active Orders</span>
            <span className="px-1.5 py-0.5 rounded-full bg-bull/10 text-bull text-[9px] font-mono font-bold">{positions.length}</span>
          </div>
          <span className="pro-label hover:text-white/40 cursor-pointer transition-colors">History</span>
          <span className="pro-label hover:text-white/40 cursor-pointer transition-colors">Execution Logs</span>
        </div>
        
        <div className="flex items-center gap-4">
           <span className="text-[8px] font-mono text-white/5 uppercase tracking-[0.2em]">Risk: Nominal</span>
           <div className="w-px h-3 bg-white/[0.03]"></div>
           <span className="text-[8px] font-mono text-white/5 uppercase tracking-[0.2em]">Engine: v0.1.0</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="terminal-border-b bg-white/[0.01]">
              <th className="px-6 py-2 pro-label">Instrument</th>
              <th className="px-6 py-2 pro-label">Side / LVG</th>
              <th className="px-6 py-2 pro-label">Exposure / Margin</th>
              <th className="px-6 py-2 pro-label">Entry / Liq.</th>
              <th className="px-6 py-2 pro-label text-right">Unrealized PnL</th>
              <th className="px-6 py-2 pro-label text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {positions.map((p) => (
              <tr key={p.id} className="hover:bg-white/[0.01] transition-colors group">
                <td className="px-6 py-3.5">
                  <span className="text-[11px] font-bold text-white/80">{p.assetId}</span>
                </td>
                <td className="px-6 py-3.5">
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-[10px] font-bold uppercase tracking-tight ${p.side === 'LONG' ? 'text-bull' : 'text-bear'}`}>
                      {p.side}
                    </span>
                    <span className="text-[9px] font-mono text-white/20">{p.leverage}x</span>
                  </div>
                </td>
                <td className="px-6 py-3.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-mono font-bold text-white/60">${(p.margin * p.leverage).toFixed(2)}</span>
                    <span className="text-[9px] font-mono text-white/10">${p.margin.toFixed(2)}</span>
                  </div>
                </td>
                <td className="px-6 py-3.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-mono text-white/50">${p.entryPrice.toFixed(2)}</span>
                    <span className="text-[9px] font-mono text-bear/30">Liq. ${p.liquidationPrice.toFixed(2)}</span>
                  </div>
                </td>
                <td className="px-6 py-3.5 text-right">
                  <div className="flex flex-col items-end gap-0.5">
                    <span className={`text-[11px] font-mono font-black ${p.pnl >= 0 ? 'text-bull' : 'text-bear'}`}>
                      {p.pnl >= 0 ? '+' : ''}{p.pnl.toFixed(2)}
                    </span>
                    <span className={`text-[9px] font-mono font-bold ${p.pnl >= 0 ? 'text-bull/30' : 'text-bear/30'}`}>
                      {((p.pnl / p.margin) * 100).toFixed(2)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-3.5 text-right">
                  <button 
                    onClick={() => closePosition(p.id)}
                    className="px-3 py-1.5 text-[9px] font-bold border border-white/[0.03] bg-white/[0.03] hover:bg-bear/10 hover:text-bear hover:border-bear/20 rounded-md transition-all opacity-20 group-hover:opacity-100 uppercase tracking-widest"
                  >
                    Close
                  </button>
                </td>
              </tr>
            ))}
            {positions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-10">
                    <div className="w-10 h-10 rounded-full border border-dashed border-white flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-[0.4em]">Empty Deployment Stack</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PositionsTerminal;
