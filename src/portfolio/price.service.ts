import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PriceService {
  private readonly logger = new Logger(PriceService.name);

  async getPrice(symbol: string, fallback?: number): Promise<number> {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      return fallback ?? 0;
    }
    try {
      const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;
      const res = await fetch(url);
      if (!res.ok) return fallback ?? 0;
      const data = await res.json();
      if (typeof data?.c === 'number' && data.c > 0) {
        return data.c;
      }
    } catch (err) {
      this.logger.warn(`Price lookup failed for ${symbol}: ${err}`);
    }
    return fallback ?? 0;
  }
}
