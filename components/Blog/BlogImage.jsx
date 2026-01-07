'use client';

import { useState, useEffect } from 'react';

const DEFAULT_BLOG_IMAGE = '/blog/default-blog.svg';

/**
 * BlogImage - Component hiển thị ảnh blog với fallback khi lỗi
 */
export default function BlogImage({ src, alt, className = '' }) {
  const [imgSrc, setImgSrc] = useState(src || DEFAULT_BLOG_IMAGE);
  const [hasError, setHasError] = useState(false);

  // Reset state khi src thay đổi
  useEffect(() => {
    setImgSrc(src || DEFAULT_BLOG_IMAGE);
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
