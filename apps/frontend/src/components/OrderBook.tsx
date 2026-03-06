import React from 'react';
import { useMarketStore } from '../store/useMarketStore';

const OrderBook: React.FC = () => {
  const { activeAsset, orderbooks, prices } = useMarketStore();
  const book = activeAsset ? orderbooks[activeAsset.id] : null;
  const currentPrice = activeAsset ? prices[activeAsset.ticker] : 0;

  if (!book) return (
    <div className="flex-1 flex flex-col bg-[#13161f] terminal-border-l overflow-hidden">
      <div className="h-9 px-4 flex items-center bg-white/[0.02] terminal-border-b">
        <span className="pro-label">Order Book</span>
      </div>
      <div className="flex-1 flex items-center justify-center opacity-10">
        <span className="text-[10px] font-bold uppercase tracking-widest">Loading Book...</span>
      </div>
    </div>
  );

  const maxQty = Math.max(
    ...book.asks.map((a: any) => a.quantity),
    ...book.bids.map((b: any) => b.quantity)
  );

  return (
    <div className="w-[240px] flex flex-col bg-[#13161f] terminal-border-l overflow-hidden">
      <div className="h-9 px-4 flex items-center justify-between bg-white/[0.02] terminal-border-b">
        <span className="pro-label">Order Book</span>
        <div className="flex gap-2">
           <span className="text-[8px] text-white/20 font-bold">0.01</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden font-mono text-[10px]">
        {/* Header */}
        <div className="grid grid-cols-2 px-4 py-1.5 opacity-30 border-b border-white/[0.02]">
          <span className="text-left">Price</span>
          <span className="text-right">Quantity</span>
        </div>

        {/* Asks (Sells) - Top down */}
        <div className="flex-1 flex flex-col-reverse justify-end overflow-hidden">
          {book.asks.slice(0, 15).map((ask: any, i: number) => (
            <div key={`ask-${i}`} className="grid grid-cols-2 px-4 py-[3px] relative group cursor-pointer hover:bg-white/[0.02]">
              <div 
                className="absolute right-0 top-0 bottom-0 bg-bear/10 transition-all duration-500" 
                style={{ width: `${(ask.quantity / maxQty) * 100}%` }}
              ></div>
              <span className="text-bear font-bold relative z-10">{ask.price.toFixed(activeAsset.ticker === 'GOON' ? 2 : 4)}</span>
              <span className="text-right text-white/60 relative z-10">{ask.quantity.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Spread / Mid Price */}
        <div className="px-4 py-3 bg-white/[0.01] border-y border-white/[0.03] flex flex-col items-center">
          <span className={`text-[14px] font-black tracking-tight ${prices[activeAsset.ticker] > activeAsset.price ? 'text-bull' : 'text-bear'}`}>
            ${currentPrice?.toFixed(currentPrice < 1 ? 4 : 2)}
          </span>
          <span className="text-[8px] text-white/20 font-bold uppercase tracking-tighter mt-0.5">Spread: 0.05%</span>
        </div>

        {/* Bids (Buys) */}
        <div className="flex-1 overflow-hidden">
          {book.bids.slice(0, 15).map((bid: any, i: number) => (
            <div key={`bid-${i}`} className="grid grid-cols-2 px-4 py-[3px] relative group cursor-pointer hover:bg-white/[0.02]">
              <div 
                className="absolute right-0 top-0 bottom-0 bg-bull/10 transition-all duration-500" 
                style={{ width: `${(bid.quantity / maxQty) * 100}%` }}
              ></div>
              <span className="text-bull font-bold relative z-10">{bid.price.toFixed(activeAsset.ticker === 'GOON' ? 2 : 4)}</span>
              <span className="text-right text-white/60 relative z-10">{bid.quantity.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
