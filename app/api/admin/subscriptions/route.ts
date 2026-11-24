import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { indicatorSubscriptions, users } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rows = await db
    .select({
      id: indicatorSubscriptions.id,
      userEmail: users.email,
      tradingviewUsername: indicatorSubscriptions.tradingviewUsername,
      planName: indicatorSubscriptions.planName,
      amountInr: indicatorSubscriptions.amountInr,
      paymentStatus: indicatorSubscriptions.paymentStatus,
      accessStatus: indicatorSubscriptions.accessStatus,
      startsAt: indicatorSubscriptions.startsAt,
      expiresAt: indicatorSubscriptions.expiresAt,
      createdAt: indicatorSubscriptions.createdAt,
    })
    .from(indicatorSubscriptions)
    .leftJoin(users, eq(indicatorSubscriptions.userId, users.id))
    .orderBy(desc(indicatorSubscriptions.createdAt));

  return NextResponse.json({ subscriptions: rows });
}

export async function PATCH(req: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, accessStatus } = await req.json();
  if (!id || !['pending_access', 'active', 'expired', 'revoked'].includes(accessStatus)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  await db
    .update(indicatorSubscriptions)
    .set({ accessStatus, updatedAt: new Date() })
    .where(eq(indicatorSubscriptions.id, id));

  return NextResponse.json({ success: true });
}