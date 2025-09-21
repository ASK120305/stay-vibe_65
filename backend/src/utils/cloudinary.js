import { v2 as cloudinary } from 'cloudinary';
import logger from './logger.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
export const uploadToCloudinary = async (buffer, options = {}) => {
  try {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        resource_type: 'auto',
        folder: 'stay-vibe-plan',
        quality: 'auto',
        fetch_format: 'auto',
        ...options
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            logger.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            logger.info(`Image uploaded to Cloudinary: ${result.public_id}`);
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    logger.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info(`Image deleted from Cloudinary: ${publicId}`);
    return result;
  } catch (error) {
    logger.error('Cloudinary delete error:', error);
    throw error;
  }
};

// Upload multiple images
export const uploadMultipleToCloudinary = async (files, options = {}) => {
  try {
    const uploadPromises = files.map(file => 
      uploadToCloudinary(file.buffer, options)
    );
    
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    logger.error('Multiple upload error:', error);
    throw error;
  }
};

// Generate optimized image URL
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const defaultOptions = {
    quality: 'auto',
    fetch_format: 'auto',
    crop: 'fill',
    gravity: 'auto'
  };

  const finalOptions = { ...defaultOptions, ...options };
  
  return cloudinary.url(publicId, finalOptions);
};

// Generate thumbnail URL
export const getThumbnailUrl = (publicId, width = 300, height = 200) => {
  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto'
  });
};

export default cloudinary;