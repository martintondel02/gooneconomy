import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { createChart, ColorType, ISeriesApi } from 'lightweight-charts';
import { useMarketStore } from '../store/useMarketStore';

interface ChartProps {
  assetId: string;
  ticker: string;
}

export interface ChartHandle {
  resetView: () => void;
}

const Chart = forwardRef<ChartHandle, ChartProps>(({ assetId, ticker }, ref) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'>>(null);
  const [loading, setLoading] = useState(true);
  const { prices, activeTimeframe } = useMarketStore();
  
  const currentCandleRef = useRef<{time: number, open: number, high: number, low: number, close: number} | null>(null);

  useImperativeHandle(ref, () => ({
    resetView: () => {
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    }
  }));

  useEffect(() => {
    if (!candleSeriesRef.current || !prices[ticker]) return;

    const currentPrice = prices[ticker];
    const durationMap: Record<string, number> = {
      '1s': 1, '5s': 5, '10s': 10, '15s': 15, '30s': 30, '1m': 60, '5m': 300, '15m': 900,
      '1h': 3600, '3h': 10800, '4h': 14400, '12h': 43200, '24h': 86400, '1d': 86400
    };
    const duration = durationMap[activeTimeframe] || 60;
    const now = Math.floor(Date.now() / 1000 / duration) * duration;

    let candle = currentCandleRef.current;

    if (!candle || candle.time !== now) {
      candle = {
        time: now,
        open: currentPrice,
        high: currentPrice,
        low: currentPrice,
        close: currentPrice
      };
    } else {
      candle.high = Math.max(candle.high, currentPrice);
      candle.low = Math.min(candle.low, currentPrice);
      candle.close = currentPrice;
    }

    currentCandleRef.current = candle;
    candleSeriesRef.current.update(candle as any);
  }, [prices[ticker], activeTimeframe, ticker]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'rgba(255, 255, 255, 0.4)',
        fontSize: 10,
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.02)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.02)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        rightOffset: 5, // Give some space on the right
        barSpacing: 6,  // FIX: Increase bar spacing to prevent "too zoomed in" feel
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.05)',
        autoScale: true, // ENSURES AUTOSCALE IS ON
        scaleMargins: {
          top: 0.2, // Increased margins to prevent price from hitting ceiling
          bottom: 0.2,
        },
      },
      handleScroll: true,
      handleScale: true,
    });

    chartRef.current = chart;

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#00FF94',
      downColor: '#FF3E60',
      borderVisible: false,
      wickUpColor: '#00FF94',
      wickDownColor: '#FF3E60',
      priceFormat: {
        type: 'price',
        precision: ticker === 'PUMPKIN' ? 6 : 2,
        minMove: ticker === 'PUMPKIN' ? 0.000001 : 0.01,
      },
    });

    // @ts-ignore
    candleSeriesRef.current = candleSeries;

    const host = window.location.hostname;
    const apiUrl = `http://${host}:28081`;
    setLoading(true);
    
    fetch(`${apiUrl}/candles/${assetId}?tf=${activeTimeframe}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          candleSeries.setData(data);
          const lastCandle = data[data.length - 1];
          currentCandleRef.current = { ...lastCandle };
          
          // FIX DEFAULT ZOOM: Fit content then set a reasonable visible range
          chart.timeScale().fitContent();
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight 
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [assetId, activeTimeframe, ticker]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-black/5">
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col gap-4 p-8 bg-[#08090D]/60 backdrop-blur-md">
          <div className="flex-1 rounded-xl bg-white/[0.02] animate-pulse"></div>
        </div>
      )}
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
});

export default Chart;
