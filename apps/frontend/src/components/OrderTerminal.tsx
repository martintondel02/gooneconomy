import React, { useState } from 'react';
import { useMarketStore } from '../store/useMarketStore';

const OrderTerminal: React.FC = () => {
  const { activeAsset, openPosition, user } = useMarketStore();
  const [leverage, setLeverage] = useState(5);
  const [margin, setMargin] = useState(100);

  if (!activeAsset) return null;

  return (
    <aside className="w-80 terminal-border-l flex flex-col bg-black/20">
      <div className="p-4 terminal-border-b flex justify-between items-center">
        <h2 className="text-xs font-black uppercase tracking-widest text-white/50">Execution Terminal</h2>
        <span className="text-[10px] font-mono text-cyan-400">SPOT / CROSS</span>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-6">
        {/* Buy/Sell Toggles */}
        <div className="flex gap-1 p-1 bg-black/40 rounded-lg border border-white/5">
          <button className="flex-1 py-2 text-[10px] font-black rounded bg-[#2ebd85]/20 text-[#2ebd85] border border-[#2ebd85]/30">BUY</button>
          <button className="flex-1 py-2 text-[10px] font-black rounded text-white/30 hover:bg-white/5">SELL</button>
        </div>

        {/* Leverage Slider */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Leverage</span>
            <span className="text-[10px] font-mono text-bull">{leverage}x</span>
          </div>
          <input 
            type="range" min="1" max="25" step="1" 
            value={leverage} 
            onChange={(e) => setLeverage(parseInt(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-bull"
          />
        </div>

        {/* Margin Input */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Margin</span>
            <span className="text-[9px] font-mono text-white/40">Avbl: ${user?.cashBalance.toFixed(2)}</span>
          </div>
          <div className="relative">
            <input 
              type="number" 
              value={margin}
              onChange={(e) => setMargin(parseFloat(e.target.value))}
              className="w-full bg-black/40 border border-white/10 rounded p-3 text-xs font-mono text-white focus:outline-none focus:border-bull/50"
            />
            <span className="absolute right-3 top-3 text-[9px] font-bold text-white/20 uppercase">USDT</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-auto">
          <button 
            onClick={() => openPosition('LONG', margin, leverage)}
            className="w-full py-3.5 rounded bg-[#2ebd85] text-[#0b0e11] font-black text-xs tracking-widest hover:bg-[#32d993] transition-all shadow-[0_4px_15px_rgba(46,189,133,0.2)]"
          >
            BUY / LONG
          </button>
          <button 
            onClick={() => openPosition('SHORT', margin, leverage)}
            className="w-full py-3.5 rounded bg-[#f6465d] text-white font-black text-xs tracking-widest hover:bg-[#ff5c6d] transition-all shadow-[0_4px_15px_rgba(246,70,93,0.2)]"
          >
            SELL / SHORT
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-tighter">
            <span className="text-white/30">Est. Liquidation</span>
            <span className="text-magenta-400 font-mono">---</span>
          </div>
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-tighter">
            <span className="text-white/30">Trade Fee (0.1%)</span>
            <span className="text-white/50 font-mono">${(margin * 0.001).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default OrderTerminal;
