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
        <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
          <button className="flex-1 py-2 text-xs font-black rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">OPEN</button>
          <button className="flex-1 py-2 text-xs font-black rounded-md text-white/30 hover:bg-white/5">CLOSE</button>
        </div>

        {/* Leverage Slider */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-white/30 uppercase">Leverage</span>
            <span className="text-xs font-mono text-cyan-400">{leverage}x</span>
          </div>
          <input 
            type="range" min="1" max="25" step="1" 
            value={leverage} 
            onChange={(e) => setLeverage(parseInt(e.target.value))}
            className="w-full accent-cyan-400"
          />
          <div className="flex justify-between text-[8px] font-mono text-white/20">
            <span>1x</span><span>5x</span><span>10x</span><span>15x</span><span>20x</span><span>25x</span>
          </div>
        </div>

        {/* Margin Input */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-white/30 uppercase">Order Margin</span>
            <span className="text-[10px] font-mono text-white/50">AVBL: ${user?.cashBalance.toFixed(2)}</span>
          </div>
          <div className="relative">
            <input 
              type="number" 
              value={margin}
              onChange={(e) => setMargin(parseFloat(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm font-mono focus:outline-none focus:border-cyan-500/50"
            />
            <span className="absolute right-3 top-3 text-[10px] font-bold text-white/20 uppercase">USD</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-auto">
          <button 
            onClick={() => openPosition('LONG', margin, leverage)}
            className="w-full py-4 rounded-xl bg-cyan-500 text-black font-black text-sm tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(0,243,255,0.2)]"
          >
            BUY / LONG
          </button>
          <button 
            onClick={() => openPosition('SHORT', margin, leverage)}
            className="w-full py-4 rounded-xl bg-magenta-500 text-white font-black text-sm tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,0,255,0.2)]"
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
