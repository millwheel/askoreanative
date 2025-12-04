import { NextRequest, NextResponse } from 'next/server';
import { createAnswerSchema } from '@/lib/validation';
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse } from '@/lib/api-utils';
import { getCurrentUser, getUserProfile } from '../base-handler';
import { supabase } from '../../../../supabase/supabase';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorizedResponse('Authentication required');
    }

    // Get user profile to check role
    const userProfile = await getUserProfile(user.id);
    if (!userProfile) {
      return errorResponse(404, 'User profile not found');
    }

    // Check if user is ANSWERER or ADMIN
    if (userProfile.userType !== 'ANSWERER' && userProfile.userType !== 'ADMIN') {
      return errorResponse(403, 'Only ANSWERER users can create answers');
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createAnswerSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten();
      return validationErrorResponse(JSON.stringify(errors.fieldErrors));
    }

    const { questionId, body: answerBody } = validationResult.data;

    // Verify question exists
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('id')
      .eq('id', questionId)
      .single();

    if (questionError || !question) {
      return errorResponse(404, 'Question not found');
    }

    // Create answer
    const { data: answer, error: insertError } = await supabase
      .from('answers')
      .insert({
        question_id: questionId,
        user_id: user.id,
        body: answerBody,
      })
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

    if (insertError) {
      console.error('Error inserting answer:', insertError);
      return errorResponse(500, 'Failed to create answer');
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

    return successResponse(transformedAnswer, 201);
  } catch (error) {
    console.error('Error in POST /api/answers:', error);
    return errorResponse(500, 'Internal server error');
  }
}
