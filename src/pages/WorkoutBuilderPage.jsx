import { useState, useCallback, useRef, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../components/Toast';
import { Icon } from '../components/Icon';
import { search as searchExercises } from '../services/exerciseService';
import './WorkoutBuilderPage.css';

const WEEKDAYS = [
  { key: 'Seg', label: 'builder_mon' },
  { key: 'Ter', label: 'builder_tue' },
  { key: 'Qua', label: 'builder_wed' },
  { key: 'Qui', label: 'builder_thu' },
  { key: 'Sex', label: 'builder_fri' },
  { key: 'Sáb', label: 'builder_sat' },
  { key: 'Dom', label: 'builder_sun' },
];

export function WorkoutBuilderPage({ onBack, onComplete }) {
  const { t, language } = useLanguage();
  const toast = useToast();

  // Each day has a list of exercises: { id, name, sets, reps }
  const [days, setDays] = useState({});
  const [selectedDays, setSelectedDays] = useState([]);
  const [activeDay, setActiveDay] = useState(null);
  const [workoutName, setWorkoutName] = useState('');
  const [dayNames, setDayNames] = useState({});
  const [showLibrary, setShowLibrary] = useState(false);
  const [undoItem, setUndoItem] = useState(null);
  const undoTimer = useRef(null);

  // Toggle day selection
  const toggleDay = (key) => {
    setSelectedDays(prev => {
      if (prev.includes(key)) {
        const next = prev.filter(d => d !== key);
        if (activeDay === key) setActiveDay(next[0] || null);
        return next;
      }
      const next = [...prev, key];
      if (!activeDay) setActiveDay(key);
      return next;
    });
  };

  // Add exercise from library to active day
  const addExercise = useCallback((exercise) => {
    if (!activeDay) return;
    setDays(prev => {
      const dayExercises = prev[activeDay] || [];
      // Avoid duplicates
      if (dayExercises.some(e => e.id === exercise.id)) return prev;
      return {
        ...prev,
        [activeDay]: [...dayExercises, {
          id: exercise.id,
          name: exercise.name,
          bodyPart: exercise.bodyPart,
          sets: 3,
          reps: '12',
        }],
      };
    });
    setShowLibrary(false);
  }, [activeDay]);

  // Update sets/reps inline
  const updateExercise = useCallback((day, exerciseId, field, value) => {
    setDays(prev => ({
      ...prev,
      [day]: (prev[day] || []).map(e =>
        e.id === exerciseId ? { ...e, [field]: value } : e
      ),
    }));
  }, []);

  // Delete exercise with undo
  const deleteExercise = useCallback((day, exerciseId) => {
    const exerciseList = days[day] || [];
    const deleted = exerciseList.find(e => e.id === exerciseId);
    if (!deleted) return;

    setDays(prev => ({
      ...prev,
      [day]: (prev[day] || []).filter(e => e.id !== exerciseId),
    }));

    // Clear previous undo
    if (undoTimer.current) clearTimeout(undoTimer.current);

    setUndoItem({ day, exercise: deleted });
    undoTimer.current = setTimeout(() => setUndoItem(null), 5000);
  }, [days]);

  // Undo delete
  const handleUndo = useCallback(() => {
    if (!undoItem) return;
    setDays(prev => ({
      ...prev,
      [undoItem.day]: [...(prev[undoItem.day] || []), undoItem.exercise],
    }));
    setUndoItem(null);
    if (undoTimer.current) clearTimeout(undoTimer.current);
  }, [undoItem]);

  // Drag reorder
  const moveExercise = useCallback((day, fromIndex, toIndex) => {
    setDays(prev => {
      const list = [...(prev[day] || [])];
      const [moved] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, moved);
      return { ...prev, [day]: list };
    });
  }, []);

  // Save workout
  const handleSave = () => {
    const dayActivities = {};
    selectedDays.forEach(day => {
      dayActivities[day] = {
        type: 'gym',
        session: {
          label: String(selectedDays.indexOf(day) + 1),
          name: dayNames[day] || workoutName || (language === 'pt-BR' ? 'Treino Personalizado' : 'Custom Workout'),
          focus: 'custom',
          icon: 'pencil-1',
        },
        exercises: (days[day] || []).map(e => ({
          id: e.id,
          nome: e.name,
          series: e.sets,
          reps: e.reps,
          musculos: [e.bodyPart].filter(Boolean),
        })),
      };
    });

    const plan = {
      name: workoutName || (language === 'pt-BR' ? 'Treino Personalizado' : 'Custom Workout'),
      splitType: 'custom',
      trainingDays: selectedDays,
      dayActivities,
      goals: ['custom'],
      generatedAt: new Date().toISOString(),
    };

    localStorage.setItem('vida_workout_plan', JSON.stringify(plan));
    toast.success(language === 'pt-BR' ? 'Treino salvo!' : 'Workout saved!');
    onComplete?.();
  };

  const totalExercises = selectedDays.reduce((sum, day) => sum + (days[day]?.length || 0), 0);
  const canSave = selectedDays.length > 0 && totalExercises > 0;

  // Library sub-view
  if (showLibrary) {
    return (
      <ExercisePickerView
        t={t}
        language={language}
        onBack={() => setShowLibrary(false)}
        onSelect={addExercise}
        existingIds={(days[activeDay] || []).map(e => e.id)}
      />
    );
  }

  return (
    <div className="builder-page">
      <div className="builder-header">
        <button className="builder-back" onClick={onBack}>
          <Icon name="chevron-left" />
        </button>
        <h1 className="builder-title">{t('builder_title')}</h1>
      </div>

      {/* Workout Name */}
      <input
        className="builder-name-input"
        type="text"
        placeholder={t('builder_name_placeholder')}
        value={workoutName}
        onChange={e => setWorkoutName(e.target.value)}
      />

      {/* Day Selection */}
      <div className="builder-section">
        <h3 className="builder-section-title">{t('builder_select_days')}</h3>
        <div className="builder-day-grid">
          {WEEKDAYS.map(({ key, label }) => (
            <button
              key={key}
              className={`builder-day-btn ${selectedDays.includes(key) ? 'active' : ''}`}
              onClick={() => toggleDay(key)}
            >
              {t(label)}
            </button>
          ))}
        </div>
      </div>

      {/* Day Tabs */}
      {selectedDays.length > 0 && (
        <div className="builder-day-tabs">
          {selectedDays.map(day => (
            <button
              key={day}
              className={`builder-day-tab ${activeDay === day ? 'active' : ''}`}
              onClick={() => setActiveDay(day)}
            >
              {day}
              {(days[day]?.length || 0) > 0 && (
                <span className="builder-day-count">{days[day].length}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Day Name Input */}
      {activeDay && (
        <input
          className="builder-day-name-input"
          type="text"
          placeholder={t('builder_day_name_placeholder')}
          value={dayNames[activeDay] || ''}
          onChange={e => setDayNames(prev => ({ ...prev, [activeDay]: e.target.value }))}
        />
      )}

      {/* Exercise List for Active Day */}
      {activeDay && (
        <div className="builder-exercises">
          {(days[activeDay] || []).length === 0 ? (
            <div className="builder-empty">
              <Icon name="plus-circle" className="builder-empty-icon" />
              <p>{t('builder_empty')}</p>
            </div>
          ) : (
            (days[activeDay] || []).map((exercise, index) => (
              <BuilderExerciseCard
                key={exercise.id}
                exercise={exercise}
                index={index}
                total={(days[activeDay] || []).length}
                t={t}
                onUpdate={(field, value) => updateExercise(activeDay, exercise.id, field, value)}
                onDelete={() => deleteExercise(activeDay, exercise.id)}
                onMoveUp={index > 0 ? () => moveExercise(activeDay, index, index - 1) : null}
                onMoveDown={index < (days[activeDay] || []).length - 1 ? () => moveExercise(activeDay, index, index + 1) : null}
              />
            ))
          )}

          <button className="builder-add-btn" onClick={() => setShowLibrary(true)}>
            <Icon name="plus-circle" />
            <span>{t('builder_add_exercise')}</span>
          </button>
        </div>
      )}

      {/* Undo Toast */}
      {undoItem && (
        <div className="builder-undo-bar">
          <span>{t('builder_deleted')}</span>
          <button className="builder-undo-btn" onClick={handleUndo}>
            {t('builder_undo')}
          </button>
        </div>
      )}

      {/* Summary Bar */}
      {canSave && (
        <div className="builder-summary-bar">
          <div className="builder-summary-info">
            <span className="builder-summary-days">{selectedDays.length} {t('builder_days_label')}</span>
            <span className="builder-summary-dot">&middot;</span>
            <span className="builder-summary-exercises">{totalExercises} {t('builder_exercises_label')}</span>
          </div>
          <button className="builder-save-btn" onClick={handleSave}>
            {t('builder_save')}
          </button>
        </div>
      )}
    </div>
  );
}

function BuilderExerciseCard({ exercise, index, total, t, onUpdate, onDelete, onMoveUp, onMoveDown }) {
  return (
    <div className="builder-exercise-card">
      <div className="builder-exercise-header">
        <span className="builder-exercise-name">{exercise.name}</span>
        <div className="builder-exercise-actions">
          {onMoveUp && (
            <button className="builder-move-btn" onClick={onMoveUp}>
              <Icon name="chevron-up" />
            </button>
          )}
          {onMoveDown && (
            <button className="builder-move-btn" onClick={onMoveDown}>
              <Icon name="chevron-down" />
            </button>
          )}
          <button className="builder-delete-btn" onClick={onDelete}>
            <Icon name="trash-1" />
          </button>
        </div>
      </div>
      <div className="builder-exercise-inputs">
        <div className="builder-input-group">
          <label>{t('builder_sets')}</label>
          <input
            type="number"
            min="1"
            max="20"
            value={exercise.sets}
            onChange={e => onUpdate('sets', parseInt(e.target.value) || 1)}
          />
        </div>
        <span className="builder-input-x">×</span>
        <div className="builder-input-group">
          <label>{t('builder_reps')}</label>
          <input
            type="text"
            value={exercise.reps}
            onChange={e => onUpdate('reps', e.target.value)}
            placeholder="12"
          />
        </div>
      </div>
    </div>
  );
}

function ExercisePickerView({ t, language, onBack, onSelect, existingIds }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  // Load initial results
  useEffect(() => {
    const initial = searchExercises('', {});
    if (initial && typeof initial.then === 'function') {
      initial.then(r => setResults(Array.isArray(r) ? r : []));
    } else if (Array.isArray(initial)) {
      setResults(initial);
    }
  }, []);

  const handleSearch = useCallback((q) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      const result = searchExercises(q, {});
      if (result && typeof result.then === 'function') {
        result.then(r => {
          setResults(Array.isArray(r) ? r : []);
          setLoading(false);
        });
      } else {
        setResults(Array.isArray(result) ? result : []);
        setLoading(false);
      }
    }, 200);
  }, []);

  return (
    <div className="builder-page">
      <div className="builder-header">
        <button className="builder-back" onClick={onBack}>
          <Icon name="chevron-left" />
        </button>
        <h1 className="builder-title">{t('builder_pick_exercise')}</h1>
      </div>

      <div className="builder-search">
        <Icon name="search-1" className="builder-search-icon" />
        <input
          type="text"
          className="builder-search-input"
          placeholder={t('builder_search_placeholder')}
          value={query}
          onChange={e => handleSearch(e.target.value)}
          autoFocus
        />
      </div>

      <div className="builder-pick-list">
        {results.slice(0, 50).map(exercise => {
          const alreadyAdded = existingIds.includes(exercise.id);
          return (
            <button
              key={exercise.id}
              className={`builder-pick-item ${alreadyAdded ? 'disabled' : ''}`}
              onClick={() => !alreadyAdded && onSelect(exercise)}
              disabled={alreadyAdded}
            >
              <div className="builder-pick-info">
                <span className="builder-pick-name">{exercise.name}</span>
                <span className="builder-pick-meta">{exercise.bodyPart} &middot; {exercise.equipment}</span>
              </div>
              {alreadyAdded ? (
                <Icon name="checkmark-1" className="builder-pick-added" />
              ) : (
                <Icon name="plus-circle" className="builder-pick-add" />
              )}
            </button>
          );
        })}
        {results.length === 0 && !loading && (
          <div className="builder-empty">
            <p>{t('builder_no_results')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
