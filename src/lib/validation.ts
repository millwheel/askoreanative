import { z } from 'zod';

export const createQuestionSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters'),
  category: z.enum([
    'TRANSPORT',
    'FOOD',
    'ACCOMMODATION',
    'CULTURE',
    'ACTIVITIES',
    'VISA_DOCUMENTS',
    'SAFETY',
  ]),
  body: z
    .string()
    .min(20, 'Question body must be at least 20 characters')
    .max(5000, 'Question body must be less than 5000 characters'),
});

export const createAnswerSchema = z.object({
  questionId: z.string().uuid('Invalid question ID'),
  body: z
    .string()
    .min(20, 'Answer body must be at least 20 characters')
    .max(5000, 'Answer body must be less than 5000 characters'),
});

export const createCommentSchema = z.object({
  postType: z.enum(['QUESTION', 'ANSWER']),
  postId: z.string().uuid('Invalid post ID'),
  body: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment must be less than 500 characters'),
});

export const updateCommentSchema = z.object({
  body: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment must be less than 500 characters'),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type CreateAnswerInput = z.infer<typeof createAnswerSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
