import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface MarketState {
  prices: Record<string, number>;
  assets: any[];
  positions: any[];
  activeAsset: any | null;
  socket: Socket | null;
  connect: () => void;
  disconnect: () => void;
  setActiveAsset: (asset: any) => void;
  openPosition: (side: 'LONG' | 'SHORT', margin: number, leverage: number) => Promise<void>;
  closePosition: (positionId: string) => Promise<void>;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  prices: {},
  assets: [],
  positions: [],
  activeAsset: null,
  socket: null,

  connect: () => {
    if (get().socket) return;
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:28081';
    const socket = io(apiUrl);
    
    socket.on('market:prices', (prices: Record<string, number>) => {
      set({ prices });
    });

    socket.on('user:positions', (positions: any[]) => {
      set({ positions });
    });

    // Fetch initial assets
    fetch(`${apiUrl}/assets`)
      .then(res => res.json())
      .then(assets => {
        set({ assets, activeAsset: assets[0] });
      });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  setActiveAsset: (asset: any) => set({ activeAsset: asset }),

  openPosition: async (side, margin, leverage) => {
    const { activeAsset } = get();
    if (!activeAsset) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:28081';
    await fetch(`${apiUrl}/trade/open`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'dev-user', // Hardcoded for now
        assetId: activeAsset.id,
        side,
        margin,
        leverage
      })
    });
  },

  closePosition: async (positionId: string) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:28081';
    await fetch(`${apiUrl}/trade/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ positionId })
    });
  }
}));
