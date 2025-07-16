import { useState, useEffect } from 'react';
// @ts-ignore - CCXT browser bundle doesn't have perfect types
import ccxt from 'ccxt';

export interface CryptoTicker {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  marketCap?: number;
}

export function useCryptoData(exchangeName: string, searchQuery: string = '') {
  const [tickers, setTickers] = useState<CryptoTicker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        let exchange;
        
        // Initialize exchange
        switch (exchangeName) {
          case 'binance':
            exchange = new ccxt.binance({
              sandbox: false,
              enableRateLimit: true,
            });
            break;
          case 'bybit':
            exchange = new ccxt.bybit({
              sandbox: false,
              enableRateLimit: true,
            });
            break;
          case 'coinbase':
            exchange = new ccxt.coinbase({
              sandbox: false,
              enableRateLimit: true,
            });
            break;
          default:
            throw new Error('Unsupported exchange');
        }

        // Fetch markets and tickers
        const markets = await exchange.loadMarkets();
        const tickersData = await exchange.fetchTickers();

        if (!isMounted) return;

        // Filter for USDT pairs and process data
        const processedTickers: CryptoTicker[] = Object.entries(tickersData)
          .filter(([symbol]) => {
            const market = markets[symbol];
            return market && market.quote === 'USDT' && market.active;
          })
          .map(([symbol, ticker]: [string, any]) => {
            const market = markets[symbol];
            return {
              symbol,
              baseAsset: market.base,
              quoteAsset: market.quote,
              price: ticker.last || ticker.close || 0,
              change24h: ticker.percentage || ticker.change || 0,
              volume24h: ticker.quoteVolume || ticker.baseVolume || 0,
              high24h: ticker.high || 0,
              low24h: ticker.low || 0,
            };
          })
          .filter(ticker => {
            if (!searchQuery) return true;
            return ticker.baseAsset.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   ticker.symbol.toLowerCase().includes(searchQuery.toLowerCase());
          })
          .sort((a, b) => b.volume24h - a.volume24h)
          .slice(0, 100); // Limit to top 100 by volume

        setTickers(processedTickers);
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching crypto data:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [exchangeName, searchQuery]);

  return { tickers, loading, error };
}