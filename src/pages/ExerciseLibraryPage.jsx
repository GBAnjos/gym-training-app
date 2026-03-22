import { useState, useCallback, useEffect, useRef } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { getBundleExercises, search, isFullCatalogAvailable, getDaysSinceSync } from '../services/exerciseService';
import { toMusculos } from '../data/bodyPartToMusculos';
import { muscleColors } from '../data/design';
import { Icon } from '../components/Icon';
import { ExerciseDetailSheet } from '../components/ExerciseDetailSheet';
import './ExerciseLibraryPage.css';

const MUSCLE_FILTERS = [
  { key: 'chest', bodyParts: ['chest'] },
  { key: 'back', bodyParts: ['back'] },
  { key: 'shoulders', bodyParts: ['shoulders'] },
  { key: 'arms', bodyParts: ['upper arms', 'lower arms'] },
  { key: 'legs', bodyParts: ['upper legs', 'lower legs'] },
  { key: 'core', bodyParts: ['waist'] },
  { key: 'fullbody', bodyParts: [] },
];

const EQUIPMENT_FILTERS = [
  { key: 'barbell', value: 'barbell' },
  { key: 'dumbbell', value: 'dumbbell' },
  { key: 'cable', value: 'cable' },
  { key: 'machine', value: 'machine' },
  { key: 'bodyweight', value: 'bodyweight' },
  { key: 'band', value: 'band' },
];

export function ExerciseLibraryPage() {
  const { t, language } = useLanguage();
  const [query, setQuery] = useState('');
  const [activeBodyParts, setActiveBodyParts] = useState([]);
  const [activeEquipment, setActiveEquipment] = useState([]);
  const [exercises, setExercises] = useState(() => getBundleExercises());
  const [isOffline, setIsOffline] = useState(false);
  const [daysSinceSync, setDaysSinceSync] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const searchTimeoutRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    isFullCatalogAvailable().then(available => setIsOffline(!available));
    setDaysSinceSync(getDaysSinceSync());
  }, []);

  const doSearch = useCallback((q, bodyParts, equipment) => {
    const { immediate, asyncResults } = search(q, { bodyParts, equipment });
    setExercises(immediate);
    asyncResults.then(merged => setExercises(merged));
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      doSearch(query, activeBodyParts, activeEquipment);
    }, 300);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [query, activeBodyParts, activeEquipment, doSearch]);

  const toggleBodyPart = (bodyParts) => {
    if (bodyParts.length === 0) {
      setActiveBodyParts([]);
      return;
    }
    setActiveBodyParts(prev => {
      const isActive = bodyParts.every(bp => prev.includes(bp));
      if (isActive) return prev.filter(bp => !bodyParts.includes(bp));
      return [...new Set([...prev, ...bodyParts])];
    });
  };

  const toggleEquipment = (value) => {
    setActiveEquipment(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  useEffect(() => {
    if (!gridRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const img = entry.target.querySelector('.library-card-img');
          if (!img) return;
          if (entry.isIntersecting) {
            if (img.dataset.src) {
              img.src = img.dataset.src;
            }
          } else {
            if (img.src && img.src !== '') {
              img.dataset.src = img.src;
              img.src = '';
            }
          }
        });
      },
      { rootMargin: '100px' }
    );
    const cards = gridRef.current.querySelectorAll('.library-card');
    cards.forEach(card => observer.observe(card));
    return () => observer.disconnect();
  }, [exercises]);

  const handleRefresh = async () => {
    window.dispatchEvent(new CustomEvent('exercise-prefetch-request'));
  };

  return (
    <div className="library-page">
      <div className="library-search">
        <Icon name="search-1" className="library-search-icon" />
        <input
          type="text"
          className="library-search-input"
          placeholder={t('library_search_placeholder')}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <button className="library-search-clear" onClick={() => setQuery('')}>
            <Icon name="xmark" />
          </button>
        )}
      </div>

      <div className="library-filters">
        <div className="library-filter-row">
          {MUSCLE_FILTERS.map(f => (
            <button
              key={f.key}
              className={`library-filter-pill ${f.bodyParts.length === 0 ? (activeBodyParts.length === 0 ? 'active' : '') : f.bodyParts.every(bp => activeBodyParts.includes(bp)) ? 'active' : ''}`}
              onClick={() => toggleBodyPart(f.bodyParts)}
            >
              {t(`library_filter_${f.key}`)}
            </button>
          ))}
        </div>
        <div className="library-filter-row">
          {EQUIPMENT_FILTERS.map(f => (
            <button
              key={f.key}
              className={`library-filter-pill ${activeEquipment.includes(f.value) ? 'active' : ''}`}
              onClick={() => toggleEquipment(f.value)}
            >
              {t(`library_filter_${f.key}`)}
            </button>
          ))}
        </div>
      </div>

      {exercises.length > 0 ? (
        <div className="library-grid" ref={gridRef}>
          {exercises.map(ex => (
            <ExerciseLibraryCard
              key={ex.id}
              exercise={ex}
              language={language}
              onClick={() => setSelectedExercise(ex)}
            />
          ))}
        </div>
      ) : (
        <div className="library-empty">
          <Icon name="search-1" className="library-empty-icon" />
          <p>
            {query
              ? `${t('library_empty_search')} "${query}"`
              : t('library_empty_filter')
            }
          </p>
        </div>
      )}

      {isOffline && (
        <div className="library-footer">
          <span>{t('library_offline_footer')}</span>
        </div>
      )}
      {!isOffline && daysSinceSync !== null && daysSinceSync >= 7 && (
        <div className="library-footer">
          <span>{t('library_staleness')} {daysSinceSync} {t('library_staleness_days')}</span>
          <button className="library-refresh-btn" onClick={handleRefresh}>
            {t('library_refresh')}
          </button>
        </div>
      )}

      {selectedExercise && (
        <ExerciseDetailSheet
          exercise={selectedExercise}
          language={language}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
}

function ExerciseLibraryCard({ exercise, language, onClick }) {
  const musculos = toMusculos([exercise.target], exercise.secondaryMuscles);

  return (
    <div className="library-card" onClick={onClick}>
      <div className="library-card-img-wrapper">
        {exercise.gifUrl ? (
          <img
            className="library-card-img"
            src={exercise.gifUrl}
            alt={exercise.name}
            loading="lazy"
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="library-card-placeholder">
            <Icon name="dumbbell-1" />
          </div>
        )}
      </div>
      <div className="library-card-info">
        <h4 className="library-card-name">{exercise.name}</h4>
        <div className="library-card-tags">
          {musculos.slice(0, 2).map(m => {
            const color = muscleColors[m] || { bg: 'rgba(128,128,128,0.2)', text: '#888' };
            return (
              <span key={m} className="library-card-tag"
                    style={{ backgroundColor: color.bg, color: color.text }}>
                {m}
              </span>
            );
          })}
          <span className="library-card-equip">{exercise.equipment}</span>
        </div>
      </div>
    </div>
  );
}
