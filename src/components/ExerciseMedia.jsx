import { useState, useCallback } from 'react';
import {
  getExerciseImages,
  hasExerciseImages,
  categorizeExercise,
  getCategoryIcon
} from '../services/exerciseMediaService';
import './ExerciseMedia.css';

/**
 * ExerciseMedia Component
 * Displays exercise start/end position images for clear visual guidance
 *
 * @param {Object} props
 * @param {string} props.exerciseName - Name of the exercise
 * @param {string} props.size - Size variant: 'small' | 'medium' | 'large'
 * @param {boolean} props.expanded - Show both images expanded
 * @param {string} props.className - Additional CSS classes
 */
export function ExerciseMedia({
  exerciseName,
  size = 'medium',
  expanded = false,
  className = ''
}) {
  const [startLoaded, setStartLoaded] = useState(false);
  const [endLoaded, setEndLoaded] = useState(false);
  const [startError, setStartError] = useState(false);
  const [endError, setEndError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(expanded);

  const images = getExerciseImages(exerciseName);
  const hasImages = hasExerciseImages(exerciseName);
  const category = categorizeExercise(exerciseName);
  const icon = getCategoryIcon(category);

  const handleStartLoad = useCallback(() => setStartLoaded(true), []);
  const handleEndLoad = useCallback(() => setEndLoaded(true), []);
  const handleStartError = useCallback(() => { setStartError(true); setStartLoaded(true); }, []);
  const handleEndError = useCallback(() => { setEndError(true); setEndLoaded(true); }, []);

  const toggleExpand = useCallback(() => {
    if (hasImages) {
      setIsExpanded(prev => !prev);
    }
  }, [hasImages]);

  // No images available - show placeholder
  if (!hasImages || !images) {
    return (
      <div className={`exercise-media exercise-media--${size} exercise-media--placeholder ${className}`}>
        <div className="exercise-media__placeholder">
          <span className="exercise-media__icon">{icon}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`exercise-media exercise-media--${size} ${isExpanded ? 'exercise-media--expanded' : ''} ${className}`}
      onClick={toggleExpand}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleExpand();
        }
      }}
    >
      {/* Start Position */}
      <div className="exercise-media__frame">
        {!startLoaded && <div className="exercise-media__skeleton" />}
        {startError ? (
          <div className="exercise-media__fallback">
            <span>{icon}</span>
          </div>
        ) : (
          <img
            src={images.startImage}
            alt={`${exerciseName} - posição inicial`}
            className={`exercise-media__image ${startLoaded ? 'loaded' : ''}`}
            onLoad={handleStartLoad}
            onError={handleStartError}
            loading="lazy"
          />
        )}
        {isExpanded && <span className="exercise-media__label">Início</span>}
      </div>

      {/* Arrow indicator */}
      <div className="exercise-media__arrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>

      {/* End Position */}
      <div className="exercise-media__frame">
        {!endLoaded && <div className="exercise-media__skeleton" />}
        {endError ? (
          <div className="exercise-media__fallback">
            <span>{icon}</span>
          </div>
        ) : (
          <img
            src={images.endImage}
            alt={`${exerciseName} - posição final`}
            className={`exercise-media__image ${endLoaded ? 'loaded' : ''}`}
            onLoad={handleEndLoad}
            onError={handleEndError}
            loading="lazy"
          />
        )}
        {isExpanded && <span className="exercise-media__label">Fim</span>}
      </div>

      {/* Expand hint for small size */}
      {size === 'small' && !isExpanded && (
        <div className="exercise-media__expand-hint">
          <span>+</span>
        </div>
      )}
    </div>
  );
}

/**
 * ExerciseMediaCompact Component
 * Single image thumbnail for exercise lists
 */
export function ExerciseMediaCompact({ exerciseName, className = '' }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const images = getExerciseImages(exerciseName);
  const hasImages = hasExerciseImages(exerciseName);
  const category = categorizeExercise(exerciseName);
  const icon = getCategoryIcon(category);

  if (!hasImages || !images) {
    return (
      <div className={`exercise-media-compact exercise-media-compact--placeholder ${className}`}>
        <span>{icon}</span>
      </div>
    );
  }

  return (
    <div className={`exercise-media-compact ${className}`}>
      {!loaded && <div className="exercise-media-compact__skeleton" />}
      {error ? (
        <span className="exercise-media-compact__icon">{icon}</span>
      ) : (
        <img
          src={images.startImage}
          alt={exerciseName}
          className={`exercise-media-compact__image ${loaded ? 'loaded' : ''}`}
          onLoad={() => setLoaded(true)}
          onError={() => { setError(true); setLoaded(true); }}
          loading="lazy"
        />
      )}
    </div>
  );
}

export default ExerciseMedia;
