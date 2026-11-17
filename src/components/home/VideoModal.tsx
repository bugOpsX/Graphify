import React, { useEffect, useRef } from 'react';
import { X, Play } from 'lucide-react';
import demoVideo from '../../../vid-updated.mp4';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Play video when modal opens (user click on "Learn here" provides user gesture)
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy prevented playback; controls remain available for manual play
        });
      }
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="mst-video-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Platform Demonstration Video"
    >
      <div
        className="mst-video-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mst-video-modal-header">
          <div className="mst-video-modal-title">
            <span className="mst-video-modal-badge">
              <Play size={10} fill="currentColor" />
            </span>
            <span>Platform Demonstration</span>
          </div>
          <button
            className="mst-video-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mst-video-modal-body">
          <video
            ref={videoRef}
            controls
            playsInline
            className="mst-video-player"
          >
            <source src={demoVideo} type="video/mp4" />
            Your browser does not support HTML5 video.
          </video>
        </div>
      </div>
    </div>
  );
};
