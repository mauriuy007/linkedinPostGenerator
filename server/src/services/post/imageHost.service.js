import crypto from 'crypto';
import { put, del } from '@vercel/blob';

export const parseDataUrl = imageUrl => {
  if (!imageUrl?.startsWith('data:')) return null;

  const match = imageUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error('Unsupported image data URL format');

  const [, mimeType, base64Data] = match;
  return { mimeType, buffer: Buffer.from(base64Data, 'base64') };
};

const extensionFor = mimeType => mimeType.split('/')[1]?.split('+')[0] ?? 'bin';

// Instagram's Graph API only accepts a publicly fetchable image_url. Uploaded
// images arrive as base64 data URLs, so we host them on Vercel Blob just long
// enough for Instagram to fetch them, then delete them once published.
export const publishTemporaryImage = async imageUrl => {
  const dataImage = parseDataUrl(imageUrl);

  if (!dataImage) return { url: imageUrl, cleanup: async () => {} };

  const pathname = `instagram-uploads/${crypto.randomUUID()}.${extensionFor(dataImage.mimeType)}`;
  const blob = await put(pathname, dataImage.buffer, {
    access: 'public',
    contentType: dataImage.mimeType,
  });

  return {
    url: blob.url,
    cleanup: () => deleteTemporaryMedia(blob.url),
  };
};

// Shared cleanup for any temporary Blob upload (Instagram images, LinkedIn
// videos uploaded directly from the browser) once the platform has ingested it.
export const deleteTemporaryMedia = async url => {
  try {
    await del(url);
  } catch (error) {
    console.error('Failed to delete temporary media blob:', error.message);
  }
};
