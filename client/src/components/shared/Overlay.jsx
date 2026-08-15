export default function Overlay({ isVisible, role, ariaLabel, ariaModal, ariaLive, children }) {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="overlay"
      role={role}
      aria-modal={ariaModal || undefined}
      aria-live={ariaLive || undefined}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}
