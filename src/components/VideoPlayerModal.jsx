import { useEffect, useRef, useCallback } from 'react';
import './VideoPlayerModal.css';

/**
 * VideoPlayerModal Component
 * Full-screen modal for playing exercise demonstration videos
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {function} props.onClose - Callback when modal should close
 * @param {string} props.videoUrl - URL of the video to play
 * @param {string} props.title - Title to display above the video
 */
export function VideoPlayerModal({ isOpen, onClose, videoUrl, title }) {
  const modalRef = useRef(null);
  const videoRef = useRef(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Pause video when closing
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isOpen]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="video-modal"
      ref={modalRef}
      onClick={handleBackdropClick}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`Video: ${title}`}
    >
      <div className="video-modal__content">
        <div className="video-modal__header">
          <h3 className="video-modal__title">{title}</h3>
          <button
            className="video-modal__close"
            onClick={onClose}
            aria-label="Fechar video"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="video-modal__player">
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              autoPlay
              playsInline
              className="video-modal__video"
            >
              O seu navegador nao suporta videos HTML5.
            </video>
          ) : (
            <div className="video-modal__no-video">
              <span className="video-modal__no-video-icon">🎬</span>
              <p>Video nao disponivel</p>
            </div>
          )}
        </div>

        <div className="video-modal__footer">
          <p className="video-modal__hint">
            Pressione ESC ou toque fora para fechar
          </p>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayerModal;
