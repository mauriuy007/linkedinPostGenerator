import { useState } from 'react';
import { createPost } from '../api/posts.js';
import { fileToBase64 } from '../utils/fileToBase64.js';

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

    let imageBase64;

    if (selectedImage) {
      try {
        imageBase64 = await fileToBase64(selectedImage);
      } catch (error) {
        console.error('Error reading the image:', error);
        setSubmitMessage("We couldn't process the selected image.");
        return null;
      }
    }

    const payload = {
      title: trimmedPrompt.slice(0, 60),
      content: trimmedPrompt,
      authorUsername: 'linkedin-user',
      imageBase64,
      imageMimeType: selectedImage?.type,
      imageName: selectedImage?.name,
    };

    setIsSubmitting(true);
    setSubmitMessage('');

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
