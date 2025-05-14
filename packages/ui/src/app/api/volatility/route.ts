import { NextResponse } from 'next/server';
import { mockVolatility } from './mock';

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol') || 'AAPL';
  const API_KEY = process.env.ALPHA_VANTAGE_KEY;

  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=60min&outputsize=compact&apikey=${API_KEY}`;

  try {
    const res = await fetch(url);
    const json = await res.json();
    const rawSeries = mockVolatility['Time Series (5min)'];
    if (!rawSeries) return NextResponse.json({ error: 'Invalid response' }, { status: 400 });

    const closes = Object.values(rawSeries)
      .map((bar: any) => parseFloat(bar['4. close']))
      .reverse();

    const logReturns = closes.slice(1).map((p, i) => Math.log(p / closes[i]));
    const avg = logReturns.reduce((a, b) => a + b, 0) / logReturns.length;
    const variance = logReturns.reduce((a, r) => a + (r - avg) ** 2, 0) / logReturns.length;
    const dailyVol = Math.sqrt(variance) * Math.sqrt(24); // 24 hourly returns per day
    const annualizedVol = dailyVol * Math.sqrt(252); // convert to annualized vol

    return NextResponse.json({ volatility: annualizedVol });
  } catch (error) {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}
