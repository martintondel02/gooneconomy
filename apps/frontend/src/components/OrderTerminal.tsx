import React, { useState } from 'react';
import { useMarketStore } from '../store/useMarketStore';

const OrderTerminal: React.FC = () => {
  const { activeAsset, openPosition, user } = useMarketStore();
  const [leverage, setLeverage] = useState(5);
  const [margin, setMargin] = useState(100);

  if (!activeAsset) return null;

  return (
    <aside className="w-80 terminal-border-l flex flex-col bg-black/20">
      <div className="h-14 p-4 terminal-border-b flex justify-between items-center bg-white/[0.02]">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-white/40">Execution Terminal</h2>
        <span className="text-[10px] font-mono text-bull">CROSS</span>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-8">
        {/* Buy/Sell Toggles */}
        <div className="flex gap-1 p-1 bg-black/40 rounded-lg border border-white/5">
          <button className="flex-1 py-2.5 text-[11px] font-black rounded-md bg-bull/20 text-bull border border-bull/30 uppercase tracking-widest">Open</button>
          <button className="flex-1 py-2.5 text-[11px] font-black rounded-md text-white/30 hover:bg-white/5 uppercase tracking-widest">Close</button>
        </div>

        {/* Leverage Slider */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-white/30 uppercase tracking-widest">Leverage</span>
            <span className="text-[12px] font-mono font-black text-bull">{leverage}x</span>
          </div>
          <div className="px-1">
            <input 
              type="range" min="1" max="25" step="1" 
              value={leverage} 
              onChange={(e) => setLeverage(parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-bull"
            />
          </div>
        </div>

        {/* Safe Zone Spacing */}
        <div className="h-2"></div>

        {/* Margin Input */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-white/30 uppercase tracking-widest">Order Margin</span>
            <span className="text-[10px] font-mono text-white/50">Avbl: ${user?.cashBalance.toFixed(2)}</span>
          </div>
          <div className="relative group">
            <input 
              type="number" 
              value={margin}
              onChange={(e) => setMargin(parseFloat(e.target.value))}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-[13px] font-mono text-white focus:outline-none focus:border-bull/50 transition-all"
            />
            <span className="absolute right-4 top-4 text-[10px] font-black text-white/20 uppercase">USDT</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-auto">
          <button 
            onClick={() => openPosition('LONG', margin, leverage)}
            className="w-full py-4 rounded-xl bg-bull text-[#08080c] font-black text-xs tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(46,189,133,0.25)]"
          >
            BUY / LONG
          </button>
          <button 
            onClick={() => openPosition('SHORT', margin, leverage)}
            className="w-full py-4 rounded-xl bg-bear text-white font-black text-xs tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(255,77,109,0.25)]"
          >
            SELL / SHORT
          </button>
        </div>
      </div>
    </aside>
  );
};

export default OrderTerminal;
