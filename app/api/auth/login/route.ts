import { NextResponse } from 'next/server';

export async function POST() {
  // This route was removed — authentication demo is disabled.
  return NextResponse.json({ error: 'Authentication routes removed' }, { status: 410 });
}
