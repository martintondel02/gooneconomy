import React from 'react';
import { useMarketStore } from '../store/useMarketStore';

const AssetPanel: React.FC = () => {
  const { assets, marketCaps, prices, activeAsset, setActiveAsset } = useMarketStore();

  const formatLargeNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toFixed(0);
  };

  return (
    <aside className="w-56 terminal-border-r flex flex-col bg-[#08080c] overflow-hidden">
      <div className="h-12 px-4 terminal-border-b flex justify-between items-center bg-white/[0.02]">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Market / Assets</h2>
        <span className="text-[8px] px-1.5 py-0.5 rounded border border-white/5 text-white/20 font-mono">USDT</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {assets.map((asset) => {
          const currentMCap = marketCaps[asset.ticker] || 0;
          const initialMCap = asset.price * asset.supply;
          const isUp = currentMCap >= initialMCap;
          const isActive = activeAsset?.id === asset.id;

          return (
            <div 
              key={asset.id}
              onClick={() => setActiveAsset(asset)}
              className={`px-4 py-3 cursor-pointer transition-all border-l-2 ${isActive ? 'bg-bull/5 border-bull' : 'border-transparent hover:bg-white/[0.02] hover:border-white/10'}`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`text-[11px] font-black tracking-tight ${isActive ? 'text-bull' : 'text-white/80'}`}>
                  {asset.ticker}
                </span>
                <span className={`text-[11px] font-mono font-black ${isUp ? 'text-bull' : 'text-bear'}`}>
                  ${prices[asset.ticker]?.toFixed(prices[asset.ticker] < 1 ? 3 : 2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-bold text-white/10 uppercase tracking-tighter">Cap</span>
                  <span className="text-[9px] font-mono font-bold text-white/30">${formatLargeNumber(currentMCap)}</span>
                </div>
                <div className={`flex items-center gap-0.5 text-[9px] font-black ${isUp ? 'text-bull/60' : 'text-bear/60'}`}>
                  <span className="text-[7px]">{isUp ? '▲' : '▼'}</span>
                  <span>{((Math.abs(currentMCap - initialMCap) / initialMCap) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default AssetPanel;
