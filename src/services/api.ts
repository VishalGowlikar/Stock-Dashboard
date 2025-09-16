// src/services/api.ts
export interface Quote {
    symbol: string;
    price: number | null;
    changePercent: number | null;
  }
  
  export const fetchGlobalQuote = async (symbol: string): Promise<Quote> => {
    const API_KEY = 'import.meta.env.VITE_API_KEY;';
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
  
    const quote = data["Global Quote"];
    if (!quote) {
      return { symbol, price: null, changePercent: null };
    }
  
    return {
      symbol: quote["01. symbol"] ?? symbol,
      price: quote["05. price"] ? parseFloat(quote["05. price"]) : null,
      changePercent: quote["10. change percent"]
        ? parseFloat(quote["10. change percent"].replace('%', ''))
        : null,
    };
  };
  