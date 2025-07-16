import { useState, useEffect } from 'react';
import { ThreeBackground } from '@/components/ThreeBackground';
import { Header } from '@/components/Header';
import { Stats } from '@/components/Stats';
import { CryptoTable } from '@/components/CryptoTable';
import { FilterBuilder } from '@/components/FilterBuilder';
import { MarketOverview } from '@/components/MarketOverview';
import { useCryptoData } from '@/hooks/useCryptoData';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

const Index = () => {
  const [selectedExchange, setSelectedExchange] = useState('binance');
  const [searchQuery, setSearchQuery] = useState('');
  const { tickers, loading, error } = useCryptoData(selectedExchange, searchQuery);

  // Set dark mode by default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-cosmic text-foreground">
      <ThreeBackground />
      
      <div className="relative z-10">
        <Header
          selectedExchange={selectedExchange}
          onExchangeChange={setSelectedExchange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 neon-text">
                CryptoScope Pro
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Professional cryptocurrency terminal with advanced screening and technical analysis
              </p>
            </div>
          </motion.div>

          {error ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="crypto-card border-destructive bg-destructive/10 mb-6"
            >
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <h3 className="font-medium text-destructive">Error loading data</h3>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              <MarketOverview />
              <div className="mb-6">
                <FilterBuilder />
              </div>
              <Stats tickers={tickers} loading={loading} />
              <CryptoTable tickers={tickers} loading={loading} />
            </>
          )}

          {!loading && !error && tickers.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="crypto-card text-center py-12"
            >
              <h3 className="text-lg font-medium mb-2">No results found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search query or selecting a different exchange.
              </p>
            </motion.div>
          )}
        </main>

        <footer className="border-t border-border bg-background/80 backdrop-blur-xl mt-16">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="text-sm text-muted-foreground">
                  Real-time data from {selectedExchange} API • Futuristic Animated Interface
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Data updates every 30 seconds
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
