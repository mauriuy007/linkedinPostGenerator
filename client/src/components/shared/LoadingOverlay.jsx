import Overlay from './Overlay.jsx';

export default function LoadingOverlay({ isVisible, title, description, eyebrow }) {
  return (
    <Overlay isVisible={isVisible} role="status" ariaLive="polite" ariaLabel="Generating post">
      <div className="loadingCard">
        <div className="loadingCard__spinner" />
        <span className="loadingCard__eyebrow">{eyebrow ?? 'Generating with Gemini'}</span>
        <h2 className="loadingCard__title">{title ?? "We're putting together your post for LinkedIn"}</h2>
        <p className="loadingCard__text">
          {description ?? 'Analyzing the context and image to show you a preview before publishing.'}
        </p>
      </div>
    </Overlay>
  );
}
