"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserProfileResponse } from "@/client/type/types";

const fetcher = async (url: string): Promise<UserProfileResponse | null> => {
  const res = await fetch(url, { credentials: "include" });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
};

export default function ProfilePage() {
  const router = useRouter();

  const {
    data: profile,
    isLoading,
    mutate,
  } = useSWR("/api/profile", fetcher, { revalidateOnFocus: false });

  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && profile === null) {
      router.replace("/login");
    }
  }, [isLoading, profile, router]);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "");
    setDisplayName(profile.display_name ?? "");
  }, [profile]);

  const isDirty = useMemo(() => {
    if (!profile) return false;
    return name !== profile.name || displayName !== profile.display_name;
  }, [name, displayName, profile]);

  const canSave = useMemo(() => {
    return (
      isDirty &&
      !saving &&
      name.trim().length > 0 &&
      displayName.trim().length > 0
    );
  }, [isDirty, saving, name, displayName]);

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          display_name: displayName.trim(),
        }),
      });

      if (!res.ok) {
        setError("Failed to update profile.");
        return;
      }

      await mutate();
      setSuccess("Profile updated successfully.");
    } catch (e) {
      setError("Could not update profile.");
      throw e;
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !profile) return null;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Profile</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile summary */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Public info
              <Badge variant="secondary" className="rounded-full">
                {profile.role}
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-sm text-gray-600">
            <div>
              <p className="text-xs">Email</p>
              <p>{profile.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Edit form */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Edit profile</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Display name</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="rounded-full"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-primary">{success}</p>}
          </CardContent>

          <CardFooter className="justify-end">
            <Button
              className="rounded-full"
              onClick={handleSave}
              disabled={!canSave}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
