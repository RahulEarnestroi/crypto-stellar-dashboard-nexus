import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCryptoStore, TimeFrame } from '@/stores/cryptoStore';
import { motion } from 'framer-motion';

const timeFrames: { value: TimeFrame; label: string }[] = [
  { value: '1m', label: '1M' },
  { value: '5m', label: '5M' },
  { value: '15m', label: '15M' },
  { value: '1h', label: '1H' },
  { value: '1d', label: '1D' },
];

export function TimeFrameSelector() {
  const { selectedTimeFrame, setTimeFrame } = useCryptoStore();

  return (
    <Card className="crypto-card">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Clock className="h-4 w-4 text-primary" />
          <h4 className="font-medium">Time Frame</h4>
        </div>
        
        <div className="flex space-x-1">
          {timeFrames.map((tf) => (
            <motion.div
              key={tf.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={selectedTimeFrame === tf.value ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeFrame(tf.value)}
                className={`
                  min-w-[3rem] h-8 text-xs font-medium transition-all
                  ${selectedTimeFrame === tf.value 
                    ? 'bg-gradient-neon border-primary glow-primary' 
                    : 'border-glow hover:border-primary/50'
                  }
                `}
              >
                {tf.label}
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}