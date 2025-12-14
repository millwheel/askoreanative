"use client";

import { loginWithGoogle } from "@/client/hook/login";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold mb-6 text-center">로그인</h1>

        <Button
          onClick={handleGoogleLogin}
          variant="outline"
          className="mt-4 w-full"
        >
          <Image src="/google.svg" alt="Google" width={16} height={16} />
          Google login
        </Button>
      </div>
    </div>
  );
}
