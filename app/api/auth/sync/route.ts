import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clerkUserId, email } = body;
    
    if (!clerkUserId || !email) {
      return NextResponse.json(
        { error: 'clerkUserId and email required' },
        { status: 400 }
      );
    }

    // For now, we just acknowledge the sync
    // In a full implementation, you'd save this to MongoDB
    console.log('User synced:', { clerkUserId, email });
    
    return NextResponse.json({
      ok: true,
      message: 'User synced successfully',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'sync_failed', detail: err?.message },
      { status: 500 }
    );
  }
}
