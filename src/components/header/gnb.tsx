"use client";

import { useMe } from "@/hooks/useMe";
import Link from "next/link";
import {supabase} from "@/lib/supabase";

export function GlobalNavigationBar() {
    const { user, loading } = useMe();

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <header className="w-full border-b border-border bg-background">
            <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">

                {/* Left: Logo */}
                <div>
                    <Link
                        href="/"
                        className="text-xl font-bold text-primary hover:text-primary-highlight transition"
                    >
                        Askoreanative
                    </Link>
                </div>

                {/* Right: Menu */}
                <div className="flex items-center gap-6">
                    <Link
                        href="/questions"
                        className="text-foreground hover:text-primary-highlight transition"
                    >
                        Questions
                    </Link>

                    {/* loading 중이면 아무것도 렌더 안 함 (UI 깜빡임 방지) */}
                    {loading && (
                        <div className="text-sm text-muted-foreground">...</div>
                    )}

                    {/* 로그인 안 됨 */}
                    {!loading && !user && (
                        <Link
                            href="/login"
                            className="rounded-md bg-primary px-4 py-1.5 text-primary-foreground hover:bg-primary-highlight transition"
                        >
                            Login
                        </Link>
                    )}

                    {/* 로그인 된 상태 */}
                    {!loading && user && (
                        <>
                            <span className="text-sm text-muted-foreground">
                                {user.email}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="rounded-md border px-3 py-1 text-sm hover:bg-muted transition"
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>

            </nav>
        </header>
    );
}