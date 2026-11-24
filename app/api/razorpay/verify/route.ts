import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { indicatorSubscriptions } from '@/lib/db/schema';

const PLAN_DAYS: Record<string, number> = {
  'First Month Trial': 30,
  '6 Months Plan': 180,
  '12 Months Plan': 365,
};

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    const [sub] = await db
      .select()
      .from(indicatorSubscriptions)
      .where(eq(indicatorSubscriptions.razorpayOrderId, razorpay_order_id))
      .limit(1);

    if (!sub) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    const days = PLAN_DAYS[sub.planName] ?? 30;
    const startsAt = new Date();
    const expiresAt = new Date(startsAt.getTime() + days * 24 * 60 * 60 * 1000);

    await db
      .update(indicatorSubscriptions)
      .set({
        razorpayPaymentId: razorpay_payment_id,
        paymentStatus: 'paid',
        startsAt,
        expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(indicatorSubscriptions.id, sub.id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Verify error:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}