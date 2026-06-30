import { apiClient } from './axios';
import type { ImageUploadScope, ImageUploadSignature } from './types';

export const DEFAULT_MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;

type CloudinaryUploadResponse = {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

export type UploadedImage = {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

export function formatImageUploadLimit(bytes = DEFAULT_MAX_IMAGE_UPLOAD_BYTES) {
  return `${Math.round(bytes / (1024 * 1024))} MB`;
}

async function getImageUploadSignature(scope: ImageUploadScope) {
  return apiClient<{ upload: ImageUploadSignature }>('/uploads/images/signature', {
    method: 'POST',
    body: JSON.stringify({ scope }),
  }).then((data) => data.upload);
}

export async function uploadImageDirect(file: File, scope: ImageUploadScope): Promise<UploadedImage> {
  const signature = await getImageUploadSignature(scope);

  if (file.size > signature.maxBytes) {
    throw new Error(`Image must be ${formatImageUploadLimit(signature.maxBytes)} or smaller`);
  }

  const formData = new FormData();

  formData.append('file', file);
  formData.append('api_key', signature.apiKey);
  formData.append('timestamp', String(signature.timestamp));
  formData.append('signature', signature.signature);
  formData.append('folder', signature.folder);
  formData.append('public_id', signature.publicId);

  const response = await fetch(signature.uploadUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Image upload failed');
  }

  const data = (await response.json()) as CloudinaryUploadResponse;

  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
    format: data.format,
    bytes: data.bytes,
  };
}

export async function deleteUploadedImage(imageUrl: string) {
  return apiClient<{ deleted: boolean }>('/uploads/images', {
    method: 'DELETE',
    body: JSON.stringify({ imageUrl }),
  });
}

export async function cleanupUploadedImages(imageUrls: string[]) {
  const uniqueUrls = Array.from(new Set(imageUrls.filter(Boolean)));

  await Promise.all(uniqueUrls.map((imageUrl) => deleteUploadedImage(imageUrl).catch(() => undefined)));
}
