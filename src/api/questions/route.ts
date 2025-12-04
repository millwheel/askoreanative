import { NextRequest } from 'next/server';
import { supabase } from '../../../supabase/supabase';
import { successResponse, validationErrorResponse, serverErrorResponse, unauthorizedResponse, forbiddenResponse } from '@/lib/api-utils';
import { Question } from '@/types';
import { createQuestionSchema } from '@/lib/validation';
import { getCurrentUser, getUserProfile } from '@/api/base-handler';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    // Validate pagination
    if (page < 1 || pageSize < 1) {
      return validationErrorResponse('Page and pageSize must be positive integers');
    }

    const offset = (page - 1) * pageSize;

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
        user_profiles:user_id (
          id,
          email,
          display_name,
          avatar_url,
          user_type,
          answerer_type
        ),
        answers (id),
        comments (id)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });

    // Add search filter if provided (full-text search)
    if (search) {
      query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`);
    }

    // Add category filter if provided
    if (category) {
      query = query.eq('category', category);
    }

    // Apply pagination
    const { data, error, count } = await query.range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Error fetching questions:', error);
      return serverErrorResponse('Failed to fetch questions');
    }

    // Transform the response
    const questions = data?.map((q: any) => ({
      id: q.id,
      userId: q.user_id,
      title: q.title,
      category: q.category,
      body: q.body,
      viewCount: q.view_count,
      createdAt: q.created_at,
      updatedAt: q.updated_at,
      user: q.user_profiles
        ? {
            id: q.user_profiles.id,
            email: q.user_profiles.email,
            displayName: q.user_profiles.display_name,
            avatarUrl: q.user_profiles.avatar_url,
            userType: q.user_profiles.user_type,
            answererType: q.user_profiles.answerer_type,
          }
        : null,
      answerCount: q.answers?.length || 0,
      commentCount: q.comments?.length || 0,
    })) as Question[];

    return successResponse({
      data: questions,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error) {
    console.error('GET /api/questions error:', error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Check if user is CUSTOMER or ANSWERER (both can create questions)
    if (!['CUSTOMER', 'ANSWERER'].includes(profile.userType)) {
      return forbiddenResponse('Only CUSTOMER and ANSWERER users can create questions');
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createQuestionSchema.parse(body);

    // Create question
    const { data, error } = await supabase
      .from('questions')
      .insert([
        {
          user_id: authData.userId,
          title: validatedData.title,
          category: validatedData.category,
          body: validatedData.body,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating question:', error);
      return serverErrorResponse('Failed to create question');
    }

    // Transform response
    const question: Question = {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      category: data.category,
      body: data.body,
      viewCount: 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      user: profile,
    };

    return successResponse(question, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Zod')) {
      return validationErrorResponse(error.message);
    }
    console.error('POST /api/questions error:', error);
    return serverErrorResponse();
  }
}
