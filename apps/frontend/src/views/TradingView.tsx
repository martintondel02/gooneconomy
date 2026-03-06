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
    <div className="flex-1 flex overflow-hidden relative">
      <AssetPanel />

      <main className="flex-1 flex flex-col min-w-0 bg-[#0d1117] relative">
        {/* Refined Asset Header */}
        <div className="h-12 terminal-border-b flex items-center px-6 gap-8 bg-white/[0.01] relative z-40">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-black tracking-tight text-white">{activeAsset?.ticker} / USDT</h2>
            <span className={`text-[13px] font-mono font-black ${prices[activeAsset?.ticker] > activeAsset?.price ? 'text-bull' : 'text-bear'}`}>
              ${prices[activeAsset?.ticker]?.toFixed(prices[activeAsset?.ticker] < 1 ? 4 : 2)}
            </span>
          </div>
          
          <div className="h-4 w-px bg-white/[0.05]"></div>

          <div className="flex gap-8">
            <div className="flex flex-col">
              <span className="pro-label">Market Cap</span>
              <span className="pro-value font-mono opacity-80">${formatLargeNumber(marketCaps[activeAsset?.ticker] || 0)}</span>
            </div>
            <div className="flex flex-col">
              <span className="pro-label">Volatility</span>
              <span className="pro-value font-mono text-bull/60 uppercase">Normal</span>
            </div>
          </div>

          <div className="ml-auto relative" ref={tfRef} style={{ zIndex: 100 }}>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsTfOpen(!isTfOpen);
              }}
              className={`px-3 py-1.5 rounded-md border text-[10px] font-bold flex items-center gap-3 transition-all ${isTfOpen ? 'bg-white/10 text-bull border-bull/30' : 'bg-white/[0.03] border-white/[0.05] text-white/50 hover:bg-white/[0.08]'}`}
            >
              {activeTimeframe.toUpperCase()}
              <span className={`text-[7px] transition-transform duration-300 ${isTfOpen ? 'rotate-180 text-bull' : 'opacity-20'}`}>▼</span>
            </button>
            
            {isTfOpen && (
              <div 
                className="absolute right-0 top-full mt-1 w-28 bg-[#161b22] border border-white/[0.08] rounded-md shadow-2xl overflow-hidden"
                style={{ zIndex: 101 }}
              >
                <div className="py-1">
                  {timeframes.map(tf => (
                    <div
                      key={tf}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveTimeframe(tf);
                        setIsTfOpen(false);
                      }}
                      className={`px-4 py-2 text-[10px] font-bold cursor-pointer transition-colors ${activeTimeframe === tf ? 'text-bull bg-bull/5' : 'text-white/40 hover:bg-white/[0.03] hover:text-white/80'}`}
                    >
                      {tf.toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-[2] relative terminal-border-b z-10">
          {activeAsset && (
            <Chart 
              key={`${activeAsset.id}-${activeTimeframe}`} 
              assetId={activeAsset.id} 
              ticker={activeAsset.ticker} 
            />
          )}
        </div>

        <PositionsTerminal />
      </main>

      <OrderTerminal />
    </div>
  );
};

export default TradingView;
