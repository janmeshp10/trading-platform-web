import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { db } from '@/lib/db/drizzle';
import { indicatorSubscriptions } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';

const PLANS: Record<string, { name: string; amountInr: number; days: number }> = {
  trial: { name: 'First Month Trial', amountInr: 199, days: 30 },
  '6months': { name: '6 Months Plan', amountInr: 1999, days: 180 },
  '12months': { name: '12 Months Plan', amountInr: 3499, days: 365 },
};

export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Please sign in first' }, { status: 401 });
    }

    const { planId, tradingviewUsername } = await req.json();
    const plan = PLANS[planId];
    if (!plan || !tradingviewUsername?.trim()) {
      return NextResponse.json({ error: 'Valid plan and TradingView username required' }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
      amount: plan.amountInr * 100, // Razorpay uses paise
      currency: 'INR',
      receipt: `rcpt_${user.id}_${Date.now()}`,
    });

    await db.insert(indicatorSubscriptions).values({
      userId: user.id,
      tradingviewUsername: tradingviewUsername.trim(),
      planName: plan.name,
      amountInr: plan.amountInr,
      razorpayOrderId: order.id,
      paymentStatus: 'pending',
      accessStatus: 'pending_access',
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planName: plan.name,
    });
  } catch (err) {
    console.error('Razorpay order error:', err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}