import { useEffect, useState } from 'react';
import CreateView from '../components/CreateView.jsx';
import LandingView from '../components/LandingView.jsx';
import LoadingOverlay from '../components/LoadingOverlay.jsx';
import PlatformSelectView from '../components/PlatformSelectView.jsx';
import PostPreviewOverlay from '../components/PostPreviewOverlay.jsx';

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const [, base64 = ''] = result.split(',');
      resolve(base64);
    };

    reader.onerror = () => reject(new Error("We couldn't read the selected image."));
    reader.readAsDataURL(file);
  });

export default function App() {
  const [view, setView] = useState('landing');
  const [platformMessage, setPlatformMessage] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('linkedin');
  const [selectedImage, setSelectedImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [generatedPost, setGeneratedPost] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [publishMessage, setPublishMessage] = useState('');
  const [linkedinProfile, setLinkedinProfile] = useState(null);
  const [instagramProfile, setInstagramProfile] = useState(null);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
  const platformLabel = selectedPlatform === 'instagram' ? 'Instagram' : 'LinkedIn';

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const linkedinStatus = currentUrl.searchParams.get('linkedin');
    const instagramStatus = currentUrl.searchParams.get('instagram');
    const reason = currentUrl.searchParams.get('reason');
    const name = currentUrl.searchParams.get('name');
    const picture = currentUrl.searchParams.get('picture');

    if (linkedinStatus === 'ok') {
      const nextMessage = name
        ? `LinkedIn connected successfully. Welcome, ${name}.`
        : 'LinkedIn connected successfully. You can create your post now.';

      setAuthMessage(nextMessage);
      setLinkedinProfile({
        name: name ?? 'LinkedIn User',
        picture: picture ?? '',
      });
      setSelectedPlatform('linkedin');
      setView('create');
    }

    if (linkedinStatus === 'error') {
      setAuthMessage(reason ?? "We couldn't complete LinkedIn login.");
      setView('landing');
      document.getElementById('get-started')?.scrollIntoView();
    }

    if (instagramStatus === 'ok') {
      const nextMessage = name
        ? `Instagram connected successfully. Welcome, ${name}.`
        : 'Instagram connected successfully. You can create your post now.';

      setAuthMessage(nextMessage);
      setInstagramProfile({
        name: name ?? 'Instagram User',
        picture: '',
      });
      setSelectedPlatform('instagram');
      setView('create');
    }

    if (instagramStatus === 'error') {
      setAuthMessage(reason ?? "We couldn't complete Instagram login.");
      setView('landing');
      document.getElementById('get-started')?.scrollIntoView();
    }

    if (linkedinStatus || instagramStatus) {
      currentUrl.searchParams.delete('linkedin');
      currentUrl.searchParams.delete('instagram');
      currentUrl.searchParams.delete('reason');
      currentUrl.searchParams.delete('name');
      currentUrl.searchParams.delete('picture');
      currentUrl.searchParams.delete('linkedinId');
      currentUrl.searchParams.delete('instagramId');
      window.history.replaceState({}, '', currentUrl);
    }
  }, []);

  useEffect(() => {
    const syncLinkedinProfile = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/linkedin/me`, {
          credentials: 'include',
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setLinkedinProfile({
          name: data?.name ?? 'LinkedIn User',
          picture: data?.picture ?? '',
        });
        setSelectedPlatform('linkedin');
        setView('create');
      } catch (error) {
        console.error("Couldn't retrieve LinkedIn profile:", error);
      }
    };

    syncLinkedinProfile();
  }, [apiBaseUrl]);

  useEffect(() => {
    const syncInstagramProfile = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/instagram/me`, {
          credentials: 'include',
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setInstagramProfile({
          name: data?.username ?? 'Instagram User',
          picture: '',
        });
        setSelectedPlatform('instagram');
        setView('create');
      } catch (error) {
        console.error("Couldn't retrieve Instagram profile:", error);
      }
    };

    syncInstagramProfile();
  }, [apiBaseUrl]);

  const handleStartFlow = () => {
    setAuthMessage('');
    setPlatformMessage('');
    setView('platforms');
  };

  const handleLinkedinLogin = () => {
    window.location.assign(`${apiBaseUrl}/api/auth/linkedin`);
  };

  const handleInstagramLogin = () => {
    window.location.assign(`${apiBaseUrl}/api/auth/instagram`);
  };

  const handleBackToLanding = () => {
    setView('landing');
    setAuthMessage('');
    setPlatformMessage('');
    setSubmitMessage('');
    setGeneratedPost(null);
    setIsPreviewOpen(false);
    setPublishMessage('');
  };

  const handleBackToPlatforms = () => {
    setView('platforms');
    setSubmitMessage('');
    setGeneratedPost(null);
    setIsPreviewOpen(false);
    setPublishMessage('');
  };

  const handlePlatformSelection = (platform) => {
    setSelectedPlatform(platform);
    setPlatformMessage('');

    if (platform === 'linkedin') {
      handleLinkedinLogin();
      return;
    }

    if (platform === 'instagram') {
      handleInstagramLogin();
      return;
    }

    setPlatformMessage("TikTok will appear here once we have its documentation and API keys ready.");
  };

  const handleGeneratePost = async () => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setSubmitMessage('Write your post content before submitting.');
      return;
    }

    let imageBase64;

    if (selectedImage) {
      try {
        imageBase64 = await fileToBase64(selectedImage);
      } catch (error) {
        console.error('Error reading the image:', error);
        setSubmitMessage("We couldn't process the selected image.");
        return;
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

    console.log('Payload sent to backend:', {
      ...payload,
      imageBase64: imageBase64 ? `[base64 length: ${imageBase64.length}]` : undefined,
    });
    setIsSubmitting(true);
    setSubmitMessage('');
    setPublishMessage('');

    try {
      const response = await fetch(`${apiBaseUrl}/api/posts/create`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let data = null;

      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch (parseError) {
        console.error("Couldn't parse backend response:", parseError);
      }

      console.log('Backend response when creating post:', data);
      console.log('Post generated by Gemini from backend:', data?.post?.content);

      if (!response.ok) {
        setSubmitMessage(data?.error ?? 'The backend returned an unexpected error.');
        return;
      }

      setGeneratedPost(data?.post ?? null);
      setIsPreviewOpen(true);
      setSubmitMessage('The post was generated successfully by Gemini.');
    } catch (error) {
      console.error('Error sending the post to the backend:', error);
      setSubmitMessage('A network error occurred while sending the post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishPost = async () => {
    if (!generatedPost) {
      return;
    }

    if (selectedPlatform === 'instagram' && !generatedPost.imageUrl) {
      setPublishMessage('Instagram requires an image. Go back, upload an image, and generate the post again.');
      return;
    }

    setIsPublishing(true);
    setPublishMessage('');

    const endpoint = selectedPlatform === 'instagram' ? '/api/posts/publish/instagram' : '/api/posts/publish';

    try {
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post: generatedPost,
        }),
      });

      const data = await response.json();

      console.log(`Backend response when publishing to ${platformLabel}:`, data);

      if (!response.ok) {
        setPublishMessage(data?.error ?? `We couldn't publish the post to ${platformLabel}.`);
        return;
      }

      setPublishMessage(`The post was published successfully to ${platformLabel}.`);
    } catch (error) {
      console.error(`Error publishing the post to ${platformLabel}:`, error);
      setPublishMessage(`A network error occurred while publishing to ${platformLabel}.`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <main className="app">
      <div className="app__viewport">
        <div className={`app__track app__track--${view}`}>
          <LandingView onStart={handleStartFlow} authMessage={view === 'landing' ? authMessage : ''} />
          <PlatformSelectView
            noticeMessage={view === 'platforms' ? platformMessage : ''}
            selectedPlatform={selectedPlatform}
            onBack={handleBackToLanding}
            onSelectPlatform={handlePlatformSelection}
          />
          <CreateView
            prompt={prompt}
            selectedImage={selectedImage}
            platformLabel={platformLabel}
            requiresImage={selectedPlatform === 'instagram'}
            authMessage={view === 'create' ? authMessage : ''}
            submitMessage={submitMessage}
            isSubmitting={isSubmitting}
            onBack={handleBackToPlatforms}
            onGenerate={handleGeneratePost}
            onImageChange={(event) => setSelectedImage(event.target.files?.[0] ?? null)}
            onPromptChange={(event) => {
              setPrompt(event.target.value);

              if (submitMessage) {
                setSubmitMessage('');
              }
            }}
          />
        </div>
      </div>
      <LoadingOverlay
        isVisible={isSubmitting || isPublishing}
        eyebrow={isPublishing ? `Publishing to ${platformLabel}` : 'Generating with Gemini'}
        title={
          isPublishing
            ? "We're publishing your post"
            : `We're putting together your post for ${platformLabel}`
        }
        description={
          isPublishing
            ? `Uploading the image and creating the post on your authenticated ${platformLabel} account.`
            : 'Analyzing the context and image to show you a preview before publishing.'
        }
      />
      <PostPreviewOverlay
        isVisible={isPreviewOpen}
        post={generatedPost}
        profile={selectedPlatform === 'instagram' ? instagramProfile : linkedinProfile}
        platformLabel={platformLabel}
        onClose={() => setIsPreviewOpen(false)}
        onPublish={handlePublishPost}
        isPublishing={isPublishing}
        publishMessage={publishMessage}
      />
    </main>
  );
}
