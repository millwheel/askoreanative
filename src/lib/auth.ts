import { supabase } from '../../supabase/supabase';
import { UserProfile } from '@/types';

export async function login(redirectTo?: string) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
  });

  if (error) throw error;
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user || null;
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  // Transform snake_case to camelCase
  return data ? transformUserProfile(data) : null;
}

export async function createUserProfile(
  userId: string,
  email: string,
  displayName: string,
  userType: 'CUSTOMER' | 'ANSWERER' = 'CUSTOMER'
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert([
      {
        id: userId,
        email,
        display_name: displayName,
        user_type: userType,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return transformUserProfile(data);
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  const updateData: Record<string, any> = {};

  if (updates.displayName) updateData.display_name = updates.displayName;
  if (updates.avatarUrl) updateData.avatar_url = updates.avatarUrl;
  if (updates.userType) updateData.user_type = updates.userType;
  if (updates.answererType) updateData.answerer_type = updates.answererType;
  if (updates.languagePreference) updateData.language_preference = updates.languagePreference;

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return transformUserProfile(data);
}

// Helper function to transform snake_case DB response to camelCase
function transformUserProfile(dbData: any): UserProfile {
  return {
    id: dbData.id,
    email: dbData.email,
    displayName: dbData.display_name,
    avatarUrl: dbData.avatar_url,
    languagePreference: dbData.language_preference,
    userType: dbData.user_type,
    answererType: dbData.answerer_type,
    createdAt: dbData.created_at,
    updatedAt: dbData.updated_at,
  };
}
