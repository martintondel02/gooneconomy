export type AssetType = 'STOCK' | 'CRYPTO' | 'COMMODITY';

export interface Asset {
  id: string;
  ticker: string;
  name: string;
  type: AssetType;
  currentPrice: number;
  totalSupply: number;
  change24h?: number;
}

export interface User {
  id: string;
  username: string;
  cashBalance: number;
  netWorth: number;
  inventory: Record<string, number>; // assetTicker -> quantity
  statusScore: number;
}

export type TradeType = 'BUY' | 'SELL' | 'BET';

export interface Trade {
  id: string;
  userId: string;
  assetId: string;
  type: TradeType;
  quantity: number;
  priceAtExecution: number;
  timestamp: number;
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
}

export interface OrderBook {
  assetId: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

export interface MarketEvent {
  type: string;
  description: string;
  magnitude: number; // 0 to 1
  duration: number; // in milliseconds
  assetTarget?: string; // ticker or 'ALL'
}
