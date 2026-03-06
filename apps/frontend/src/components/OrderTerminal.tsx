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
    <aside className="w-72 terminal-border-l flex flex-col bg-[#08080c]">
      <div className="h-12 px-4 terminal-border-b flex justify-between items-center bg-white/[0.02]">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Execution Terminal</h2>
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-bull shadow-[0_0_8px_rgba(46,189,133,0.5)]"></div>
           <span className="text-[9px] font-mono font-bold text-bull/70 tracking-tighter uppercase">Cross-Margin</span>
        </div>
      </div>

      <div className="flex-1 p-5 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
        {/* Buy/Sell Toggles */}
        <div className="flex gap-1 p-1 bg-black/40 rounded border border-white/5">
          <button 
            onClick={() => setSide('LONG')}
            className={`flex-1 py-2 text-[10px] font-black rounded transition-all uppercase tracking-widest ${side === 'LONG' ? 'bg-bull text-black shadow-[0_0_15px_rgba(46,189,133,0.2)]' : 'text-white/20 hover:text-white/50 hover:bg-white/5'}`}
          >
            Buy / Long
          </button>
          <button 
            onClick={() => setSide('SHORT')}
            className={`flex-1 py-2 text-[10px] font-black rounded transition-all uppercase tracking-widest ${side === 'SHORT' ? 'bg-bear text-white shadow-[0_0_15px_rgba(255,59,92,0.2)]' : 'text-white/20 hover:text-white/50 hover:bg-white/5'}`}
          >
            Sell / Short
          </button>
        </div>

        {/* Leverage Section */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-0.5">
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Leverage</span>
            <span className="text-[11px] font-mono font-black text-bull">{leverage}x</span>
          </div>
          <div className="px-1">
            <input 
              type="range" min="1" max="50" step="1" 
              value={leverage} 
              onChange={(e) => setLeverage(parseInt(e.target.value))}
              className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-bull"
            />
          </div>
          <div className="flex justify-between gap-1">
            {quickLeverages.map(l => (
              <button 
                key={l}
                onClick={() => setLeverage(l)}
                className={`flex-1 py-1 text-[8px] font-black rounded border transition-all ${leverage === l ? 'bg-white/10 border-white/20 text-white' : 'bg-black/40 border-white/5 text-white/20 hover:border-white/20 hover:text-white/40'}`}
              >
                {l}x
              </button>
            ))}
          </div>
        </div>

        {/* Margin Input */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center px-0.5">
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Order Margin</span>
            <span className="text-[9px] font-mono text-white/30">Avbl: ${user?.cashBalance.toFixed(2)}</span>
          </div>
          <div className="relative group">
            <input 
              type="number" 
              value={margin}
              onChange={(e) => setMargin(parseFloat(e.target.value))}
              className="w-full bg-black/60 border border-white/10 rounded py-3 px-3 text-[13px] font-mono text-white font-bold focus:border-cyan-500/30 transition-all outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-white/10 uppercase tracking-widest">USDT</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-4">
          <button 
            onClick={() => openPosition(side, margin, leverage)}
            className={`w-full py-4 rounded font-black text-[11px] tracking-[0.2em] uppercase active:scale-[0.98] transition-all shadow-lg ${side === 'LONG' ? 'bg-bull text-black shadow-bull/10 hover:shadow-bull/30' : 'bg-bear text-white shadow-bear/10 hover:shadow-bear/30'}`}
          >
            Execute {side === 'LONG' ? 'Buy' : 'Sell'} Order
          </button>
        </div>

        <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-tighter">
            <span className="text-white/20">Estimated Liq.</span>
            <span className="text-bear/70 font-mono italic">CALCULATING...</span>
          </div>
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-tighter">
            <span className="text-white/20">Est. Order Value</span>
            <span className="text-white/60 font-mono">${(margin * leverage).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-tighter">
            <span className="text-white/20">Trading Fee (0.1%)</span>
            <span className="text-white/60 font-mono">${(margin * 0.001).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default OrderTerminal;
