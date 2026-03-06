import express, { Request } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { MatchingEngine } from './engine/MatchingEngine.js';
import { ShadowMarketMaker } from './engine/ShadowMarketMaker.js';
import { CandleStore } from './store/CandleStore.js';
import { PositionManager, PositionSide } from './manager/PositionManager.js';
import { LeaderboardManager } from './manager/LeaderboardManager.js';
import { AuthManager } from './manager/AuthManager.js';
import { initRedis } from './store/RedisManager.js';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 28081;

// Setup File Uploads using absolute paths for CommonJS
const uploadDir = path.resolve(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Initialize Market Engines
const engine = new MatchingEngine();
const candleStore = new CandleStore();
const posManager = new PositionManager(engine);
const leaderboard = new LeaderboardManager(posManager);
const authManager = new AuthManager();
const shadowMarketMaker = new ShadowMarketMaker(engine);

const initialAssets = [
  { ticker: 'GOON', name: 'GoonCoin', type: 'CRYPTO' as const, price: 142.32, supply: 1000000, vol: 5.0 },
  { ticker: 'BTC', name: 'Bitcoin', type: 'CRYPTO' as const, price: 64231.50, supply: 21000000, vol: 1.0 },
  { ticker: 'ETH', name: 'Ethereum', type: 'CRYPTO' as const, price: 3451.20, supply: 120000000, vol: 1.2 },
  { ticker: 'PUMPKIN', name: 'PumpkinCoin', type: 'CRYPTO' as const, price: 0.042, supply: 1000000000, vol: 8.0 },
  { ticker: 'MOSSAD', name: 'MossadCoin', type: 'CRYPTO' as const, price: 1.00, supply: 10000000, vol: 10.0 },
  { ticker: 'NVDA', name: 'Nvidia', type: 'STOCK' as const, price: 892.12, supply: 2500000000, vol: 1.5 },
  { ticker: 'ORCL', name: 'Oracle', type: 'STOCK' as const, price: 125.40, supply: 2700000000, vol: 0.8 },
  { ticker: 'AAPL', name: 'Apple', type: 'STOCK' as const, price: 172.10, supply: 15000000000, vol: 0.7 },
  { ticker: 'TSLA', name: 'Tesla', type: 'STOCK' as const, price: 165.30, supply: 3000000000, vol: 2.0 },
  { ticker: 'PLTR', name: 'Palantir', type: 'STOCK' as const, price: 24.15, supply: 2200000000, vol: 2.5 },
  { ticker: 'GOLD', name: 'Gold', type: 'COMMODITY' as const, price: 2145.00, supply: 100000000, vol: 0.4 },
];

async function initializeServer() {
  console.log('Initializing GoonEconomy Server...');
  
  await initRedis();

  for (const a of initialAssets) {
    await prisma.asset.upsert({
      where: { ticker: a.ticker },
      update: {},
      create: {
        ticker: a.ticker,
        name: a.name,
        type: a.type,
        currentPrice: a.price,
        totalSupply: a.supply,
        volatility: a.vol
      }
    });
  }

  await engine.syncFromDb();
  await shadowMarketMaker.recoverState();
  console.log('Engine synced with database and Redis.');

  httpServer.listen(port, () => {
    console.log(`GoonEconomy Backend listening on port ${port}`);
  });
}

app.use(cors());
app.use(express.json());
// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '0.7.0', timestamp: Date.now() });
});

// Auth Routes
app.post('/auth/register', async (req, res) => {
  const { username, password } = req.body;
  const result = await authManager.register(username, password);
  if (result.error) return res.status(400).json(result);
  res.json(result);
});

app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await authManager.login(username, password);
  if (result.error) return res.status(401).json(result);
  res.json(result);
});

// --- ADMIN ROUTES ---
app.get('/admin/assets', async (req, res) => {
  const assets = await prisma.asset.findMany({ orderBy: { ticker: 'asc' } });
  res.json(assets);
});

