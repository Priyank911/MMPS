const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const CLOUDINARY_CONFIG = {
  cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
  uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
};

export default API_URL;
