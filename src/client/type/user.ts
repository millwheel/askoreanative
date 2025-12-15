export type UUID = string;
export type Timestamp = string;

export interface MeResponse {
  id: string;
  email: string;
  displayName: string;
  role: string;
  avatarUrl: string;
}

export interface UserProfileResponse {
  id: UUID;
  email: string;
  name: string;
  displayName: string;
  role: string;
  avatarUrl: string;
}

export type UserProfileRequest = {
  name: string;
  displayName: string;
};
