import Overlay from '../shared/Overlay.jsx';
import PostCard from './PostCard.jsx';

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
  if (!post) {
    return null;
  }

  return (
    <Overlay isVisible={isVisible} role="dialog" ariaModal ariaLabel="Post preview">
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

        <PostCard
          post={post}
          profile={profile}
          platformLabel={platformLabel}
          onClose={onClose}
          onPublish={onPublish}
          isPublishing={isPublishing}
          publishMessage={publishMessage}
        />
      </section>
    </Overlay>
  );
}
