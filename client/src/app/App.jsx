import { useState } from 'react';
import CreateView from '../components/CreateView.jsx';
import HomeView from '../components/HomeView.jsx';

export default function App() {
  const [view, setView] = useState('home');
  const [selectedImage, setSelectedImage] = useState(null);
  const [prompt, setPrompt] = useState('');

  return (
    <main className="app">
      <div className="app__viewport">
        <div className={`app__track app__track--${view}`}>
          <HomeView onStart={() => setView('create')} />
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
