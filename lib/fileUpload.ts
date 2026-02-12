/**
 * Upload image to public folder (development) or prepare for production
 */
export const uploadProductImage = async (
  file: File,
  productId: string,
  productName: string
): Promise<string> => {
  // Generate unique filename
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanName = productName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
  
  const filename = `product-${productId}-${cleanName}.${extension}`;
  
  if (process.env.NODE_ENV === 'development') {
    // In development: We'll simulate saving to public folder
    // In real implementation, you'd write to /public/images/products/
    console.log(`[DEV] Would save image as: ${filename}`);
    
    // For now, we'll use localStorage as a simulation
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onload = (e) => {
        // Store in localStorage temporarily
        const images = JSON.parse(localStorage.getItem('product_images') || '{}');
        images[filename] = e.target?.result;
        localStorage.setItem('product_images', JSON.stringify(images));
        resolve(filename);
      };
      reader.readAsDataURL(file);
    });
  } else {
    // PRODUCTION: Upload to your server/CDN
    // This would be your actual upload logic
    const formData = new FormData();
    formData.append('image', file);
    formData.append('filename', filename);
    
    const response = await fetch('/api/upload-product-image', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) throw new Error('Upload failed');
    
    const data = await response.json();
    return data.imagePath; // Return the stored path/URL
  }
};