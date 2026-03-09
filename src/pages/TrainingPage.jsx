import { useState, useEffect } from 'react';
import { TREINOS, DAY_MAP, TRAINING_DAYS } from '../data/treinos';
import { muscleColors } from '../data/design';
import { useDataSync } from '../hooks/useDataSync';
import { ExerciseMedia } from '../components/ExerciseMedia';
import './TrainingPage.css';

export function TrainingPage() {
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
              navigator.vibrate([200, 100, 200]);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const startTimer = (seconds) => {
    setTimerSeconds(seconds);
    setTimerActive(true);
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

  if (!treino) {
    return (
      <div className="training-page">
        <p className="no-training">Sem treino para este dia</p>
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
        <h2 className="workout-name">{treino.nome}</h2>
        <p className="workout-groups">{treino.grupos.join(' • ')}</p>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-info">
          <span>{completed} de {total} exercícios</span>
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
          />
        ))}
      </div>

      {/* Rest Timer */}
      <div className="timer-section">
        <h3 className="timer-title">⏱ Timer de Descanso</h3>
        <div className="timer-buttons">
          <button onClick={() => startTimer(60)}>60s</button>
          <button onClick={() => startTimer(90)}>90s</button>
          <button onClick={() => startTimer(120)}>120s</button>
        </div>
        {timerSeconds !== null && (
          <div className={`timer-display ${timerSeconds === 0 ? 'done' : ''}`}>
            {timerSeconds === 0 ? '✓ Descanso finalizado!' : formatTime(timerSeconds)}
          </div>
        )}
      </div>
    </div>
  );
}

function ExerciseCard({ exercise, dayKey, onSync }) {
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
    updateSaved({ feito: !saved.feito });

    if (!saved.feito) {
      // Save training day
      const today = new Date().toISOString().split('T')[0];
      let history = JSON.parse(localStorage.getItem('training_days') || '[]');
      if (!history.includes(today)) {
        history.push(today);
        localStorage.setItem('training_days', JSON.stringify(history));
      }
    }
  };

  return (
    <div className={`exercise-card ${saved.feito ? 'completed' : ''}`}>
      <div className="exercise-header">
        <ExerciseMedia
          exerciseName={exercise.nome}
          size="small"
          showPlayButton={true}
        />
        <div className="exercise-info">
          <h4 className="exercise-name">{exercise.nome}</h4>
          <div className="exercise-meta">
            <span className="exercise-sets">{exercise.series}x{exercise.reps}</span>
            {exercise.obs && <span className="exercise-obs">{exercise.obs}</span>}
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
                  {m}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="exercise-controls">
        <div className="weight-input-group">
          <label>Peso (kg)</label>
          <input
            type="number"
            step="0.5"
            value={saved.peso || ''}
            onChange={(e) => handleWeightChange(e.target.value)}
            placeholder="0.0"
          />
        </div>
        <label className="done-checkbox">
          <input
            type="checkbox"
            checked={saved.feito || false}
            onChange={handleDoneToggle}
          />
          <span>Concluído</span>
        </label>
      </div>
    </div>
  );
}
