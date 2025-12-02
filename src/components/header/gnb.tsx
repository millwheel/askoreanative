"use client";

import Link from "next/link";

export function GlobalNavigationBar() {
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

                    <Link
                        href="/login"
                        className="rounded-md bg-primary px-4 py-1.5 text-primary-foreground hover:bg-primary-highlight transition"
                    >
                        Login
                    </Link>
                </div>
            </nav>
        </header>
    );
}