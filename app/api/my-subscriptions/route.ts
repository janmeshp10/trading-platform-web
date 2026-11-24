import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { indicatorSubscriptions } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subs = await db
    .select()
    .from(indicatorSubscriptions)
    .where(eq(indicatorSubscriptions.userId, user.id))
    .orderBy(desc(indicatorSubscriptions.createdAt));

  return NextResponse.json({ user: { email: user.email }, subscriptions: subs });
}