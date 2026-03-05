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
  const { prices } = useMarketStore();

  // Price update effect
  useEffect(() => {
    if (!candleSeriesRef.current || !prices[ticker]) return;

    const price = prices[ticker];
    const now = Math.floor(Date.now() / 60000) * 60;

    candleSeriesRef.current.update({
      time: now as any,
      open: price, // This is a simplification, in a real app we'd track the candle's open
      high: price,
      low: price,
      close: price,
    });
  }, [prices, ticker]);

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
        secondsVisible: false,
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
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:28081';
    fetch(`${apiUrl}/candles/${assetId}`)
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
  }, [assetId]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
};

export default Chart;
