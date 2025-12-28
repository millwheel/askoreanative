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
          <CardTitle className="text-2xl text-center">
            SignUp & SingIn
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            It only takes{" "}
            <span className="font-medium text-foreground">10 seconds</span>.
          </p>

          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <Image src="/google.svg" alt="Google" width={16} height={16} />
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
