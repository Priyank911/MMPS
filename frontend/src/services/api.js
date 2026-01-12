import axios from 'axios';
import API_URL from '../config';

/**
 * Submit multi-modal inputs to the refinement pipeline
 */
export const refinePrompt = async (textInputs, imageUrls, documents) => {
  const formData = new FormData();

  // Add text inputs
  textInputs.forEach(text => {
    formData.append('textInputs', text);
  });

  // Add image URLs (already uploaded to Cloudinary)
  formData.append('imageUrls', JSON.stringify(imageUrls));

  // Add document files
  documents.forEach(doc => {
    formData.append('documents', doc.file);
  });

  try {
    const response = await axios.post(`${API_URL}/api/refine`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000 // 60 second timeout
    });

    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error
      throw new Error(
        error.response.data?.error?.message || 'Server error occurred'
      );
    } else if (error.request) {
      // Request made but no response
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Error setting up request
      throw new Error(error.message || 'Failed to submit request');
    }
  }
};

/**
 * Get health status of the system
 */
export const getHealthStatus = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/health`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch health status');
  }
};

/**
 * Get status of a specific layer
 */
export const getLayerStatus = async (layer) => {
  try {
    const response = await axios.get(`${API_URL}/api/layers/${layer}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch ${layer} layer status`);
  }
};
