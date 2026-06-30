type ImageTransformOptions = {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'limit';
  quality?: 'auto' | number;
};

export function optimizedImageUrl(imageUrl: string | null | undefined, options: ImageTransformOptions = {}) {
  if (!imageUrl) {
    return '';
  }

  let url: URL;

  try {
    url = new URL(imageUrl);
  } catch {
    return imageUrl;
  }

  if (url.hostname !== 'res.cloudinary.com' || !url.pathname.includes('/image/upload/')) {
    return imageUrl;
  }

  const transforms = [
    options.width ? `w_${options.width}` : undefined,
    options.height ? `h_${options.height}` : undefined,
    options.crop ? `c_${options.crop}` : undefined,
    `q_${options.quality ?? 'auto'}`,
    'f_auto',
    'dpr_auto',
  ].filter(Boolean);

  return imageUrl.replace('/image/upload/', `/image/upload/${transforms.join(',')}/`);
}
