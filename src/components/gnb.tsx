"use client";

import Link from "next/link";
import {useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import {getCurrentUser, logout} from "@/supabase/auth";

export function GlobalNavigationBar() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        (async () => {
            try {
                const currentUser = await getCurrentUser();
                if (isMounted) {
                    setUser(currentUser);
                }
            } catch (e) {
                console.error(e);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleLogout = async () => {
        await logout();
        setUser(null);
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
                            <Link
                                href="/login"
                                className="rounded-md bg-primary px-4 py-1.5 text-primary-foreground hover:bg-primary-hover transition cursor-pointer"
                            >
                                Login
                            </Link>
                        )}

                        {/* 로그인 된 상태 */}
                        {!loading && user && (
                            <div className="flex items-center gap-6">
                                <p className="text-sm text-gray-600">
                                    {user.email}
                                </p>
                                <button
                                    onClick={handleLogout}
                                    className="rounded-md bg-primary px-4 py-1.5 text-primary-foreground hover:bg-primary-hover transition cursor-pointer"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>

                </div>

            </nav>
        </header>
    );
}