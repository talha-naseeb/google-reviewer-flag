import { NextResponse } from 'next/server';
import { GoogleBusinessProfileClient } from '@/lib/gbpClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || undefined;
    const accountId = searchParams.get('accountId') || undefined;

    const client = new GoogleBusinessProfileClient(token, accountId);
    const locations = await client.fetchLocations();

    return NextResponse.json({ success: true, locations });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
