import React, { useState } from 'react';
import { useMarketStore } from '../store/useMarketStore';

const OrderTerminal: React.FC = () => {
  const { activeAsset, openPosition, user } = useMarketStore();
  const [leverage, setLeverage] = useState(5);
  const [margin, setMargin] = useState(100);
  const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG');

  if (!activeAsset) return null;

  const quickLeverages = [1, 5, 10, 25, 50];
  const quickSizes = [25, 50, 75, 100];

  const handleQuickSize = (pct: number) => {
    if (!user) return;
    const amount = (user.cashBalance * pct) / 100;
    setMargin(Math.floor(amount * 100) / 100);
  };

  return (
    <aside className="w-[280px] terminal-border-l flex flex-col bg-[#0e0f14]">
      <div className="h-12 px-6 terminal-border-b flex justify-between items-center bg-white/[0.01]">
        <h2 className="pro-label !text-white/40">Market Order</h2>
        <div className="flex items-center gap-1.5">
           <span className="text-[9px] font-mono font-bold text-kraken uppercase tracking-widest">Isolated</span>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
        {/* Buy/Sell Toggles */}
        <div className="flex gap-2 p-1 bg-white/[0.03] rounded-md border border-white/[0.05]">
          <button 
            onClick={() => setSide('LONG')}
            className={`flex-1 py-2 text-[10px] font-black rounded-md transition-all uppercase tracking-widest ${side === 'LONG' ? 'bg-bull text-[#0d1117] shadow-lg shadow-bull/10' : 'text-white/30 hover:text-white/50'}`}
          >
            Buy
          </button>
          <button 
            onClick={() => setSide('SHORT')}
            className={`flex-1 py-2 text-[10px] font-black rounded-md transition-all uppercase tracking-widest ${side === 'SHORT' ? 'bg-bear text-[#0d1117] shadow-lg shadow-bear/10' : 'text-white/30 hover:text-white/50'}`}
          >
            Sell
          </button>
        </div>

        {/* Margin Input with Quick Sizes */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-0.5">
            <span className="pro-label">Order Margin</span>
            <span className="text-[9px] font-mono text-white/20">USDT</span>
          </div>
          <div className="relative">
            <input 
              type="number" 
              value={margin}
              onChange={(e) => setMargin(parseFloat(e.target.value))}
              className="w-full bg-[#1c1f2a] border border-white/5 rounded-md py-3.5 px-4 text-[13px] font-mono text-white font-bold focus:border-kraken/50 transition-all outline-none"
            />
          </div>
          <div className="flex justify-between gap-1.5">
            {quickSizes.map(pct => (
              <button 
                key={pct}
                onClick={() => handleQuickSize(pct)}
                className="flex-1 py-1.5 bg-white/[0.03] border border-white/[0.05] rounded text-[9px] font-bold text-white/30 hover:bg-white/[0.08] hover:text-white/60 transition-all"
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Leverage Section */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-0.5">
            <span className="pro-label">Leverage</span>
            <span className="text-[11px] font-mono font-black text-white/80">{leverage}x</span>
          </div>
          <div className="px-1 relative">
            <input 
              type="range" min="1" max="50" step="1" 
              value={leverage} 
              onChange={(e) => setLeverage(parseInt(e.target.value))}
              className="w-full h-[2px] bg-white/10 rounded-full appearance-none cursor-pointer accent-kraken"
            />
          </div>
          <div className="flex justify-between gap-1.5">
            {quickLeverages.map(l => (
              <button 
                key={l}
                onClick={() => setLeverage(l)}
                className={`flex-1 py-1.5 text-[9px] font-bold rounded border transition-all ${leverage === l ? 'bg-kraken/10 border-kraken/40 text-kraken' : 'bg-white/[0.01] border-white/[0.05] text-white/20 hover:text-white/40'}`}
              >
                {l}x
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-4">
          <button 
            onClick={() => openPosition(side, margin, leverage)}
            className={`w-full py-4 rounded-md font-black text-[11px] tracking-[0.2em] uppercase active:scale-[0.98] transition-all ${side === 'LONG' ? 'bg-bull text-[#0d1117] hover:brightness-110 shadow-lg shadow-bull/5' : 'bg-bear text-[#0d1117] hover:brightness-110 shadow-lg shadow-bear/5'}`}
          >
            Confirm {side}
          </button>
        </div>

        {/* Order Details */}
        <div className="flex flex-col gap-3 pt-5 border-t border-white/[0.03]">
          <div className="flex justify-between items-center">
            <span className="pro-label !tracking-tight">Available</span>
            <span className="text-white/40 text-[10px] font-mono">${user?.cashBalance.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="pro-label !tracking-tight">Est. Price</span>
            <span className="text-white/40 text-[10px] font-mono">${activeAsset.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="pro-label !tracking-tight">Fee (0.1%)</span>
            <span className="text-white/40 text-[10px] font-mono">${(margin * 0.001).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default OrderTerminal;
