import { useState, useCallback } from 'react';
import {
  getExerciseMedia,
  getPlaceholderImage,
  categorizeExercise,
  hasExerciseVideo
} from '../services/exerciseMediaService';
import { VideoPlayerModal } from './VideoPlayerModal';
import './ExerciseMedia.css';

/**
 * ExerciseMedia Component
 * Displays exercise thumbnail with optional video playback
 *
 * @param {Object} props
 * @param {string} props.exerciseName - Name of the exercise
 * @param {string} props.size - Size variant: 'small' | 'medium' | 'large'
 * @param {boolean} props.showPlayButton - Whether to show play button for videos
 * @param {string} props.className - Additional CSS classes
 */
export function ExerciseMedia({
  exerciseName,
  size = 'medium',
  showPlayButton = true,
  className = ''
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const media = getExerciseMedia(exerciseName);
  const category = categorizeExercise(exerciseName);
  const hasVideo = hasExerciseVideo(exerciseName);

  const handleClick = useCallback(() => {
    if (hasVideo && showPlayButton) {
      setIsModalOpen(true);
    }
  }, [hasVideo, showPlayButton]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  const thumbnailSrc = imageError || !media?.thumbnail
    ? getPlaceholderImage(category)
    : media.thumbnail;

  const altText = media?.alt || exerciseName;

  return (
    <>
      <div
        className={`exercise-media exercise-media--${size} ${hasVideo ? 'exercise-media--playable' : ''} ${className}`}
        onClick={handleClick}
        role={hasVideo ? 'button' : undefined}
        tabIndex={hasVideo ? 0 : undefined}
        onKeyDown={(e) => {
          if (hasVideo && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {!imageLoaded && (
          <div className="exercise-media__skeleton" />
        )}

        <img
          src={thumbnailSrc}
          alt={altText}
          className={`exercise-media__image ${imageLoaded ? 'loaded' : ''}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />

        {hasVideo && showPlayButton && imageLoaded && (
          <div className="exercise-media__play-overlay">
            <div className="exercise-media__play-button">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
              </svg>
            </div>
          </div>
        )}

        {imageError && !media?.thumbnail && (
          <div className="exercise-media__placeholder-icon">
            {getCategoryIcon(category)}
          </div>
        )}
      </div>

      {hasVideo && (
        <VideoPlayerModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          videoUrl={media?.video}
          title={exerciseName}
        />
      )}
    </>
  );
}

function getCategoryIcon(category) {
  const icons = {
    push: '💪',
    pull: '🔙',
    legs: '🦵',
    default: '🏋️'
  };
  return icons[category] || icons.default;
}

/**
 * ExerciseMediaCompact Component
 * Smaller inline version for exercise lists
 */
export function ExerciseMediaCompact({ exerciseName, className = '' }) {
  return (
    <ExerciseMedia
      exerciseName={exerciseName}
      size="small"
      showPlayButton={false}
      className={`exercise-media--compact ${className}`}
    />
  );
}

export default ExerciseMedia;
