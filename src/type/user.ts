export type MeResponse = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  avatarUrl: string | null;
};

export type UserProfileResponse = {
  id: string;
  email: string;
  name: string;
  displayName: string;
  role: string;
  avatarUrl: string | null;
};

export type UserProfileRequest = {
  displayName: string;
};

export type UserProfileAvatarRequest = {
  avatarUrl: string | null;
};
