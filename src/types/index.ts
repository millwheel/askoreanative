// User Types and Enums
export type UserType = 'CUSTOMER' | 'ANSWERER' | 'ADMIN';
export type AnswererType = 'KOREAN_NATIVE' | 'LONG_TERM_RESIDENT';
export type PostType = 'QUESTION' | 'ANSWER';
export type CategoryType = 'TRANSPORT' | 'FOOD' | 'ACCOMMODATION' | 'CULTURE' | 'ACTIVITIES' | 'VISA_DOCUMENTS' | 'SAFETY';

// User Profile
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  languagePreference?: string;
  userType: UserType;
  answererType?: AnswererType;
  createdAt: string;
  updatedAt: string;
}

// Question
export interface Question {
  id: string;
  userId: string;
  title: string;
  category: CategoryType;
  body: string; // Tiptap JSON
  viewCount?: number;
  createdAt: string;
  updatedAt: string;
  user?: UserProfile;
  answers?: Answer[];
  comments?: Comment[];
  attachments?: Attachment[];
}

// Answer
export interface Answer {
  id: string;
  questionId: string;
  userId: string;
  body: string; // Tiptap JSON
  createdAt: string;
  updatedAt: string;
  user?: UserProfile;
  comments?: Comment[];
  attachments?: Attachment[];
}

// Comment
export interface Comment {
  id: string;
  postType: PostType;
  postId: string; // question_id or answer_id
  userId: string;
  body: string; // Plain text
  createdAt: string;
  updatedAt: string;
  user?: UserProfile;
}

// Attachment
export interface Attachment {
  id: string;
  postType: PostType;
  postId: string; // question_id or answer_id
  fileUrl: string;
  fileType: string; // 'image/jpeg', 'image/png', etc.
  fileName?: string;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// API Request/Response DTOs
export interface CreateQuestionRequest {
  title: string;
  category: CategoryType;
  body: string;
}

export interface UpdateQuestionRequest {
  title?: string;
  category?: CategoryType;
  body?: string;
}

export interface CreateAnswerRequest {
  questionId: string;
  body: string;
}

export interface UpdateAnswerRequest {
  body: string;
}

export interface CreateCommentRequest {
  postType: PostType;
  postId: string;
  body: string;
}

export interface UploadResponse {
  url: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}
