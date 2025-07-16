import { useState } from 'react';
import { ChevronUp, ChevronDown, Star, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { CryptoTicker } from '@/hooks/useCryptoData';
import { EnhancedCryptoTicker, useCryptoStore } from '@/stores/cryptoStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface CryptoTableProps {
  tickers: EnhancedCryptoTicker[];
  loading: boolean;
}

type SortField = 'symbol' | 'price' | 'change24h' | 'volume24h' | 'rsi' | 'macd';
type SortDirection = 'asc' | 'desc';

export function CryptoTable({ tickers, loading }: CryptoTableProps) {
  const [sortField, setSortField] = useState<SortField>('volume24h');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const { filteredTickers } = useCryptoStore();
  
  // Use filtered tickers from store if available, otherwise use props
  const displayTickers = filteredTickers.length > 0 ? filteredTickers : tickers;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const toggleWatchlist = (symbol: string) => {
    const newWatchlist = new Set(watchlist);
    if (newWatchlist.has(symbol)) {
      newWatchlist.delete(symbol);
    } else {
      newWatchlist.add(symbol);
    }
    setWatchlist(newWatchlist);
    localStorage.setItem('crypto-watchlist', JSON.stringify(Array.from(newWatchlist)));
  };

  const sortedTickers = [...displayTickers].sort((a, b) => {
    let aValue: any, bValue: any;
    
    if (sortField === 'rsi') {
      aValue = a.indicators?.rsi || 50;
      bValue = b.indicators?.rsi || 50;
    } else if (sortField === 'macd') {
      aValue = a.indicators?.macd || 0;
      bValue = b.indicators?.macd || 0;
    } else {
      aValue = a[sortField];
      bValue = b[sortField];
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    const aNum = Number(aValue) || 0;
    const bNum = Number(bValue) || 0;
    
    return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
  });

  const formatPrice = (price: number) => {
    if (price >= 1) return price.toFixed(2);
    if (price >= 0.01) return price.toFixed(4);
    return price.toFixed(8);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="h-4 w-4 opacity-30" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-primary" />
      : <ChevronDown className="h-4 w-4 text-primary" />;
  };

  if (loading) {
    return (
      <div className="crypto-card">
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              <div className="h-8 w-8 rounded-full loading-shimmer"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 loading-shimmer rounded"></div>
                <div className="h-3 loading-shimmer rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="crypto-card overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-muted-foreground">★</span>
                </div>
              </th>
              <th className="text-left p-4">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('symbol')}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <span>Coin</span>
                  <SortIcon field="symbol" />
                </Button>
              </th>
              <th className="text-right p-4">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('price')}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground ml-auto"
                >
                  <span>Price</span>
                  <SortIcon field="price" />
                </Button>
              </th>
              <th className="text-right p-4">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('change24h')}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground ml-auto"
                >
                  <span>24h %</span>
                  <SortIcon field="change24h" />
                </Button>
              </th>
              <th className="text-right p-4">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('volume24h')}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground ml-auto"
                >
                  <span>Volume</span>
                  <SortIcon field="volume24h" />
                </Button>
              </th>
              <th className="text-center p-4">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('rsi')}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <span>RSI</span>
                  <SortIcon field="rsi" />
                </Button>
              </th>
              <th className="text-center p-4">
                <Button
                  variant="ghost"
                  onClick={() => handleSort('macd')}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <span>MACD</span>
                  <SortIcon field="macd" />
                </Button>
              </th>
              <th className="text-center p-4">
                <span className="text-sm font-medium text-muted-foreground">Chart</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTickers.map((ticker, index) => (
              <motion.tr
                key={ticker.symbol}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
              >
                <td className="p-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleWatchlist(ticker.symbol)}
                    className="p-1 hover:bg-transparent"
                  >
                    <Star 
                      className={`h-4 w-4 ${
                        watchlist.has(ticker.symbol) 
                          ? 'fill-yellow-500 text-yellow-500' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`} 
                    />
                  </Button>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-neon flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-foreground">
                        {ticker.baseAsset.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{ticker.baseAsset}</div>
                      <div className="text-sm text-muted-foreground">{ticker.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="font-mono font-medium">
                    ${formatPrice(ticker.price)}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className={`flex items-center justify-end space-x-1 ${
                    ticker.change24h >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {ticker.change24h >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span className="font-medium">
                      {ticker.change24h >= 0 ? '+' : ''}{ticker.change24h.toFixed(2)}%
                    </span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="font-mono text-sm">
                    {formatVolume(ticker.volume24h)}
                  </div>
                </td>
                <td className="p-4 text-center">
                  <Badge
                    variant="outline"
                    className={`
                      ${(ticker.indicators?.rsi || 50) > 70 
                        ? 'border-destructive/50 text-destructive bg-destructive/10' 
                        : (ticker.indicators?.rsi || 50) < 30 
                        ? 'border-success/50 text-success bg-success/10'
                        : 'border-muted-foreground/50 text-muted-foreground'
                      }
                    `}
                  >
                    {(ticker.indicators?.rsi || 50).toFixed(0)}
                  </Badge>
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <div className={`h-2 w-2 rounded-full ${
                      (ticker.indicators?.macd || 0) > 0 ? 'bg-success' : 'bg-destructive'
                    }`} />
                    <span className="text-xs font-mono">
                      {(ticker.indicators?.macd || 0).toFixed(4)}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="h-12 w-20 bg-gradient-to-r from-primary/20 to-accent/20 rounded flex items-center justify-center">
                    <Activity className="h-4 w-4 text-primary/60" />
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}