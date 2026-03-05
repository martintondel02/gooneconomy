import React, { useState, useRef, useEffect } from 'react';
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

  const [isTfOpen, setIsTfOpen] = useState(false);
  const tfRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tfRef.current && !tfRef.current.contains(event.target as Node)) {
        setIsTfOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <div className="h-14 terminal-border-b flex items-center px-4 gap-6 bg-black/40">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-black tracking-tight">{activeAsset?.ticker}USDT</h2>
            <span className={`text-sm font-mono font-bold ${prices[activeAsset?.ticker] > activeAsset?.price ? 'text-bull' : 'text-bear'}`}>
              ${prices[activeAsset?.ticker]?.toFixed(prices[activeAsset?.ticker] < 1 ? 4 : 2)}
            </span>
          </div>
          
          <div className="h-6 w-px bg-white/10"></div>

          <div className="flex gap-6">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-white/30 uppercase">MCAP</span>
              <span className="text-[11px] font-mono font-bold text-white/80">${formatLargeNumber(marketCaps[activeAsset?.ticker] || 0)}</span>
            </div>
          </div>

          {/* Timeframe Dropdown */}
          <div className="ml-auto relative" ref={tfRef}>
            <button 
              onClick={() => setIsTfOpen(!isTfOpen)}
              className={`px-3 py-1.5 glass-panel rounded border-white/10 text-[10px] font-black flex items-center gap-2 transition-all ${isTfOpen ? 'bg-white/10 text-bull border-bull/30' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
            >
              {activeTimeframe.toUpperCase()}
              <span className={`text-[8px] transition-transform ${isTfOpen ? 'rotate-180 opacity-100' : 'opacity-40'}`}>▼</span>
            </button>
            
            {isTfOpen && (
              <div className="absolute right-0 top-full mt-1 w-24 glass-panel bg-[#1e2329] border-white/10 rounded shadow-2xl z-50 overflow-hidden">
                <div className="py-1">
                  {timeframes.map(tf => (
                    <div
                      key={tf}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setActiveTimeframe(tf);
                        setIsTfOpen(false);
                      }}
                      className={`px-4 py-2 text-[10px] font-bold cursor-pointer transition-colors ${activeTimeframe === tf ? 'text-bull bg-white/5' : 'text-white/50 hover:bg-white/5'}`}
                    >
                      {tf.toUpperCase()}
                    </div>
                  ))}

                </div>
              </div>
            )}
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
