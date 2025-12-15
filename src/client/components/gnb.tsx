"use client";

import Link from "next/link";
import { useMe } from "@/client/hook/useMe";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function GlobalNavigationBar() {
  const router = useRouter();
  const { user, loading, mutate } = useMe();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    await mutate(null, { revalidate: false });
    router.replace("/");
  };

  return (
    <header className="w-full border-b border-border bg-background">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div>
          <Link
            href="/"
            className="text-xl font-bold text-primary hover:text-primary-lighter transition"
          >
            Askoreanative
          </Link>
        </div>

        <div className="flex items-center space-x-6">
          <Link
            href="/questions"
            className="text-foreground hover:text-primary-hover transition"
          >
            Questions
          </Link>

          <div>
            {/* 로그인 안 된 상태 */}
            {!loading && !user && (
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            )}

            {/* 로그인 된 상태 */}
            {!loading && user && (
              <div className="flex items-center gap-4">
                <Link href="/profile" className="hover:opacity-80 transition">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user.avatarUrl}
                      alt={user.displayName}
                    />
                    <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                  </Avatar>
                </Link>
                <Button onClick={handleLogout}>Logout</Button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
