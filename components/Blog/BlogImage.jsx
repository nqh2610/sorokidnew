'use client';

import { useState, useEffect } from 'react';

const DEFAULT_BLOG_IMAGE = '/blog/default-blog.svg';

// Known non-existent images that should use default
const INVALID_DEFAULT_IMAGES = [
  '/blog/default-blog-image.jpg',
  '/blog/default-blog-image.png',
];

/**
 * BlogImage - Component hiển thị ảnh blog với fallback khi lỗi
 * Auto-corrects known invalid default image paths
 */
export default function BlogImage({ src, alt, className = '' }) {
  // Normalize src - replace known invalid defaults with actual default
  const normalizedSrc = INVALID_DEFAULT_IMAGES.includes(src) 
    ? DEFAULT_BLOG_IMAGE 
    : (src || DEFAULT_BLOG_IMAGE);
    
  const [imgSrc, setImgSrc] = useState(normalizedSrc);
  const [hasError, setHasError] = useState(false);

  // Reset state khi src thay đổi
  useEffect(() => {
    const correctedSrc = INVALID_DEFAULT_IMAGES.includes(src) 
      ? DEFAULT_BLOG_IMAGE 
      : (src || DEFAULT_BLOG_IMAGE);
    setImgSrc(correctedSrc);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(DEFAULT_BLOG_IMAGE);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={handleError}
    />
  );
}
