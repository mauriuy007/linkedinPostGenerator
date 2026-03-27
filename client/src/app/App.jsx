import { useEffect, useState } from 'react';
import CreateView from '../components/CreateView.jsx';
import HomeView from '../components/HomeView.jsx';

export default function App() {
  const [view, setView] = useState('home');
  const [selectedImage, setSelectedImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const linkedinStatus = currentUrl.searchParams.get('linkedin');
    const reason = currentUrl.searchParams.get('reason');
    const name = currentUrl.searchParams.get('name');

    if (linkedinStatus === 'ok') {
      const nextMessage = name
        ? `LinkedIn conectado correctamente. Bienvenido, ${name}.`
        : 'LinkedIn conectado correctamente. Ya podes crear tu post.';

      setAuthMessage(nextMessage);
      setView('create');
    }

    if (linkedinStatus === 'error') {
      setAuthMessage(reason ?? 'No pudimos completar el login con LinkedIn.');
      setView('home');
    }

    if (linkedinStatus) {
      currentUrl.searchParams.delete('linkedin');
      currentUrl.searchParams.delete('reason');
      currentUrl.searchParams.delete('name');
      currentUrl.searchParams.delete('linkedinId');
      window.history.replaceState({}, '', currentUrl);
    }
  }, []);

  const handleLinkedinLogin = () => {
    window.location.assign(`${apiBaseUrl}/api/auth/linkedin`);
  };

  const handleBackToHome = () => {
    setView('home');
    setAuthMessage('');
    setSubmitMessage('');
  };

  const handleGeneratePost = async () => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setSubmitMessage('Escribi primero el contenido del post antes de enviarlo.');
      return;
    }

    const payload = {
      title: trimmedPrompt.slice(0, 60),
      content: trimmedPrompt,
      authorUsername: 'linkedin-user',
    };

    console.log('Payload enviado al backend:', payload);
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch(`${apiBaseUrl}/api/posts/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log('Respuesta del backend al crear post:', data);

      if (!response.ok) {
        setSubmitMessage(data.error ?? 'No pudimos enviar el post al backend.');
        return;
      }

      setSubmitMessage('El backend recibio el contenido correctamente.');
    } catch (error) {
      console.error('Error enviando el post al backend:', error);
      setSubmitMessage('Hubo un error de red al intentar enviar el post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app">
      <div className="app__viewport">
        <div className={`app__track app__track--${view}`}>
          <HomeView onStart={handleLinkedinLogin} authMessage={view === 'home' ? authMessage : ''} />
          <CreateView
            prompt={prompt}
            selectedImage={selectedImage}
            authMessage={view === 'create' ? authMessage : ''}
            submitMessage={submitMessage}
            isSubmitting={isSubmitting}
            onBack={handleBackToHome}
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
    </main>
  );
}
