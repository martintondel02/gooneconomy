import React, { useEffect, useState } from 'react';
import { Wallet, ShoppingBag, Settings, LogOut, BarChart3, ShieldAlert, ChevronRight } from 'lucide-react';
import { useMarketStore } from './store/useMarketStore';
import { Toaster } from 'react-hot-toast';
import TradingView from './views/TradingView';
import PortfolioView from './views/PortfolioView';
import ShopView from './views/ShopView';
import AdminView from './views/AdminView';
import AuthView from './views/AuthView';

function App() {
  const { 
    leaderboard,
    user,
    token,
    positions,
    activeTab,
    connect, 
    disconnect, 
    setActiveTab,
    logout
  } = useMarketStore();

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  if (!token || !user) {
    return <AuthView />;
  }

  const unrealizedPnL = positions.reduce((acc, p) => acc + (p.pnl || 0), 0);
  const netWorth = (user?.cashBalance || 0) + unrealizedPnL;

  const renderView = () => {
    switch (activeTab) {
      case 'TRADING': return <TradingView />;
      case 'PORTFOLIO': return <PortfolioView />;
      case 'SHOP': return <ShopView />;
      case 'ADMIN': return <AdminView />;
      default: return <TradingView />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#08090D] text-[#F0F2F5] overflow-hidden font-sans">
      <Toaster position="bottom-right" />
      
      {/* COMPACT ICON-ONLY SIDEBAR */}
      <aside className="w-[52px] h-full flex-shrink-0 bg-[#0D0E12] border-r border-white/[0.04] flex flex-col items-center py-4 z-[200]">
        
        {/* Brand Logo */}
        <div className="mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3E7BFA] to-[#00FF94] flex items-center justify-center shadow-lg shadow-black/40">
            <span className="font-black italic text-[#0D0E12] text-xs">G</span>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="flex flex-col gap-2 w-full items-center">
          <SidebarIcon 
            icon={<BarChart3 size={20} />} 
            active={activeTab === 'TRADING'} 
            onClick={() => setActiveTab('TRADING')} 
          />
          <SidebarIcon 
            icon={<Wallet size={20} />} 
            active={activeTab === 'PORTFOLIO'} 
            onClick={() => setActiveTab('PORTFOLIO')} 
          />
          <SidebarIcon 
            icon={<ShoppingBag size={20} />} 
            active={activeTab === 'SHOP'} 
            onClick={() => setActiveTab('SHOP')} 
          />
          {user.isAdmin && (
            <SidebarIcon 
              icon={<ShieldAlert size={20} />} 
              active={activeTab === 'ADMIN'} 
              onClick={() => setActiveTab('ADMIN')} 
              color="#00A3FF"
            />
          )}
        </nav>

        {/* Footer Actions */}
        <div className="mt-auto flex flex-col gap-2 w-full items-center pb-2">
          <div className="py-2 mb-2 flex justify-center">
             <span className="text-[7px] font-black text-white/5 uppercase -rotate-90 origin-center whitespace-nowrap tracking-widest">v0.6.5</span>
          </div>
          <SidebarIcon 
            icon={<Settings size={20} />} 
            onClick={() => {}} 
          />
          <SidebarIcon 
            icon={<LogOut size={20} />} 
            onClick={() => logout()} 
            hoverColor="hover:text-bear"
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        <header className="h-[52px] flex-shrink-0 border-b border-white/[0.04] flex items-center px-6 justify-between bg-[#0D0E12]/80 backdrop-blur-xl z-40">
          <div className="flex items-center gap-10">
            <StatItem label="Total Equity" value={`$${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
            <div className="w-px h-6 bg-white/[0.04]"></div>
            <StatItem label="Available" value={`$${user?.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
            <div className="w-px h-6 bg-white/[0.04]"></div>
            <StatItem 
              label="Unrealized PnL" 
              value={`${unrealizedPnL >= 0 ? '+' : ''}${unrealizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
              isPnL={true} 
              positive={unrealizedPnL >= 0} 
            />
          </div>

          <div className="flex flex-col items-end">
            <span className="pro-label !text-[8px] opacity-40">Network Identity</span>
            <span className="text-[11px] font-bold text-bull tracking-tight uppercase">RANK #{leaderboard.find(l => l.username === user?.username)?.rank || '---'}</span>
          </div>
        </header>

        <main className="flex-1 flex min-h-0 relative">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

const SidebarIcon = ({ icon, active, onClick, color, hoverColor }: any) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 relative
        ${active 
          ? 'bg-white/[0.06] text-white' 
          : `text-white/20 hover:bg-white/[0.03] ${hoverColor || 'hover:text-white/60'}`
        }
      `}
      style={active && color ? { color: color } : {}}
    >
      {icon}
      {active && (
        <div 
          className="absolute left-0 top-1/4 w-[2px] h-1/2 bg-white rounded-r-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
          style={color ? { backgroundColor: color, boxShadow: `0 0 15px ${color}` } : {}}
        ></div>
      )}
    </button>
  );
};

const StatItem = ({ label, value, isPnL, positive }: any) => (
  <div className="flex flex-col gap-0.5">
    <span className="pro-label !text-[9px]">{label}</span>
    <span className={`text-[13px] font-mono font-bold tracking-tight ${isPnL ? (positive ? 'text-bull' : 'text-bear') : 'text-white'}`}>
      {value}
    </span>
  </div>
);

export default App;
