import React, { useState, useRef, useEffect } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Chart from '../components/Chart';
import AssetPanel from '../components/AssetPanel';
import OrderTerminal from '../components/OrderTerminal';
import PositionsTerminal from '../components/PositionsTerminal';
import OrderBook from '../components/OrderBook';
import RecentTrades from '../components/RecentTrades';

const TradingView: React.FC = () => {
  const { 
    prices, 
    marketCaps,
    activeAsset, 
    activeTimeframe,
    setActiveTimeframe,
  } = useMarketStore();

  const [isTfOpen, setIsTfOpen] = useState(false);
  const [isAssetPanelOpen, setIsAssetPanelOpen] = useState(true);
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
    <div className="flex-1 flex overflow-hidden relative bg-[#0e0f14]">
      {/* Left: Market Selection (Collapsible) */}
      <div className={`flex transition-all duration-300 ${isAssetPanelOpen ? 'w-56' : 'w-0'} overflow-hidden`}>
        <AssetPanel />
      </div>
      
      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsAssetPanelOpen(!isAssetPanelOpen)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-50 w-4 h-12 bg-[#1c1f2a] border border-white/[0.05] rounded-r-md flex items-center justify-center text-white/20 hover:text-white transition-colors"
        style={{ left: isAssetPanelOpen ? '224px' : '0' }}
      >
        {isAssetPanelOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>

      {/* Middle: Chart & Management */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0e0f14] relative">
        {/* Refined Asset Header */}
        <div className="h-12 terminal-border-b flex items-center px-6 gap-8 bg-white/[0.01] relative z-40">
          <div className="flex items-center gap-4">
            <h2 className="text-[13px] font-black tracking-tight text-white uppercase">{activeAsset?.ticker} / USD</h2>
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
              <span className="pro-label">24h Volume</span>
              <span className="pro-value font-mono text-white/40 uppercase">$1.2M</span>
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="ml-auto flex items-center gap-1 bg-white/[0.02] p-1 rounded-md border border-white/[0.03]">
            {['1m', '5m', '15m', '1h', '4h', '1d'].map(tf => (
              <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                className={`px-2.5 py-1 rounded text-[9px] font-bold transition-all ${activeTimeframe === tf ? 'bg-kraken text-white' : 'text-white/30 hover:text-white/60'}`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* The Chart Area */}
        <div className="flex-[3] relative terminal-border-b z-10">
          {activeAsset && (
            <Chart 
              key={`${activeAsset.id}-${activeTimeframe}`} 
              assetId={activeAsset.id} 
              ticker={activeAsset.ticker} 
            />
          )}
        </div>

        {/* Bottom: Positions */}
        <div className="flex-[1.5] flex min-h-[200px]">
          <PositionsTerminal />
        </div>
      </main>

      {/* Right Column: Order Book & Trades */}
      <div className="w-[240px] flex flex-col terminal-border-l bg-[#13161f]">
        <OrderBook />
        <RecentTrades />
      </div>

      {/* Far Right: Execution */}
      <OrderTerminal />
    </div>
  );
};

export default TradingView;
