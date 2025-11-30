import { NextRequest, NextResponse } from 'next/server';
import { createQuestionSchema } from '@/lib/validation';
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/api-utils';
import { getCurrentUser, getUserProfile } from '../../base-handler';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const questionId = params.id;

    // Fetch question with nested data
    const { data: question, error } = await supabase
      .from('questions')
      .select(`
        id,
        user_id,
        title,
        category,
        body,
        view_count,
        created_at,
        updated_at,
        user_profiles!inner (
          id,
          email,
          display_name,
          avatar_url,
          language_preference,
          user_type,
          answerer_type,
          created_at,
          updated_at
        ),
        answers (
          id,
          user_id,
          body,
          created_at,
          updated_at,
          user_profiles!inner (
            id,
            email,
            display_name,
            avatar_url,
            language_preference,
            user_type,
            answerer_type,
            created_at,
            updated_at
          ),
          comments (
            id,
            user_id,
            body,
            created_at,
            updated_at,
            user_profiles!inner (
              id,
              email,
              display_name,
              avatar_url,
              language_preference,
              user_type,
              answerer_type,
              created_at,
              updated_at
            )
          ),
          attachments (
            id,
            file_url,
            file_type,
            file_name,
            file_size,
            created_at,
            updated_at
          )
        ),
        comments (
          id,
          user_id,
          body,
          created_at,
          updated_at,
          user_profiles!inner (
            id,
            email,
            display_name,
            avatar_url,
            language_preference,
            user_type,
            answerer_type,
            created_at,
            updated_at
          )
        ),
        attachments (
          id,
          file_url,
          file_type,
          file_name,
          file_size,
          created_at,
          updated_at
        )
      `)
      .eq('id', questionId)
      .single();

    if (error || !question) {
      return notFoundResponse('Question not found');
    }

    // Increment view count
    await supabase
      .from('questions')
      .update({ view_count: (question.view_count || 0) + 1 })
      .eq('id', questionId);

    // Transform comments
    const transformComments = (comments: any[]) =>
      (comments || []).map((c) => ({
        id: c.id,
        userId: c.user_id,
        body: c.body,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        user: c.user_profiles ? {
          id: c.user_profiles.id,
          email: c.user_profiles.email,
          displayName: c.user_profiles.display_name,
          avatarUrl: c.user_profiles.avatar_url,
          languagePreference: c.user_profiles.language_preference,
          userType: c.user_profiles.user_type,
          answererType: c.user_profiles.answerer_type,
          createdAt: c.user_profiles.created_at,
          updatedAt: c.user_profiles.updated_at,
        } : null,
      }));

    // Transform attachments
    const transformAttachments = (attachments: any[]) =>
      (attachments || []).map((a) => ({
        id: a.id,
        fileUrl: a.file_url,
        fileType: a.file_type,
        fileName: a.file_name,
        fileSize: a.file_size,
        createdAt: a.created_at,
        updatedAt: a.updated_at,
      }));

    // Transform answers
    const transformedAnswers = (question.answers || []).map((a: any) => ({
      id: a.id,
      questionId: questionId,
      userId: a.user_id,
      body: a.body,
      createdAt: a.created_at,
      updatedAt: a.updated_at,
      user: a.user_profiles ? {
        id: a.user_profiles.id,
        email: a.user_profiles.email,
        displayName: a.user_profiles.display_name,
        avatarUrl: a.user_profiles.avatar_url,
        languagePreference: a.user_profiles.language_preference,
        userType: a.user_profiles.user_type,
        answererType: a.user_profiles.answerer_type,
        createdAt: a.user_profiles.created_at,
        updatedAt: a.user_profiles.updated_at,
      } : null,
      comments: transformComments(a.comments),
      attachments: transformAttachments(a.attachments),
    }));

    // Transform response
    const transformedQuestion = {
      id: question.id,
      userId: question.user_id,
      title: question.title,
      category: question.category,
      body: question.body,
      viewCount: question.view_count,
      createdAt: question.created_at,
      updatedAt: question.updated_at,
      user: question.user_profiles ? {
        id: question.user_profiles.id,
        email: question.user_profiles.email,
        displayName: question.user_profiles.display_name,
        avatarUrl: question.user_profiles.avatar_url,
        languagePreference: question.user_profiles.language_preference,
        userType: question.user_profiles.user_type,
        answererType: question.user_profiles.answerer_type,
        createdAt: question.user_profiles.created_at,
        updatedAt: question.user_profiles.updated_at,
      } : null,
      answers: transformedAnswers,
      comments: transformComments(question.comments),
      attachments: transformAttachments(question.attachments),
    };

    return successResponse(transformedQuestion);
  } catch (error) {
    console.error('Error in GET /api/questions/:id:', error);
    return errorResponse(500, 'Internal server error');
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorizedResponse('Authentication required');
    }

    // Get user profile
    const userProfile = await getUserProfile(user.id);
    if (!userProfile) {
      return errorResponse(404, 'User profile not found');
    }

    const questionId = params.id;

    // Get the question to verify ownership
    const { data: question, error: fetchError } = await supabase
      .from('questions')
      .select('user_id')
      .eq('id', questionId)
      .single();

    if (fetchError || !question) {
      return notFoundResponse('Question not found');
    }

    // Check ownership (must be creator or ADMIN)
    if (question.user_id !== user.id && userProfile.userType !== 'ADMIN') {
      return forbiddenResponse('You can only edit your own questions');
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createQuestionSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten();
      return validationErrorResponse(JSON.stringify(errors.fieldErrors));
    }

    const { title, category, body: questionBody } = validationResult.data;

    // Update question
    const { data: updatedQuestion, error: updateError } = await supabase
      .from('questions')
      .update({
        title,
        category,
        body: questionBody,
        updated_at: new Date().toISOString(),
      })
      .eq('id', questionId)
      .select(`
        id,
        user_id,
        title,
        category,
        body,
        view_count,
        created_at,
        updated_at,
        user_profiles!inner (
          id,
          email,
          display_name,
          avatar_url,
          language_preference,
          user_type,
          answerer_type,
          created_at,
          updated_at
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating question:', updateError);
      return errorResponse(500, 'Failed to update question');
    }

    // Transform response
    const transformedQuestion = {
      id: updatedQuestion.id,
      userId: updatedQuestion.user_id,
      title: updatedQuestion.title,
      category: updatedQuestion.category,
      body: updatedQuestion.body,
      viewCount: updatedQuestion.view_count,
      createdAt: updatedQuestion.created_at,
      updatedAt: updatedQuestion.updated_at,
      user: updatedQuestion.user_profiles ? {
        id: updatedQuestion.user_profiles.id,
        email: updatedQuestion.user_profiles.email,
        displayName: updatedQuestion.user_profiles.display_name,
        avatarUrl: updatedQuestion.user_profiles.avatar_url,
        languagePreference: updatedQuestion.user_profiles.language_preference,
        userType: updatedQuestion.user_profiles.user_type,
        answererType: updatedQuestion.user_profiles.answerer_type,
        createdAt: updatedQuestion.user_profiles.created_at,
        updatedAt: updatedQuestion.user_profiles.updated_at,
      } : null,
      answers: [],
      comments: [],
    };

    return successResponse(transformedQuestion);
  } catch (error) {
    console.error('Error in PUT /api/questions/:id:', error);
    return errorResponse(500, 'Internal server error');
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorizedResponse('Authentication required');
    }

    // Get user profile
    const userProfile = await getUserProfile(user.id);
    if (!userProfile) {
      return errorResponse(404, 'User profile not found');
    }

    const questionId = params.id;

    // Get the question to verify ownership
    const { data: question, error: fetchError } = await supabase
      .from('questions')
      .select('user_id')
      .eq('id', questionId)
      .single();

    if (fetchError || !question) {
      return notFoundResponse('Question not found');
    }

    // Check ownership (must be creator or ADMIN)
    if (question.user_id !== user.id && userProfile.userType !== 'ADMIN') {
      return forbiddenResponse('You can only delete your own questions');
    }

    // Delete question (cascade delete will handle answers, comments, attachments)
    const { error: deleteError } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId);

    if (deleteError) {
      console.error('Error deleting question:', deleteError);
      return errorResponse(500, 'Failed to delete question');
    }

    return successResponse({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/questions/:id:', error);
    return errorResponse(500, 'Internal server error');
  }
}