app.post('/admin/assets/add', upload.single('image'), async (req: Request, res) => {
  try {
    const data = JSON.parse(req.body.data);
    if (req.file) {
      data.imageUrl = `/uploads/${req.file.filename}`;
    }
    const asset = await prisma.asset.create({ data });
    await engine.syncFromDb();
    res.json(asset);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.patch('/admin/assets/:id', upload.single('image'), async (req: Request, res) => {
  try {
    const data = JSON.parse(req.body.data);
    if (req.file) {
      data.imageUrl = `/uploads/${req.file.filename}`;
    }
    const asset = await prisma.asset.update({ 
      where: { id: req.params.id }, 
      data 
    });
    await engine.syncFromDb();
    res.json(asset);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/admin/market/event', async (req, res) => {
  const { assetId, magnitude, durationSeconds } = req.body;
  shadowMarketMaker.setMarketEvent(assetId, magnitude, durationSeconds);
  res.json({ success: true });
});

app.post('/admin/market/clear', async (req, res) => {
  const { assetId } = req.body;
  shadowMarketMaker.clearEvents(assetId);
  res.json({ success: true });
});

// GLOBAL ECONOMY RESET
app.post('/admin/economy/reset', async (req, res) => {
  try {
    await prisma.user.updateMany({
      data: { cashBalance: 100.0, statusScore: 0 }
    });
    await prisma.position.deleteMany({});
    await prisma.trade.deleteMany({});

    for (const a of initialAssets) {
      await prisma.asset.update({
        where: { ticker: a.ticker },
        data: { currentPrice: a.price, manualBias: 0.0 }
      });
    }

    await engine.syncFromDb();
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// --- ADMIN USER MANAGEMENT ("The Hammer") ---
app.get('/admin/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: { select: { positions: { where: { isActive: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Calculate live net worths
    const usersWithStats = await Promise.all(users.map(async user => {
      const activePos = await posManager.getActivePositions(user.id);
      const unrealizedPnL = activePos.reduce((acc: number, p: any) => acc + posManager.calculatePnL(p), 0);
      return {
        ...user,
        activePositions: user._count.positions,
        netWorth: user.cashBalance + unrealizedPnL,
        unrealizedPnL
      };
    }));
    
    res.json(usersWithStats);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/admin/users/wipe', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Close all positions instantly
    const userPositions = await posManager.getActivePositions(userId);
    for (const pos of userPositions) {
      await posManager.closePosition(pos.id);
    }
    
    // Wipe balance
    await prisma.user.update({
      where: { id: userId },
      data: { cashBalance: 0 }
    });
    
    // Force websocket update to the user
    io.to(`user:${userId}`).emit('user:wipe');
    
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/admin/users/stimulus', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    
    await prisma.user.update({
      where: { id: userId },
      data: { cashBalance: { increment: amount } }
    });
    
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// --- PUBLIC ROUTES ---
app.get('/assets', (req, res) => {
  res.json(engine.getAssets());
});

app.get('/candles/:assetId', (req, res) => {
  const { assetId } = req.params;
  const tf = (req.query.tf as any) || '1m';
  const candles = candleStore.getCandles(assetId, tf);
  res.json(candles);
});

app.post('/trade/open', async (req, res) => {
  const { userId, assetId, side, margin, leverage } = req.body;
  const position = await posManager.openPosition(userId, assetId, side as PositionSide, margin, leverage);
  res.json(position);
});

app.post('/trade/close', async (req, res) => {
  const { positionId } = req.body;
  const result = await posManager.closePosition(positionId);
  if (!result) return res.status(404).json({ error: 'Position not found' });
  res.json(result);
});

app.get('/leaderboard', async (req, res) => {
  res.json(await leaderboard.getLeaderboard());
});

app.get('/user/:userId', async (req, res) => {
  const user = await leaderboard.getUser(req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.get('/user/trades/:userId', async (req, res) => {
  const trades = await prisma.trade.findMany({
    where: { userId: req.params.userId },
    orderBy: { timestamp: 'desc' },
    take: 50
  });
  res.json(trades);
});

// HIGH-FREQUENCY MARKET ENGINE LOOP (100ms)
setInterval(async () => {
  try {
    shadowMarketMaker.tick();

    const assets = engine.getAssets();
    assets.forEach(asset => {
      candleStore.update(asset.id, asset.currentPrice);
    });
  } catch (err) {
    console.error('Error in shadow market maker tick:', err);
  }
}, 100);

// REAL-TIME DATA EMISSION LOOP (1000ms)
setInterval(async () => {
  try {
    const currentPrices: Record<string, number> = {};
    const currentMarketCaps: Record<string, number> = {};
    const orderbooks: Record<string, any> = {};

    const assets = engine.getAssets();
    assets.forEach(asset => {
      const price = asset.currentPrice;
      const marketCap = price * asset.totalSupply;
      
      currentPrices[asset.ticker] = price;
      currentMarketCaps[asset.ticker] = marketCap;
      orderbooks[asset.id] = engine.getOrderBook(asset.id);
    });
    
    const liquidations = await posManager.checkLiquidations();
    if (liquidations.length > 0) {
      io.emit('market:liquidations', liquidations);
    }

    const allActivePositions = await posManager.getActivePositions();
    const activePositionsWithPnL = allActivePositions.map((p: any) => ({
      ...p,
      pnl: posManager.calculatePnL(p),
      currentPrice: engine.getCurrentPrice(p.assetId)
    }));

    const lbData = await leaderboard.getLeaderboard();

    io.emit('market:prices', currentPrices);
    io.emit('market:caps', currentMarketCaps);
    io.emit('market:orderbooks', orderbooks);
    io.emit('user:positions', activePositionsWithPnL);
    io.emit('market:leaderboard', lbData);
    
    const connectedUserIds = Array.from(io.sockets.adapter.rooms.keys())
      .filter(room => room.startsWith('user:'))
      .map(room => room.replace('user:', ''));

    for (const userId of connectedUserIds) {
      const userData = await leaderboard.getUser(userId);
      if (userData) {
        io.to(`user:${userId}`).emit('user:data', userData);
      }
    }
  } catch (err) {
    console.error('Error in market emission loop:', err);
  }
}, 1000);

// Periodic persistence loop (every 30s)
setInterval(async () => {
  try {
    await engine.persistPrices();
  } catch (err) {
    console.error('Price persistence failed:', err);
  }
}, 30000);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('subscribe:user', (userId) => {
    socket.join(`user:${userId}`);
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

initializeServer();
