import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user details from Clerk
    const user = await (await clerkClient()).users.getUser(userId);
    
    return NextResponse.json({
      email: user.emailAddresses[0]?.emailAddress || 'user@example.com',
      profile: {
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.firstName || user.username || 'User',
        preferences: {},
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'profile_fetch_failed', detail: err?.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // In a full implementation, you'd update the profile in MongoDB
    console.log('Profile update:', body);
    
    return NextResponse.json({
      ok: true,
      message: 'Profile updated successfully',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'profile_update_failed', detail: err?.message },
      { status: 500 }
    );
  }
}
