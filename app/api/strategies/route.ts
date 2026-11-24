import { NextResponse } from 'next/server';

const ENGINE_URL = process.env.ENGINE_URL || 'http://127.0.0.1:8000';

export async function GET() {
  try {
    const res = await fetch(`${ENGINE_URL}/api/v1/strategies/`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: `Engine unreachable: ${err.message}` }, { status: 502 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(`${ENGINE_URL}/api/v1/strategies/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: `Engine unreachable: ${err.message}` }, { status: 502 });
  }
}