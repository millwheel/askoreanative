"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const avatarObjectUrlRef = useRef<string | null>(null);

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
    return displayName !== profile.displayName;
  }, [displayName, profile]);

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

  const uploadAvatar = async (file: File) => {
    if (!profile) return;

    setError(null);
    setSuccess(null);
    setUploadingAvatar(true);

    // 로컬 미리보기
    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current);
      avatarObjectUrlRef.current = null;
    }

    const objectUrl = URL.createObjectURL(file);
    avatarObjectUrlRef.current = objectUrl;
    setAvatarUrl(objectUrl);

    try {
      // 서버 업로드
      const formData = new FormData();
      formData.append("avatar", file);

      const { data, error } = await apiPut<{ avatarUrl: string }>(
        "/profile/avatar",
        formData,
      );

      if (error || !data?.avatarUrl) {
        setError(error?.message ?? "Failed to upload avatar.");
        await mutate();
        await globalMutate("/axios/me");
        return;
      }

      // 3) 서버 URL로 교체
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
        avatarObjectUrlRef.current = null;
      }

      setAvatarUrl(data.avatarUrl ?? null);

      await mutate();
      await globalMutate("/axios/me");

      setSuccess("Avatar updated.");
    } catch (e) {
      setError("Failed to upload avatar.");
      await mutate(); // 서버 기준 상태로 동기화
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const openAvatarPicker = () => {
    if (uploadingAvatar) return; // 업로드 중이면 무시
    fileInputRef.current?.click();
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
            <div className="cursor-pointer" onClick={openAvatarPicker}>
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl ?? undefined} alt={displayName} />
                <AvatarFallback>{displayName[0]}</AvatarFallback>
              </Avatar>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              uploadAvatar(file);
            }}
          />

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
