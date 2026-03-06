import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { createChart, ColorType, ISeriesApi, SeriesMarkerPosition, SeriesMarkerShape } from 'lightweight-charts';
import { useMarketStore } from '../store/useMarketStore';

interface ChartProps {
  assetId: string;
  ticker: string;
  mode?: 'PRICE' | 'MARKET_CAP';
}

export interface ChartHandle {
  resetView: () => void;
}

const MARKER_TTL_MS = 20000;

const Chart = forwardRef<ChartHandle, ChartProps>(({ assetId, ticker, mode = 'MARKET_CAP' }, ref) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'>>(null);
  const [loading, setLoading] = useState(true);
  
  const { prices, marketCaps, activeTimeframe, assets, trades } = useMarketStore();
  
  const currentAsset = assets.find(a => a.id === assetId);
  const currentCandleRef = useRef<{time: number, open: number, high: number, low: number, close: number} | null>(null);

  useImperativeHandle(ref, () => ({
    resetView: () => {
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    }
  }));

  // Render Trade Markers with TTL and Clustering
  useEffect(() => {
    if (!candleSeriesRef.current) return;
    
    const updateMarkers = () => {
      if (!candleSeriesRef.current) return;

      const now = Date.now();
      const assetTrades = trades
        .filter(t => t.assetId === assetId && (now - new Date(t.timestamp).getTime() <= MARKER_TTL_MS))
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      const groupedMarkers: Record<string, any> = {};

      assetTrades.forEach(trade => {
        const time = Math.floor(new Date(trade.timestamp).getTime() / 1000);
        const isBuy = trade.type === 'BUY';
        const key = `${time}-${trade.type}`; // Group by exact second AND trade direction

        if (!groupedMarkers[key]) {
          groupedMarkers[key] = {
            count: 1,
            totalValue: trade.priceAtExecution * trade.quantity,
            totalQuantity: trade.quantity,
            marker: {
              time: time as any,
              position: isBuy ? 'belowBar' as SeriesMarkerPosition : 'aboveBar' as SeriesMarkerPosition,
              color: isBuy ? '#00FF94' : '#FF3E60',
              shape: isBuy ? 'arrowUp' as SeriesMarkerShape : 'arrowDown' as SeriesMarkerShape,
              text: `${trade.type} @ $${trade.priceAtExecution.toFixed(2)}`,
              size: 1.5
            }
          };
        } else {
          const group = groupedMarkers[key];
          group.count += 1;
          group.totalValue += trade.priceAtExecution * trade.quantity;
          group.totalQuantity += trade.quantity;
          
          const avgPrice = group.totalValue / group.totalQuantity;
          group.marker.text = `${group.count}x ${trade.type} @ ~$${avgPrice.toFixed(2)}`;
          group.marker.size = Math.min(1.5 + (group.count * 0.3), 3); // Increase size slightly for big clusters
        }
      });

      const finalMarkers = Object.values(groupedMarkers).map(g => g.marker);
      candleSeriesRef.current.setMarkers(finalMarkers);
    };

    // Run immediately
    updateMarkers();

    // Set interval to clear out old markers
    const intervalId = setInterval(updateMarkers, 1000);

    return () => clearInterval(intervalId);
  }, [trades, assetId, mode]); 

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

    const candle = currentCandleRef.current;

    if (!candle || candle.time !== now) {
      const newCandle = {
        time: now as any,
        open: candle ? candle.close : currentValue,
        high: candle ? Math.max(candle.close, currentValue) : currentValue,
        low: candle ? Math.min(candle.close, currentValue) : currentValue,
        close: currentValue
      };
      currentCandleRef.current = newCandle as any;
      candleSeriesRef.current.update(newCandle);
    } else {
      const updatedCandle = {
        ...candle,
        time: candle.time as any,
        high: Math.max(candle.high, currentValue),
        low: Math.min(candle.low, currentValue),
        close: currentValue
      };
      currentCandleRef.current = updatedCandle as any;
      candleSeriesRef.current.update(updatedCandle);
    }
  }, [prices[ticker], activeTimeframe, ticker, mode, currentAsset]);

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
    const apiUrl = import.meta.env.VITE_API_URL || '';
    setLoading(true);
    
    fetch(`${apiUrl}/candles/${assetId}?tf=${activeTimeframe}`)
      .then(res => res.json())
      .then(data => {
        console.log(`[Chart] Loaded ${data?.length || 0} candles for ${ticker} (${activeTimeframe})`);
        if (data && data.length > 0) {
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
          currentCandleRef.current = { 
            time: lastCandle.time,
            open: lastCandle.open,
            high: lastCandle.high,
            low: lastCandle.low,
            close: lastCandle.close
          };
          
          // Ensure we see the latest data
          chart.timeScale().scrollToPosition(0, false);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(`[Chart] Failed to load history for ${ticker}:`, err);
        setLoading(false);
      });

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
