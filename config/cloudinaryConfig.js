import axios from 'axios';

export const uploadImageToCloudinary = async (uri) => {
    const formData = new FormData();
    const file = {
      uri: uri.startsWith('content://') ? uri.replace('content://', 'file://') : uri,
      type: 'image/jpeg',
      name: 'image.jpg',
    };
    formData.append('file', file);
    formData.append('upload_preset', 'images_sharego'); // Replace with your Cloudinary upload preset
    formData.append('api_key', '566111242317349'); // Add your Cloudinary API key here

    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/doj7dhsdj/image/upload', // Replace with your Cloudinary cloud name
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      console.log('Cloudinary Response:', response.data); // Log the response
      return response.data.secure_url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error.response || error.message);
      Alert.alert('Error', 'Failed to upload image to Cloudinary.');
      return null;
    }
  };