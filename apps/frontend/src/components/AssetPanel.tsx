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
      <div className="h-14 p-4 terminal-border-b flex justify-between items-center bg-white/[0.02]">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-white/40">Market List</h2>
        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/30 font-mono">USDT</span>
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
              className={`px-4 py-4 cursor-pointer watchlist-item ${isActive ? 'active' : ''}`}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className={`text-[12px] font-black tracking-tight ${isActive ? 'text-bull' : 'text-white/90'}`}>
                  {asset.ticker}
                </span>
                <span className={`text-[12px] font-mono font-bold ${isUp ? 'text-bull' : 'text-bear'}`}>
                  ${prices[asset.ticker]?.toFixed(prices[asset.ticker] < 1 ? 4 : 2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter leading-none">MCAP</span>
                  <span className="text-[10px] font-bold text-white/30 leading-tight">${formatLargeNumber(currentMCap)}</span>
                </div>
                <span className={`text-[10px] font-bold ${isUp ? 'text-bull' : 'text-bear'}`}>
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
