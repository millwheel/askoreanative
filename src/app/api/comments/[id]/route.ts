import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from '@/lib/api-utils';
import { getCurrentUser, getUserProfile } from '../../base-handler';
import { supabase } from '@/lib/supabase';

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

    const commentId = params.id;

    // Get the comment to verify ownership
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('user_id')
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      return notFoundResponse('Comment not found');
    }

    // Check ownership (must be creator or ADMIN)
    if (comment.user_id !== user.id && userProfile.userType !== 'ADMIN') {
      return forbiddenResponse('You can only delete your own comments');
    }

    // Delete comment
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) {
      console.error('Error deleting comment:', deleteError);
      return errorResponse(500, 'Failed to delete comment');
    }

    return successResponse({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/comments/:id:', error);
    return errorResponse(500, 'Internal server error');
  }
}
