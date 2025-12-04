import { type Session, type User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type OAuthProvider = 'google'

// OAuth 로그인
export async function loginWithOAuth(provider: OAuthProvider) {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
    });

    if (error) {
        console.error(error);
    }

    console.log(data);
    
    // 자동 리디렉션되므로 따로 처리할 것 없음
}

/**
 * 인증 상태 확인
 * - 로그인 되어 있으면 user / session / accessToken 반환
 */
export async function getAuthStatus(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        console.error('Error while getting session:', error);
        return null;
    }

    return data.session;
}


export async function logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error(error);
    }

}
