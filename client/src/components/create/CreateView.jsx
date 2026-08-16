import ImageUploadField from './ImageUploadField.jsx';
import PostContextField from './PostContextField.jsx';

export default function CreateView({
  authMessage,
  submitMessage,
  isSubmitting,
  prompt,
  selectedImage,
  platformLabel = 'LinkedIn',
  requiresImage = false,
  onBack,
  onDisconnect,
  onGenerate,
  onImageChange,
  onPromptChange,
}) {
  return (
    <section className="create">
      <section className="create__panel">
        <span className="create__eyebrow">Post Generator</span>
        <h1 className="create__title">Prepare your idea before sending it to the AI</h1>
        <p className="create__text">
          Upload an image and add context, then generate a post ready for
          {' '}{platformLabel}.
          {' '}
          <button className="create__disconnect" type="button" onClick={onDisconnect}>
            Not you? Log out of {platformLabel}
          </button>
        </p>
        {authMessage ? <p className="app__notice app__notice--success">{authMessage}</p> : null}
        {submitMessage ? <p className="app__notice app__notice--info">{submitMessage}</p> : null}

        <div className="create__form">
          <ImageUploadField
            selectedImage={selectedImage}
            requiresImage={requiresImage}
            platformLabel={platformLabel}
            onImageChange={onImageChange}
          />
          <PostContextField prompt={prompt} onPromptChange={onPromptChange} />
        </div>

        <div className="create__actions">
          <button className="create__secondary" type="button" onClick={onBack} disabled={isSubmitting}>
            Back
          </button>
          <button className="create__primary" type="button" onClick={onGenerate} disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Generate post'}
          </button>
        </div>
      </section>
    </section>
  );
}
