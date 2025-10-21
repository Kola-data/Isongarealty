// Real-time Currency Converter using online API
// Supports multiple currency APIs for reliability

interface CurrencyRates {
  RWF: number;
  USD: number;
  EUR?: number;
  GBP?: number;
}

interface ExchangeRateResponse {
  rates: {
    USD: number;
    EUR?: number;
    GBP?: number;
  };
  base: string;
  date: string;
}

class CurrencyConverter {
  private rates: CurrencyRates = { RWF: 1, USD: 0.000679 }; // Default fallback
  private lastUpdated: Date | null = null;
  private updateInterval: number = 5 * 60 * 1000; // 5 minutes
  private isUpdating: boolean = false;

  // Multiple API endpoints for reliability
  private apiEndpoints = [
    'https://api.exchangerate-api.com/v4/latest/RWF',
    'https://api.fixer.io/latest?access_key=YOUR_API_KEY&base=RWF',
    'https://api.currencylayer.com/live?access_key=YOUR_API_KEY&currencies=USD,EUR,GBP&source=RWF'
  ];

  constructor() {
    this.updateRates();
    // Update rates every 5 minutes
    setInterval(() => this.updateRates(), this.updateInterval);
  }

  private async updateRates(): Promise<void> {
    if (this.isUpdating) return;
    
    this.isUpdating = true;
    
    try {
      // Try multiple APIs for reliability
      for (const endpoint of this.apiEndpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            this.parseRates(data);
            this.lastUpdated = new Date();
            console.log('Currency rates updated:', this.rates);
            break;
          }
        } catch (error) {
          console.warn(`Failed to fetch from ${endpoint}:`, error);
          continue;
        }
      }
    } catch (error) {
      console.error('Failed to update currency rates:', error);
      // Use fallback rates
      this.rates = { RWF: 1, USD: 1300 };
    } finally {
      this.isUpdating = false;
    }
  }

  private parseRates(data: any): void {
    // Handle different API response formats
    if (data.rates) {
      // ExchangeRate-API format
      this.rates = {
        RWF: 1,
        USD: data.rates.USD || 1300,
        EUR: data.rates.EUR,
        GBP: data.rates.GBP,
      };
    } else if (data.quotes) {
      // CurrencyLayer format
      this.rates = {
        RWF: 1,
        USD: data.quotes.RWFUSD || 1300,
        EUR: data.quotes.RWFEUR,
        GBP: data.quotes.RWFGBP,
      };
    }
  }

  // Convert RWF to USD
  convertRWFToUSD(rwf: number): number {
    return Math.round((rwf * this.rates.USD) * 100) / 100;
  }

  // Convert USD to RWF
  convertUSDToRWF(usd: number): number {
    return Math.round(usd / this.rates.USD);
  }

  // Get current exchange rate
  getExchangeRate(): number {
    return this.rates.USD;
  }

  // Get last update time
  getLastUpdated(): Date | null {
    return this.lastUpdated;
  }

  // Force update rates
  async forceUpdate(): Promise<void> {
    await this.updateRates();
  }

  // Get rates status
  getStatus(): { rates: CurrencyRates; lastUpdated: Date | null; isUpdating: boolean } {
    return {
      rates: this.rates,
      lastUpdated: this.lastUpdated,
      isUpdating: this.isUpdating,
    };
  }
}

// Create singleton instance
const currencyConverter = new CurrencyConverter();

// Export functions for easy use
export const convertRWFToUSD = (rwf: number): number => currencyConverter.convertRWFToUSD(rwf);
export const convertUSDToRWF = (usd: number): number => currencyConverter.convertUSDToRWF(usd);
export const getExchangeRate = (): number => currencyConverter.getExchangeRate();
export const getLastUpdated = (): Date | null => currencyConverter.getLastUpdated();
export const forceUpdateRates = (): Promise<void> => currencyConverter.forceUpdate();
export const getCurrencyStatus = () => currencyConverter.getStatus();

// Format currency with proper symbols and commas
export const formatCurrency = (amount: number, currency: 'RWF' | 'USD' = 'RWF'): string => {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  }
  
  return `RWF ${new Intl.NumberFormat('en-US').format(amount)}`;
};

// Format money with currency conversion
export const formatMoney = (amountRwf: number, targetCurrency: 'RWF' | 'USD' = 'RWF'): string => {
  if (targetCurrency === 'USD') {
    const usdAmount = convertRWFToUSD(amountRwf);
    return formatCurrency(usdAmount, 'USD');
  }
  
  return formatCurrency(amountRwf, 'RWF');
};

export default currencyConverter;
