import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'Upload is not configured yet.' }, { status: 501 });
}
