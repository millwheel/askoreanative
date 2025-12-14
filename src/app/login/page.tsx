"use client";

import { loginWithGoogle } from "@/client/hook/login";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">로그인</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full"
          >
            <Image src="/google.svg" alt="Google" width={16} height={16} />
            Google login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
