import React, { useEffect } from 'react';
import { Wallet, ShoppingBag, Settings, TrendingUp } from 'lucide-react';
import { useMarketStore } from './store/useMarketStore';
import TradingView from './views/TradingView';
import PortfolioView from './views/PortfolioView';
import ShopView from './views/ShopView';

function App() {
  const { 
    prices, 
    leaderboard,
    user,
    positions,
    activeTab,
    connect, 
    disconnect, 
    setActiveTab,
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

  const renderView = () => {
    switch (activeTab) {
      case 'TRADING': return <TradingView />;
      case 'PORTFOLIO': return <PortfolioView />;
      case 'SHOP': return <ShopView />;
      default: return <TradingView />;
    }
  };

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
          <div 
            onClick={() => setActiveTab('TRADING')}
            className={`p-3 cursor-pointer rounded-xl transition-all ${activeTab === 'TRADING' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'hover:bg-white/10 text-white/50'}`}
          >
            <TrendingUp size={24} />
          </div>
          <div 
            onClick={() => setActiveTab('PORTFOLIO')}
            className={`p-3 cursor-pointer rounded-xl transition-all ${activeTab === 'PORTFOLIO' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'hover:bg-white/10 text-white/50'}`}
          >
            <Wallet size={24} />
          </div>
          <div 
            onClick={() => setActiveTab('SHOP')}
            className={`p-3 cursor-pointer rounded-xl transition-all ${activeTab === 'SHOP' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'hover:bg-white/10 text-white/50'}`}
          >
            <ShoppingBag size={24} />
          </div>
          <div className="mt-auto p-3 cursor-pointer hover:bg-white/10 rounded-xl transition-colors text-white/50">
            <Settings size={24} />
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Global Header (Persistent across views) */}
          <section className="h-20 glass-panel m-4 mb-0 flex items-center px-8 justify-between flex-shrink-0">
            <div className="flex gap-8">
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">Net Worth</p>
                <p className="text-2xl font-black text-cyan-400">
                  ${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                </p>
              </div>
              <div className="h-8 w-px bg-white/10"></div>
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">Liquid Cash</p>
                <p className="text-2xl font-black text-white/80">${user?.cashBalance.toLocaleString() || '0.00'}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-end mr-4">
                <p className="text-[10px] text-white/30 uppercase font-black">Rank</p>
                <p className="text-sm font-black text-cyan-400">#{leaderboard.find(l => l.username === user?.username)?.rank || '---'}</p>
              </div>
              <button 
                onClick={() => claimStimulus()}
                className="px-6 py-2 glass-panel border-cyan-500/30 hover:bg-cyan-500/10 transition-all text-[10px] font-black tracking-widest uppercase"
              >
                Claim Stimulus
              </button>
            </div>
          </section>

          {/* View Content */}
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
