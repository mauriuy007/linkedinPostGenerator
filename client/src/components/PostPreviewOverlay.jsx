const formatPostContent = (content) =>
  content
    .split('\n')
    .filter(Boolean)
    .map((paragraph, index) => (
      <p className="previewPost__paragraph" key={`${paragraph}-${index}`}>
        {paragraph}
      </p>
    ));

export default function PostPreviewOverlay({
  isVisible,
  post,
  linkedinProfile,
  onClose,
  onPublish,
  isPublishing,
  publishMessage,
}) {
  if (!isVisible || !post) {
    return null;
  }

  const displayName = linkedinProfile?.name ?? post.authorUsername ?? 'LinkedIn User';
  const profilePicture = linkedinProfile?.picture ?? '';
  const avatarFallback = displayName.slice(0, 1)?.toUpperCase() ?? 'L';

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
            {profilePicture ? (
              <img className="previewPost__avatarImage" src={profilePicture} alt={displayName} />
            ) : (
              <div className="previewPost__avatar">{avatarFallback}</div>
            )}
            <div>
              <h3 className="previewPost__author">{displayName}</h3>
              <p className="previewPost__meta">Vista previa del post que se publicará en LinkedIn</p>
            </div>
          </div>

          {post.imageUrl ? (
            <img className="previewPost__image" src={post.imageUrl} alt={post.title ?? 'Imagen del post'} />
          ) : null}

          <div className="previewPost__content">{formatPostContent(post.content ?? '')}</div>

          {publishMessage ? <p className="previewPost__status">{publishMessage}</p> : null}

          <div className="previewPost__actions">
            <button className="previewModal__close" type="button" onClick={onClose} disabled={isPublishing}>
              Cerrar
            </button>
            <button className="previewPost__publish" type="button" onClick={onPublish} disabled={isPublishing}>
              {isPublishing ? 'Posteando...' : 'Postear'}
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
