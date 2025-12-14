import { supabaseClient } from "@/client/supabase/config";

export async function loginWithGoogle(destination = "/") {
  await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${location.origin}/api/auth/callback?destination=${encodeURIComponent(destination)}`,
    },
  });
}
