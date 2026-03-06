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
    <div className="flex flex-col h-screen bg-[#0d1117] text-white overflow-hidden">
      {/* Sleek Ticker Tape */}
      <div className="h-7 border-b border-white/[0.04] flex items-center overflow-hidden bg-black/20">
        <div className="whitespace-nowrap animate-marquee px-4">
          {tickers.map(ticker => {
            const isUp = prices[ticker] > 100;
            return (
              <span key={ticker} className="mx-6 text-[10px] font-medium tracking-tight">
                <span className="text-white/20 mr-2 uppercase">{ticker}</span>
                <span className={`font-mono font-bold ${isUp ? 'text-bull' : 'text-bear'}`}>
                  ${prices[ticker]?.toFixed(prices[ticker] < 1 ? 4 : 2) || '---'}
                </span>
              </span>
            );
          })}
          {tickers.map(ticker => (
            <span key={`${ticker}-loop`} className="mx-6 text-[10px] font-medium tracking-tight">
              <span className="text-white/20 mr-2 uppercase">{ticker}</span>
              <span className="text-bull font-mono font-bold">
                ${prices[ticker]?.toFixed(prices[ticker] < 1 ? 4 : 2) || '---'}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Pro Sidebar (Left Rail) */}
        <aside className="w-14 terminal-border-r flex flex-col items-center py-5 gap-6 bg-[#0d1117]">
          <div className="mb-4">
            <div className="w-8 h-8 rounded-md bg-bull flex items-center justify-center font-black italic tracking-tighter text-[#0d1117] text-sm shadow-[0_0_15px_rgba(16,185,129,0.2)]">G</div>
          </div>
          
          <div 
            onClick={() => setActiveTab('TRADING')}
            className={`p-2.5 cursor-pointer rounded-lg transition-all group relative ${activeTab === 'TRADING' ? 'bg-bull/5 text-bull' : 'text-white/20 hover:text-white/40'}`}
          >
            <TrendingUp size={18} />
            {activeTab === 'TRADING' && <div className="absolute left-[-15px] top-1/4 w-[2px] h-1/2 bg-bull rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
          </div>
          
          <div 
            onClick={() => setActiveTab('PORTFOLIO')}
            className={`p-2.5 cursor-pointer rounded-lg transition-all group relative ${activeTab === 'PORTFOLIO' ? 'bg-bull/5 text-bull' : 'text-white/20 hover:text-white/40'}`}
          >
            <Wallet size={18} />
            {activeTab === 'PORTFOLIO' && <div className="absolute left-[-15px] top-1/4 w-[2px] h-1/2 bg-bull rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
          </div>
          
          <div 
            onClick={() => setActiveTab('SHOP')}
            className={`p-2.5 cursor-pointer rounded-lg transition-all group relative ${activeTab === 'SHOP' ? 'bg-bull/5 text-bull' : 'text-white/20 hover:text-white/40'}`}
          >
            <ShoppingBag size={18} />
            {activeTab === 'SHOP' && <div className="absolute left-[-15px] top-1/4 w-[2px] h-1/2 bg-bull rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
          </div>

          <div className="mt-auto flex flex-col items-center gap-4 mb-2">
            <span className="text-[7px] font-bold text-white/10 uppercase -rotate-90 origin-center whitespace-nowrap tracking-widest">v0.1.0</span>
            
            <div 
              onClick={() => logout()}
              className="p-2.5 cursor-pointer text-white/10 hover:text-bear transition-colors group relative"
              title="Logout"
            >
              <LogOut size={18} />
            </div>

            <div className="p-2.5 cursor-pointer text-white/10 hover:text-white/30 transition-colors">
              <Settings size={18} />
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Minimalist Pro Header */}
          <header className="h-12 terminal-border-b flex items-center px-4 justify-between bg-[#0d1117]/80 backdrop-blur-md">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="pro-label">Total Equity / USD</span>
                <span className="pro-value font-mono tracking-tight">${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="w-px h-5 bg-white/[0.04]"></div>
              <div className="flex flex-col">
                <span className="pro-label">Available Balance</span>
                <span className="pro-value text-white/60 font-mono tracking-tight">${user?.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="w-px h-5 bg-white/[0.04]"></div>
              <div className="flex flex-col">
                <span className="pro-label">Unrealized PnL</span>
                <span className={`pro-value font-mono tracking-tight ${unrealizedPnL >= 0 ? 'text-bull' : 'text-bear'}`}>
                  {unrealizedPnL >= 0 ? '+' : ''}{unrealizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="pro-label">Global Standing</span>
                <span className="text-[10px] font-bold text-bull italic">#{leaderboard.find(l => l.username === user?.username)?.rank || '---'}</span>
              </div>
              <div className="w-px h-5 bg-white/[0.04] mx-1"></div>
              <button 
                onClick={() => claimStimulus()}
                className="px-3 py-1.5 rounded-md bg-bull/5 border border-bull/10 text-[8px] font-bold text-bull uppercase tracking-widest hover:bg-bull/10 transition-all active:scale-95"
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
