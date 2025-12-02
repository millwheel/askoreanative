import {NextRequest, NextResponse} from 'next/server';
import { getCurrentUser, getUserProfile } from '@/api/base-handler';
import { successResponse, unauthorizedResponse } from '@/lib/api-utils';


export async function GET(request: NextRequest) {
  try {
    const authData = await getCurrentUser(request);

    if (!authData) {
      return unauthorizedResponse('No valid authentication token');
    }

    // const profile = await getUserProfile(authData.userId);
    //
    // if (!profile) {
    //   return unauthorizedResponse('User profile not found');
    // }

    // return successResponse(profile);

    return NextResponse.json({
      user: {
        userId: authData.userId,
        email: authData.email,
      },
    });
  } catch (error) {
    console.error('GET /api/auth/me error:', error);
    return unauthorizedResponse('Failed to fetch user profile');
  }
}