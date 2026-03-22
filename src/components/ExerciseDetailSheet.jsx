import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { search } from '../services/exerciseService';
import { toMusculos } from '../data/bodyPartToMusculos';
import { muscleColors } from '../data/design';
import { Icon } from './Icon';
import './ExerciseDetailSheet.css';

export function ExerciseDetailSheet({ exercise, language, onClose }) {
  const { t } = useLanguage();
  const [similarExercises, setSimilarExercises] = useState([]);
  const [currentExercise, setCurrentExercise] = useState(exercise);
  const sheetRef = useRef(null);

  useEffect(() => {
    setCurrentExercise(exercise);
  }, [exercise]);

  useEffect(() => {
    if (!currentExercise) return;
    const { immediate } = search('', { bodyParts: [currentExercise.bodyPart] });
    const similar = immediate
      .filter(ex => ex.id !== currentExercise.id && ex.equipment !== currentExercise.equipment)
      .slice(0, 4);
    setSimilarExercises(similar);
  }, [currentExercise]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!currentExercise) return null;

  const musculos = toMusculos(
    [currentExercise.target],
    currentExercise.secondaryMuscles
  );

  const levelLabels = {
    beginner: language === 'pt-BR' ? 'Iniciante' : 'Beginner',
    intermediate: language === 'pt-BR' ? 'Intermediário' : 'Intermediate',
    expert: language === 'pt-BR' ? 'Avançado' : 'Advanced',
  };

  const startImg = currentExercise.gifUrl;
  const endImg = currentExercise.gifUrl?.replace('/0.jpg', '/1.jpg');

  return (
    <div className="detail-sheet-backdrop" onClick={handleBackdropClick}>
      <div className="detail-sheet" ref={sheetRef}>
        <div className="detail-sheet-handle" />

        <button className="detail-sheet-close" onClick={onClose}>
          <Icon name="xmark" />
        </button>

        <div className="detail-sheet-images">
          {startImg ? (
            <>
              <div className="detail-sheet-img-container">
                <img src={startImg} alt={`${currentExercise.name} - start`} />
                <span className="detail-sheet-img-label">
                  {language === 'pt-BR' ? 'Início' : 'Start'}
                </span>
              </div>
              {endImg && (
                <div className="detail-sheet-img-container">
                  <img src={endImg} alt={`${currentExercise.name} - end`} />
                  <span className="detail-sheet-img-label">
                    {language === 'pt-BR' ? 'Fim' : 'End'}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="detail-sheet-placeholder">
              <Icon name="dumbbell-1" />
            </div>
          )}
        </div>

        <h2 className="detail-sheet-name">{currentExercise.name}</h2>

        <div className="detail-sheet-meta">
          <div className="detail-sheet-muscles">
            {musculos.map(m => {
              const color = muscleColors[m] || { bg: 'rgba(128,128,128,0.2)', text: '#888' };
              return (
                <span key={m} className="detail-sheet-muscle-tag"
                      style={{ backgroundColor: color.bg, color: color.text }}>
                  {m}
                </span>
              );
            })}
          </div>
          <div className="detail-sheet-badges">
            <span className="detail-sheet-badge">{currentExercise.equipment}</span>
            <span className="detail-sheet-badge detail-sheet-level">
              {levelLabels[currentExercise.level] || currentExercise.level}
            </span>
          </div>
        </div>

        {currentExercise.instructions && currentExercise.instructions.length > 0 && (
          <div className="detail-sheet-section">
            <h3>{t('library_detail_instructions')}</h3>
            <ol className="detail-sheet-instructions">
              {currentExercise.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        {similarExercises.length > 0 && (
          <div className="detail-sheet-section">
            <h3>{t('library_detail_similar')}</h3>
            <div className="detail-sheet-similar">
              {similarExercises.map(ex => (
                <div key={ex.id} className="detail-sheet-similar-card"
                     onClick={() => setCurrentExercise(ex)}>
                  {ex.gifUrl ? (
                    <img src={ex.gifUrl} alt={ex.name} loading="lazy" />
                  ) : (
                    <div className="detail-sheet-similar-placeholder">
                      <Icon name="dumbbell-1" />
                    </div>
                  )}
                  <span>{ex.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
