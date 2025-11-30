import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { successResponse, notFoundResponse, serverErrorResponse, unauthorizedResponse, forbiddenResponse, validationErrorResponse } from '@/lib/api-utils';
import { Question } from '@/types';
import { createQuestionSchema } from '@/lib/validation';
import { getCurrentUser, getUserProfile } from '@/api/base-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch question with answers, comments, and user info
    const { data, error } = await supabase
      .from('questions')
      .select(
        `
        id,
        user_id,
        title,
        category,
        body,
        view_count,
        created_at,
        updated_at,
        user_profiles:user_id (
          id,
          email,
          display_name,
          avatar_url,
          user_type,
          answerer_type
        ),
        answers (
          id,
          user_id,
          body,
          created_at,
          updated_at,
          user_profiles:user_id (
            id,
            email,
            display_name,
            avatar_url,
            user_type,
            answerer_type
          ),
          comments (
            id,
            user_id,
            body,
            created_at,
            updated_at,
            user_profiles:user_id (
              id,
              email,
              display_name,
              avatar_url,
              user_type,
              answerer_type
            )
          ),
          attachments (
            id,
            file_url,
            file_type,
            file_name,
            file_size,
            created_at
          )
        ),
        comments (
          id,
          user_id,
          body,
          created_at,
          updated_at,
          user_profiles:user_id (
            id,
            email,
            display_name,
            avatar_url,
            user_type,
            answerer_type
          )
        ),
        attachments (
          id,
          file_url,
          file_type,
          file_name,
          file_size,
          created_at
        )
      `
      )
      .eq('id', id)
      .single();

    if (error || !data) {
      return notFoundResponse('Question not found');
    }

    // Increment view count
    await supabase
      .from('questions')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', id);

    // Transform response
    const question: Question = {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      category: data.category,
      body: data.body,
      viewCount: (data.view_count || 0) + 1,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      user: data.user_profiles
        ? {
            id: data.user_profiles.id,
            email: data.user_profiles.email,
            displayName: data.user_profiles.display_name,
            avatarUrl: data.user_profiles.avatar_url,
            userType: data.user_profiles.user_type,
            answererType: data.user_profiles.answerer_type,
            createdAt: '',
            updatedAt: '',
          }
        : undefined,
      answers: data.answers?.map((a: any) => ({
        id: a.id,
        questionId: id,
        userId: a.user_id,
        body: a.body,
        createdAt: a.created_at,
        updatedAt: a.updated_at,
        user: a.user_profiles
          ? {
              id: a.user_profiles.id,
              email: a.user_profiles.email,
              displayName: a.user_profiles.display_name,
              avatarUrl: a.user_profiles.avatar_url,
              userType: a.user_profiles.user_type,
              answererType: a.user_profiles.answerer_type,
              createdAt: '',
              updatedAt: '',
            }
          : undefined,
        comments: a.comments?.map((c: any) => ({
          id: c.id,
          postType: 'ANSWER' as const,
          postId: a.id,
          userId: c.user_id,
          body: c.body,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
          user: c.user_profiles
            ? {
                id: c.user_profiles.id,
                email: c.user_profiles.email,
                displayName: c.user_profiles.display_name,
                avatarUrl: c.user_profiles.avatar_url,
                userType: c.user_profiles.user_type,
                answererType: c.user_profiles.answerer_type,
                createdAt: '',
                updatedAt: '',
              }
            : undefined,
        })),
        attachments: a.attachments?.map((att: any) => ({
          id: att.id,
          postType: 'ANSWER' as const,
          postId: a.id,
          fileUrl: att.file_url,
          fileType: att.file_type,
          fileName: att.file_name,
          fileSize: att.file_size,
          createdAt: att.created_at,
          updatedAt: '',
        })),
      })),
      comments: data.comments?.map((c: any) => ({
        id: c.id,
        postType: 'QUESTION' as const,
        postId: id,
        userId: c.user_id,
        body: c.body,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        user: c.user_profiles
          ? {
              id: c.user_profiles.id,
              email: c.user_profiles.email,
              displayName: c.user_profiles.display_name,
              avatarUrl: c.user_profiles.avatar_url,
              userType: c.user_profiles.user_type,
              answererType: c.user_profiles.answerer_type,
              createdAt: '',
              updatedAt: '',
            }
          : undefined,
      })),
      attachments: data.attachments?.map((a: any) => ({
        id: a.id,
        postType: 'QUESTION' as const,
        postId: id,
        fileUrl: a.file_url,
        fileType: a.file_type,
        fileName: a.file_name,
        fileSize: a.file_size,
        createdAt: a.created_at,
        updatedAt: '',
      })),
    };

    return successResponse(question);
  } catch (error) {
    console.error('GET /api/questions/:id error:', error);
    return serverErrorResponse();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check authentication
    const authData = await getCurrentUser(request);
    if (!authData) {
      return unauthorizedResponse('Authentication required');
    }

    // Get user profile
    const profile = await getUserProfile(authData.userId);
    if (!profile) {
      return unauthorizedResponse('User profile not found');
    }

    // Fetch question to check ownership
    const { data: questionData, error: fetchError } = await supabase
      .from('questions')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !questionData) {
      return notFoundResponse('Question not found');
    }

    // Check authorization (creator or ADMIN)
    if (questionData.user_id !== authData.userId && profile.userType !== 'ADMIN') {
      return forbiddenResponse('You can only edit your own questions');
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createQuestionSchema.parse(body);

    // Update question
    const { data, error } = await supabase
      .from('questions')
      .update({
        title: validatedData.title,
        category: validatedData.category,
        body: validatedData.body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating question:', error);
      return serverErrorResponse('Failed to update question');
    }

    // Transform response
    const question: Question = {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      category: data.category,
      body: data.body,
      viewCount: data.view_count,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      user: profile,
    };

    return successResponse(question);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Zod')) {
      return validationErrorResponse(error.message);
    }
    console.error('PUT /api/questions/:id error:', error);
    return serverErrorResponse();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check authentication
    const authData = await getCurrentUser(request);
    if (!authData) {
      return unauthorizedResponse('Authentication required');
    }

    // Get user profile
    const profile = await getUserProfile(authData.userId);
    if (!profile) {
      return unauthorizedResponse('User profile not found');
    }

    // Fetch question to check ownership
    const { data: questionData, error: fetchError } = await supabase
      .from('questions')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !questionData) {
      return notFoundResponse('Question not found');
    }

    // Check authorization (creator or ADMIN)
    if (questionData.user_id !== authData.userId && profile.userType !== 'ADMIN') {
      return forbiddenResponse('You can only delete your own questions');
    }

    // Delete question (cascading delete via RLS)
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting question:', error);
      return serverErrorResponse('Failed to delete question');
    }

    return successResponse({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/questions/:id error:', error);
    return serverErrorResponse();
  }
}
