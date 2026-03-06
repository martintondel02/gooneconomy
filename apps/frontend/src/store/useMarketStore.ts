import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

interface MarketState {
  prices: Record<string, number>;
  marketCaps: Record<string, number>;
  orderbooks: Record<string, any>;
  assets: any[];
  positions: any[];
  trades: any[];
  leaderboard: any[];
  user: any | null;
  token: string | null;
  activeAsset: any | null;
  activeTimeframe: string;
  activeTab: 'TRADING' | 'PORTFOLIO' | 'SHOP' | 'ADMIN';
  socket: Socket | null;
  connect: () => void;
  disconnect: () => void;
  login: (username: string, password: string) => Promise<{ error?: string }>;
  register: (username: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
  setActiveAsset: (asset: any) => void;
  setActiveTimeframe: (tf: string) => void;
  setActiveTab: (tab: 'TRADING' | 'PORTFOLIO' | 'SHOP' | 'ADMIN') => void;
  openPosition: (side: 'LONG' | 'SHORT', margin: number, leverage: number) => Promise<void>;
  closePosition: (positionId: string) => Promise<void>;
  fetchUser: () => Promise<void>;
  fetchTrades: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  fetchAssets: () => Promise<void>;
  
  // Admin Actions
  adminAssets: any[];
  fetchAdminAssets: () => Promise<void>;
  addAsset: (formData: FormData) => Promise<void>;
  editAsset: (id: string, formData: FormData) => Promise<void>;
  setMarketEvent: (assetId: string, magnitude: number, durationSeconds: number) => Promise<void>;
  clearMarketEvents: (assetId: string) => Promise<void>;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  prices: {},
  marketCaps: {},
  orderbooks: {},
  assets: [],
  positions: [],
  trades: [],
  leaderboard: [],
  user: null,
  token: localStorage.getItem('goon_token'),
  activeAsset: null,
  activeTimeframe: '1m',
  activeTab: 'TRADING',
  socket: null,
  adminAssets: [],

  connect: () => {
    if (get().socket) return;
    
    const host = window.location.hostname;
    const apiUrl = `http://${host}:28081`;
    const socket = io(apiUrl);
    
    socket.on('connect', () => {
      console.log('Connected to backend:', apiUrl);
      const { user } = get();
      if (user) {
        socket.emit('subscribe:user', user.id);
      }
    });

    socket.on('market:prices', (prices: Record<string, number>) => set({ prices }));
    socket.on('market:caps', (marketCaps: Record<string, number>) => set({ marketCaps }));
    socket.on('market:orderbooks', (orderbooks: Record<string, any>) => set({ orderbooks }));
    
    socket.on('market:liquidations', (liquidations: any[]) => {
      const { user } = get();
      if (!user) return;
      
      liquidations.forEach(liq => {
        if (liq.position.userId === user.id) {
          toast.error(`LIQUIDATION: ${liq.position.assetId} ${liq.position.side} (-$${Math.abs(liq.pnl).toFixed(2)})`);
          get().fetchUser();
          get().fetchTrades();
        }
      });
    });

    socket.on('user:positions', (positions: any[]) => {
      const { user } = get();
      if (user) {
        const userPositions = positions.filter(p => p.userId === user.id);
        set({ positions: userPositions });
      }
    });
    
    socket.on('market:leaderboard', (leaderboard: any[]) => set({ leaderboard }));
    
    socket.on('user:data', (freshUser: any) => {
      set({ user: freshUser });
      localStorage.setItem('goon_user', JSON.stringify(freshUser));
    });

    // Fetch initial data
    get().fetchAssets();
    get().fetchLeaderboard();

    set({ socket });

    const { token, user } = get();
    if (token && !user) {
      get().fetchUser();
    }
    if (user) {
      get().fetchTrades();
    }
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  fetchAssets: async () => {
    const host = window.location.hostname;
    const apiUrl = `http://${host}:28081`;
    const res = await fetch(`${apiUrl}/assets`);
    const assets = await res.json();
    set({ assets, activeAsset: get().activeAsset || assets[0] });
  },

  fetchLeaderboard: async () => {
    const host = window.location.hostname;
    const apiUrl = `http://${host}:28081`;
    const res = await fetch(`${apiUrl}/leaderboard`);
    const data = await res.json();
    set({ leaderboard: data });
  },

  fetchUser: async () => {
    const { token } = get();
    if (!token) return;

    try {
      const storedUser = localStorage.getItem('goon_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        set({ user });
        
        const host = window.location.hostname;
        const apiUrl = `http://${host}:28081`;
        const res = await fetch(`${apiUrl}/user/${user.id}`);
        if (res.ok) {
          const freshUser = await res.json();
          set({ user: freshUser });
          localStorage.setItem('goon_user', JSON.stringify(freshUser));
          
          const { socket } = get();
          if (socket) socket.emit('subscribe:user', freshUser.id);
        }
      }
    } catch (e) {
      console.error('Failed to fetch user', e);
    }
  },

  fetchTrades: async () => {
    const { user } = get();
    if (!user) return;
    const host = window.location.hostname;
    const apiUrl = `http://${host}:28081`;
    const res = await fetch(`${apiUrl}/user/trades/${user.id}`);
    if (res.ok) {
      const data = await res.json();
      set({ trades: data });
    }
  },

  login: async (username, password) => {
    const host = window.location.hostname;
    const apiUrl = `http://${host}:28081`;
    const res = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const result = await res.json();
    if (result.error) {
      toast.error(result.error);
      return result;
    }

    localStorage.setItem('goon_token', result.token);
    localStorage.setItem('goon_user', JSON.stringify(result.user));
    set({ token: result.token, user: result.user });
    
    const { socket } = get();
    if (socket) socket.emit('subscribe:user', result.user.id);
    get().fetchTrades();
    toast.success('Session Authenticated');
    return {};
  },

  register: async (username, password) => {
    const host = window.location.hostname;
    const apiUrl = `http://${host}:28081`;
    const res = await fetch(`${apiUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const result = await res.json();
    if (result.error) {
      toast.error(result.error);
      return result;
    }

    localStorage.setItem('goon_token', result.token);
    localStorage.setItem('goon_user', JSON.stringify(result.user));
    set({ token: result.token, user: result.user });

    const { socket } = get();
    if (socket) socket.emit('subscribe:user', result.user.id);
    get().fetchTrades();
    toast.success('Terminal Provisioned');
    return {};
  },

  logout: () => {
    localStorage.removeItem('goon_token');
    localStorage.removeItem('goon_user');
    set({ token: null, user: null, positions: [], trades: [] });
    toast.success('Session Terminated');
  },

  setActiveAsset: (asset: any) => set({ activeAsset: asset }),
  setActiveTimeframe: (tf: string) => set({ activeTimeframe: tf }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  openPosition: async (side, margin, leverage) => {
    const { activeAsset, user } = get();
    if (!activeAsset || !user) return;

    const host = window.location.hostname;
    const apiUrl = `http://${host}:28081`;
    const res = await fetch(`${apiUrl}/trade/open`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id, 
        assetId: activeAsset.id,
        side,
        margin,
        leverage
      })
    });
    if (res.ok) {
      toast.success(`ORDER FILLED: ${side} ${activeAsset.ticker} @ ${leverage}x`);
      get().fetchUser();
      get().fetchTrades();
    } else {
      toast.error('ORDER REJECTED');
    }
  },

