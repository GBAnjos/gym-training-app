import { useState, useCallback } from 'react';
import {
  getExerciseImages,
  getExerciseImageById,
  hasExerciseImages,
  categorizeExercise,
  getCategoryIcon
} from '../services/exerciseMediaService';
import { Icon } from './Icon';
import './ExerciseMedia.css';

/**
 * ExerciseMedia Component
 * Shows a thumbnail that opens a modal with start/end position images
 */
export function ExerciseMedia({
  exerciseName,
  exerciseId,
  size = 'medium',
  className = ''
}) {
  const [showModal, setShowModal] = useState(false);
  const [startLoaded, setStartLoaded] = useState(false);
  const [endLoaded, setEndLoaded] = useState(false);
  const [startError, setStartError] = useState(false);
  const [endError, setEndError] = useState(false);
  const [thumbLoaded, setThumbLoaded] = useState(false);
  const [thumbError, setThumbError] = useState(false);

  const images = (exerciseId && getExerciseImageById(exerciseId)) || getExerciseImages(exerciseName);
  const hasImages = hasExerciseImages(exerciseName);
  const category = categorizeExercise(exerciseName);
  const icon = getCategoryIcon(category);

  const openModal = useCallback((e) => {
    e.stopPropagation();
    if (hasImages) {
      setShowModal(true);
      document.body.style.overflow = 'hidden';
    }
  }, [hasImages]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    document.body.style.overflow = '';
  }, []);

  // No images available - show placeholder
  if (!hasImages || !images) {
    return (
      <div className={`exercise-thumb exercise-thumb--${size} exercise-thumb--placeholder ${className}`}>
        <Icon name={icon} className="exercise-thumb__icon" />
      </div>
    );
  }

  return (
    <>
      {/* Thumbnail */}
      <div
        className={`exercise-thumb exercise-thumb--${size} ${className}`}
        onClick={openModal}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal(e);
          }
        }}
      >
        {!thumbLoaded && <div className="exercise-thumb__skeleton" />}
        {thumbError ? (
          <Icon name={icon} className="exercise-thumb__icon" />
        ) : (
          <img
            src={images.startImage}
            alt={exerciseName}
            className={`exercise-thumb__image ${thumbLoaded ? 'loaded' : ''}`}
            onLoad={() => setThumbLoaded(true)}
            onError={() => { setThumbError(true); setThumbLoaded(true); }}
            loading="lazy"
          />
        )}
        <div className="exercise-thumb__overlay">
          <Icon name="eye-1" />
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="exercise-modal" onClick={closeModal}>
          <div className="exercise-modal__backdrop" />
          <div className="exercise-modal__content" onClick={(e) => e.stopPropagation()}>
            <button className="exercise-modal__close" onClick={closeModal}>
              <Icon name="xmark" />
            </button>

            <h3 className="exercise-modal__title">{exerciseName}</h3>

            <div className="exercise-modal__images">
              {/* Start Position */}
              <div className="exercise-modal__column">
                <span className="exercise-modal__label">Início</span>
                <div className="exercise-modal__frame">
                  {!startLoaded && <div className="exercise-modal__skeleton" />}
                  {startError ? (
                    <div className="exercise-modal__fallback">
                      <Icon name={icon} />
                    </div>
                  ) : (
                    <img
                      src={images.startImage}
                      alt={`${exerciseName} - posição inicial`}
                      className={`exercise-modal__image ${startLoaded ? 'loaded' : ''}`}
                      onLoad={() => setStartLoaded(true)}
                      onError={() => { setStartError(true); setStartLoaded(true); }}
                    />
                  )}
                </div>
              </div>

              {/* Arrow */}
              <div className="exercise-modal__arrow">
                <Icon name="arrow-right-1" />
              </div>

              {/* End Position */}
              <div className="exercise-modal__column">
                <span className="exercise-modal__label">Fim</span>
                <div className="exercise-modal__frame">
                  {!endLoaded && <div className="exercise-modal__skeleton" />}
                  {endError ? (
                    <div className="exercise-modal__fallback">
                      <Icon name={icon} />
                    </div>
                  ) : (
                    <img
                      src={images.endImage}
                      alt={`${exerciseName} - posição final`}
                      className={`exercise-modal__image ${endLoaded ? 'loaded' : ''}`}
                      onLoad={() => setEndLoaded(true)}
                      onError={() => { setEndError(true); setEndLoaded(true); }}
                    />
                  )}
                </div>
              </div>
            </div>

            <p className="exercise-modal__hint">Toque fora para fechar</p>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * ExerciseMediaCompact Component
 * Single image thumbnail for exercise lists
 */
export function ExerciseMediaCompact({ exerciseName, exerciseId, className = '' }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const images = (exerciseId && getExerciseImageById(exerciseId)) || getExerciseImages(exerciseName);
  const hasImages = hasExerciseImages(exerciseName);
  const category = categorizeExercise(exerciseName);
  const icon = getCategoryIcon(category);

  if (!hasImages || !images) {
    return (
      <div className={`exercise-media-compact exercise-media-compact--placeholder ${className}`}>
        <Icon name={icon} />
      </div>
    );
  }

  return (
    <div className={`exercise-media-compact ${className}`}>
      {!loaded && <div className="exercise-media-compact__skeleton" />}
      {error ? (
        <Icon name={icon} className="exercise-media-compact__icon" />
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
