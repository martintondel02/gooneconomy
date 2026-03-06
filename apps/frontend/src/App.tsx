import React, { useEffect } from 'react';
import { Wallet, ShoppingBag, Settings, TrendingUp, LogOut } from 'lucide-react';
import { useMarketStore } from './store/useMarketStore';
import TradingView from './views/TradingView';
import PortfolioView from './views/PortfolioView';
import ShopView from './views/ShopView';
import AuthView from './views/AuthView';

function App() {
  const { 
    prices, 
    leaderboard,
    user,
    token,
    positions,
    activeTab,
    connect, 
    disconnect, 
    setActiveTab,
    claimStimulus,
    logout
  } = useMarketStore();

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  if (!token || !user) {
    return <AuthView />;
  }

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
    <div className="flex flex-col h-screen bg-[#050508] text-white overflow-hidden">
      {/* High-Density Ticker Tape */}
      <div className="h-8 glass-panel flex items-center overflow-hidden border-x-0 border-t-0 rounded-none bg-black/40">
        <div className="whitespace-nowrap animate-marquee px-4">
          {tickers.map(ticker => {
            const isUp = prices[ticker] > 100; // Simplified for visual
            return (
              <span key={ticker} className="mx-6 text-[10px] font-mono font-bold tracking-tighter">
                <span className="text-white/30 mr-2">{ticker}</span>
                <span className={isUp ? 'text-cyan-400' : 'text-magenta-400'}>
                  ${prices[ticker]?.toFixed(prices[ticker] < 1 ? 4 : 2) || '---'}
                </span>
              </span>
            );
          })}
          {/* Loop Duplicate */}
          {tickers.map(ticker => (
            <span key={`${ticker}-loop`} className="mx-6 text-[10px] font-mono font-bold tracking-tighter">
              <span className="text-white/30 mr-2">{ticker}</span>
              <span className="text-cyan-400">
                ${prices[ticker]?.toFixed(prices[ticker] < 1 ? 4 : 2) || '---'}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Pro Sidebar (Left Rail) */}
        <aside className="w-16 terminal-border-r flex flex-col items-center py-6 gap-6 bg-[#0a0a0f]">
          <div className="mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black italic tracking-tighter text-black active-tick shadow-[0_0_15px_rgba(0,243,255,0.3)]">G</div>
          </div>
          
          <div 
            onClick={() => setActiveTab('TRADING')}
            className={`p-3 cursor-pointer rounded-xl transition-all group relative ${activeTab === 'TRADING' ? 'bg-cyan-500/10 text-cyan-400' : 'text-white/20 hover:text-white/50'}`}
          >
            <TrendingUp size={20} />
            {activeTab === 'TRADING' && <div className="absolute left-0 top-1/4 w-1 h-1/2 bg-cyan-400 rounded-r-full shadow-[0_0_10px_#00f3ff]"></div>}
          </div>
          
          <div 
            onClick={() => setActiveTab('PORTFOLIO')}
            className={`p-3 cursor-pointer rounded-xl transition-all group relative ${activeTab === 'PORTFOLIO' ? 'bg-cyan-500/10 text-cyan-400' : 'text-white/20 hover:text-white/50'}`}
          >
            <Wallet size={20} />
            {activeTab === 'PORTFOLIO' && <div className="absolute left-0 top-1/4 w-1 h-1/2 bg-cyan-400 rounded-r-full shadow-[0_0_10px_#00f3ff]"></div>}
          </div>
          
          <div 
            onClick={() => setActiveTab('SHOP')}
            className={`p-3 cursor-pointer rounded-xl transition-all group relative ${activeTab === 'SHOP' ? 'bg-cyan-500/10 text-cyan-400' : 'text-white/20 hover:text-white/50'}`}
          >
            <ShoppingBag size={20} />
            {activeTab === 'SHOP' && <div className="absolute left-0 top-1/4 w-1 h-1/2 bg-cyan-400 rounded-r-full shadow-[0_0_10px_#00f3ff]"></div>}
          </div>

          <div className="mt-auto flex flex-col items-center gap-4 mb-2">
            <span className="text-[8px] font-mono text-white/20 font-bold -rotate-90 origin-center whitespace-nowrap">v0.0.1</span>
            
            <div 
              onClick={() => logout()}
              className="p-3 cursor-pointer text-white/10 hover:text-bear transition-colors group relative"
              title="Logout"
            >
              <LogOut size={20} />
            </div>

            <div className="p-3 cursor-pointer text-white/10 hover:text-white/30 transition-colors">
              <Settings size={20} />
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Minimalist Pro Header */}
          <header className="h-12 terminal-border-b flex items-center px-4 justify-between bg-[#08080c]/80 backdrop-blur-md">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em]">Equity / USD</span>
                <span className="text-[11px] font-mono font-black text-bull tracking-tight">${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="w-px h-6 bg-white/5"></div>
              <div className="flex flex-col">
                <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em]">Available</span>
                <span className="text-[11px] font-mono font-black text-white/60 tracking-tight">${user?.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="w-px h-6 bg-white/5"></div>
              <div className="flex flex-col">
                <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em]">Unrealized PnL</span>
                <span className={`text-[11px] font-mono font-black tracking-tight ${unrealizedPnL >= 0 ? 'text-bull' : 'text-bear'}`}>
                  {unrealizedPnL >= 0 ? '+' : ''}{unrealizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Global Rank</span>
                <span className="text-[10px] font-black text-bull italic">#{leaderboard.find(l => l.username === user?.username)?.rank || '---'}</span>
              </div>
              <div className="w-px h-6 bg-white/5 mx-1"></div>
              <button 
                onClick={() => claimStimulus()}
                className="px-3 py-1.5 rounded bg-bull/5 border border-bull/20 text-[8px] font-black text-bull uppercase tracking-[0.1em] hover:bg-bull/10 transition-all active:scale-95"
              >
                Claim Stimulus
              </button>
            </div>
          </header>

          {/* Main Viewport */}
          <div className="flex-1 flex overflow-hidden">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
