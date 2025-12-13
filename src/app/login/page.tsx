"use client";

import { useState } from "react";
import {supabaseClient} from "@/supabase/config";

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setError(null);
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: "google",
        });

        if (error) {
            setError(error.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
                <h1 className="text-2xl font-semibold mb-6 text-center">
                    로그인
                </h1>

                <button
                    onClick={handleGoogleLogin}
                    className="mt-4 w-full rounded-md border border-slate-200 py-2 text-sm font-medium hover:bg-slate-50 cursor-pointer"
                >
                    Google로 계속하기
                </button>
            </div>
        </div>
    );
}