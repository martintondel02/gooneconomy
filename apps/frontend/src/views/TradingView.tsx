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

  // Expanded Institutional Timeframes
  const timeframes = ['1s', '5s', '10s', '15s', '30s', '1m', '5m', '15m', '1h', '4h', '1d'];

  const formatLargeNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    return (num / 1e3).toFixed(1) + 'K';
  };

  return (
    <div className="flex-1 flex overflow-hidden relative bg-[#0D0E12] w-full h-full">
      {/* Left Widget: Watchlist */}
      <div className={`flex flex-shrink-0 transition-all duration-300 ${isAssetPanelOpen ? 'w-[240px]' : 'w-0'} overflow-hidden`}>
        <AssetPanel />
      </div>
      
      {/* Interaction Layer: Panel Toggle */}
      <button 
        onClick={() => setIsAssetPanelOpen(!isAssetPanelOpen)}
        className="absolute top-1/2 -translate-y-1/2 z-[60] w-3 h-10 bg-white/[0.03] border border-white/[0.05] rounded-r-md flex items-center justify-center text-white/10 hover:text-white/40 transition-all active:scale-95 shadow-xl backdrop-blur-md"
        style={{ left: isAssetPanelOpen ? '240px' : '0' }}
      >
        {isAssetPanelOpen ? <ChevronLeft size={10} /> : <ChevronRight size={10} />}
      </button>

      {/* Main Terminal Grid */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0D0E12] relative overflow-hidden h-full">
        {/* Asset Dashboard Header */}
        <div className="h-[52px] flex-shrink-0 border-b border-white/[0.04] flex items-center px-6 justify-between bg-white/[0.01] relative z-40">
          <div className="flex items-center gap-8 overflow-hidden">
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-7 h-7 rounded-lg bg-white/[0.03] flex items-center justify-center border border-white/[0.05]">
                <Activity size={14} className="text-apex" />
              </div>
              <h2 className="text-[14px] font-bold tracking-tight text-white uppercase truncate">{activeAsset?.ticker} / USD</h2>
            </div>
            
            <div className="h-4 w-px bg-white/[0.06] flex-shrink-0"></div>

            <div className="flex gap-10 overflow-hidden">
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <span className="pro-label !text-[8px]">Live Price</span>
                <span className={`text-[14px] font-mono font-bold tracking-tight ${prices[activeAsset?.ticker] > activeAsset?.price ? 'text-bull' : 'text-bear'}`}>
                  ${prices[activeAsset?.ticker]?.toFixed(prices[activeAsset?.ticker] < 1 ? 4 : 2)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <span className="pro-label !text-[8px]">Index Cap</span>
                <span className="text-[13px] font-mono font-bold text-white/60 tracking-tight">${formatLargeNumber(marketCaps[activeAsset?.ticker] || 0)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* RESET CHART BUTTON */}
            <button 
              onClick={() => chartRef.current?.resetView()}
              className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-white/20 hover:text-apex hover:border-apex/30 hover:bg-apex/5 transition-all group"
              title="Reset Chart Layout"
            >
              <Maximize2 size={14} />
            </button>

            <div className="w-px h-4 bg-white/[0.06]"></div>

            {/* Timeframe Engine Selector */}
            <div className="flex items-center gap-1 bg-white/[0.02] p-1 rounded-lg border border-white/[0.04] flex-shrink-0 overflow-x-auto no-scrollbar">
              {timeframes.map(tf => (
                <button
                  key={tf}
                  onClick={() => setActiveTimeframe(tf)}
                  className={`px-2.5 py-1.5 rounded-md text-[9px] font-bold transition-all flex-shrink-0 ${activeTimeframe === tf ? 'bg-apex text-white shadow-lg shadow-apex/20' : 'text-white/30 hover:text-white/60 hover:bg-white/5'}`}
                >
                  {tf.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Core Visualization Area */}
        <div className="flex-1 relative z-10 overflow-hidden">
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
        <div className="h-[220px] flex-shrink-0 flex overflow-hidden">
          <PositionsTerminal />
        </div>
      </main>

      {/* Right Widget: Execution Terminal */}
      <div className="flex-shrink-0 h-full">
        <OrderTerminal />
      </div>
    </div>
  );
};

export default TradingView;
