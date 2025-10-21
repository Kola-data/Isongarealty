// Test Currency Conversion with Database Numbers
import { convertRWFToUSD, formatMoney, getExchangeRate } from './currencyConverter';

// Example database prices (RWF)
const databasePrices = [
  300000,    // RWF 300,000
  500000,    // RWF 500,000
  1000000,   // RWF 1,000,000
  2500000,   // RWF 2,500,000
  5000000,   // RWF 5,000,000
];

console.log('🔄 Currency Conversion Test');
console.log('============================');
console.log(`Current Exchange Rate: 1 USD = ${getExchangeRate().toLocaleString()} RWF`);
console.log('');

databasePrices.forEach(price => {
  const usdAmount = convertRWFToUSD(price);
  const formattedRWF = formatMoney(price, 'RWF');
  const formattedUSD = formatMoney(price, 'USD');
  
  console.log(`Database Price: ${formattedRWF}`);
  console.log(`Converted to USD: ${formattedUSD}`);
  console.log(`Raw USD Amount: $${usdAmount.toFixed(2)}`);
  console.log('---');
});

export { databasePrices };
