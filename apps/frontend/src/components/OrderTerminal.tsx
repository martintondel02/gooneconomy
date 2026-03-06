import React, { useState, useEffect } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { Info, Zap, ChevronDown, DollarSign } from 'lucide-react';

const OrderTerminal: React.FC = () => {
  const { activeAsset, openPosition, user, prices } = useMarketStore();
  const [leverage, setLeverage] = useState(10);
  const [margin, setMargin] = useState(100);
  const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG');

  if (!activeAsset) return null;

  const currentPrice = prices[activeAsset.ticker] || activeAsset.price;
  const totalExposure = margin * leverage;
  const assetQuantity = totalExposure / currentPrice;

  const quickSizes = [25, 50, 75, 100];

  const handleQuickSize = (pct: number) => {
    if (!user) return;
    const amount = (user.cashBalance * pct) / 100;
    setMargin(Math.floor(amount * 100) / 100);
  };

  return (
    <aside className="w-[320px] flex flex-col bg-[#08090D] border-l border-white/[0.05]">
      <div className="h-[52px] px-6 border-b border-white/[0.05] flex justify-between items-center bg-white/[0.01]">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-apex" />
          <span className="pro-label !text-white/60 tracking-widest">Execution Engine</span>
        </div>
        <div className="px-2 py-1 rounded bg-apex/10 border border-apex/20 flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,163,255,0.1)]">
           <span className="text-[9px] font-bold text-apex uppercase tracking-wider">Isolated</span>
           <ChevronDown size={10} className="text-apex" />
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
        {/* Buy/Sell Toggles - HIGH VIBRANCY */}
        <div className="flex gap-2 p-1 bg-white/[0.02] rounded-xl border border-white/[0.05]">
          <button 
            onClick={() => setSide('LONG')}
            className={`flex-1 py-2.5 text-[11px] font-black rounded-lg transition-all uppercase tracking-widest ${side === 'LONG' ? 'btn-bull-active' : 'text-white/20 hover:text-white/40'}`}
          >
            Buy / Long
          </button>
          <button 
            onClick={() => setSide('SHORT')}
            className={`flex-1 py-2.5 text-[11px] font-black rounded-lg transition-all uppercase tracking-widest ${side === 'SHORT' ? 'btn-bear-active' : 'text-white/20 hover:text-white/40'}`}
          >
            Sell / Short
          </button>
        </div>

        {/* Input Groups */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <span className="pro-label">Capital Input (USD)</span>
              <span className="text-[10px] font-mono text-white/30">Available: ${user?.cashBalance.toFixed(2)}</span>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <DollarSign size={14} className="text-white/20 group-focus-within:text-apex transition-colors" />
              </div>
              <input 
                type="number" 
                value={margin}
                onChange={(e) => setMargin(parseFloat(e.target.value) || 0)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-4 pl-10 pr-5 text-[14px] font-mono text-white font-bold focus:border-apex/40 focus:bg-apex/5 transition-all outline-none"
                placeholder="0.00"
              />
            </div>
            <div className="flex justify-between gap-2">
              {quickSizes.map(pct => (
                <button 
                  key={pct}
                  onClick={() => handleQuickSize(pct)}
                  className="flex-1 py-2 bg-white/[0.03] border border-white/[0.05] rounded-lg text-[10px] font-bold text-white/30 hover:bg-white/[0.08] hover:text-white/60 transition-all active:scale-95"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="pro-label">Leverage Multiplier</span>
              <div className="px-2 py-0.5 rounded-full bg-apex/10 text-[11px] font-mono font-black text-apex border border-apex/20 shadow-[0_0_10px_rgba(0,163,255,0.1)]">{leverage}x</div>
            </div>
            <div className="px-1 relative h-6 flex items-center">
              <div className="absolute w-full h-[2px] bg-white/[0.05] rounded-full"></div>
              {/* Custom Styled Slider */}
              <input 
                type="range" min="1" max="50" step="1" 
                value={leverage} 
                onChange={(e) => setLeverage(parseInt(e.target.value))}
                className="w-full h-[2px] bg-transparent rounded-full appearance-none cursor-pointer accent-apex relative z-10 custom-slider"
              />
            </div>
          </div>
        </div>

        {/* Live Exposure Preview - Apex Accent */}
        <div className="p-5 rounded-xl bg-apex/[0.03] border border-apex/10 flex flex-col gap-2 relative overflow-hidden group hover:bg-apex/5 transition-colors">
          <div className="absolute top-0 left-0 w-1 h-full bg-apex/40"></div>
          <span className="pro-label !text-apex/60 !text-[8px] tracking-widest">Total Market Exposure</span>
          <div className="flex justify-between items-end">
            <span className="text-[20px] font-mono font-black text-white leading-none tracking-tighter">${totalExposure.toLocaleString()}</span>
            <span className="text-[10px] font-mono text-white/40 group-hover:text-white/60 transition-colors">≈ {assetQuantity.toFixed(4)} {activeAsset.ticker}</span>
          </div>
        </div>

        {/* Dynamic Execution Button - SOLID COLORS */}
        <div className="mt-auto">
          <button 
            onClick={() => openPosition(side, margin, leverage)}
            className={`w-full py-4.5 rounded-xl font-black text-[14px] tracking-[0.2em] uppercase transition-all active:scale-[0.98] border border-white/10 ${side === 'LONG' ? 'btn-bull-solid' : 'btn-bear-solid'}`}
          >
            Deploy {side}
          </button>
        </div>

        {/* Detailed Stats Overlay */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center text-[10px]">
            <div className="flex items-center gap-1.5 opacity-40 uppercase font-bold tracking-widest">
              <Info size={10} />
              <span>Est. Liq. Price</span>
            </div>
            <span className="text-bear font-mono font-black">
              ${side === 'LONG' ? (currentPrice * (1 - 0.9/leverage)).toFixed(2) : (currentPrice * (1 + 0.9/leverage)).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span className="opacity-40 uppercase font-bold tracking-widest">Required Margin</span>
            <span className="text-white font-mono font-bold">${margin.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span className="opacity-40 uppercase font-bold tracking-widest">Fee (0.1%)</span>
            <span className="text-white font-mono font-bold">${(margin * 0.001).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default OrderTerminal;
