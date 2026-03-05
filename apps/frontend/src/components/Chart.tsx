import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, ISeriesApi } from 'lightweight-charts';
import { useMarketStore } from '../store/useMarketStore';

interface ChartProps {
  assetId: string;
  ticker: string;
}

const Chart: React.FC<ChartProps> = ({ assetId, ticker }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'>>(null);
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
        textColor: 'rgba(255, 255, 255, 0.5)',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
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
      upColor: '#00f3ff',
      downColor: '#ff00ff',
      borderVisible: false,
      wickUpColor: '#00f3ff',
      wickDownColor: '#ff00ff',
    });

    // @ts-ignore
    candleSeriesRef.current = candleSeries;

    // Fetch initial candles
    const host = window.location.hostname;
    const apiUrl = `http://${host}:28081`;
    fetch(`${apiUrl}/candles/${assetId}?tf=${activeTimeframe}`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          candleSeries.setData(data);
        }
      });

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [assetId, activeTimeframe]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
};

export default Chart;
