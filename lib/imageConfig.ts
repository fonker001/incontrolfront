// Configuration for image storage
export const imageConfig = {
  // Base URL for product images
  baseUrl: process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '/images/products/',
  
  // Generate full image URL
  getProductImageUrl: (imagePath: string | null): string => {
    if (!imagePath) return '/images/products/default.jpg';
    
    // If imagePath is already a full URL (from CDN), use it
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Otherwise, combine with base URL
    return `${imageConfig.baseUrl}${imagePath}`;
  },
  
  // Allowed image extensions
  allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  
  // Max file size (5MB)
  maxFileSize: 5 * 1024 * 1024,
};