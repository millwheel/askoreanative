import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { successResponse, unauthorizedResponse, validationErrorResponse, serverErrorResponse } from '@/lib/api-utils';
import { getCurrentUser } from '@/app/api/base-handler';
import { FILE_SIZE_LIMIT, ALLOWED_IMAGE_TYPES } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authData = await getCurrentUser(request);
    if (!authData) {
      return unauthorizedResponse('Authentication required');
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return validationErrorResponse('No file provided');
    }

    // Validate file size
    if (file.size > FILE_SIZE_LIMIT) {
      return validationErrorResponse('File size exceeds 5MB limit');
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return validationErrorResponse('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${authData.userId}/${timestamp}_${file.name}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('question-images')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading file:', error);
      return serverErrorResponse('Failed to upload file');
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('question-images')
      .getPublicUrl(data.path);

    return successResponse({
      url: urlData.publicUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
  } catch (error) {
    console.error('POST /api/upload error:', error);
    return serverErrorResponse();
  }
}
