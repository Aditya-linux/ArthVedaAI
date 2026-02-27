import { NextResponse } from 'next/server';

export async function GET() {
    // Return the Finnhub API key safely for client-side WebSocket connections
    // In production, you would validate the user session before returning this.
    return NextResponse.json({ token: process.env.FINNHUB_API_KEY });
}
