import { useState } from 'react';
import CreateView from '../components/CreateView.jsx';
import HomeView from '../components/HomeView.jsx';

export default function App() {
  const [view, setView] = useState('home');
  const [selectedImage, setSelectedImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

  const handleLinkedinLogin = () => {
    window.location.assign(`${apiBaseUrl}/api/auth/linkedin`);
  };

  return (
    <main className="app">
      <div className="app__viewport">
        <div className={`app__track app__track--${view}`}>
          <HomeView onStart={handleLinkedinLogin} />
          <CreateView
            prompt={prompt}
            selectedImage={selectedImage}
            onBack={() => setView('home')}
            onImageChange={(event) => setSelectedImage(event.target.files?.[0] ?? null)}
            onPromptChange={(event) => setPrompt(event.target.value)}
          />
        </div>
      </div>
    </main>
  );
}