  closePosition: async (positionId: string) => {
    const host = window.location.hostname;
    const apiUrl = `http://${host}:28081`;
    const res = await fetch(`${apiUrl}/trade/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ positionId })
    });
    
    if (res.ok) {
      const data = await res.json();
      const pnlPrefix = data.pnl >= 0 ? '+' : '';
      toast.success(`POSITION CLOSED: ${pnlPrefix}$${data.pnl.toFixed(2)}`);
      get().fetchUser();
      get().fetchTrades();
    } else {
      toast.error('CLOSE REJECTED');
    }
  },

  fetchAdminAssets: async () => {
    const host = window.location.hostname;
    const apiUrl = `http://${host}:28081`;
    const res = await fetch(`${apiUrl}/admin/assets`);
    const data = await res.json();
    set({ adminAssets: data });
  },

  addAsset: async (formData) => {
    const host = window.location.hostname;
    const apiUrl = `http://${host}:28081`;
    const res = await fetch(`${apiUrl}/admin/assets/add`, {
      method: 'POST',
      body: formData
    });
    if (res.ok) {
      toast.success('Asset Node Initialized');
      get().fetchAdminAssets();
      get().fetchAssets(); // Refresh public assets too
    } else {
      toast.error('Initialization Failed');
    }
  },

  editAsset: async (id, formData) => {
    const host = window.location.hostname;
    const apiUrl = `http://${host}:28081`;
    const res = await fetch(`${apiUrl}/admin/assets/${id}`, {
      method: 'PATCH',
      body: formData
    });
    if (res.ok) {
      toast.success('Asset Node Modified');
      get().fetchAdminAssets();
      get().fetchAssets(); // Refresh public assets too
    } else {
      toast.error('Modification Failed');
    }
  },

  setMarketEvent: async (assetId, magnitude, durationSeconds) => {
    const host = window.location.hostname;
    const apiUrl = `http://${host}:28081`;
    await fetch(`${apiUrl}/admin/market/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetId, magnitude, durationSeconds })
    });
    toast.success(`Market Event Dispatched`);
  },

  clearMarketEvents: async (assetId) => {
    const host = window.location.hostname;
    const apiUrl = `http://${host}:28081`;
    await fetch(`${apiUrl}/admin/market/clear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assetId })
    });
    toast.success(`Asset Stabilized`);
  }
}));
