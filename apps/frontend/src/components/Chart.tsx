import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { createChart, ColorType, ISeriesApi } from 'lightweight-charts';
import { useMarketStore } from '../store/useMarketStore';

interface ChartProps {
  assetId: string;
  ticker: string;
  mode?: 'PRICE' | 'MARKET_CAP';
}

export interface ChartHandle {
  resetView: () => void;
}

const Chart = forwardRef<ChartHandle, ChartProps>(({ assetId, ticker, mode = 'MARKET_CAP' }, ref) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'>>(null);
  const [loading, setLoading] = useState(true);
  const { prices, marketCaps, activeTimeframe, assets } = useMarketStore();
  
  const currentAsset = assets.find(a => a.id === assetId);
  const currentCandleRef = useRef<{time: number, open: number, high: number, low: number, close: number} | null>(null);

  useImperativeHandle(ref, () => ({
    resetView: () => {
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    }
  }));

  // High-Frequency Price update effect
  useEffect(() => {
    if (!candleSeriesRef.current || !prices[ticker] || !currentAsset) return;

    let currentValue = prices[ticker];
    if (mode === 'MARKET_CAP') {
      currentValue = prices[ticker] * (currentAsset.totalSupply || 0);
    }

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
        open: currentValue,
        high: currentValue,
        low: currentValue,
        close: currentValue
      };
    } else {
      candle.high = Math.max(candle.high, currentValue);
      candle.low = Math.min(candle.low, currentValue);
      candle.close = currentValue;
    }

    currentCandleRef.current = candle;
    candleSeriesRef.current.update(candle as any);
  }, [prices[ticker], activeTimeframe, ticker, mode]);

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
        rightOffset: 5, 
        barSpacing: 6, 
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.05)',
        autoScale: true, 
        scaleMargins: {
          top: 0.2, 
          bottom: 0.2,
        },
      },
      handleScroll: true,
      handleScale: true,
      localization: {
        priceFormatter: (price: number) => {
          if (mode === 'MARKET_CAP') {
            if (price >= 1e9) return (price / 1e9).toFixed(2) + 'B';
            if (price >= 1e6) return (price / 1e6).toFixed(2) + 'M';
            if (price >= 1e3) return (price / 1e3).toFixed(1) + 'K';
            return price.toFixed(0);
          } else {
            return price.toFixed(ticker === 'PUMPKIN' ? 6 : 2);
          }
        },
      },
    });

    chartRef.current = chart;

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#00FF94',
      downColor: '#FF3E60',
      borderVisible: false,
      wickUpColor: '#00FF94',
      wickDownColor: '#FF3E60',
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
          // Transform historical data based on mode
          const transformedData = data.map((c: any) => {
            if (mode === 'MARKET_CAP' && currentAsset) {
              const multiplier = currentAsset.totalSupply || 1;
              return {
                time: c.time,
                open: c.open * multiplier,
                high: c.high * multiplier,
                low: c.low * multiplier,
                close: c.close * multiplier
              };
            }
            return c;
          });

          candleSeries.setData(transformedData);
          const lastCandle = transformedData[transformedData.length - 1];
          currentCandleRef.current = { ...lastCandle };
          
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
  }, [assetId, activeTimeframe, ticker, mode, currentAsset]);

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
