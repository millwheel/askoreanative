import { NextRequest } from 'next/server';
import { supabase } from '../../../supabase/supabase';
import { logger } from '@/lib/logger';

/**
 * Get current authenticated user from request token
 */
export async function getCurrentUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const {
      data: { user },
    } = await supabase.auth.getUser(token);

    if (!user) {
      return null;
    }

    logger.debug('User authenticated', { userId: user.id, email: user.email });
    return user;
  } catch (error) {
    logger.error('Error getting current user', error);
    return null;
  }
}

/**
 * Get user profile from database
 */
export async function getUserProfile(userId: string) {
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      logger.error('Error fetching user profile', error.message);
      return null;
    }

    logger.debug('User profile fetched', { userId, userType: profile?.user_type });
    return profile ? transformUserProfile(profile) : null;
  } catch (error) {
    logger.error('Error in getUserProfile', error);
    return null;
  }
}

/**
 * Transform database snake_case to camelCase
 */
function transformUserProfile(profile: any) {
  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
    languagePreference: profile.language_preference,
    userType: profile.user_type,
    answererType: profile.answerer_type,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

/**
 * Middleware for requiring authentication
 */
export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    logger.warn('Unauthorized request', { path: request.nextUrl.pathname });
    return null;
  }
  return user;
}

/**
 * Middleware for requiring specific roles
 */
export async function requireRole(request: NextRequest, allowedRoles: string[]) {
  const user = await getCurrentUser(request);
  if (!user) {
    logger.warn('Unauthorized request', { path: request.nextUrl.pathname });
    return null;
  }

  const profile = await getUserProfile(user.id);
  if (!profile || !allowedRoles.includes(profile.userType)) {
    logger.warn('Forbidden request - insufficient role', {
      path: request.nextUrl.pathname,
      userId: user.id,
      userType: profile?.userType,
      allowedRoles,
    });
    return null;
  }

  return { user, profile };
}
