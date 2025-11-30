import { NextRequest, NextResponse } from 'next/server';
import { createCommentSchema } from '@/lib/validation';
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse } from '@/lib/api-utils';
import { getCurrentUser, getUserProfile } from '../base-handler';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorizedResponse('Authentication required to post comments');
    }

    // Get user profile
    const userProfile = await getUserProfile(user.id);
    if (!userProfile) {
      return errorResponse(404, 'User profile not found');
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createCommentSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten();
      return validationErrorResponse(JSON.stringify(errors.fieldErrors));
    }

    const { postType, postId, body: commentBody } = validationResult.data;

    // Verify the post exists (question or answer)
    let postExists = false;
    if (postType === 'QUESTION') {
      const { data: question } = await supabase
        .from('questions')
        .select('id')
        .eq('id', postId)
        .single();
      postExists = !!question;
    } else if (postType === 'ANSWER') {
      const { data: answer } = await supabase
        .from('answers')
        .select('id')
        .eq('id', postId)
        .single();
      postExists = !!answer;
    }

    if (!postExists) {
      return errorResponse(404, `${postType} not found`);
    }

    // Create comment
    const { data: comment, error: insertError } = await supabase
      .from('comments')
      .insert({
        post_type: postType,
        post_id: postId,
        user_id: user.id,
        body: commentBody,
      })
      .select(`
        id,
        post_type,
        post_id,
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
      console.error('Error inserting comment:', insertError);
      return errorResponse(500, 'Failed to create comment');
    }

    // Transform response
    const transformedComment = {
      id: comment.id,
      postType: comment.post_type,
      postId: comment.post_id,
      userId: comment.user_id,
      body: comment.body,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      user: comment.user_profiles ? {
        id: comment.user_profiles.id,
        email: comment.user_profiles.email,
        displayName: comment.user_profiles.display_name,
        avatarUrl: comment.user_profiles.avatar_url,
        languagePreference: comment.user_profiles.language_preference,
        userType: comment.user_profiles.user_type,
        answererType: comment.user_profiles.answerer_type,
        createdAt: comment.user_profiles.created_at,
        updatedAt: comment.user_profiles.updated_at,
      } : null,
    };

    return successResponse(transformedComment, 201);
  } catch (error) {
    console.error('Error in POST /api/comments:', error);
    return errorResponse(500, 'Internal server error');
  }
}
