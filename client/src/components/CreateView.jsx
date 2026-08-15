export default function CreateView({
  authMessage,
  submitMessage,
  isSubmitting,
  prompt,
  selectedImage,
  platformLabel = 'LinkedIn',
  requiresImage = false,
  onBack,
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
        </p>
        {authMessage ? <p className="app__notice app__notice--success">{authMessage}</p> : null}
        {submitMessage ? <p className="app__notice app__notice--info">{submitMessage}</p> : null}

        <div className="create__form">
          <div className="create__upload">
            <span className="create__uploadTitle">Reference image</span>
            <p className="create__uploadText">
              {requiresImage
                ? `${platformLabel} requires an image to publish the post.`
                : 'Choose an image to go along with the context you send to Gemini.'}
            </p>

            <label className="create__uploadButton" htmlFor="image-upload">
              Select image
            </label>
            <input
              id="image-upload"
              className="create__uploadInput"
              type="file"
              accept="image/*"
              onChange={onImageChange}
            />

            <p className="create__fileName">
              {selectedImage ? selectedImage.name : 'No image selected yet'}
            </p>
          </div>

          <div className="create__copy">
            <label className="create__label" htmlFor="post-context">
              Context for the post
            </label>
            <textarea
              id="post-context"
              className="create__textarea"
              placeholder="Tell the AI what you want to communicate, the tone, the goal of the post, or any important details..."
              value={prompt}
              onChange={onPromptChange}
            />
          </div>
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
