import React from 'react';
import { useMarketStore } from '../store/useMarketStore';

const AssetPanel: React.FC = () => {
  const { assets, marketCaps, prices, activeAsset, setActiveAsset } = useMarketStore();

  const formatLargeNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    return (num / 1e3).toFixed(1) + 'K';
  };

  return (
    <aside className="w-64 terminal-border-r flex flex-col bg-black/20 overflow-hidden">
      <div className="p-4 terminal-border-b flex justify-between items-center bg-white/[0.02]">
        <h2 className="text-xs font-black uppercase tracking-widest text-white/50">Markets</h2>
        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/30 font-mono">USD</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {assets.map((asset) => {
          const currentMCap = marketCaps[asset.ticker] || 0;
          const initialMCap = asset.price * asset.supply;
          const isUp = currentMCap >= initialMCap;

          return (
            <div 
              key={asset.id}
              onClick={() => setActiveAsset(asset)}
              className={`px-4 py-3 cursor-pointer transition-all border-l-2 ${activeAsset?.id === asset.id ? 'bg-white/5 border-bull' : 'border-transparent hover:bg-white/[0.03]'}`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-black tracking-tight">{asset.ticker}</span>
                <span className={`text-[11px] font-mono font-bold ${isUp ? 'text-bull' : 'text-bear'}`}>
                  ${prices[asset.ticker]?.toFixed(prices[asset.ticker] < 1 ? 4 : 2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">MCAP: ${formatLargeNumber(currentMCap)}</span>
                <span className={`text-[8px] font-bold ${isUp ? 'text-bull' : 'text-bear'}`}>
                  {isUp ? '+' : ''}{((Math.abs(currentMCap - initialMCap) / initialMCap) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default AssetPanel;
