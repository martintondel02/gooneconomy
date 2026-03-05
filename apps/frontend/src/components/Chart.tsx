import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, ISeriesApi } from 'lightweight-charts';
import { useMarketStore } from '../store/useMarketStore';

interface ChartProps {
  assetId: string;
  ticker: string;
}

const Chart: React.FC<ChartProps> = ({ assetId, ticker }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'>>(null);
  const [loading, setLoading] = useState(true);
  const { marketCaps, activeTimeframe } = useMarketStore();

  // Price update effect
  useEffect(() => {
    if (!candleSeriesRef.current || !marketCaps[ticker]) return;

    const marketCap = marketCaps[ticker];
    const durationMap: Record<string, number> = {
      '1s': 1, '5s': 5, '15s': 15, '1m': 60, '5m': 300, '15m': 900,
      '1h': 3600, '3h': 10800, '12h': 43200, '24h': 86400,
    };
    const duration = durationMap[activeTimeframe] || 60;
    const now = Math.floor(Date.now() / 1000 / duration) * duration;

    candleSeriesRef.current.update({
      time: now as any,
      open: marketCap, 
      high: marketCap,
      low: marketCap,
      close: marketCap,
    });
  }, [marketCaps, ticker, activeTimeframe]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'rgba(255, 255, 255, 0.4)',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: 'rgba(255, 255, 255, 0.05)',
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.05)',
      },
      localization: {
        priceFormatter: (price: number) => {
          if (price >= 1e9) return (price / 1e9).toFixed(2) + 'B';
          if (price >= 1e6) return (price / 1e6).toFixed(2) + 'M';
          if (price >= 1e3) return (price / 1e3).toFixed(2) + 'K';
          return price.toFixed(2);
        },
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#2ebd85',
      downColor: '#ff4d6d',
      borderVisible: false,
      wickUpColor: '#2ebd85',
      wickDownColor: '#ff4d6d',
    });

    // @ts-ignore
    candleSeriesRef.current = candleSeries;

    // Fetch initial candles
    const host = window.location.hostname;
    const apiUrl = `http://${host}:28081`;
    setLoading(true);
    fetch(`${apiUrl}/candles/${assetId}?tf=${activeTimeframe}`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          candleSeries.setData(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [assetId, activeTimeframe]);

  return (
    <div className="w-full h-full relative">
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col gap-4 p-8 bg-black/40">
          <div className="flex-1 skeleton opacity-20"></div>
          <div className="h-24 skeleton opacity-10"></div>
        </div>
      )}
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
};

export default Chart;
