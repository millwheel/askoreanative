import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { successResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api-utils';
import { Question } from '@/types';

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
