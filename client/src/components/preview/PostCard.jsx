import { formatPostContent } from '../../utils/formatPostContent.js';

export default function PostCard({
  post,
  profile,
  platformLabel,
  onClose,
  onPublish,
  isPublishing,
  publishMessage,
}) {
  const displayName = profile?.name ?? post.authorUsername ?? `${platformLabel} User`;
  const profilePicture = profile?.picture ?? '';
  const avatarFallback = displayName.slice(0, 1)?.toUpperCase() ?? platformLabel.slice(0, 1);

  return (
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

      <div className="previewPost__content">
        {formatPostContent(post.content ?? '').map(({ key, text }) => (
          <p className="previewPost__paragraph" key={key}>{text}</p>
        ))}
      </div>

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
  );
}
