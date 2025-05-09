import { NextResponse } from 'next/server';

export async function GET() {
  const API_KEY = process.env.ALPHA_VANTAGE_KEY;
  const symbol = 'AAPL'; // Replace with dynamic symbol
  const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&sort=LATEST&limit=50&apikey=${API_KEY}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: res.status });
    }

    const data = await res.json();

    return NextResponse.json(data.feed);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
