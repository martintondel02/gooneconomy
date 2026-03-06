import React, { useState } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { Search, TrendingUp, TrendingDown, Image as ImageIcon } from 'lucide-react';

const AssetPanel: React.FC = () => {
  const { assets, marketCaps, prices, activeAsset, setActiveAsset } = useMarketStore();
  const [searchTerm, setSearchTerm] = useState('');

  const formatLargeNumber = (num: number) => {
    if (!num) return '0';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toFixed(0);
  };

  const filteredAssets = assets.filter(asset => 
    asset.ticker.toLowerCase().includes(searchTerm.toLowerCase()) || 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-[240px] flex flex-col bg-[#0D0E12] border-r border-white/[0.04] overflow-hidden">
      <div className="h-[52px] px-4 flex items-center justify-between border-b border-white/[0.04] bg-white/[0.01]">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
            <Search size={14} className="text-white/20 group-focus-within:text-apex transition-colors" />
          </div>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent py-2 pl-6 pr-2 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all"
            placeholder="Search Assets..."
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
        {filteredAssets.map((asset) => {
          const currentPrice = prices[asset.ticker] || asset.currentPrice || 0;
          const initialPrice = asset.currentPrice || 0; // Use the DB's currentPrice as the baseline if history isn't tracked yet
          const currentMCap = currentPrice * (asset.totalSupply || 0);
          
          // Calculate percentage change based on price, handling zero to avoid NaN
          let percentChange = 0;
          if (initialPrice > 0) {
             percentChange = ((currentPrice - initialPrice) / initialPrice) * 100;
          }

          // In a real app, 'isUp' would compare to a 24h open price. 
          // For now, we'll check if currentPrice is >= initialPrice, or use a small epsilon to avoid flickering on exactly 0%
          const isUp = percentChange >= 0;
          const isActive = activeAsset?.id === asset.id;

          return (
            <div 
              key={asset.id}
              onClick={() => setActiveAsset(asset)}
              className={`mx-2 px-3 py-3 cursor-pointer rounded-xl transition-all mb-1 border ${isActive ? 'bg-apex/10 border-apex/50 shadow-[0_0_15px_rgba(0,163,255,0.15)] scale-[1.02]' : 'border-transparent hover:bg-white/[0.02] hover:border-white/[0.05]'}`}
            >
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                   <div className="w-5 h-5 rounded-md bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden">
                      {asset.imageUrl ? (
                        <img src={`http://${window.location.hostname}:28081${asset.imageUrl}`} className="w-full h-full object-cover" />
                      ) : <ImageIcon size={10} className="opacity-20" />}
                   </div>
                   <span className={`text-[12px] font-bold tracking-tight ${isActive ? 'text-apex' : 'text-white/80'}`}>
                     {asset.ticker}
                   </span>
                </div>
                <span className={`text-[12px] font-mono font-bold ${isUp ? 'text-bull' : 'text-bear'}`}>
                  ${currentPrice.toFixed(currentPrice < 1 ? 3 : 2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-medium text-white/10 uppercase">Cap</span>
                  <span className="text-[10px] font-mono font-medium text-white/30">${formatLargeNumber(currentMCap)}</span>
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-bold ${isUp ? 'text-bull/60' : 'text-bear/60'}`}>
                  {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  <span>{Math.abs(percentChange).toFixed(2)}%</span>
                </div>
              </div>
            </div>
          );
        })}
        {filteredAssets.length === 0 && (
          <div className="px-4 py-8 text-center opacity-30 text-[10px] uppercase font-bold tracking-widest">
            No Assets Found
          </div>
        )}
      </div>
    </aside>
  );
};

export default AssetPanel;
