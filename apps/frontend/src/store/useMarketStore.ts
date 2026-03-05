import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface MarketState {
  prices: Record<string, number>;
  assets: any[];
  socket: Socket | null;
  connect: () => void;
  disconnect: () => void;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  prices: {},
  assets: [],
  socket: null,

  connect: () => {
    if (get().socket) return;
    
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:28081');
    
    socket.on('market:prices', (prices: Record<string, number>) => {
      set({ prices });
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  }
}));
