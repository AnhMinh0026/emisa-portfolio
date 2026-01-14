/**
 * Simple Cloudinary URL Optimization
 * Only transforms URLs, doesn't change component structure
 */

/**
 * Optimize Cloudinary image URL
 * @param {string} url - Original Cloudinary URL
 * @param {number} width - Target width (optional)
 * @param {number} quality - Quality 1-100 (default 85)
 * @returns {string} Optimized URL
 */
export const optimizeCloudinaryUrl = (url, width = null, quality = 85) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;

  const baseUrl = url.substring(0, uploadIndex + 8);
  const imagePath = url.substring(uploadIndex + 8);

  // Build transformation string
  const transforms = [];
  transforms.push('f_auto'); // Auto format (WebP/AVIF)
  transforms.push('q_auto:good'); // Smart quality balancing
  transforms.push('dpr_auto'); // Auto device pixel ratio
  transforms.push('fl_progressive'); // Progressive loading
  
  if (width) {
    transforms.push(`w_${width}`);
    transforms.push('c_limit'); // Don't upscale
  }

  const transformString = transforms.join(',');
  return `${baseUrl}${transformString}/${imagePath}`;
};
