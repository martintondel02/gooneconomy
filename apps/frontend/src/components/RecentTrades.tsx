import React from 'react';
import { useMarketStore } from '../store/useMarketStore';

const RecentTrades: React.FC = () => {
  const { activeAsset, recentTrades } = useMarketStore();
  const trades = activeAsset ? recentTrades[activeAsset.id] || [] : [];

  return (
    <div className="flex-1 flex flex-col bg-[#13161f] terminal-border-t overflow-hidden">
      <div className="h-9 px-4 flex items-center bg-white/[0.02] terminal-border-b">
        <span className="pro-label">Recent Trades</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[10px]">
        <div className="grid grid-cols-3 px-4 py-1.5 opacity-30 border-b border-white/[0.02]">
          <span>Price</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Time</span>
        </div>

        <div className="flex flex-col">
          {trades.map((trade: any) => (
            <div key={trade.id} className="grid grid-cols-3 px-4 py-1 hover:bg-white/[0.02] transition-colors">
              <span className={trade.type === 'BUY' ? 'text-bull font-bold' : 'text-bear font-bold'}>
                {trade.price.toFixed(activeAsset?.ticker === 'GOON' ? 2 : 4)}
              </span>
              <span className="text-right text-white/60">{trade.quantity.toFixed(3)}</span>
              <span className="text-right text-white/20">
                {new Date(trade.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          ))}
          {trades.length === 0 && (
            <div className="px-4 py-8 text-center opacity-10 uppercase tracking-widest text-[8px] font-bold">
              Waiting for executions...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentTrades;
