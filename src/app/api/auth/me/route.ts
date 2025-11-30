import { NextRequest } from 'next/server';
import { getCurrentUser, getUserProfile } from '@/app/api/base-handler';
import { successResponse, unauthorizedResponse } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const authData = await getCurrentUser(request);

    if (!authData) {
      return unauthorizedResponse('No valid authentication token');
    }

    const profile = await getUserProfile(authData.userId);

    if (!profile) {
      return unauthorizedResponse('User profile not found');
    }

    return successResponse(profile);
  } catch (error) {
    console.error('GET /api/auth/me error:', error);
    return unauthorizedResponse('Failed to fetch user profile');
  }
}
