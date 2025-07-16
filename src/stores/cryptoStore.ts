import { create } from 'zustand';
import { CryptoTicker } from '@/hooks/useCryptoData';

export type TimeFrame = '1m' | '5m' | '15m' | '1h' | '1d';

export interface FilterCondition {
  field: 'price' | 'change24h' | 'volume24h' | 'rsi' | 'macd' | 'ma';
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value: number;
  logic?: 'AND' | 'OR';
}

export interface TechnicalIndicators {
  rsi?: number;
  macd?: number;
  signal?: number;
  histogram?: number;
  ma20?: number;
  ma50?: number;
  ma200?: number;
}

export interface EnhancedCryptoTicker extends CryptoTicker {
  indicators?: TechnicalIndicators;
}

interface CryptoStore {
  selectedTimeFrame: TimeFrame;
  filters: FilterCondition[];
  tickers: EnhancedCryptoTicker[];
  filteredTickers: EnhancedCryptoTicker[];
  hotCoins: EnhancedCryptoTicker[];
  topGainers: EnhancedCryptoTicker[];
  topLosers: EnhancedCryptoTicker[];
  
  setTimeFrame: (timeFrame: TimeFrame) => void;
  addFilter: (filter: FilterCondition) => void;
  removeFilter: (index: number) => void;
  updateFilter: (index: number, filter: FilterCondition) => void;
  clearFilters: () => void;
  setTickers: (tickers: EnhancedCryptoTicker[]) => void;
  applyFilters: () => void;
}

export const useCryptoStore = create<CryptoStore>((set, get) => ({
  selectedTimeFrame: '1h',
  filters: [],
  tickers: [],
  filteredTickers: [],
  hotCoins: [],
  topGainers: [],
  topLosers: [],

  setTimeFrame: (timeFrame) => set({ selectedTimeFrame: timeFrame }),

  addFilter: (filter) => {
    const { filters } = get();
    set({ filters: [...filters, filter] });
    get().applyFilters();
  },

  removeFilter: (index) => {
    const { filters } = get();
    set({ filters: filters.filter((_, i) => i !== index) });
    get().applyFilters();
  },

  updateFilter: (index, filter) => {
    const { filters } = get();
    const newFilters = [...filters];
    newFilters[index] = filter;
    set({ filters: newFilters });
    get().applyFilters();
  },

  clearFilters: () => {
    set({ filters: [] });
    get().applyFilters();
  },

  setTickers: (tickers) => {
    // Calculate derived lists
    const hotCoins = [...tickers]
      .filter(t => t.volume24h > 1000000 && Math.abs(t.change24h) > 3)
      .sort((a, b) => b.volume24h - a.volume24h)
      .slice(0, 10);

    const topGainers = [...tickers]
      .filter(t => t.change24h > 0)
      .sort((a, b) => b.change24h - a.change24h)
      .slice(0, 10);

    const topLosers = [...tickers]
      .filter(t => t.change24h < 0)
      .sort((a, b) => a.change24h - b.change24h)
      .slice(0, 10);

    set({ 
      tickers, 
      hotCoins, 
      topGainers, 
      topLosers 
    });
    get().applyFilters();
  },

  applyFilters: () => {
    const { tickers, filters } = get();
    
    if (filters.length === 0) {
      set({ filteredTickers: tickers });
      return;
    }

    const filtered = tickers.filter(ticker => {
      return filters.every((filter, index) => {
        const getValue = (field: string) => {
          switch (field) {
            case 'price': return ticker.price;
            case 'change24h': return ticker.change24h;
            case 'volume24h': return ticker.volume24h;
            case 'rsi': return ticker.indicators?.rsi || 50;
            case 'macd': return ticker.indicators?.macd || 0;
            case 'ma': return ticker.indicators?.ma20 || ticker.price;
            default: return 0;
          }
        };

        const value = getValue(filter.field);
        
        switch (filter.operator) {
          case 'gt': return value > filter.value;
          case 'lt': return value < filter.value;
          case 'eq': return Math.abs(value - filter.value) < 0.01;
          case 'gte': return value >= filter.value;
          case 'lte': return value <= filter.value;
          default: return true;
        }
      });
    });

    set({ filteredTickers: filtered });
  },
}));