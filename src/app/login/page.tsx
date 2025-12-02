"use client";

import { FormEvent, useState } from "react";

import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleEmailLogin = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setPending(true);

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        console.log(data);

        setPending(false);

        if (error) {
            setError(error.message);
            return;
        }

        router.replace("/");
    };

    const handleGoogleLogin = async () => {
        setError(null);
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`, // 필요에 맞게 수정
            },
        });

        if (error) {
            setError(error.message);
        }
        // OAuth는 리다이렉트되므로 여기서 따로 처리할 건 거의 없음
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
                <h1 className="text-2xl font-semibold mb-6 text-center">
                    로그인
                </h1>

                <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1">이메일</label>
                        <input
                            type="email"
                            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">비밀번호</label>
                        <input
                            type="password"
                            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={pending}
                        className="w-full rounded-md bg-primary py-2 text-sm font-medium text-white hover:bg-primary-highlight disabled:opacity-60 cursor-pointer"
                    >
                        {pending ? "로그인 중..." : "이메일로 로그인"}
                    </button>
                </form>

                <div className="mt-6 flex items-center gap-2">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs text-slate-400">또는</span>
                    <div className="h-px flex-1 bg-slate-200" />
                </div>

                <button
                    onClick={handleGoogleLogin}
                    className="mt-4 w-full rounded-md border border-slate-200 py-2 text-sm font-medium hover:bg-slate-50"
                >
                    Google로 계속하기
                </button>
            </div>
        </div>
    );
}