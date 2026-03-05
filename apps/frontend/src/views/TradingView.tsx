import React from 'react';
import { useMarketStore } from '../store/useMarketStore';
import Chart from '../components/Chart';
import AssetPanel from '../components/AssetPanel';
import OrderTerminal from '../components/OrderTerminal';
import PositionsTerminal from '../components/PositionsTerminal';

const TradingView: React.FC = () => {
  const { 
    prices, 
    marketCaps,
    activeAsset, 
    activeTimeframe,
    setActiveTimeframe,
  } = useMarketStore();

  const timeframes = ['1s', '5s', '15s', '1m', '5m', '15m', '1h', '3h', '12h', '24h'];

  const formatLargeNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    return (num / 1e3).toFixed(1) + 'K';
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left: Market Selection */}
      <AssetPanel />

      {/* Center: Chart & Management */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0a0a0f]/50">
        {/* Asset Header Info */}
        <div className="h-16 terminal-border-b flex items-center px-6 gap-8 bg-black/20">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black tracking-tighter italic">{activeAsset?.ticker}USDT</h2>
            <span className={`text-sm font-mono font-bold ${prices[activeAsset?.ticker] > activeAsset?.price ? 'text-cyan-400' : 'text-magenta-400'}`}>
              ${prices[activeAsset?.ticker]?.toFixed(prices[activeAsset?.ticker] < 1 ? 4 : 2)}
            </span>
          </div>
          
          <div className="h-8 w-px bg-white/5"></div>

          <div className="flex gap-6">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">Market Cap</span>
              <span className="text-[11px] font-mono font-bold">${formatLargeNumber(marketCaps[activeAsset?.ticker] || 0)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">24h Low</span>
              <span className="text-[11px] font-mono font-bold text-white/70">${(activeAsset?.price * 0.95).toFixed(2)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">24h High</span>
              <span className="text-[11px] font-mono font-bold text-white/70">${(activeAsset?.price * 1.05).toFixed(2)}</span>
            </div>
          </div>

          <div className="ml-auto flex gap-1">
            {timeframes.map(tf => (
              <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                className={`text-[10px] px-2 py-1 rounded transition-all font-black ${activeTimeframe === tf ? 'bg-white/10 text-cyan-400' : 'text-white/30 hover:text-white/50'}`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* The Chart Area */}
        <div className="flex-[2] relative terminal-border-b">
          {activeAsset && (
            <Chart 
              key={`${activeAsset.id}-${activeTimeframe}`} 
              assetId={activeAsset.id} 
              ticker={activeAsset.ticker} 
            />
          )}
        </div>

        {/* Bottom: Positions & Orders */}
        <PositionsTerminal />
      </main>

      {/* Right: Order Entry */}
      <OrderTerminal />
    </div>
  );
};

export default TradingView;
