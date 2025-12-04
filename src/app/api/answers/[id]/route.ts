import { NextRequest, NextResponse } from 'next/server';
import { createAnswerSchema } from '@/lib/validation';
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/api-utils';
import { getCurrentUser, getUserProfile } from '../../base-handler';
import { supabase } from '../../../../../supabase/supabase';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const answerId = params.id;

    // Fetch answer with user profile
    const { data: answer, error } = await supabase
      .from('answers')
      .select(`
        id,
        question_id,
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
      `)
      .eq('id', answerId)
      .single();

    if (error || !answer) {
      return notFoundResponse('Answer not found');
    }

    // Transform response
    const transformedAnswer = {
      id: answer.id,
      questionId: answer.question_id,
      userId: answer.user_id,
      body: answer.body,
      createdAt: answer.created_at,
      updatedAt: answer.updated_at,
      user: answer.user_profiles ? {
        id: answer.user_profiles.id,
        email: answer.user_profiles.email,
        displayName: answer.user_profiles.display_name,
        avatarUrl: answer.user_profiles.avatar_url,
        languagePreference: answer.user_profiles.language_preference,
        userType: answer.user_profiles.user_type,
        answererType: answer.user_profiles.answerer_type,
        createdAt: answer.user_profiles.created_at,
        updatedAt: answer.user_profiles.updated_at,
      } : null,
      comments: [],
      attachments: [],
    };

    return successResponse(transformedAnswer);
  } catch (error) {
    console.error('Error in GET /api/answers/:id:', error);
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

    const answerId = params.id;

    // Get the answer to verify ownership
    const { data: answer, error: fetchError } = await supabase
      .from('answers')
      .select('user_id')
      .eq('id', answerId)
      .single();

    if (fetchError || !answer) {
      return errorResponse(404, 'Answer not found');
    }

    // Check ownership (must be creator or ADMIN)
    if (answer.user_id !== user.id && userProfile.userType !== 'ADMIN') {
      return forbiddenResponse('You can only edit your own answers');
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createAnswerSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten();
      return validationErrorResponse(JSON.stringify(errors.fieldErrors));
    }

    const { body: answerBody } = validationResult.data;

    // Update answer
    const { data: updatedAnswer, error: updateError } = await supabase
      .from('answers')
      .update({
        body: answerBody,
        updated_at: new Date().toISOString(),
      })
      .eq('id', answerId)
      .select(`
        id,
        question_id,
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
      `)
      .single();

    if (updateError) {
      console.error('Error updating answer:', updateError);
      return errorResponse(500, 'Failed to update answer');
    }

    // Transform response
    const transformedAnswer = {
      id: updatedAnswer.id,
      questionId: updatedAnswer.question_id,
      userId: updatedAnswer.user_id,
      body: updatedAnswer.body,
      createdAt: updatedAnswer.created_at,
      updatedAt: updatedAnswer.updated_at,
      user: updatedAnswer.user_profiles ? {
        id: updatedAnswer.user_profiles.id,
        email: updatedAnswer.user_profiles.email,
        displayName: updatedAnswer.user_profiles.display_name,
        avatarUrl: updatedAnswer.user_profiles.avatar_url,
        languagePreference: updatedAnswer.user_profiles.language_preference,
        userType: updatedAnswer.user_profiles.user_type,
        answererType: updatedAnswer.user_profiles.answerer_type,
        createdAt: updatedAnswer.user_profiles.created_at,
        updatedAt: updatedAnswer.user_profiles.updated_at,
      } : null,
      comments: [],
      attachments: [],
    };

    return successResponse(transformedAnswer);
  } catch (error) {
    console.error('Error in PUT /api/answers/:id:', error);
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

    const answerId = params.id;

    // Get the answer to verify ownership
    const { data: answer, error: fetchError } = await supabase
      .from('answers')
      .select('user_id')
      .eq('id', answerId)
      .single();

    if (fetchError || !answer) {
      return errorResponse(404, 'Answer not found');
    }

    // Check ownership (must be creator or ADMIN)
    if (answer.user_id !== user.id && userProfile.userType !== 'ADMIN') {
      return forbiddenResponse('You can only delete your own answers');
    }

    // Delete answer (cascade delete will handle comments and attachments)
    const { error: deleteError } = await supabase
      .from('answers')
      .delete()
      .eq('id', answerId);

    if (deleteError) {
      console.error('Error deleting answer:', deleteError);
      return errorResponse(500, 'Failed to delete answer');
    }

    return successResponse({ message: 'Answer deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/answers/:id:', error);
    return errorResponse(500, 'Internal server error');
  }
}
