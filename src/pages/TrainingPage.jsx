import { useState, useEffect } from 'react';
import { TREINOS, DAY_MAP, TRAINING_DAYS, getExerciseName, getMuscle, getObs, getWorkoutName } from '../data/treinos';
import { muscleColors } from '../data/design';
import { useDataSync } from '../hooks/useDataSync';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../components/Toast';
import { ExerciseMedia } from '../components/ExerciseMedia';
import { Icon } from '../components/Icon';
import './TrainingPage.css';

export function TrainingPage() {
  const { t, language } = useLanguage();
  const toast = useToast();
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date().toLocaleDateString("pt-BR", { weekday: "long" });
    return DAY_MAP[today] || 'segunda';
  });
  const [timerSeconds, setTimerSeconds] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const { debouncedSync } = useDataSync();

  const treino = TREINOS[selectedDay];

  // Timer logic
  useEffect(() => {
    let interval;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            if (navigator.vibrate) {
              navigator.vibrate([200, 100, 200, 100, 200]);
            }
            toast.success(language === 'pt-BR' ? 'Descanso finalizado!' : 'Rest complete!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds, toast, language]);

  const startTimer = (seconds) => {
    setTimerSeconds(seconds);
    setTimerActive(true);
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const stopTimer = () => {
    setTimerActive(false);
    setTimerSeconds(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate completion
  const getCompletedCount = () => {
    if (!treino) return { completed: 0, total: 0 };
    let completed = 0;
    treino.exercicios.forEach(ex => {
      const key = `${selectedDay}_${ex.id}`;
      const saved = JSON.parse(localStorage.getItem(key) || '{}');
      if (saved.feito) completed++;
    });
    return { completed, total: treino.exercicios.length };
  };

  const { completed, total } = getCompletedCount();
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Check if workout is complete
  useEffect(() => {
    if (completed === total && total > 0) {
      const today = new Date().toISOString().split('T')[0];
      const shownKey = `workout_complete_toast_${today}_${selectedDay}`;
      if (!localStorage.getItem(shownKey)) {
        localStorage.setItem(shownKey, 'true');
        toast.success(language === 'pt-BR' ? 'Treino completo! Parabéns!' : 'Workout complete! Great job!');
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100, 50, 200]);
        }
      }
    }
  }, [completed, total, selectedDay, toast, language]);

  if (!treino) {
    return (
      <div className="training-page">
        <p className="no-training">
          {language === 'pt-BR' ? 'Sem treino para este dia' : 'No workout for this day'}
        </p>
      </div>
    );
  }

  return (
    <div className="training-page">
      {/* Day Selector */}
      <div className="training-day-selector">
        {TRAINING_DAYS.map(day => (
          <button
            key={day}
            className={`training-day-btn ${selectedDay === day ? 'active' : ''}`}
            onClick={() => setSelectedDay(day)}
          >
            {day.charAt(0).toUpperCase() + day.slice(1, 3)}
          </button>
        ))}
      </div>

      {/* Workout Header */}
      <div className="workout-header">
        <h2 className="workout-name">{getWorkoutName(treino, language)}</h2>
        <p className="workout-groups">{treino.grupos.map(g => getMuscle(g, language)).join(' • ')}</p>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-info">
          <span>{completed} {language === 'pt-BR' ? 'de' : 'of'} {total} {language === 'pt-BR' ? 'exercícios' : 'exercises'}</span>
          <span className="progress-percent">{progress}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Exercise List */}
      <div className="exercise-list">
        {treino.exercicios.map(ex => (
          <ExerciseCard
            key={ex.id}
            exercise={ex}
            dayKey={selectedDay}
            onSync={debouncedSync}
            onStartTimer={startTimer}
            toast={toast}
            language={language}
          />
        ))}
      </div>

      {/* Floating Timer */}
      {timerSeconds !== null && (
        <div className={`floating-timer ${timerSeconds === 0 ? 'done' : ''}`}>
          <div className="floating-timer-content">
            {timerActive && timerSeconds > 0 ? (
              <>
                <span className="floating-timer-label">
                  {language === 'pt-BR' ? 'Descansando' : 'Resting'}
                </span>
                <span className="floating-timer-time">{formatTime(timerSeconds)}</span>
                <button className="floating-timer-stop" onClick={stopTimer}>
                  <Icon name="xmark" />
                </button>
              </>
            ) : (
              <>
                <Icon name="checkmark-circle-1" className="floating-timer-check" />
                <span className="floating-timer-done">
                  {language === 'pt-BR' ? 'Pronto!' : 'Ready!'}
                </span>
                <button className="floating-timer-stop" onClick={stopTimer}>
                  <Icon name="xmark" />
                </button>
              </>
            )}
          </div>
          {timerActive && (
            <div className="floating-timer-progress">
              <div
                className="floating-timer-bar"
                style={{
                  width: `${((timerSeconds) / (timerSeconds > 90 ? 120 : timerSeconds > 60 ? 90 : 60)) * 100}%`
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ExerciseCard({ exercise, dayKey, onSync, onStartTimer, toast, language }) {
  const storageKey = `${dayKey}_${exercise.id}`;
  const [saved, setSaved] = useState(() => {
    return JSON.parse(localStorage.getItem(storageKey) || '{}');
  });

  const updateSaved = (updates) => {
    const newSaved = { ...saved, ...updates };
    setSaved(newSaved);
    localStorage.setItem(storageKey, JSON.stringify(newSaved));
    onSync();
  };

  const handleWeightChange = (value) => {
    const today = new Date().toISOString().split('T')[0];
    const historico = saved.historico || [];
    const existingIndex = historico.findIndex(h => h.data === today);

    if (existingIndex >= 0) {
      historico[existingIndex].peso = value;
    } else {
      historico.push({ data: today, peso: value });
    }

    updateSaved({
      peso: value,
      data: today,
      historico
    });
  };

  const handleDoneToggle = () => {
    const nowDone = !saved.feito;
    updateSaved({ feito: nowDone });

    if (nowDone) {
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      // Save training day
      const today = new Date().toISOString().split('T')[0];
      let history = JSON.parse(localStorage.getItem('training_days') || '[]');
      if (!history.includes(today)) {
        history.push(today);
        localStorage.setItem('training_days', JSON.stringify(history));
      }
    }
  };

  const exerciseName = getExerciseName(exercise.id, language);
  const obsText = getObs(exercise.obs, language);

  return (
    <div className={`exercise-card ${saved.feito ? 'completed' : ''}`}>
      <div className="exercise-header">
        <ExerciseMedia
          exerciseName={exercise.nome}
          size="small"
        />
        <div className="exercise-info">
          <h4 className="exercise-name">{exerciseName}</h4>
          <div className="exercise-meta">
            <span className="exercise-sets">{exercise.series}x{exercise.reps}</span>
            {obsText && <span className="exercise-obs">{obsText}</span>}
          </div>
          <div className="exercise-muscles">
            {exercise.musculos.map(m => {
              const color = muscleColors[m] || { bg: 'rgba(128,128,128,0.2)', text: '#888' };
              return (
                <span
                  key={m}
                  className="muscle-tag"
                  style={{ backgroundColor: color.bg, color: color.text }}
                >
                  {getMuscle(m, language)}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="exercise-controls">
        <div className="weight-input-group">
          <label>{language === 'pt-BR' ? 'Peso (kg)' : 'Weight (kg)'}</label>
          <input
            type="number"
            step="0.5"
            value={saved.peso || ''}
            onChange={(e) => handleWeightChange(e.target.value)}
            placeholder="0.0"
          />
        </div>

        <div className="exercise-actions">
          <button
            className="timer-btn"
            onClick={() => onStartTimer(60)}
            title={language === 'pt-BR' ? 'Timer 60s' : '60s Timer'}
          >
            <Icon name="timer-1" />
            <span>60s</span>
          </button>

          <label className="done-checkbox">
            <input
              type="checkbox"
              checked={saved.feito || false}
              onChange={handleDoneToggle}
            />
            <span className="checkbox-icon">
              <Icon name="checkmark-1" />
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
