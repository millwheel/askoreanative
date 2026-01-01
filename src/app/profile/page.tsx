"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { mutate as globalMutate } from "swr";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useProfile } from "@/client/hook/useProfile";
import { apiPut } from "@/lib/axios/api";
import { UserProfileRequest } from "@/type/user";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loading, mutate } = useProfile();

  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !profile) {
      router.replace("/login");
    }
  }, [loading, profile, router]);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name ?? "");
    setDisplayName(profile.displayName ?? "");
    setAvatarUrl(profile.avatarUrl ?? null);
  }, [profile]);

  const isDirty = useMemo(() => {
    if (!profile) return false;
    return (
      displayName !== profile.displayName || avatarUrl !== profile.avatarUrl
    );
  }, [displayName, avatarUrl, profile]);

  const canSave = useMemo(() => {
    return isDirty && !saving && displayName.trim().length > 0;
  }, [isDirty, saving, displayName]);

  const handleSave = async () => {
    if (!profile) return;

    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const payload: UserProfileRequest = {
        displayName: displayName.trim(),
        avatarUrl: avatarUrl ?? null,
      };
      const { error } = await apiPut("/profile", {
        payload,
      });

      if (error) {
        setError(error.message ?? "Failed to update profile.");
        return;
      }

      await mutate();
      await globalMutate("/axios/me");
      setSuccess("Profile updated successfully.");
    } catch (e) {
      setError("Could not update profile.");
      throw e;
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-4 py-10">
        <p className="text-sm text-gray-500">Loading profile…</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="mx-auto min-h-screen max-w-xl px-4 py-10">
        <p className="text-sm text-gray-500">Redirecting to login…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Profile</h1>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Email + Avatar */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-sm text-gray-600 py-1">{profile.email}</p>
            </div>
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={profile.avatarUrl ?? undefined}
                alt={profile.displayName}
              />
              <AvatarFallback>{profile.displayName[0]}</AvatarFallback>
            </Avatar>
          </div>

          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium">Name</label>
            <Input value={name} className="rounded-full" disabled />
          </div>

          {/* Display name */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Display name
            </label>
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
    </main>
  );
}
