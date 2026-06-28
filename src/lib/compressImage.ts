import imageCompression from 'browser-image-compression';

export async function compressImage(file: File, maxSizeMB = 1.5, maxWidthOrHeight = 1200) {
  const options = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
  };
  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error('[Compress] Error:', error);
    return file; // Compression ካልተሳካ ያልተጨመቀውን ፋይል መልስ
  }
}
