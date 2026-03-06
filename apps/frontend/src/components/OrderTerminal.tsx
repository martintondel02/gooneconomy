import React, { useState } from 'react';
import { useMarketStore } from '../store/useMarketStore';

const OrderTerminal: React.FC = () => {
  const { activeAsset, openPosition, user } = useMarketStore();
  const [leverage, setLeverage] = useState(5);
  const [margin, setMargin] = useState(100);
  const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG');

  if (!activeAsset) return null;

  const quickLeverages = [1, 5, 10, 25, 50];

  return (
    <aside className="w-[300px] terminal-border-l flex flex-col bg-[#0d1117]">
      <div className="h-12 px-6 terminal-border-b flex justify-between items-center bg-white/[0.01]">
        <h2 className="pro-label italic opacity-40">Execution Protocol</h2>
        <div className="flex items-center gap-1.5">
           <div className="w-1.5 h-1.5 rounded-full bg-bull/60 shadow-[0_0_8px_rgba(16,185,129,0.2)]"></div>
           <span className="text-[9px] font-mono font-bold text-bull/40 uppercase tracking-tighter">Live_Cross</span>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
        {/* Buy/Sell Toggles */}
        <div className="flex gap-2 p-1 bg-white/[0.02] rounded-md border border-white/[0.05]">
          <button 
            onClick={() => setSide('LONG')}
            className={`flex-1 py-2 text-[10px] font-black rounded-md transition-all uppercase tracking-widest ${side === 'LONG' ? 'bg-bull/10 text-bull border border-bull/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : 'text-white/20 hover:text-white/40'}`}
          >
            Buy
          </button>
          <button 
            onClick={() => setSide('SHORT')}
            className={`flex-1 py-2 text-[10px] font-black rounded-md transition-all uppercase tracking-widest ${side === 'SHORT' ? 'bg-bear/10 text-bear border border-bear/20 shadow-[0_0_15px_rgba(239,68,68,0.05)]' : 'text-white/20 hover:text-white/40'}`}
          >
            Sell
          </button>
        </div>

        {/* Leverage Section */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-0.5">
            <span className="pro-label">Position Leverage</span>
            <span className="text-[11px] font-mono font-black text-bull/80">{leverage}x</span>
          </div>
          <div className="px-1 relative">
            <input 
              type="range" min="1" max="50" step="1" 
              value={leverage} 
              onChange={(e) => setLeverage(parseInt(e.target.value))}
              className="w-full h-[2px] bg-white/5 rounded-full appearance-none cursor-pointer accent-bull"
            />
          </div>
          <div className="flex justify-between gap-1.5">
            {quickLeverages.map(l => (
              <button 
                key={l}
                onClick={() => setLeverage(l)}
                className={`flex-1 py-1 text-[8px] font-black rounded border transition-all ${leverage === l ? 'bg-white/5 border-white/20 text-white' : 'bg-white/[0.01] border-white/[0.03] text-white/20 hover:text-white/40'}`}
              >
                {l}x
              </button>
            ))}
          </div>
        </div>

        {/* Margin Input */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-0.5">
            <span className="pro-label">Order Margin</span>
            <span className="text-[9px] font-mono text-white/20 font-medium">Avbl: ${user?.cashBalance.toFixed(2)}</span>
          </div>
          <div className="relative">
            <input 
              type="number" 
              value={margin}
              onChange={(e) => setMargin(parseFloat(e.target.value))}
              className="w-full bg-white/[0.02] border border-white/5 rounded-md py-3.5 px-4 text-[13px] font-mono text-white font-bold focus:border-bull/30 transition-all outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-white/10 tracking-[0.2em]">USDT</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-4">
          <button 
            onClick={() => openPosition(side, margin, leverage)}
            className={`w-full py-4 rounded-md font-black text-[11px] tracking-[0.2em] uppercase active:scale-[0.98] transition-all border ${side === 'LONG' ? 'bg-bull text-[#0d1117] border-bull/20 shadow-lg shadow-bull/5 hover:bg-bull/90' : 'bg-bear text-[#0d1117] border-bear/20 shadow-lg shadow-bear/5 hover:bg-bear/90'}`}
          >
            Execute {side === 'LONG' ? 'Long' : 'Short'}
          </button>
        </div>

        <div className="flex flex-col gap-2.5 pt-5 border-t border-white/[0.03]">
          <div className="flex justify-between items-center">
            <span className="pro-label !tracking-tight">Est. Liquidation</span>
            <span className="text-bear/40 text-[10px] font-mono font-bold italic">ANALYZING...</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="pro-label !tracking-tight">Total Exposure</span>
            <span className="pro-value text-white/40 font-mono">${(margin * leverage).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="pro-label !tracking-tight">Trading Fee</span>
            <span className="pro-value text-white/40 font-mono">${(margin * 0.001).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default OrderTerminal;
