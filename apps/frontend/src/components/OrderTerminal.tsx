import React, { useState } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { Info, Zap, ChevronDown } from 'lucide-react';

const OrderTerminal: React.FC = () => {
  const { activeAsset, openPosition, user } = useMarketStore();
  const [leverage, setLeverage] = useState(10);
  const [margin, setMargin] = useState(100);
  const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG');

  if (!activeAsset) return null;

  const quickSizes = [25, 50, 75, 100];

  const handleQuickSize = (pct: number) => {
    if (!user) return;
    const amount = (user.cashBalance * pct) / 100;
    setMargin(Math.floor(amount * 100) / 100);
  };

  return (
    <aside className="w-[320px] flex flex-col bg-[#0D0E12] border-l border-white/[0.04]">
      <div className="h-[52px] px-6 border-b border-white/[0.04] flex justify-between items-center bg-white/[0.01]">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-[#3E7BFA]" />
          <span className="pro-label !text-white/60">Limit / Market</span>
        </div>
        <div className="px-2 py-1 rounded bg-[#3E7BFA]/10 border border-[#3E7BFA]/20 flex items-center gap-1.5">
           <span className="text-[9px] font-bold text-[#3E7BFA] uppercase tracking-wider">Isolated</span>
           <ChevronDown size={10} className="text-[#3E7BFA]" />
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
        {/* Execution Type Toggles */}
        <div className="flex gap-2 p-1 bg-white/[0.02] rounded-xl border border-white/[0.05]">
          <button 
            onClick={() => setSide('LONG')}
            className={`flex-1 py-2.5 text-[11px] font-bold rounded-lg transition-all uppercase tracking-widest ${side === 'LONG' ? 'bg-bull text-[#0D0E12] shadow-lg shadow-bull/10' : 'text-white/20 hover:text-white/40'}`}
          >
            Buy / Long
          </button>
          <button 
            onClick={() => setSide('SHORT')}
            className={`flex-1 py-2.5 text-[11px] font-bold rounded-lg transition-all uppercase tracking-widest ${side === 'SHORT' ? 'bg-bear text-[#0D0E12] shadow-lg shadow-bear/10' : 'text-white/20 hover:text-white/40'}`}
          >
            Sell / Short
          </button>
        </div>

        {/* Input Groups */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="pro-label">Order Size</span>
              <span className="text-[10px] font-mono text-white/30">Available: ${user?.cashBalance.toFixed(2)}</span>
            </div>
            <div className="relative group">
              <input 
                type="number" 
                value={margin}
                onChange={(e) => setMargin(parseFloat(e.target.value))}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl py-4 px-5 text-[14px] font-mono text-white font-bold focus:border-[#3E7BFA]/40 focus:bg-[#3E7BFA]/5 transition-all outline-none"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 pro-label !text-white/20">USDT</span>
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
            <div className="flex justify-between items-center">
              <span className="pro-label">Leverage</span>
              <div className="px-2 py-0.5 rounded-full bg-white/[0.05] text-[11px] font-mono font-bold text-[#3E7BFA]">{leverage}x</div>
            </div>
            <div className="px-1 relative h-6 flex items-center">
              <div className="absolute w-full h-[2px] bg-white/[0.05] rounded-full"></div>
              <input 
                type="range" min="1" max="50" step="1" 
                value={leverage} 
                onChange={(e) => setLeverage(parseInt(e.target.value))}
                className="w-full h-[2px] bg-transparent rounded-full appearance-none cursor-pointer accent-[#3E7BFA] relative z-10"
              />
            </div>
            <div className="flex justify-between text-[9px] font-bold text-white/10 uppercase tracking-tighter px-1">
              <span>1x</span>
              <span>10x</span>
              <span>25x</span>
              <span>50x</span>
            </div>
          </div>
        </div>

        {/* Dynamic Execution Button */}
        <div className="mt-auto pt-4">
          <button 
            onClick={() => openPosition(side, margin, leverage)}
            className={`w-full py-4.5 rounded-xl font-bold text-[13px] tracking-widest uppercase transition-all shadow-xl active:scale-[0.98] border border-white/5 ${side === 'LONG' ? 'bg-bull text-[#0D0E12] shadow-bull/5 hover:brightness-110' : 'bg-bear text-[#0D0E12] shadow-bear/5 hover:brightness-110'}`}
          >
            Execute {side}
          </button>
        </div>

        {/* Detailed Stats Overlay */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2.5">
          <div className="flex justify-between items-center text-[10px]">
            <div className="flex items-center gap-1.5 opacity-40 uppercase font-bold tracking-tight">
              <Info size={10} />
              <span>Est. Liquidation</span>
            </div>
            <span className="text-bear/60 font-mono font-bold">---</span>
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span className="opacity-40 uppercase font-bold tracking-tight">Total Exposure</span>
            <span className="text-white/60 font-mono font-bold">${(margin * leverage).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span className="opacity-40 uppercase font-bold tracking-tight">Trading Fee</span>
            <span className="text-white/60 font-mono font-bold">${(margin * 0.001).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default OrderTerminal;
