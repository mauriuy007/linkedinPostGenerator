import { useRef, useState } from 'react';
import CreateView from '../components/create/CreateView.jsx';
import LandingView from '../components/landing/LandingView.jsx';
import LoadingOverlay from '../components/shared/LoadingOverlay.jsx';
import PlatformSelectView from '../components/platform-select/PlatformSelectView.jsx';
import PostPreviewOverlay from '../components/preview/PostPreviewOverlay.jsx';
import { getPlatformLabel } from '../constants/platforms.js';
import useSocialAuth from '../hooks/useSocialAuth.js';
import usePostGenerator from '../hooks/usePostGenerator.js';
import usePostPublisher from '../hooks/usePostPublisher.js';

const scrollToGetStarted = () => {
  document.getElementById('get-started')?.scrollIntoView();
};

export default function App() {
  const [view, setView] = useState('landing');
  const [platformMessage, setPlatformMessage] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('linkedin');
  const [authMessage, setAuthMessage] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
  const platformLabel = getPlatformLabel(selectedPlatform);

  // A user can hold a valid session for more than one platform at once, so
  // on mount both useSocialAuth instances race to sync their own cookie and
  // claim the initial view. An explicit OAuth redirect (the platform the
  // user just actually logged into) must always win over a passive "I also
  // happen to have a valid cookie" background sync from the other platform,
  // and once either has claimed the initial selection the other shouldn't
  // silently override it later.
  const hasClaimedInitialPlatformRef = useRef(false);

  const handleAuthConnected = (platformId) => (profile, { source, name }) => {
    if (source !== 'redirect' && hasClaimedInitialPlatformRef.current) {
      return;
    }

    hasClaimedInitialPlatformRef.current = true;
    setSelectedPlatform(platformId);
    setView('create');

    if (source === 'redirect') {
      const label = getPlatformLabel(platformId);
      setAuthMessage(
        name
          ? `${label} connected successfully. Welcome, ${name}.`
          : `${label} connected successfully. You can create your post now.`
      );
    }
  };

  const handleAuthError = (reason) => {
    setAuthMessage(reason);
    setView('landing');
    scrollToGetStarted();
  };

  const linkedinAuth = useSocialAuth('linkedin', {
    apiBaseUrl,
    onConnected: handleAuthConnected('linkedin'),
    onError: handleAuthError,
  });

  const instagramAuth = useSocialAuth('instagram', {
    apiBaseUrl,
    onConnected: handleAuthConnected('instagram'),
    onError: handleAuthError,
  });

  const postGen = usePostGenerator(apiBaseUrl);
  const postPub = usePostPublisher(apiBaseUrl);

  const activeProfile = selectedPlatform === 'instagram' ? instagramAuth.profile : linkedinAuth.profile;

  const handleStartFlow = () => {
    setAuthMessage('');
    setPlatformMessage('');
    setView('platforms');
  };

  const handleBackToLanding = () => {
    setView('landing');
    setAuthMessage('');
    setPlatformMessage('');
    postGen.setSubmitMessage('');
    postGen.resetGeneratedPost();
    setIsPreviewOpen(false);
    postPub.resetPublishMessage();
  };

  const handleBackToPlatforms = () => {
    setView('platforms');
    postGen.setSubmitMessage('');
    postGen.resetGeneratedPost();
    setIsPreviewOpen(false);
    postPub.resetPublishMessage();
  };

  const handlePlatformSelection = (platform) => {
    setSelectedPlatform(platform);
    setPlatformMessage('');

    if (platform === 'linkedin') {
      linkedinAuth.login();
      return;
    }

    if (platform === 'instagram') {
      instagramAuth.login();
      return;
    }

    setPlatformMessage("TikTok will appear here once we have its documentation and API keys ready.");
  };

  const handleGeneratePost = async () => {
    postPub.resetPublishMessage();
    const post = await postGen.generatePost();

    if (post) {
      setIsPreviewOpen(true);
    }
  };

  const handlePublishPost = () => {
    postPub.publish({ platform: selectedPlatform, platformLabel, post: postGen.generatedPost });
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
            prompt={postGen.prompt}
            selectedImage={postGen.selectedImage}
            platformLabel={platformLabel}
            requiresImage={selectedPlatform === 'instagram'}
            authMessage={view === 'create' ? authMessage : ''}
            submitMessage={postGen.submitMessage}
            isSubmitting={postGen.isSubmitting}
            onBack={handleBackToPlatforms}
            onGenerate={handleGeneratePost}
            onImageChange={(event) => postGen.setSelectedImage(event.target.files?.[0] ?? null)}
            onPromptChange={(event) => postGen.setPrompt(event.target.value)}
          />
        </div>
      </div>
      <LoadingOverlay
        isVisible={postGen.isSubmitting || postPub.isPublishing}
        eyebrow={postPub.isPublishing ? `Publishing to ${platformLabel}` : 'Generating with Gemini'}
        title={
          postPub.isPublishing
            ? "We're publishing your post"
            : `We're putting together your post for ${platformLabel}`
        }
        description={
          postPub.isPublishing
            ? `Uploading the image and creating the post on your authenticated ${platformLabel} account.`
            : 'Analyzing the context and image to show you a preview before publishing.'
        }
      />
      <PostPreviewOverlay
        isVisible={isPreviewOpen}
        post={postGen.generatedPost}
        profile={activeProfile}
        platformLabel={platformLabel}
        onClose={() => setIsPreviewOpen(false)}
        onPublish={handlePublishPost}
        isPublishing={postPub.isPublishing}
        publishMessage={postPub.publishMessage}
      />
    </main>
  );
}
