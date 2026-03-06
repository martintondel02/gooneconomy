import React, { useState, useRef, useEffect } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import { ChevronLeft, ChevronRight, BarChart3, Activity, PieChart, Maximize2 } from 'lucide-react';
import Chart, { ChartHandle } from '../components/Chart';
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

  const [isAssetPanelOpen, setIsAssetPanelOpen] = useState(true);
  const chartRef = useRef<ChartHandle>(null);

  const timeframes = ['1s', '5s', '10s', '15s', '30s', '1m', '5m', '15m', '1h', '4h', '1d'];

  const formatLargeNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    return (num / 1e3).toFixed(1) + 'K';
  };

  return (
    <div className="flex-1 grid grid-cols-[auto_1fr_auto] h-full w-full bg-[#0D0E12] overflow-hidden">
      
      {/* COLUMN 1: Watchlist */}
      <div className={`h-full border-r border-white/[0.04] transition-all duration-300 relative ${isAssetPanelOpen ? 'w-[240px]' : 'w-0'} overflow-hidden`}>
        <AssetPanel />
        {/* Toggle inside Column 1 edge */}
        <button 
          onClick={() => setIsAssetPanelOpen(!isAssetPanelOpen)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-[60] w-3 h-10 bg-white/[0.03] border-y border-l border-white/[0.05] rounded-l-md flex items-center justify-center text-white/10 hover:text-white/40 transition-all shadow-xl"
        >
          {isAssetPanelOpen ? <ChevronLeft size={10} /> : <ChevronRight size={10} />}
        </button>
      </div>

      {/* COLUMN 2: Main Content (Chart + Positions) */}
      <main className="flex flex-col min-w-0 h-full overflow-hidden border-r border-white/[0.04]">
        
        {/* Asset Dashboard Header */}
        <div className="h-[52px] flex-shrink-0 border-b border-white/[0.04] flex items-center px-6 justify-between bg-white/[0.01]">
          <div className="flex items-center gap-6 overflow-hidden mr-4">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-7 h-7 rounded-lg bg-white/[0.03] flex items-center justify-center border border-white/[0.05]">
                <Activity size={14} className="text-apex" />
              </div>
              <h2 className="text-[13px] font-bold text-white uppercase truncate">{activeAsset?.ticker}</h2>
            </div>
            
            <div className="flex gap-6 items-center flex-shrink-0">
              <div className="flex flex-col">
                <span className={`text-[13px] font-mono font-bold ${prices[activeAsset?.ticker] > activeAsset?.price ? 'text-bull' : 'text-bear'}`}>
                  ${prices[activeAsset?.ticker]?.toFixed(prices[activeAsset?.ticker] < 1 ? 4 : 2)}
                </span>
              </div>
              <div className="flex flex-col hidden sm:flex">
                <span className="pro-label !text-[8px]">Index Cap</span>
                <span className="text-[11px] font-mono font-bold text-white/40">${formatLargeNumber(marketCaps[activeAsset?.ticker] || 0)}</span>
              </div>
            </div>
          </div>

          {/* Timeframe Engine Selector */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button 
              onClick={() => chartRef.current?.resetView()}
              className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05] text-white/20 hover:text-apex transition-all"
            >
              <Maximize2 size={12} />
            </button>
            <div className="w-px h-4 bg-white/[0.06]"></div>
            <div className="flex items-center gap-1 bg-white/[0.02] p-1 rounded-lg border border-white/[0.04] overflow-x-auto no-scrollbar max-w-[120px] md:max-w-none">
              {timeframes.slice(2).map(tf => (
                <button
                  key={tf}
                  onClick={() => setActiveTimeframe(tf)}
                  className={`px-2 py-1 rounded-md text-[9px] font-bold transition-all flex-shrink-0 ${activeTimeframe === tf ? 'bg-apex text-white' : 'text-white/30 hover:text-white/60'}`}
                >
                  {tf.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Core Visualization Area */}
        <div className="flex-1 relative overflow-hidden">
          {activeAsset && (
            <Chart 
              ref={chartRef}
              key={`${activeAsset.id}-${activeTimeframe}`} 
              assetId={activeAsset.id} 
              ticker={activeAsset.ticker} 
            />
          )}
        </div>

        {/* Logic Layer: Positions & History */}
        <div className="h-[280px] flex-shrink-0 border-t border-white/[0.04]">
          <PositionsTerminal />
        </div>
      </main>

      {/* COLUMN 3: Execution Terminal */}
      <div className="w-[320px] h-full flex flex-col overflow-hidden">
        <OrderTerminal />
      </div>

    </div>
  );
};

export default TradingView;
