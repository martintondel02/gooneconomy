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
    <aside className="w-80 terminal-border-l flex flex-col bg-black/20">
      <div className="h-14 p-4 terminal-border-b flex justify-between items-center bg-white/[0.02]">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-white/40">Execution Terminal</h2>
        <span className="text-[10px] font-mono text-bull">CROSS</span>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
        {/* Buy/Sell Toggles */}
        <div className="flex gap-1 p-1 bg-black/40 rounded-lg border border-white/5">
          <button 
            onClick={() => setSide('LONG')}
            className={`flex-1 py-2.5 text-[11px] font-black rounded-md transition-all uppercase tracking-widest ${side === 'LONG' ? 'bg-bull/20 text-bull border border-bull/30' : 'text-white/20 hover:text-white/40'}`}
          >
            Buy
          </button>
          <button 
            onClick={() => setSide('SHORT')}
            className={`flex-1 py-2.5 text-[11px] font-black rounded-md transition-all uppercase tracking-widest ${side === 'SHORT' ? 'bg-bear/20 text-bear border border-bear/30' : 'text-white/20 hover:text-white/40'}`}
          >
            Sell
          </button>
        </div>

        {/* Leverage Section */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-white/30 uppercase tracking-widest">Leverage</span>
            <span className="text-[12px] font-mono font-black text-bull">{leverage}x</span>
          </div>
          <div className="px-1">
            <input 
              type="range" min="1" max="50" step="1" 
              value={leverage} 
              onChange={(e) => setLeverage(parseInt(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-bull"
            />
          </div>
          <div className="flex justify-between gap-1">
            {quickLeverages.map(l => (
              <button 
                key={l}
                onClick={() => setLeverage(l)}
                className={`flex-1 py-1 text-[9px] font-black rounded border transition-all ${leverage === l ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/5 text-white/20 hover:text-white/40'}`}
              >
                {l}x
              </button>
            ))}
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
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-[14px] font-mono text-white font-bold focus:outline-none focus:border-bull/50 transition-all"
            />
            <span className="absolute right-4 top-4 text-[10px] font-black text-white/20 uppercase">USDT</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-auto pt-4">
          <button 
            onClick={() => openPosition(side, margin, leverage)}
            className={`w-full py-4 rounded-xl font-black text-xs tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-lg ${side === 'LONG' ? 'bg-bull text-[#08080c] shadow-bull/20' : 'bg-bear text-white shadow-bear/20'}`}
          >
            {side === 'LONG' ? 'BUY / LONG' : 'SELL / SHORT'}
          </button>
        </div>

        <div className="flex flex-col gap-2 opacity-50">
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-tighter">
            <span className="text-white/40">Est. Liquidation</span>
            <span className="text-bear font-mono">---</span>
          </div>
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-tighter">
            <span className="text-white/40">Market Fee (0.1%)</span>
            <span className="text-white font-mono">${(margin * 0.001).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default OrderTerminal;
