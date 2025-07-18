import { useState, useEffect } from 'react';
import { mockCryptoData, updateMockPrices } from '@/data/mockData';
import { calculateTechnicalIndicators } from '@/utils/technicalIndicators';
import { EnhancedCryptoTicker, useCryptoStore } from '@/stores/cryptoStore';

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

// Exchange API configurations
const exchangeConfigs = {
  binance: {
    tickerUrl: 'https://api.binance.com/api/v3/ticker/24hr',
    name: 'Binance'
  },
  bybit: {
    tickerUrl: 'https://api.bybit.com/v5/market/tickers?category=spot',
    name: 'Bybit'
  },
  coinbase: {
    tickerUrl: 'https://api.exchange.coinbase.com/products',
    statsUrl: 'https://api.exchange.coinbase.com/products/{symbol}/stats',
    name: 'Coinbase'
  }
};

export function useCryptoData(exchangeName: string, searchQuery: string = '') {
  const [tickers, setTickers] = useState<EnhancedCryptoTicker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setTickers: setStoreTickers, selectedTimeFrame } = useCryptoStore();

  useEffect(() => {
    let isMounted = true;

    const fetchBinanceData = async (): Promise<EnhancedCryptoTicker[]> => {
      const response = await fetch(exchangeConfigs.binance.tickerUrl);
      const data = await response.json();
      
      return data
        .filter((ticker: any) => ticker.symbol.endsWith('USDT'))
        .map((ticker: any) => {
          const price = parseFloat(ticker.lastPrice);
          return {
            symbol: ticker.symbol,
            baseAsset: ticker.symbol.replace('USDT', ''),
            quoteAsset: 'USDT',
            price,
            change24h: parseFloat(ticker.priceChangePercent),
            volume24h: parseFloat(ticker.quoteVolume),
            high24h: parseFloat(ticker.highPrice),
            low24h: parseFloat(ticker.lowPrice),
            indicators: calculateTechnicalIndicators(price),
          };
        });
    };

    const fetchBybitData = async (): Promise<EnhancedCryptoTicker[]> => {
      const response = await fetch(exchangeConfigs.bybit.tickerUrl);
      const data = await response.json();
      
      if (!data.result?.list) return [];
      
      return data.result.list
        .filter((ticker: any) => ticker.symbol.endsWith('USDT'))
        .map((ticker: any) => {
          const price = parseFloat(ticker.lastPrice);
          return {
            symbol: ticker.symbol,
            baseAsset: ticker.symbol.replace('USDT', ''),
            quoteAsset: 'USDT',
            price,
            change24h: parseFloat(ticker.price24hPcnt) * 100,
            volume24h: parseFloat(ticker.turnover24h),
            high24h: parseFloat(ticker.highPrice24h),
            low24h: parseFloat(ticker.lowPrice24h),
            indicators: calculateTechnicalIndicators(price),
          };
        });
    };

    const fetchCoinbaseData = async (): Promise<EnhancedCryptoTicker[]> => {
      const productsResponse = await fetch(exchangeConfigs.coinbase.tickerUrl);
      const products = await productsResponse.json();
      
      const usdtProducts = products.filter((product: any) => 
        product.quote_currency === 'USD' && product.status === 'online'
      );

      const tickers = await Promise.all(
        usdtProducts.slice(0, 50).map(async (product: any) => {
          try {
            const statsUrl = exchangeConfigs.coinbase.statsUrl.replace('{symbol}', product.id);
            const statsResponse = await fetch(statsUrl);
            const stats = await statsResponse.json();
            
            const price = parseFloat(stats.last) || 0;
            return {
              symbol: `${product.base_currency}USD`,
              baseAsset: product.base_currency,
              quoteAsset: 'USD',
              price,
              change24h: parseFloat(stats.open) ? 
                ((parseFloat(stats.last) - parseFloat(stats.open)) / parseFloat(stats.open)) * 100 : 0,
              volume24h: parseFloat(stats.volume) || 0,
              high24h: parseFloat(stats.high) || 0,
              low24h: parseFloat(stats.low) || 0,
              indicators: calculateTechnicalIndicators(price),
            };
          } catch {
            return null;
          }
        })
      );

      return tickers.filter(Boolean) as EnhancedCryptoTicker[];
    };

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        let processedTickers: EnhancedCryptoTicker[] = [];

        switch (exchangeName) {
          case 'binance':
            processedTickers = await fetchBinanceData();
            break;
          case 'bybit':
            processedTickers = await fetchBybitData();
            break;
          case 'coinbase':
            processedTickers = await fetchCoinbaseData();
            break;
          default:
            throw new Error('Unsupported exchange');
        }

        if (!isMounted) return;

        // Filter by search query
        const filteredTickers = processedTickers.filter(ticker => {
          if (!searchQuery) return true;
          return ticker.baseAsset.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 ticker.symbol.toLowerCase().includes(searchQuery.toLowerCase());
        });

        // Sort by volume and limit to top 100
        const sortedTickers = filteredTickers
          .sort((a, b) => b.volume24h - a.volume24h)
          .slice(0, 100);

        setTickers(sortedTickers);
        setStoreTickers(sortedTickers);
      } catch (err) {
        if (isMounted) {
          console.warn('API failed, using mock data:', err);
          
          // Use mock data as fallback
          let fallbackData = [...mockCryptoData];
          
          // Update prices to simulate real-time data
          fallbackData = updateMockPrices(fallbackData);
          
          // Add technical indicators to mock data
          const enhancedFallbackData: EnhancedCryptoTicker[] = fallbackData.map(ticker => ({
            ...ticker,
            indicators: calculateTechnicalIndicators(ticker.price),
          }));
          
          // Filter by search query
          const filteredMockData = enhancedFallbackData.filter(ticker => {
            if (!searchQuery) return true;
            return ticker.baseAsset.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   ticker.symbol.toLowerCase().includes(searchQuery.toLowerCase());
          });

          setTickers(filteredMockData);
          setStoreTickers(filteredMockData);
          setError(`Using demo data - ${exchangeName} API unavailable in browser`);
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