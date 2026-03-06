import React, { useEffect } from 'react';
import { Wallet, ShoppingBag, Settings, TrendingUp, LogOut, BarChart3, Users, ShieldAlert } from 'lucide-react';
import { useMarketStore } from './store/useMarketStore';
import { Toaster } from 'react-hot-toast';
import TradingView from './views/TradingView';
import PortfolioView from './views/PortfolioView';
import ShopView from './views/ShopView';
import AdminView from './views/AdminView';
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
    <div className="flex flex-col h-screen w-screen bg-[#0D0E12] text-[#F0F2F5] overflow-hidden font-sans">
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1C1E26',
            color: '#F0F2F5',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            fontSize: '11px',
            fontFamily: 'Inter',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          },
          success: {
            iconTheme: { primary: '#00FF94', secondary: '#1C1E26' }
          },
          error: {
            iconTheme: { primary: '#FF3E60', secondary: '#1C1E26' }
          }
        }}
      />
      
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sleek Rail Sidebar */}
        <aside className="w-[60px] flex-shrink-0 border-r border-white/[0.04] flex flex-col items-center py-6 gap-8 bg-[#0D0E12] z-50">
          <div className="mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3E7BFA] to-[#00FF94] flex items-center justify-center shadow-lg shadow-black/20 group cursor-pointer active:scale-95 transition-all">
              <span className="font-black italic text-[#0D0E12] text-lg">G</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <NavIcon 
              active={activeTab === 'TRADING'} 
              icon={<BarChart3 size={20} />} 
              onClick={() => setActiveTab('TRADING')} 
              label="Trade"
            />
            <NavIcon 
              active={activeTab === 'PORTFOLIO'} 
              icon={<Wallet size={20} />} 
              onClick={() => setActiveTab('PORTFOLIO')} 
              label="Assets"
            />
            <NavIcon 
              active={activeTab === 'SHOP'} 
              icon={<ShoppingBag size={20} />} 
              onClick={() => setActiveTab('SHOP')} 
              label="Shop"
            />
            {user.isAdmin && (
              <NavIcon 
                active={activeTab === 'ADMIN'} 
                icon={<ShieldAlert size={20} />} 
                onClick={() => setActiveTab('ADMIN')} 
                label="Admin"
                color="#00A3FF"
              />
            )}
          </div>

          <div className="mt-auto flex flex-col items-center gap-6 pb-2">
            <div className="group relative">
              <span className="text-[8px] font-bold text-white/10 uppercase -rotate-90 origin-center whitespace-nowrap tracking-[0.2em]">v0.6.0</span>
            </div>
            
            <div className="flex flex-col gap-4 items-center">
              <div 
                onClick={() => logout()}
                className="p-2 cursor-pointer text-white/20 hover:text-bear transition-all group active:scale-90"
                title="Disconnect"
              >
                <LogOut size={20} />
              </div>
              <div className="p-2 cursor-pointer text-white/20 hover:text-white/60 transition-all active:scale-90">
                <Settings size={20} />
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Institutional Header */}
          <header className="h-[52px] flex-shrink-0 border-b border-white/[0.04] flex items-center px-6 justify-between bg-white/[0.01] backdrop-blur-xl z-40">
            <div className="flex items-center gap-10">
              <StatItem label="Total Equity" value={`$${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} isPnL={false} />
              <div className="w-px h-6 bg-white/[0.04]"></div>
              <StatItem label="Available" value={`$${user?.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} isPnL={false} />
              <div className="w-px h-6 bg-white/[0.04]"></div>
              <StatItem 
                label="Unrealized PnL" 
                value={`${unrealizedPnL >= 0 ? '+' : ''}${unrealizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
                isPnL={true} 
                positive={unrealizedPnL >= 0} 
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="pro-label !text-[8px] opacity-40">Node Standing</span>
                <span className="text-[11px] font-bold text-bull tracking-tight">RANK #{leaderboard.find(l => l.username === user?.username)?.rank || '---'}</span>
              </div>
            </div>
          </header>

          {/* Main Viewport */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}

const NavIcon = ({ active, icon, onClick, label, color }: any) => (
  <div className="group relative flex flex-col items-center">
    <div 
      onClick={onClick}
      className={`p-3 cursor-pointer rounded-xl transition-all relative ${active ? 'bg-white/5' : 'text-white/20 hover:bg-white/[0.03] hover:text-white/40'}`}
      style={active ? { color: color || '#FFFFFF' } : {}}
    >
      {icon}
      {active && <div className="absolute left-[-18px] top-1/4 w-[3px] h-1/2 rounded-r-full shadow-[0_0_15px_rgba(255,255,255,0.6)]" style={{backgroundColor: color || '#FFFFFF', boxShadow: `0 0 15px ${color || '#FFFFFF'}`}}></div>}
    </div>
    <span className="absolute left-full ml-4 px-2 py-1 bg-[#1C1E26] border border-white/[0.05] rounded text-[9px] font-bold text-white/60 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity z-[100] pointer-events-none whitespace-nowrap">
      {label}
    </span>
  </div>
);

const StatItem = ({ label, value, isPnL, positive }: any) => (
  <div className="flex flex-col gap-0.5">
    <span className="pro-label !text-[9px]">{label}</span>
    <span className={`text-[13px] font-mono font-bold tracking-tight ${isPnL ? (positive ? 'text-bull' : 'text-bear') : 'text-white'}`}>
      {value}
    </span>
  </div>
);

export default App;
