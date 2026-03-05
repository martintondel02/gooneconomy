import React, { useEffect } from 'react';
import { LayoutGrid, Wallet, ShoppingBag, Settings, TrendingUp } from 'lucide-react';
import { useMarketStore } from './store/useMarketStore';
import Chart from './components/Chart';

function App() {
  const { prices, connect, disconnect } = useMarketStore();

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  const tickers = ['GOON', 'TSLAX', 'GOLD', 'MVDA', 'KNG', 'BMD'];

  return (
    <div className="flex flex-col h-screen">
      {/* Ticker Tape */}
      <div className="h-10 glass-panel flex items-center overflow-hidden border-x-0 border-t-0 rounded-none">
        <div className="whitespace-nowrap animate-marquee px-4 text-sm">
          {tickers.map(ticker => (
            <span key={ticker} className="mx-4 text-cyan-400 font-mono">
              {ticker}: ${prices[ticker]?.toFixed(2) || '---'}
            </span>
          ))}
          {/* Duplicate for smooth loop */}
          {tickers.map(ticker => (
            <span key={`${ticker}-loop`} className="mx-4 text-cyan-400 font-mono">
              {ticker}: ${prices[ticker]?.toFixed(2) || '---'}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-20 glass-panel m-4 mr-0 flex flex-col items-center py-8 gap-8">
          <div className="p-3 cursor-pointer hover:bg-white/10 rounded-xl transition-colors">
            <TrendingUp size={24} />
          </div>
          <div className="p-3 cursor-pointer hover:bg-white/10 rounded-xl transition-colors">
            <Wallet size={24} />
          </div>
          <div className="p-3 cursor-pointer hover:bg-white/10 rounded-xl transition-colors">
            <ShoppingBag size={24} />
          </div>
          <div className="mt-auto p-3 cursor-pointer hover:bg-white/10 rounded-xl transition-colors">
            <Settings size={24} />
          </div>
        </aside>

        {/* Central Grid */}
        <main className="flex-1 p-4 grid grid-cols-12 grid-rows-6 gap-4">
          {/* Scoreboard */}
          <section className="col-span-12 row-span-1 glass-panel flex items-center px-8 justify-between">
            <div className="flex gap-8">
              <div>
                <p className="text-xs text-white/50 uppercase">Net Worth</p>
                <p className="text-2xl font-bold text-cyan-400">$10,420.69</p>
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase">Liquid Cash</p>
                <p className="text-2xl font-bold">$1,242.00</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button className="px-4 py-2 glass-panel hover:bg-white/10 transition-all text-sm font-medium">Claim Stimulus</button>
            </div>
          </section>

          {/* Main Chart */}
          <section className="col-span-8 row-span-5 glass-panel p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">GOON / USD</h2>
              <div className="flex gap-2">
                <span className="text-xs px-2 py-1 glass-panel">1M</span>
                <span className="text-xs px-2 py-1 glass-panel">5M</span>
                <span className="text-xs px-2 py-1 glass-panel bg-white/10">15M</span>
                <span className="text-xs px-2 py-1 glass-panel">1H</span>
              </div>
            </div>
            <div className="flex-1 rounded-lg overflow-hidden">
              <Chart assetId="1" ticker="GOON" />
            </div>
          </section>

          {/* Active Trades & Betting */}
          <div className="col-span-4 row-span-5 flex flex-col gap-4">
            <section className="flex-1 glass-panel p-4 overflow-hidden flex flex-col">
              <h2 className="text-sm font-bold uppercase text-white/50 mb-4 tracking-wider">Live Trades</h2>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className="text-xs flex justify-between p-2 rounded bg-white/5 border border-white/5">
                    <span className={i % 2 === 0 ? "text-cyan-400" : "text-magenta-400"}>
                      User{i} {i % 2 === 0 ? 'Bought' : 'Sold'} 0.5 GOON
                    </span>
                    <span className="text-white/30">12:0{i}:21</span>
                  </div>
                ))}
              </div>
            </section>
            
            <section className="h-48 glass-panel p-4">
              <h2 className="text-sm font-bold uppercase text-white/50 mb-4 tracking-wider">Quick Bet</h2>
              <div className="flex gap-2 mb-4">
                <button className="flex-1 py-3 rounded bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 font-bold hover:bg-cyan-500/30 transition-all">LONG</button>
                <button className="flex-1 py-3 rounded bg-magenta-500/20 border border-magenta-500/50 text-magenta-400 font-bold hover:bg-magenta-500/30 transition-all">SHORT</button>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-1 text-xs glass-panel bg-white/10">2x</button>
                <button className="flex-1 py-1 text-xs glass-panel">5x</button>
                <button className="flex-1 py-1 text-xs glass-panel">10x</button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
