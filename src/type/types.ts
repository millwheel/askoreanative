
export type UUID = string;
export type Timestamp = string;

export interface Profile {
    id: UUID; // auth.users.id 와 동일
    display_name: string;
    is_korean: boolean;
    bio: string | null;
    native_language: string | null; // 예: 'ko', 'en'
    country: string | null;
    level: number;
    total_answers: number;
    total_accepted_answers: number;
    credits: number;
    created_at: Timestamp;
}

export type QuestionType = 'FREE' | 'EXPRESS' | 'EXPERT';

export type QuestionStatus = 'OPEN' | 'ANSWERED' | 'CLOSED';

export interface Question {
    id: UUID;
    asker_id: UUID;
    title: string;
    body: string;
    type: QuestionType;
    status: QuestionStatus;
    price_credits: number; // FREE 는 0
    accepted_answer_id: UUID | null;
    created_at: Timestamp;
}

export interface Answer {
    id: UUID;
    question_id: UUID;
    author_id: UUID;
    body: string;
    is_accepted: boolean;
    created_at: Timestamp;
}


