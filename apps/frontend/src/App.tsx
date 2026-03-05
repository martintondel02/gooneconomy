import React, { useEffect } from 'react';
import { LayoutGrid, Wallet, ShoppingBag, Settings, TrendingUp } from 'lucide-react';
import { useMarketStore } from './store/useMarketStore';
import Chart from './components/Chart';

function App() {
  const { 
    prices, 
    assets, 
    positions, 
    leaderboard,
    user,
    activeAsset, 
    connect, 
    disconnect, 
    setActiveAsset, 
    openPosition, 
    closePosition,
    claimStimulus
  } = useMarketStore();

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  const tickers = ['GOON', 'BTC', 'ETH', 'NVDA', 'PUMPKIN', 'MOSSAD', 'AAPL', 'TSLA', 'GOLD'];

  // Calculate stats
  const unrealizedPnL = positions.reduce((acc, p) => acc + (p.pnl || 0), 0);
  const netWorth = (user?.cashBalance || 0) + unrealizedPnL;

  return (
    <div className="flex flex-col h-screen">
      {/* Ticker Tape */}
      <div className="h-10 glass-panel flex items-center overflow-hidden border-x-0 border-t-0 rounded-none">
        <div className="whitespace-nowrap animate-marquee px-4 text-sm">
          {tickers.map(ticker => (
            <span key={ticker} className="mx-4 text-cyan-400 font-mono">
              {ticker}: ${prices[ticker]?.toFixed(prices[ticker] < 1 ? 4 : 2) || '---'}
            </span>
          ))}
          {/* Duplicate for smooth loop */}
          {tickers.map(ticker => (
            <span key={`${ticker}-loop`} className="mx-4 text-cyan-400 font-mono">
              {ticker}: ${prices[ticker]?.toFixed(prices[ticker] < 1 ? 4 : 2) || '---'}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-20 glass-panel m-4 mr-0 flex flex-col items-center py-8 gap-8">
          <div className="p-3 cursor-pointer bg-white/10 rounded-xl transition-colors text-cyan-400">
            <TrendingUp size={24} />
          </div>
          <div className="p-3 cursor-pointer hover:bg-white/10 rounded-xl transition-colors text-white/50">
            <LayoutGrid size={24} />
          </div>
          <div className="p-3 cursor-pointer hover:bg-white/10 rounded-xl transition-colors text-white/50">
            <Wallet size={24} />
          </div>
          <div className="p-3 cursor-pointer hover:bg-white/10 rounded-xl transition-colors text-white/50">
            <ShoppingBag size={24} />
          </div>
          <div className="mt-auto p-3 cursor-pointer hover:bg-white/10 rounded-xl transition-colors text-white/50">
            <Settings size={24} />
          </div>
        </aside>

        {/* Central Grid */}
        <main className="flex-1 p-4 grid grid-cols-12 grid-rows-6 gap-4">
          {/* Scoreboard */}
          <section className="col-span-12 row-span-1 glass-panel flex items-center px-8 justify-between">
            <div className="flex gap-8">
              <div>
                <p className="text-xs text-white/50 uppercase tracking-widest">Global Hierarchy</p>
                <p className="text-2xl font-bold text-cyan-400">
                  ${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                  <span className="text-xs font-normal text-white/30 ml-2">#{leaderboard.find(l => l.username === user?.username)?.rank || '---'} Rank</span>
                </p>
              </div>
              <div className="h-8 w-px bg-white/10"></div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-widest">Liquid Assets</p>
                <p className="text-2xl font-bold">${user?.cashBalance.toLocaleString() || '0.00'}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-end mr-4">
                <p className="text-[10px] text-white/30 uppercase">Status Tier</p>
                <p className="text-sm font-bold text-yellow-400 uppercase">{user?.statusScore > 400 ? 'Golden Goon' : 'Silver Goon'}</p>
              </div>
              <button 
                onClick={() => claimStimulus()}
                className="px-6 py-2 glass-panel border-cyan-500/30 hover:bg-cyan-500/10 transition-all text-xs font-bold tracking-widest uppercase"
              >
                Claim Stimulus
              </button>
            </div>
          </section>

          {/* Asset List & Chart */}
          <section className="col-span-8 row-span-5 flex flex-col gap-4">
            <div className="h-16 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {assets.map(asset => (
                <button 
                  key={asset.id}
                  onClick={() => setActiveAsset(asset)}
                  className={`px-4 py-2 glass-panel flex-shrink-0 flex flex-col justify-center min-w-[120px] transition-all ${activeAsset?.id === asset.id ? 'bg-white/10 border-cyan-500/50' : 'hover:bg-white/5'}`}
                >
                  <span className="text-[10px] text-white/50 font-bold">{asset.ticker}</span>
                  <span className={`text-sm font-mono ${prices[asset.ticker] > asset.price ? 'text-cyan-400' : 'text-magenta-400'}`}>
                    ${prices[asset.ticker]?.toFixed(prices[asset.ticker] < 1 ? 4 : 2) || '---'}
                  </span>
                </button>
              ))}
            </div>
            
            <div className="flex-1 glass-panel p-4 flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-center mb-4 z-10">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-black tracking-tighter italic">{activeAsset?.name || 'Loading...'}</h2>
                  <span className="text-xs font-mono text-white/30">{activeAsset?.ticker} / USD</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] px-3 py-1 glass-panel bg-white/10 border-cyan-500/20 text-cyan-400 font-bold">LIVE FEED</span>
                </div>
              </div>
              <div className="flex-1 rounded-lg overflow-hidden">
                {activeAsset && <Chart key={activeAsset.id} assetId={activeAsset.id} ticker={activeAsset.ticker} />}
              </div>
            </div>
          </section>

          {/* Active Positions & Leaderboard */}
          <div className="col-span-4 row-span-5 flex flex-col gap-4">
            <section className="flex-1 glass-panel p-4 overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xs font-black uppercase text-white/30 tracking-[0.2em]">Active Positions</h2>
                <span className="text-[10px] text-cyan-400 font-bold font-mono">${unrealizedPnL.toFixed(2)} PnL</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {positions.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-[10px] uppercase tracking-widest text-white/10 font-bold">No Active Trades</p>
                  </div>
                ) : (
                  positions.map(pos => (
                    <div key={pos.id} className="p-3 rounded-lg bg-white/[0.03] border border-white/5 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${pos.side === 'LONG' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-magenta-500/20 text-magenta-400'}`}>
                            {pos.side} {pos.leverage}X
                          </span>
                          <span className="ml-2 text-xs font-bold text-white/70">{assets.find(a => a.id === pos.assetId)?.ticker}</span>
                        </div>
                        <span className={`text-sm font-mono font-bold ${pos.pnl >= 0 ? 'text-cyan-400' : 'text-magenta-400'}`}>
                          {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono text-white/30">
                        <span>Entry: ${pos.entryPrice.toFixed(2)}</span>
                        <button 
                          onClick={() => closePosition(pos.id)}
                          className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-white/70 transition-colors uppercase font-black tracking-tighter"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
            
            <section className="flex-1 glass-panel p-4 overflow-hidden flex flex-col">
              <h2 className="text-xs font-black uppercase text-white/30 mb-4 tracking-[0.2em]">Global Leaderboard</h2>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {leaderboard.map((entry, i) => (
                  <div key={i} className={`flex justify-between items-center p-2 rounded ${entry.username === user?.username ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-white/5 border border-white/5'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-white/30">#{entry.rank}</span>
                      <span className="text-xs font-bold">{entry.username}</span>
                    </div>
                    <span className="text-xs font-mono text-cyan-400">${entry.netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="h-56 glass-panel p-4 flex flex-col">
              <h2 className="text-xs font-black uppercase text-white/30 mb-4 tracking-[0.2em]">Execute Trade</h2>
              <div className="flex gap-2 mb-4">
                <button 
                  onClick={() => openPosition('LONG', 100, 5)}
                  className="flex-1 py-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-black hover:bg-cyan-500/20 transition-all text-sm tracking-widest"
                >
                  LONG
                </button>
                <button 
                  onClick={() => openPosition('SHORT', 100, 5)}
                  className="flex-1 py-4 rounded-xl bg-magenta-500/10 border border-magenta-500/30 text-magenta-400 font-black hover:bg-magenta-500/20 transition-all text-sm tracking-widest"
                >
                  SHORT
                </button>
              </div>
              <div className="flex gap-2">
                {[2, 5, 10, 25].map(lev => (
                  <button key={lev} className={`flex-1 py-2 text-[10px] font-black glass-panel ${lev === 5 ? 'bg-white/10 border-white/20' : 'text-white/30'}`}>{lev}X</button>
                ))}
              </div>
              <p className="mt-4 text-[9px] text-center text-white/20 font-bold uppercase tracking-tighter">Margin: $100.00 | Liquidation: $---</p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
