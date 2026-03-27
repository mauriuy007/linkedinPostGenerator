export default function CreateView({
  authMessage,
  submitMessage,
  isSubmitting,
  prompt,
  selectedImage,
  onBack,
  onGenerate,
  onImageChange,
  onPromptChange,
}) {
  return (
    <section className="create">
      <section className="create__panel">
        <span className="create__eyebrow">Generador de Post</span>
        <h1 className="create__title">Prepará tu idea antes de enviarla a la IA</h1>
        <p className="create__text">
          Subí una imagen y sumá contexto para después generar un post listo para
          LinkedIn.
        </p>
        {authMessage ? <p className="app__notice app__notice--success">{authMessage}</p> : null}
        {submitMessage ? <p className="app__notice app__notice--info">{submitMessage}</p> : null}

        <div className="create__form">
          <div className="create__upload">
            <span className="create__uploadTitle">Imagen de referencia</span>
            <p className="create__uploadText">
              Elegí una imagen para acompañar el contexto que le vas a mandar a
              OpenAI.
            </p>

            <label className="create__uploadButton" htmlFor="image-upload">
              Seleccionar imagen
            </label>
            <input
              id="image-upload"
              className="create__uploadInput"
              type="file"
              accept="image/*"
              onChange={onImageChange}
            />

            <p className="create__fileName">
              {selectedImage ? selectedImage.name : 'Todavia no elegiste ninguna imagen'}
            </p>
          </div>

          <div className="create__copy">
            <label className="create__label" htmlFor="post-context">
              Contexto para el post
            </label>
            <textarea
              id="post-context"
              className="create__textarea"
              placeholder="Contale a la IA qué querés comunicar, el tono, el objetivo del post o cualquier detalle importante..."
              value={prompt}
              onChange={onPromptChange}
            />
          </div>
        </div>

        <div className="create__actions">
          <button className="create__secondary" type="button" onClick={onBack} disabled={isSubmitting}>
            Volver
          </button>
          <button className="create__primary" type="button" onClick={onGenerate} disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Generar post'}
          </button>
        </div>
      </section>
    </section>
  );
}
