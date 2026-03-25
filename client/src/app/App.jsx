import { useEffect, useState } from 'react';
import CreateView from '../components/CreateView.jsx';
import HomeView from '../components/HomeView.jsx';

export default function App() {
  const [view, setView] = useState('home');
  const [selectedImage, setSelectedImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [authMessage, setAuthMessage] = useState('');
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
            onBack={handleBackToHome}
            onImageChange={(event) => setSelectedImage(event.target.files?.[0] ?? null)}
            onPromptChange={(event) => setPrompt(event.target.value)}
          />
        </div>
      </div>
    </main>
  );
}
