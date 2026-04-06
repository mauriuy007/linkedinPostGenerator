const formatPostContent = (content) =>
  content
    .split('\n')
    .filter(Boolean)
    .map((paragraph, index) => (
      <p className="previewPost__paragraph" key={`${paragraph}-${index}`}>
        {paragraph}
      </p>
    ));

export default function PostPreviewOverlay({ isVisible, post, onClose }) {
  if (!isVisible || !post) {
    return null;
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Vista previa del post">
      <section className="previewModal">
        <div className="previewModal__header">
          <div>
            <span className="previewModal__eyebrow">Vista previa</span>
            <h2 className="previewModal__title">Así se vería tu posteo</h2>
          </div>
          <button className="previewModal__close" type="button" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <article className="previewPost">
          <div className="previewPost__top">
            <div className="previewPost__avatar">{post.authorUsername?.slice(0, 1)?.toUpperCase() ?? 'L'}</div>
            <div>
              <h3 className="previewPost__author">{post.authorUsername ?? 'linkedin-user'}</h3>
              <p className="previewPost__meta">Post generado por Gemini</p>
            </div>
          </div>

          {post.imageUrl ? (
            <img className="previewPost__image" src={post.imageUrl} alt={post.title ?? 'Imagen del post'} />
          ) : null}

          <div className="previewPost__content">{formatPostContent(post.content ?? '')}</div>
        </article>
      </section>
    </div>
  );
}
