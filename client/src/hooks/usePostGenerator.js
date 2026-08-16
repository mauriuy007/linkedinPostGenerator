import { useState } from 'react';
import { createPost, uploadLinkedinVideo } from '../api/posts.js';
import { fileToBase64 } from '../utils/fileToBase64.js';

const isVideoFile = (file) => Boolean(file?.type?.startsWith('video/'));

export default function usePostGenerator(apiBaseUrl) {
  const [prompt, setPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [generatedPost, setGeneratedPost] = useState(null);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updatePrompt = (value) => {
    setPrompt(value);
    setSubmitMessage('');
  };

  const generatePost = async () => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setSubmitMessage('Write your post content before submitting.');
      return null;
    }

    const isVideo = isVideoFile(selectedImage);
    let imageBase64;
    let videoUrl;

    setIsSubmitting(true);
    setSubmitMessage('');

    if (selectedImage && isVideo) {
      try {
        setSubmitMessage('Uploading video...');
        videoUrl = await uploadLinkedinVideo(apiBaseUrl, selectedImage);
        setSubmitMessage('');
      } catch (error) {
        console.error('Error uploading the video:', error);
        setSubmitMessage(error.message);
        setIsSubmitting(false);
        return null;
      }
    } else if (selectedImage) {
      try {
        imageBase64 = await fileToBase64(selectedImage);
      } catch (error) {
        console.error('Error reading the image:', error);
        setSubmitMessage("We couldn't process the selected image.");
        setIsSubmitting(false);
        return null;
      }
    }

    const payload = {
      title: trimmedPrompt.slice(0, 60),
      content: trimmedPrompt,
      authorUsername: 'linkedin-user',
      imageBase64,
      imageMimeType: isVideo ? undefined : selectedImage?.type,
      imageName: isVideo ? undefined : selectedImage?.name,
      videoUrl,
    };

    try {
      const post = await createPost(apiBaseUrl, payload);
      setGeneratedPost(post);
      setSubmitMessage('The post was generated successfully by Gemini.');
      return post;
    } catch (error) {
      setSubmitMessage(error.message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetGeneratedPost = () => setGeneratedPost(null);

  return {
    prompt,
    setPrompt: updatePrompt,
    selectedImage,
    setSelectedImage,
    generatedPost,
    submitMessage,
    setSubmitMessage,
    isSubmitting,
    generatePost,
    resetGeneratedPost,
  };
}
