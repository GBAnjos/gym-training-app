import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useOnboarding } from '../hooks/useOnboarding';
import { getBundleExercises, search, isFullCatalogAvailable, getDaysSinceSync } from '../services/exerciseService';
import { toMusculos } from '../data/bodyPartToMusculos';
import { muscleColors } from '../data/design';
import { Icon } from '../components/Icon';
import { BottomSheet } from '../components/BottomSheet';
import { ExerciseDetailSheet } from '../components/ExerciseDetailSheet';
import { useExercisePrefetch } from '../hooks/useExercisePrefetch';
import './ExerciseLibraryPage.css';

const MUSCLE_FILTERS = [
  { key: 'chest', bodyParts: ['chest'] },
  { key: 'back', bodyParts: ['back'] },
  { key: 'shoulders', bodyParts: ['shoulders'] },
  { key: 'arms', bodyParts: ['upper arms', 'lower arms'] },
  { key: 'legs', bodyParts: ['upper legs', 'lower legs'] },
  { key: 'core', bodyParts: ['waist'] },
];

const EQUIPMENT_FILTERS = [
  { key: 'barbell', value: 'barbell' },
  { key: 'dumbbell', value: 'dumbbell' },
  { key: 'cable', value: 'cable' },
  { key: 'machine', value: 'machine' },
  { key: 'bodyweight', value: 'bodyweight' },
  { key: 'band', value: 'band' },
];

const LEVEL_FILTERS = [
  { key: 'beginner', value: 'beginner' },
  { key: 'intermediate', value: 'intermediate' },
  { key: 'expert', value: 'expert' },
];

// Derive quick-access muscle groups from user's main activities
function getQuickMuscles(userProfile) {
  if (!userProfile) return ['chest', 'back', 'legs'];
  const activities = userProfile.mainActivities || ['gym'];
  const muscles = new Set();

  for (const act of activities) {
    switch (act) {
      case 'gym':
        muscles.add('chest').add('back').add('legs').add('shoulders');
        break;
      case 'crossfit':
        muscles.add('legs').add('shoulders').add('back');
        break;
      case 'calisthenics':
        muscles.add('chest').add('back').add('core').add('arms');
        break;
      case 'pilates':
        muscles.add('core').add('legs');
        break;
      default:
        muscles.add('chest').add('back').add('legs');
    }
  }

  return [...muscles].slice(0, 4);
}

export function ExerciseLibraryPage() {
  const { t, language } = useLanguage();
  const { userProfile } = useOnboarding();
  const [query, setQuery] = useState('');
  const [activeBodyParts, setActiveBodyParts] = useState([]);
  const [activeEquipment, setActiveEquipment] = useState([]);
  const [activeLevels, setActiveLevels] = useState([]);
  const [exercises, setExercises] = useState(() => getBundleExercises());
  const [isOffline, setIsOffline] = useState(false);
  const [daysSinceSync, setDaysSinceSync] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const searchTimeoutRef = useRef(null);
  const gridRef = useRef(null);
  useExercisePrefetch(true);

  const quickMuscles = useMemo(() => getQuickMuscles(userProfile), [userProfile]);

  const activeFilterCount = activeBodyParts.length + activeEquipment.length + activeLevels.length;
  const hasActiveFilters = activeFilterCount > 0;

  useEffect(() => {
    isFullCatalogAvailable().then(available => setIsOffline(!available));
    setDaysSinceSync(getDaysSinceSync());
  }, []);

  const doSearch = useCallback((q, bodyParts, equipment, levels) => {
    const { immediate, asyncResults } = search(q, { bodyParts, equipment, levels });
    setExercises(immediate);
    asyncResults.then(merged => setExercises(merged));
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      doSearch(query, activeBodyParts, activeEquipment, activeLevels);
    }, 300);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [query, activeBodyParts, activeEquipment, activeLevels, doSearch]);

  const toggleBodyPart = (bodyParts) => {
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

  const toggleLevel = (value) => {
    setActiveLevels(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const clearAllFilters = () => {
    setActiveBodyParts([]);
    setActiveEquipment([]);
    setActiveLevels([]);
  };

  // Quick-access pill toggle: maps muscle key to bodyParts array
  const toggleQuickMuscle = (muscleKey) => {
    const filter = MUSCLE_FILTERS.find(f => f.key === muscleKey);
    if (filter) toggleBodyPart(filter.bodyParts);
  };

  const isQuickMuscleActive = (muscleKey) => {
    const filter = MUSCLE_FILTERS.find(f => f.key === muscleKey);
    if (!filter) return false;
    return filter.bodyParts.every(bp => activeBodyParts.includes(bp));
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

      <div className="library-filter-bar">
        <button
          className={`library-filtros-btn ${hasActiveFilters ? 'active' : ''}`}
          onClick={() => setShowFilterSheet(true)}
        >
          <Icon name="funnel" />
          <span>{t('library_filters_button')}</span>
          {hasActiveFilters && (
            <span className="library-filtros-badge">{activeFilterCount}</span>
          )}
        </button>

        <div className="library-quick-pills">
          {quickMuscles.map(key => (
            <button
              key={key}
              className={`library-quick-pill ${isQuickMuscleActive(key) ? 'active' : ''}`}
              onClick={() => toggleQuickMuscle(key)}
            >
              {t(`library_filter_${key}`)}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button className="library-clear-link" onClick={clearAllFilters}>
            {t('library_filters_clear')}
          </button>
        )}
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

      {/* Filter Bottom Sheet */}
      <BottomSheet
        isOpen={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        title={t('library_filters_button')}
      >
        <div className="filter-sheet-body">
          {/* Muscle Groups */}
          <div className="filter-sheet-section">
            <h4 className="filter-sheet-label">{t('library_filters_muscle_group')}</h4>
            <div className="filter-sheet-chips">
              {MUSCLE_FILTERS.map(f => {
                const isActive = f.bodyParts.every(bp => activeBodyParts.includes(bp));
                return (
                  <button
                    key={f.key}
                    className={`filter-chip ${isActive ? 'active' : ''}`}
                    onClick={() => toggleBodyPart(f.bodyParts)}
                  >
                    {t(`library_filter_${f.key}`)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Equipment */}
          <div className="filter-sheet-section">
            <h4 className="filter-sheet-label">{t('library_filters_equipment')}</h4>
            <div className="filter-sheet-chips">
              {EQUIPMENT_FILTERS.map(f => (
                <button
                  key={f.key}
                  className={`filter-chip ${activeEquipment.includes(f.value) ? 'active' : ''}`}
                  onClick={() => toggleEquipment(f.value)}
                >
                  {t(`library_filter_${f.key}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Level */}
          <div className="filter-sheet-section">
            <h4 className="filter-sheet-label">{t('library_filters_level')}</h4>
            <div className="filter-sheet-chips">
              {LEVEL_FILTERS.map(f => (
                <button
                  key={f.key}
                  className={`filter-chip ${activeLevels.includes(f.value) ? 'active' : ''}`}
                  onClick={() => toggleLevel(f.value)}
                >
                  {t(`library_filter_${f.key}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="filter-sheet-footer">
          {hasActiveFilters ? (
            <button className="filter-sheet-clear" onClick={clearAllFilters}>
              {t('library_filters_clear_all')}
            </button>
          ) : (
            <div />
          )}
          <button
            className="filter-sheet-apply"
            onClick={() => setShowFilterSheet(false)}
          >
            {t('library_filters_show_results')} ({exercises.length})
          </button>
        </div>
      </BottomSheet>

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
