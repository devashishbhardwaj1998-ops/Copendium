import { AssetAttachmentImage } from '../types';

/**
 * Formats byte size into human readable string (e.g., 245 KB, 1.2 MB)
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

/**
 * Processes and compresses an image file using HTML5 canvas.
 * Resizes large dimensions to max 1600px and compresses JPEG/WebP to ensure
 * snappy rendering and prevent browser storage exhaustion.
 */
export async function processImageFile(
  file: File,
  maxDimension = 1600,
  quality = 0.82
): Promise<AssetAttachmentImage> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) {
        reject(new Error('Empty image file'));
        return;
      }

      // If it's a vector SVG or small image under 300KB, keep as is
      if (file.type === 'image/svg+xml' || file.size < 300 * 1024) {
        resolve({
          id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          dataUrl,
          caption: '',
          uploadedAt: new Date().toISOString(),
          sizeBytes: file.size,
        });
        return;
      }

      // Resize and compress via canvas
      const img = new Image();
      img.onerror = () => {
        // Fallback to uncompressed if image decode fails
        resolve({
          id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          dataUrl,
          caption: '',
          uploadedAt: new Date().toISOString(),
          sizeBytes: file.size,
        });
      };

      img.onload = () => {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve({
            id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            dataUrl,
            caption: '',
            uploadedAt: new Date().toISOString(),
            sizeBytes: file.size,
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Use JPEG for photographic/screenshot compression
        const outputFormat = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const compressedDataUrl = canvas.toDataURL(outputFormat, quality);
        const approxSize = Math.round((compressedDataUrl.length * 3) / 4);

        resolve({
          id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          dataUrl: compressedDataUrl,
          caption: '',
          uploadedAt: new Date().toISOString(),
          sizeBytes: approxSize,
        });
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
}
