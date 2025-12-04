import { NextRequest, NextResponse } from 'next/server';
import { createQuestionSchema } from '@/lib/validation';
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse } from '@/lib/api-utils';
import { getCurrentUser, getUserProfile } from '../base-handler';
import { supabase } from '../../../../supabase/supabase';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'newest'; // 'newest' or 'mostViewed'
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    logger.info('GET /api/questions', { search, category, sort, page, pageSize });

    const offset = (page - 1) * pageSize;

    // Build query
    let query = supabase
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
        answers (count),
        comments (count)
      `,
        { count: 'exact' }
      );

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`);
    }

    // Apply category filter
    if (category) {
      query = query.eq('category', category);
    }

    // Apply sorting
    if (sort === 'mostViewed') {
      query = query.order('view_count', { ascending: false });
    } else {
      // Default: newest (created_at descending)
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1);

    const { data: questions, error, count } = await query;

    if (error) {
      console.error('Error fetching questions:', error);
      return errorResponse(500, 'Failed to fetch questions');
    }

    // Transform response
    const transformedQuestions = (questions || []).map((q: any) => ({
      id: q.id,
      userId: q.user_id,
      title: q.title,
      category: q.category,
      body: q.body,
      viewCount: q.view_count,
      createdAt: q.created_at,
      updatedAt: q.updated_at,
      user: q.user_profiles ? {
        id: q.user_profiles.id,
        email: q.user_profiles.email,
        displayName: q.user_profiles.display_name,
        avatarUrl: q.user_profiles.avatar_url,
        languagePreference: q.user_profiles.language_preference,
        userType: q.user_profiles.user_type,
        answererType: q.user_profiles.answerer_type,
        createdAt: q.user_profiles.created_at,
        updatedAt: q.user_profiles.updated_at,
      } : null,
      answers: q.answers || [],
      comments: q.comments || [],
    }));

    const duration = Date.now() - startTime;
    logger.request('GET', '/api/questions', 200, duration);

    return successResponse(
      {
        data: transformedQuestions,
        pagination: {
          page,
          pageSize,
          total: count,
          totalPages: Math.ceil((count || 0) / pageSize),
        },
      },
      200
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Error in GET /api/questions', error);
    logger.request('GET', '/api/questions', 500, duration);
    return errorResponse(500, 'Internal server error');
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorizedResponse('Authentication required');
    }

    // Get user profile to verify role
    const userProfile = await getUserProfile(user.id);
    if (!userProfile) {
      return errorResponse(404, 'User profile not found');
    }

    // Check if user is allowed to create questions (CUSTOMER or ANSWERER)
    if (userProfile.userType !== 'CUSTOMER' && userProfile.userType !== 'ANSWERER' && userProfile.userType !== 'ADMIN') {
      return errorResponse(403, 'You do not have permission to create questions');
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createQuestionSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten();
      return validationErrorResponse(JSON.stringify(errors.fieldErrors));
    }

    const { title, category, body: questionBody } = validationResult.data;

    // Create question
    const { data: question, error: insertError } = await supabase
      .from('questions')
      .insert({
        user_id: user.id,
        title,
        category,
        body: questionBody,
      })
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

    if (insertError) {
      console.error('Error inserting question:', insertError);
      return errorResponse(500, 'Failed to create question');
    }

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
      answers: [],
      comments: [],
    };

    return successResponse(transformedQuestion, 201);
  } catch (error) {
    console.error('Error in POST /api/questions:', error);
    return errorResponse(500, 'Internal server error');
  }
}
