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
  profile,
  platformLabel = 'LinkedIn',
  onClose,
  onPublish,
  isPublishing,
  publishMessage,
}) {
  if (!isVisible || !post) {
    return null;
  }

  const displayName = profile?.name ?? post.authorUsername ?? `${platformLabel} User`;
  const profilePicture = profile?.picture ?? '';
  const avatarFallback = displayName.slice(0, 1)?.toUpperCase() ?? platformLabel.slice(0, 1);

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Post preview">
      <section className="previewModal">
        <div className="previewModal__header">
          <div>
            <span className="previewModal__eyebrow">Preview</span>
            <h2 className="previewModal__title">This is how your post would look</h2>
          </div>
          <button className="previewModal__close" type="button" onClick={onClose}>
            Close
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
              <p className="previewPost__meta">Preview of the post that will be published to {platformLabel}</p>
            </div>
          </div>

          {post.imageUrl ? (
            <img className="previewPost__image" src={post.imageUrl} alt={post.title ?? 'Post image'} />
          ) : null}

          <div className="previewPost__content">{formatPostContent(post.content ?? '')}</div>

          {publishMessage ? <p className="previewPost__status">{publishMessage}</p> : null}

          <div className="previewPost__actions">
            <button className="previewModal__close" type="button" onClick={onClose} disabled={isPublishing}>
              Close
            </button>
            <button className="previewPost__publish" type="button" onClick={onPublish} disabled={isPublishing}>
              {isPublishing ? 'Posting...' : 'Post'}
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
