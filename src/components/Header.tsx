import { Search, TrendingUp, Settings, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface HeaderProps {
  selectedExchange: string;
  onExchangeChange: (exchange: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({ selectedExchange, onExchangeChange, searchQuery, onSearchChange }: HeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-neon">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold neon-text">CryptoScope</h1>
              <p className="text-xs text-muted-foreground">3D Market Scanner</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* Exchange Selector */}
            <Select value={selectedExchange} onValueChange={onExchangeChange}>
              <SelectTrigger className="w-32 border-glow bg-card/50">
                <SelectValue placeholder="Exchange" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="binance">Binance</SelectItem>
                <SelectItem value="bybit">Bybit</SelectItem>
                <SelectItem value="coinbase">Coinbase</SelectItem>
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search coins..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-64 pl-10 border-glow bg-card/50"
              />
            </div>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="border-glow bg-card/50 hover:glow-primary"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Settings */}
            <Button
              variant="outline"
              size="icon"
              className="border-glow bg-card/50 hover:glow-primary"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}