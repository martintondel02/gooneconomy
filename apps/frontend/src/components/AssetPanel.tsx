import React from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { Search, TrendingUp, TrendingDown, Image as ImageIcon } from 'lucide-react';

const AssetPanel: React.FC = () => {
  const { assets, marketCaps, prices, activeAsset, setActiveAsset } = useMarketStore();

  const formatLargeNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toFixed(0);
  };

  return (
    <aside className="w-[240px] flex flex-col bg-[#0D0E12] border-r border-white/[0.04] overflow-hidden">
      <div className="h-[52px] px-4 flex items-center justify-between border-b border-white/[0.04] bg-white/[0.01]">
        <div className="flex items-center gap-2">
          <Search size={14} className="text-white/20" />
          <span className="pro-label !text-white/40">Watchlist</span>
        </div>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/[0.05] text-white/30 font-mono">USDT</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
        {assets.map((asset) => {
          const currentMCap = marketCaps[asset.ticker] || 0;
          const initialMCap = asset.price * asset.supply;
          const isUp = currentMCap >= initialMCap;
          const isActive = activeAsset?.id === asset.id;

          return (
            <div 
              key={asset.id}
              onClick={() => setActiveAsset(asset)}
              className={`mx-2 px-3 py-3 cursor-pointer rounded-xl transition-all mb-1 ${isActive ? 'bg-[#3E7BFA]/10' : 'hover:bg-white/[0.02]'}`}
            >
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                   <div className="w-5 h-5 rounded-md bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden">
                      {asset.imageUrl ? (
                        <img src={`http://${window.location.hostname}:28081${asset.imageUrl}`} className="w-full h-full object-cover" />
                      ) : <ImageIcon size={10} className="opacity-20" />}
                   </div>
                   <span className={`text-[12px] font-bold tracking-tight ${isActive ? 'text-[#3E7BFA]' : 'text-white/80'}`}>
                     {asset.ticker}
                   </span>
                </div>
                <span className={`text-[12px] font-mono font-bold ${isUp ? 'text-bull' : 'text-bear'}`}>
                  ${prices[asset.ticker]?.toFixed(prices[asset.ticker] < 1 ? 3 : 2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-medium text-white/10 uppercase">Cap</span>
                  <span className="text-[10px] font-mono font-medium text-white/30">${formatLargeNumber(currentMCap)}</span>
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-bold ${isUp ? 'text-bull/60' : 'text-bear/60'}`}>
                  {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
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
