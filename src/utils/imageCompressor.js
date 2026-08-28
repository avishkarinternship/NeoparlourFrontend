/**
 * Compresses raw camera image File or Base64 string to max maxWidth/maxHeight and quality JPEG.
 * Reduces 5MB-10MB raw camera photos into lightweight ~150KB Web-optimized JPEGs in browser RAM using HTML5 Canvas.
 *
 * @param {File | Blob | string} imageSource - Raw File object, Blob, or DataURL string
 * @param {number} maxWidth - Maximum width in pixels (default 1200)
 * @param {number} maxHeight - Maximum height in pixels (default 1200)
 * @param {number} quality - JPEG compression quality 0.0 to 1.0 (default 0.75)
 * @param {boolean} returnRawBase64 - If true, returns Base64 string without data:image/jpeg;base64, prefix
 * @returns {Promise<string>} Compressed JPEG Data URL or Base64 string
 */
export const compressImage = (
  imageSource,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.75,
  returnRawBase64 = false
) => {
  return new Promise((resolve, reject) => {
    if (!imageSource) {
      return reject(new Error("No image source provided for compression"));
    }

    const processImageElement = (img) => {
      try {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio scaling
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to compressed Base64 JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

        if (returnRawBase64) {
          const rawBase64 = compressedDataUrl.includes(',')
            ? compressedDataUrl.split(',')[1]
            : compressedDataUrl;
          resolve(rawBase64);
        } else {
          resolve(compressedDataUrl);
        }
      } catch (err) {
        reject(err);
      }
    };

    // If source is already a string (Data URL or URL)
    if (typeof imageSource === 'string') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => processImageElement(img);
      img.onerror = (err) => reject(new Error("Failed to load image from string source"));
      img.src = imageSource;
      return;
    }

    // If source is a File or Blob
    const reader = new FileReader();
    reader.readAsDataURL(imageSource);
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => processImageElement(img);
      img.onerror = (err) => reject(new Error("Failed to load image from FileReader source"));
      img.src = event.target.result;
    };
    reader.onerror = (err) => reject(err);
  });
};

/**
 * Batch compresses an array of image Files.
 *
 * @param {Array<File>} files - Array of File objects
 * @param {number} maxWidth - Max dimension
 * @param {number} maxHeight - Max dimension
 * @param {number} quality - Quality (0.75)
 * @returns {Promise<Array<string>>} Array of compressed Base64 strings
 */
export const compressImagesBatch = async (
  files,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.75
) => {
  if (!Array.isArray(files) || files.length === 0) return [];
  const results = await Promise.all(
    files.map(file => compressImage(file, maxWidth, maxHeight, quality))
  );
  return results;
};

export default compressImage;
