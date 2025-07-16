import { TrendingUp, TrendingDown, Flame, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCryptoStore } from '@/stores/cryptoStore';
import { motion } from 'framer-motion';

export function MarketOverview() {
  const { hotCoins, topGainers, topLosers } = useCryptoStore();

  const formatPrice = (price: number) => {
    if (price >= 1) return `$${price.toFixed(2)}`;
    if (price >= 0.01) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(8)}`;
  };

  const MarketSection = ({ 
    title, 
    data, 
    icon: Icon, 
    colorClass 
  }: { 
    title: string; 
    data: any[]; 
    icon: any; 
    colorClass: string;
  }) => (
    <Card className="crypto-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-sm">
          <Icon className={`h-4 w-4 ${colorClass}`} />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.slice(0, 5).map((item, index) => (
          <motion.div
            key={item.symbol}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-full bg-gradient-neon flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary-foreground">
                  {item.baseAsset.slice(0, 2)}
                </span>
              </div>
              <div>
                <div className="text-sm font-medium">{item.baseAsset}</div>
                <div className="text-xs text-muted-foreground">{formatPrice(item.price)}</div>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={`${
                item.change24h >= 0 
                  ? 'text-success bg-success/10 border-success/20' 
                  : 'text-destructive bg-destructive/10 border-destructive/20'
              }`}
            >
              {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
            </Badge>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MarketSection
        title="🔥 Hot Coins"
        data={hotCoins}
        icon={Flame}
        colorClass="text-orange-500"
      />
      <MarketSection
        title="📈 Top Gainers"
        data={topGainers}
        icon={TrendingUp}
        colorClass="text-success"
      />
      <MarketSection
        title="📉 Top Losers"
        data={topLosers}
        icon={TrendingDown}
        colorClass="text-destructive"
      />
    </div>
  );
}