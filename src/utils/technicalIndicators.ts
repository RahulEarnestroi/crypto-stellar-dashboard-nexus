import { TechnicalIndicators } from '@/stores/cryptoStore';

// Simple RSI calculation
export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50; // Default neutral RSI
  
  const changes = prices.slice(1).map((price, i) => price - prices[i]);
  const gains = changes.map(change => change > 0 ? change : 0);
  const losses = changes.map(change => change < 0 ? Math.abs(change) : 0);
  
  const avgGain = gains.slice(-period).reduce((sum, gain) => sum + gain, 0) / period;
  const avgLoss = losses.slice(-period).reduce((sum, loss) => sum + loss, 0) / period;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// Simple Moving Average
export function calculateMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  
  const recentPrices = prices.slice(-period);
  return recentPrices.reduce((sum, price) => sum + price, 0) / period;
}

// Simple MACD calculation
export function calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
  if (prices.length < 26) {
    return { macd: 0, signal: 0, histogram: 0 };
  }
  
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;
  
  // Simple signal line (we'd need more data for proper EMA of MACD)
  const signal = macd * 0.8; // Simplified
  const histogram = macd - signal;
  
  return { macd, signal, histogram };
}

// Exponential Moving Average
function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  
  const multiplier = 2 / (period + 1);
  let ema = prices[0];
  
  for (let i = 1; i < prices.length; i++) {
    ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
  }
  
  return ema;
}

// Generate mock historical prices for technical analysis
export function generateMockPriceHistory(currentPrice: number, periods: number = 50): number[] {
  const prices = [];
  let price = currentPrice;
  
  // Generate backwards from current price
  for (let i = periods; i >= 0; i--) {
    // Add some randomness but keep it somewhat realistic
    const change = (Math.random() - 0.5) * (price * 0.05); // Max 5% change
    price = Math.max(price + change, price * 0.8); // Don't let it drop too much
    prices.unshift(price);
  }
  
  return prices;
}

// Calculate all technical indicators for a ticker
export function calculateTechnicalIndicators(currentPrice: number): TechnicalIndicators {
  // Generate mock price history for calculations
  const priceHistory = generateMockPriceHistory(currentPrice);
  
  const rsi = calculateRSI(priceHistory);
  const { macd, signal, histogram } = calculateMACD(priceHistory);
  const ma20 = calculateMA(priceHistory, 20);
  const ma50 = calculateMA(priceHistory, 50);
  const ma200 = calculateMA(priceHistory, 200);
  
  return {
    rsi: Math.round(rsi * 100) / 100,
    macd: Math.round(macd * 10000) / 10000,
    signal: Math.round(signal * 10000) / 10000,
    histogram: Math.round(histogram * 10000) / 10000,
    ma20: Math.round(ma20 * 100) / 100,
    ma50: Math.round(ma50 * 100) / 100,
    ma200: Math.round(ma200 * 100) / 100,
  };
}
