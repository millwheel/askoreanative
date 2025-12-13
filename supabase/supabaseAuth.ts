import { type User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export async function loginWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
    });

    if (error) {
        console.error("Google login error:", error);
    }

    console.log(data.url);
}

export async function getCurrentUser(): Promise<User | null> {
    console.log("[getCurrentUser] called");

    const { data, error } = await supabase.auth.getSession();

    console.log("[getCurrentUser] response:", { data, error });

    if (error) {
        console.error("Error while getting session:", error);
        return null;
    }

    console.log("[getCurrentUser] session.user:", data.session?.user ?? null);
    return data.session?.user ?? null;
}

export async function logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error(error);
    }

}
