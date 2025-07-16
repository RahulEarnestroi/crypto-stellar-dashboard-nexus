import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { CryptoTicker } from '@/hooks/useCryptoData';

interface StatsProps {
  tickers: CryptoTicker[];
  loading: boolean;
}

export function Stats({ tickers, loading }: StatsProps) {
  const totalMarketCap = tickers.reduce((sum, ticker) => sum + (ticker.price * ticker.volume24h / 1000), 0);
  const totalVolume = tickers.reduce((sum, ticker) => sum + ticker.volume24h, 0);
  const gainers = tickers.filter(t => t.change24h > 0).length;
  const losers = tickers.filter(t => t.change24h < 0).length;

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toFixed(0)}`;
  };

  const stats = [
    {
      label: 'Market Cap',
      value: loading ? '...' : formatLargeNumber(totalMarketCap),
      icon: DollarSign,
      color: 'text-primary',
      bgColor: 'bg-primary/20',
    },
    {
      label: '24h Volume',
      value: loading ? '...' : formatLargeNumber(totalVolume),
      icon: Activity,
      color: 'text-accent',
      bgColor: 'bg-accent/20',
    },
    {
      label: 'Gainers',
      value: loading ? '...' : gainers.toString(),
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/20',
    },
    {
      label: 'Losers',
      value: loading ? '...' : losers.toString(),
      icon: TrendingDown,
      color: 'text-destructive',
      bgColor: 'bg-destructive/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="crypto-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
        >
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${loading ? 'animate-pulse' : ''}`}>
                {stat.value}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}