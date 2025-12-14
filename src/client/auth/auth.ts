import { supabaseClient } from "@/client/supabase/client";

export async function loginWithGoogle() {
  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider: "google",
  });

  if (error) {
    console.error("Google login error:", error);
  }

  console.log(data.url);
}

export async function logout(): Promise<void> {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    console.error(error);
  }
}
