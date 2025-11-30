import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { forbiddenResponse, unauthorizedResponse } from '@/lib/api-utils';
import { UserProfile } from '@/types';

/**
 * Base handler for API routes with authentication
 * Provides common utilities for auth checks and user profile fetching
 */

export async function getCurrentUser(request: NextRequest): Promise<{ userId: string; user: any } | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return { userId: user.id, user };
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    // Transform snake_case to camelCase
    return {
      id: data.id,
      email: data.email,
      displayName: data.display_name,
      avatarUrl: data.avatar_url,
      languagePreference: data.language_preference,
      userType: data.user_type,
      answererType: data.answerer_type,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function requireAuth(request: NextRequest) {
  const authData = await getCurrentUser(request);
  if (!authData) {
    throw new Error('UNAUTHORIZED');
  }
  return authData;
}

export async function requireRole(request: NextRequest, allowedRoles: string[]) {
  const authData = await requireAuth(request);
  const profile = await getUserProfile(authData.userId);

  if (!profile || !allowedRoles.includes(profile.userType)) {
    throw new Error('FORBIDDEN');
  }

  return { authData, profile };
}

// Export helper responses
export { unauthorizedResponse, forbiddenResponse };
