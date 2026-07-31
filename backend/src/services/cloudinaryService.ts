/**
 * cloudinaryService.ts
 * 
 * Handles PDF uploads to Cloudinary and manages storage URLs
 */

import { v2 as cloudinary } from 'cloudinary';
import { Buffer } from 'buffer';

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Configure Cloudinary
if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
  console.log('[Cloudinary] ✅ Configured successfully');
} else {
  console.warn('[Cloudinary] ⚠️  Cloudinary credentials not fully configured. PDF uploads will be disabled.');
}

export interface CloudinaryUploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  size?: number;
  error?: string;
}

/**
 * Uploads a PDF buffer to Cloudinary
 * Returns public URL and metadata
 */
export async function uploadPDFToCloudinary(
  pdfBuffer: Buffer,
  filename: string,
  folder: string = 'research-workspace'
): Promise<CloudinaryUploadResult> {
  try {
    // Check if Cloudinary is configured
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      console.warn('[Cloudinary] Skipping upload - credentials not configured');
      return {
        success: false,
        error: 'Cloudinary not configured. PDF will not be uploaded to cloud storage.',
      };
    }

    // Upload to Cloudinary using a readable stream from buffer
    return new Promise((resolve) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: `research-workspace/${folder}`,
          public_id: filename.replace(/\.[^/.]+$/, ''), // Remove extension
          format: 'pdf',
          overwrite: false,
          tags: ['research-workspace', 'generated-pdf'],
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error: any, result: any) => {
          if (error) {
            console.error('[Cloudinary] Upload error:', error);
            resolve({
              success: false,
              error: error.message || 'Upload failed',
            });
          } else {
            console.log('[Cloudinary] ✅ PDF uploaded:', result.public_id);
            resolve({
              success: true,
              url: result.secure_url,
              publicId: result.public_id,
              size: result.bytes,
            });
          }
        }
      );

      // Write buffer to stream
      stream.end(pdfBuffer);
    });
  } catch (error: any) {
    console.error('[Cloudinary] Fatal error during upload:', error.message);
    return {
      success: false,
      error: error.message || 'Unknown error during upload',
    };
  }
}

/**
 * Deletes a PDF from Cloudinary by public ID
 */
export async function deletePDFFromCloudinary(publicId: string): Promise<boolean> {
  try {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      console.warn('[Cloudinary] Skipping delete - credentials not configured');
      return false;
    }

    const result = await cloudinary.uploader.destroy(publicId);
    console.log('[Cloudinary] ✅ PDF deleted:', publicId);
    return result.result === 'ok';
  } catch (error: any) {
    console.error('[Cloudinary] Delete error:', error.message);
    return false;
  }
}

/**
 * Gets secure URL from public ID
 */
export function getSecureUrl(publicId: string): string | null {
  if (!CLOUDINARY_CLOUD_NAME) return null;
  return cloudinary.url(publicId, {
    secure: true,
    format: 'auto',
  });
}

/**
 * Checks if Cloudinary is properly configured
 */
export function isCloudinaryConfigured(): boolean {
  return !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);
}
