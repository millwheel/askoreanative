"use client";

import { loginWithGoogle } from "@/client/auth/auth";
import Image from "next/image";

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold mb-6 text-center">로그인</h1>

        <button
          onClick={handleGoogleLogin}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 py-2 text-sm font-medium hover:bg-slate-50 cursor-pointer"
        >
          <Image src="/google.svg" alt="Google" width={16} height={16} />
          Google login
        </button>
      </div>
    </div>
  );
}
