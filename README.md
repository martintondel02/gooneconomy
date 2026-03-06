# GoonEconomy - Institutional Grade Trading Terminal

GoonEconomy is a high-performance, real-time simulated trading terminal designed with a sleek "Institutional Grade" aesthetic. It features sub-second price action, a realistic momentum-based matching engine, and a comprehensive admin control nexus for market manipulation.

## Core Features

### 📈 High-Frequency Market Engine
*   **Sub-Second Tick Rate**: The internal engine ticks every 100ms, providing ultra-smooth, organic price movement.
*   **Momentum-based Random Walk**: Assets don't just jitter; they follow realistic momentum trends and volatility parameters, mimicking real-world institutional order flow.
*   **Live Orderbooks**: Real-time generation of Bid/Ask depth charts.
*   **Continuous Charting**: Uses TradingView's `lightweight-charts` to plot true OHLC (Open, High, Low, Close) candles down to the 1-second timeframe.

### 🛡️ Institutional Interface
*   **Modular Architecture**: A fully scalable, grid-based dashboard inspired by industry leaders like Kraken Pro and Bloomberg.
*   **"Apex" Design Language**: Utilizes a deep charcoal palette (`#08090D`) with vibrant "Apex Blue" and "Mint Green" accents to reduce eye strain while highlighting critical data.
*   **Zero-Overlap Tooltips**: A minimalist sidebar with dynamic, intelligent tooltips that never block the main workspace.
*   **Live Financial Positions**: Real-time calculation of Net Worth, Available Liquidity, and Unrealized PnL.

### ⚡ The "Hammer" (Admin Nexus)
A secure, Level-4 authorized control panel allowing system administrators to manage the simulation:
*   **Market Manipulation**: Deploy timed "Pumps" or "Crashes" with precise magnitude and duration controls to test user reaction.
*   **Asset Provisioning**: Dynamically add new Crypto, Stock, or Commodity assets with custom icons, initial pricing, and base volatility.
*   **Node Management**: Monitor all active users, their net worth, and active deployments in real-time.
*   **Sanction Protocols**: Instantly inject liquidity ($1k stimulus) or issue a "Wipe" command to instantly liquidate and burn a user's account.

## Tech Stack

*   **Frontend**: React 18, TypeScript, Vite, Zustand (State Management), Tailwind CSS (Styling), Lightweight Charts.
*   **Backend**: Node.js, Express, Socket.io (Real-time Websockets).
*   **Database**: PostgreSQL managed via Prisma ORM.
*   **Caching & State Recovery**: Redis (Used for maintaining high-frequency momentum states across backend restarts).
*   **Infrastructure**: Docker Compose (Multi-container orchestration).

## Getting Started

### Prerequisites
*   Docker & Docker Compose
*   Node.js v20+

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/martintondel02/gooneconomy.git
    cd gooneconomy
    ```

2.  **Start the infrastructure:**
    This will spin up the Frontend, Backend, PostgreSQL, and Redis containers.
    ```bash
    docker compose up -d --build
    ```

3.  **Access the Terminal:**
    *   Frontend UI: `http://localhost:28080`
    *   Backend API: `http://localhost:28081`

4.  **Admin Access:**
    By default, the first user created is not an admin. To grant admin access to a user, access the Postgres database and update their record:
    ```bash
    docker compose exec db psql -U user -d gooneconomy -c "UPDATE \"User\" SET \"isAdmin\" = true;"
    ```

## Project Structure

```
gooneconomy/
├── apps/
│   ├── frontend/       # React + Vite application
│   └── backend/        # Node.js + Express + Socket.io + Prisma
├── packages/
│   └── shared/         # Shared TypeScript interfaces (OrderBook, TradeType)
├── docker-compose.yml  # Container orchestration
└── package.json        # Root workspace configuration
```

## Contributing
Contributions to improve the market engine, add new technical indicators, or enhance the UI are welcome. Please ensure any UI updates adhere to the "Apex Institutional" design language.

## License
MIT
