import { useEffect, useState } from 'react';
import CreateView from '../components/CreateView.jsx';
import HomeView from '../components/HomeView.jsx';
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

    reader.onerror = () => reject(new Error('No pudimos leer la imagen seleccionada.'));
    reader.readAsDataURL(file);
  });

export default function App() {
  const [view, setView] = useState('home');
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
        ? `LinkedIn conectado correctamente. Bienvenido, ${name}.`
        : 'LinkedIn conectado correctamente. Ya podes crear tu post.';

      setAuthMessage(nextMessage);
      setLinkedinProfile({
        name: name ?? 'LinkedIn User',
        picture: picture ?? '',
      });
      setSelectedPlatform('linkedin');
      setView('create');
    }

    if (linkedinStatus === 'error') {
      setAuthMessage(reason ?? 'No pudimos completar el login con LinkedIn.');
      setView('home');
    }

    if (instagramStatus === 'ok') {
      const nextMessage = name
        ? `Instagram conectado correctamente. Bienvenido, ${name}.`
        : 'Instagram conectado correctamente. Ya podes crear tu post.';

      setAuthMessage(nextMessage);
      setInstagramProfile({
        name: name ?? 'Instagram User',
        picture: '',
      });
      setSelectedPlatform('instagram');
      setView('create');
    }

    if (instagramStatus === 'error') {
      setAuthMessage(reason ?? 'No pudimos completar el login con Instagram.');
      setView('home');
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
        console.error('No pudimos recuperar el perfil de LinkedIn:', error);
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
        console.error('No pudimos recuperar el perfil de Instagram:', error);
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

  const handleBackToHome = () => {
    setView('home');
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

    setPlatformMessage('TikTok va a aparecer aca cuando tengamos su documentacion y las API keys listas.');
  };

  const handleGeneratePost = async () => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setSubmitMessage('Escribi primero el contenido del post antes de enviarlo.');
      return;
    }

    let imageBase64;

    if (selectedImage) {
      try {
        imageBase64 = await fileToBase64(selectedImage);
      } catch (error) {
        console.error('Error leyendo la imagen:', error);
        setSubmitMessage('No pudimos procesar la imagen seleccionada.');
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

    console.log('Payload enviado al backend:', {
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
        console.error('No pudimos parsear la respuesta del backend:', parseError);
      }

      console.log('Respuesta del backend al crear post:', data);
      console.log('Post generado por Gemini desde el backend:', data?.post?.content);

      if (!response.ok) {
        setSubmitMessage(data?.error ?? 'El backend devolvio un error inesperado.');
        return;
      }

      setGeneratedPost(data?.post ?? null);
      setIsPreviewOpen(true);
      setSubmitMessage('El post fue generado correctamente por Gemini.');
    } catch (error) {
      console.error('Error enviando el post al backend:', error);
      setSubmitMessage('Hubo un error de red al intentar enviar el post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishPost = async () => {
    if (!generatedPost) {
      return;
    }

    if (selectedPlatform === 'instagram' && !generatedPost.imageUrl) {
      setPublishMessage('Instagram requiere una imagen. Volvé, subí una imagen y volvé a generar el post.');
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

      console.log(`Respuesta del backend al publicar en ${platformLabel}:`, data);

      if (!response.ok) {
        setPublishMessage(data?.error ?? `No pudimos publicar el post en ${platformLabel}.`);
        return;
      }

      setPublishMessage(`El post se publico correctamente en ${platformLabel}.`);
    } catch (error) {
      console.error(`Error publicando el post en ${platformLabel}:`, error);
      setPublishMessage(`Hubo un error de red al intentar publicar en ${platformLabel}.`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <main className="app">
      <div className="app__viewport">
        <div className={`app__track app__track--${view}`}>
          <HomeView onStart={handleStartFlow} authMessage={view === 'home' ? authMessage : ''} />
          <PlatformSelectView
            noticeMessage={view === 'platforms' ? platformMessage : ''}
            selectedPlatform={selectedPlatform}
            onBack={handleBackToHome}
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
        eyebrow={isPublishing ? `Publicando en ${platformLabel}` : 'Generando con Gemini'}
        title={
          isPublishing
            ? 'Estamos publicando tu post'
            : `Estamos armando tu post para ${platformLabel}`
        }
        description={
          isPublishing
            ? `Subiendo la imagen y creando la publicación en la cuenta autenticada de ${platformLabel}.`
            : 'Analizando el contexto y la imagen para mostrarte una vista previa antes de publicar.'
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
