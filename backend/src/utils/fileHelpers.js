export const generateS3Key = (originalName, prefix = 'uploads/') => {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  return `${prefix}${timestamp}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
};

export const validateFile = (file, options = {}) => {
  const { allowedTypes = ['image/jpeg', 'image/png'], maxSizeMB = 5 } = options;

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error(
      `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
    );
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    throw new Error(`File exceeds maximum size of ${maxSizeMB}MB`);
  }

  return true;
};
