import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface MarketState {
  prices: Record<string, number>;
  marketCaps: Record<string, number>;
  assets: any[];
  positions: any[];
  leaderboard: any[];
  user: any | null;
  activeAsset: any | null;
  activeTimeframe: string;
  socket: Socket | null;
  connect: () => void;
  disconnect: () => void;
  setActiveAsset: (asset: any) => void;
  setActiveTimeframe: (tf: string) => void;
  openPosition: (side: 'LONG' | 'SHORT', margin: number, leverage: number) => Promise<void>;
  closePosition: (positionId: string) => Promise<void>;
  claimStimulus: () => Promise<void>;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  prices: {},
  marketCaps: {},
  assets: [],
  positions: [],
  leaderboard: [],
  user: null,
  activeAsset: null,
  activeTimeframe: '1m',
  socket: null,

  connect: () => {
    if (get().socket) return;
    
    const host = window.location.hostname;
    const apiUrl = `http://${host}:28081`;
    const socket = io(apiUrl);
    
    socket.on('connect', () => console.log('Connected to backend:', apiUrl));
    socket.on('connect_error', (err) => console.error('Socket connection error:', err));

    socket.on('market:prices', (prices: Record<string, number>) => {
      set({ prices });
    });

    socket.on('market:caps', (marketCaps: Record<string, number>) => {
      set({ marketCaps });
    });

    socket.on('user:positions', (positions: any[]) => {
      set({ positions });
    });

    socket.on('market:leaderboard', (leaderboard: any[]) => {
      set({ leaderboard });
    });

    socket.on('user:data', (user: any) => {
      set({ user });
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

  setActiveTimeframe: (tf: string) => set({ activeTimeframe: tf }),

  openPosition: async (side, margin, leverage) => {
    const { activeAsset } = get();
    if (!activeAsset) return;

    const host = window.location.hostname;
    const apiUrl = `http://${host}:28081`;
    await fetch(`${apiUrl}/trade/open`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'dev-user', 
        assetId: activeAsset.id,
        side,
        margin,
        leverage
      })
    });
  },

  closePosition: async (positionId: string) => {
    const host = window.location.hostname;
    const apiUrl = `http://${host}:28081`;
    await fetch(`${apiUrl}/trade/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ positionId })
    });
  },

  claimStimulus: async () => {
    const host = window.location.hostname;
    const apiUrl = `http://${host}:28081`;
    const res = await fetch(`${apiUrl}/user/claim-stimulus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'dev-user' })
    });
    const result = await res.json();
    if (!result.success && result.nextClaimIn) {
      const hours = Math.floor(result.nextClaimIn / (60 * 60 * 1000));
      alert(`Stimulus available in ${hours} hours.`);
    }
  }
}));
