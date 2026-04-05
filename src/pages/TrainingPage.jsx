import { useState, useEffect, useMemo, useRef } from 'react';
import { TREINOS, DAY_MAP, TRAINING_DAYS, SCHEDULE_TO_TREINO_DAY, getExerciseName, getMuscle, getObs, getWorkoutName, getWorkoutBySplit } from '../data/treinos';
import { generateAdvancedPlan } from '../utils/advancedPlanGenerator';
import { muscleColors } from '../data/design';
import { DESIGN } from '../data/design';
import { useDataSync } from '../hooks/useDataSync';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../components/Toast';
import { ExerciseMedia } from '../components/ExerciseMedia';
import { formatExerciseName } from '../utils/formatExerciseName';
import { Icon } from '../components/Icon';
import { CrossFitCard } from '../components/activity-cards/CrossFitCard';
import { CalisthenicsCard } from '../components/activity-cards/CalisthenicsCard';
import { PilatesCard } from '../components/activity-cards/PilatesCard';
import { RunCard } from '../components/activity-cards/RunCard';
import { YogaCard } from '../components/activity-cards/YogaCard';
import { ProgramsPage } from './ProgramsPage';
import './TrainingPage.css';

// Load workout plan from localStorage (re-reads on each mount/navigation)
function useWorkoutPlan() {
  const [plan, setPlan] = useState(() => {
    try {
      const raw = localStorage.getItem('vida_workout_plan');
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error('Error loading workout plan:', e);
    }
    return null;
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('vida_workout_plan');
      setPlan(raw ? JSON.parse(raw) : null);
    } catch (e) {
      console.error('Error loading workout plan:', e);
    }
  }, []);

  return plan;
}

// Map schedule days to workouts based on workout plan
function buildTrainingMap(plan) {
  if (!plan) return null;

  // New multi-activity path
  if (plan.dayActivities) {
    return plan.dayActivities;
  }

  // Legacy gym-only path
  if (!plan.split || !plan.trainingDays) return null;
  const map = {};
  plan.split.forEach((splitEntry, i) => {
    const scheduleDay = plan.trainingDays[i];
    const treinoKey = SCHEDULE_TO_TREINO_DAY[scheduleDay];
    if (!treinoKey) return;
    const workout = getWorkoutBySplit(splitEntry.name);
    if (workout) {
      map[treinoKey] = {
        ...workout,
        nome: {
          'pt-BR': `Dia ${splitEntry.label}: ${splitEntry.name}`,
          'en': `Day ${splitEntry.label}: ${splitEntry.name}`
        }
      };
    }
  });
  return map;
}

const CANONICAL_DAY_ORDER = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function getActiveDays(plan) {
  if (!plan) return TRAINING_DAYS;

  // New multi-activity path: dayActivities keys are schedule days (Seg, Ter, etc.)
  if (plan.dayActivities) {
    const keys = Object.keys(plan.dayActivities);
    return keys.sort((a, b) => CANONICAL_DAY_ORDER.indexOf(a) - CANONICAL_DAY_ORDER.indexOf(b));
  }

  // Legacy path
  if (!plan.trainingDays) return TRAINING_DAYS;
  return plan.trainingDays.map(d => SCHEDULE_TO_TREINO_DAY[d]).filter(Boolean);
}

export function TrainingPage({ onTabChange }) {
  const { t, language } = useLanguage();
  const toast = useToast();
  const workoutPlan = useWorkoutPlan();
  const trainingMap = useMemo(() => buildTrainingMap(workoutPlan), [workoutPlan]);
  const activeDays = useMemo(() => getActiveDays(workoutPlan), [workoutPlan]);
  const [subTab, setSubTab] = useState('workout');

  const [selectedDay, setSelectedDay] = useState(() => {
    const days = workoutPlan ? getActiveDays(workoutPlan) : TRAINING_DAYS;
    if (workoutPlan?.dayActivities) {
      // Multi-activity: use schedule day keys
      const dayMap = { 'domingo': 'Dom', 'segunda-feira': 'Seg', 'terça-feira': 'Ter', 'quarta-feira': 'Qua', 'quinta-feira': 'Qui', 'sexta-feira': 'Sex', 'sábado': 'Sáb' };
      const today = new Date().toLocaleDateString("pt-BR", { weekday: "long" });
      const todayKey = dayMap[today.toLowerCase()] || days[0];
      return days.includes(todayKey) ? todayKey : days[0];
    }
    // Legacy
    const today = new Date().toLocaleDateString("pt-BR", { weekday: "long" });
    const todayKey = DAY_MAP[today] || 'segunda';
    return days.includes(todayKey) ? todayKey : days[0];
  });
  const [timerSeconds, setTimerSeconds] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  const { debouncedSync } = useDataSync();

  // Resolve treino: for multi-activity gym days, look up exercises
  const treino = useMemo(() => {
    const dayActivity = workoutPlan?.dayActivities?.[selectedDay];
    if (dayActivity && dayActivity.type === 'gym' && dayActivity.session) {
      // Tier 1: Advanced generator — exercises inline in dayActivities
      if (dayActivity.exercises && dayActivity.exercises.length > 0) {
        return {
          nome: dayActivity.session.focus || {
            'pt-BR': `Dia ${dayActivity.session.label}: ${dayActivity.session.name}`,
            'en': `Day ${dayActivity.session.label}: ${dayActivity.session.name}`
          },
          grupos: dayActivity.session.targetMuscles || [],
          exercicios: dayActivity.exercises,
        };
      }
      // Tier 2: Legacy split lookup from treinos.js
      const workout = getWorkoutBySplit(dayActivity.session.name);
      if (workout) {
        return {
          ...workout,
          nome: {
            'pt-BR': `Dia ${dayActivity.session.label}: ${dayActivity.session.name}`,
            'en': `Day ${dayActivity.session.label}: ${dayActivity.session.name}`
          }
        };
      }
      // Tier 3: On-the-fly generation for plans that have no exercises
      // (e.g., old plans saved before the advanced generator existed)
      try {
        const goal = workoutPlan.goals?.[0] || 'general';
        const level = workoutPlan.level || 'intermediate';
        const days = workoutPlan.trainingDays?.length || 3;
        const equipment = workoutPlan.equipment || 'full_gym';
        const freshPlan = generateAdvancedPlan({ goal, level, days, equipment, duration: 60, priorityMuscles: [] });
        // Find the matching day in the freshly generated plan
        const freshDay = freshPlan.dayActivities?.[selectedDay];
        if (freshDay?.exercises?.length > 0) {
          return {
            nome: dayActivity.session.focus || {
              'pt-BR': `Dia ${dayActivity.session.label}: ${dayActivity.session.name}`,
              'en': `Day ${dayActivity.session.label}: ${dayActivity.session.name}`
            },
            grupos: freshDay.session?.targetMuscles || [],
            exercicios: freshDay.exercises,
          };
        }
      } catch (e) {
        // Generation failed — continue to legacy fallback
      }
    }
    // Legacy path or fallback
    if (trainingMap && trainingMap[selectedDay] && trainingMap[selectedDay].exercicios) {
      return trainingMap[selectedDay];
    }
    return TREINOS[selectedDay] || null;
  }, [workoutPlan, trainingMap, selectedDay]);

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
    if (!treino || !treino.exercicios) return { completed: 0, total: 0 };
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

  const renderActivityCard = (dayActivity, day) => {
    switch (dayActivity.type) {
      case 'crossfit':
        return <CrossFitCard dayActivity={dayActivity} day={day} language={language} toast={toast} />;
      case 'calisthenics':
        return <CalisthenicsCard dayActivity={dayActivity} day={day} language={language} toast={toast} />;
      case 'pilates':
        return <PilatesCard dayActivity={dayActivity} day={day} language={language} toast={toast} />;
      case 'running':
        return <RunCard dayActivity={dayActivity} day={day} language={language} toast={toast} />;
      case 'yoga':
        return <YogaCard dayActivity={dayActivity} day={day} language={language} toast={toast} />;
      default:
        return null;
    }
  };

  const isNonGymDay = workoutPlan?.dayActivities?.[selectedDay] && workoutPlan.dayActivities[selectedDay].type !== 'gym';

  const subTabBar = (
    <div className="training-subtabs">
      <button
        className={`training-subtab ${subTab === 'workout' ? 'active' : ''}`}
        onClick={() => setSubTab('workout')}
      >
        {language === 'pt-BR' ? 'Treino' : 'Workout'}
      </button>
      <button
        className={`training-subtab ${subTab === 'programs' ? 'active' : ''}`}
        onClick={() => setSubTab('programs')}
      >
        {language === 'pt-BR' ? 'Programas' : 'Programs'}
      </button>
    </div>
  );

  // Programs sub-tab
  if (subTab === 'programs') {
    return (
      <div className="training-page">
        {subTabBar}
        <ProgramsPage onComplete={() => setSubTab('workout')} onTabChange={onTabChange} />
      </div>
    );
  }

  // No plan at all — show plan selection empty state
  if (!workoutPlan) {
    return (
      <div className="training-page">
        {subTabBar}
        <div className="training-empty-state">
          <Icon name="dumbbell-1" className="training-empty-icon" />
          <h2 className="training-empty-title">{t('training_empty_title')}</h2>
          <p className="training-empty-desc">{t('training_empty_desc')}</p>

          <div className="training-option-cards">
            <button className="training-option-card" onClick={() => onTabChange?.('smart-plan')}>
              <div className="training-option-icon smart">
                <Icon name="wand" />
              </div>
              <div className="training-option-text">
                <h3>{t('training_option_smart')}</h3>
                <p>{t('training_option_smart_desc')}</p>
              </div>
              <Icon name="chevron-right" className="training-option-arrow" />
            </button>

            <button className="training-option-card" onClick={() => onTabChange?.('build-plan')}>
              <div className="training-option-icon scratch">
                <Icon name="pencil-1" />
              </div>
              <div className="training-option-text">
                <h3>{t('training_option_scratch')}</h3>
                <p>{t('training_option_scratch_desc')}</p>
              </div>
              <Icon name="chevron-right" className="training-option-arrow" />
            </button>

            <button className="training-option-card" onClick={() => setSubTab('programs')}>
              <div className="training-option-icon programs">
                <Icon name="list-3" />
              </div>
              <div className="training-option-text">
                <h3>{t('training_option_programs')}</h3>
                <p>{t('training_option_programs_desc')}</p>
              </div>
              <Icon name="chevron-right" className="training-option-arrow" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!treino && !isNonGymDay) {
    return (
      <div className="training-page">
        {subTabBar}
        <p className="no-training">
          {language === 'pt-BR' ? 'Sem treino para este dia' : 'No workout for this day'}
        </p>
      </div>
    );
  }

  return (
    <div className="training-page">
      {subTabBar}
      {/* Active Plan Header */}
      <div className="training-plan-header">
        <div className="training-plan-info">
          <span className="training-plan-label">{t('training_active_plan')}</span>
          <span className="training-plan-name">{(typeof workoutPlan.name === 'object' ? (workoutPlan.name[language] || workoutPlan.name['pt-BR']) : workoutPlan.name) || (language === 'pt-BR' ? 'Meu Plano' : 'My Plan')}</span>
        </div>
        <button className="training-change-plan" onClick={() => setSubTab('programs')}>
          {t('training_change_plan')}
        </button>
      </div>

      {/* Day Selector */}
      <div className="training-day-selector">
        {activeDays.map(day => {
          const activityType = workoutPlan?.dayActivities?.[day]?.type;
          const dotColor = activityType ? DESIGN.sportColors[activityType]?.primary : null;
          return (
            <button
              key={day}
              className={`training-day-btn ${selectedDay === day ? 'active' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              {day.charAt(0).toUpperCase() + day.slice(1, 3)}
              {dotColor && <span className="activity-dot" style={{ backgroundColor: dotColor }} />}
            </button>
          );
        })}
      </div>

      {/* Workout Header */}
      {workoutPlan?.dayActivities?.[selectedDay]?.type && workoutPlan.dayActivities[selectedDay].type !== 'gym' ? (
        <div className="workout-header">
          <h2 className="workout-name">
            {workoutPlan.dayActivities[selectedDay].session?.name?.[language] ||
             workoutPlan.dayActivities[selectedDay].type.charAt(0).toUpperCase() + workoutPlan.dayActivities[selectedDay].type.slice(1)}
          </h2>
        </div>
      ) : treino ? (
        <div className="workout-header">
          <h2 className="workout-name">{getWorkoutName(treino, language)}</h2>
          <p className="workout-groups">{treino.grupos.map(g => getMuscle(g, language)).join(' • ')}</p>
        </div>
      ) : null}

      {/* Progress Bar - only for gym */}
      {(!workoutPlan?.dayActivities?.[selectedDay] || workoutPlan.dayActivities[selectedDay].type === 'gym') && treino && (
        <div className="progress-section">
          <div className="progress-info">
            <span>{completed} {language === 'pt-BR' ? 'de' : 'of'} {total} {language === 'pt-BR' ? 'exercícios' : 'exercises'}</span>
            <span className="progress-percent">{progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Progress for running days */}
      {workoutPlan?.dayActivities?.[selectedDay]?.type === 'running' && (
        <RunProgress day={selectedDay} session={workoutPlan.dayActivities[selectedDay].session} language={language} />
      )}

      {/* Exercise List / Activity Card */}
      {workoutPlan?.dayActivities?.[selectedDay] && workoutPlan.dayActivities[selectedDay].type !== 'gym' ? (
        <div className="exercise-list">
          {renderActivityCard(workoutPlan.dayActivities[selectedDay], selectedDay)}
        </div>
      ) : (
        <div className="exercise-list">
          {treino?.exercicios?.map(ex => (
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
      )}

      {/* Quick Actions */}
      <div className="training-actions">
        <button className="training-action-btn" onClick={() => setSubTab('programs')}>
          <Icon name="list-3" />
          <span>{language === 'pt-BR' ? 'Programas' : 'Programs'}</span>
        </button>
        <button className="training-action-btn" onClick={() => onTabChange?.('dashboard')}>
          <Icon name="bar-chart-4" />
          <span>{language === 'pt-BR' ? 'Progresso' : 'Progress'}</span>
        </button>
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

function RunProgress({ day, session, language }) {
  const today = new Date().toISOString().split('T')[0];
  const storageKey = `run_${day}_${today}`;
  const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');

  // Parse target distance e.g. "5K" → 5
  const targetMatch = String(session?.distance || '').match(/([\d.]+)\s*[Kk]/);
  const targetKm = targetMatch ? parseFloat(targetMatch[1]) : null;
  const enteredKm = parseFloat(saved.distance) || 0;
  const pct = targetKm && enteredKm > 0 ? Math.min(100, (enteredKm / targetKm) * 100) : 0;

  return (
    <div className="run-progress-section">
      <div className="run-progress-header">
        <div className="run-progress-target">
          <Icon name="direction-1" className="run-progress-icon" />
          <span className="run-progress-label">
            {session?.distance || '5K'} · Zone {session?.zone || 2}
          </span>
        </div>
        {saved.completed && (
          <div className="run-progress-stats">
            {saved.distance && <span>{saved.distance} km</span>}
            {saved.pace && <span>{saved.pace} /km</span>}
            {saved.duration && <span>{saved.duration} min</span>}
          </div>
        )}
      </div>
      {targetKm && (
        <div className="run-progress-bar-wrap">
          <div className="run-progress-bar">
            <div className="run-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="run-progress-bar-label">
            {enteredKm > 0
              ? `${enteredKm.toFixed(1)} / ${targetKm} km`
              : `${language === 'pt-BR' ? '— de' : '— of'} ${targetKm} km`}
          </span>
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

  const exerciseName = formatExerciseName(getExerciseName(exercise.id, language) || exercise.nome || exercise.id);
  const obsText = getObs(exercise.obs, language);
  const restTime = exercise.restSeconds || 60;
  const rpeLabel = exercise.targetRpe ? `RPE ${exercise.targetRpe}` : null;

  return (
    <div className={`exercise-card ${saved.feito ? 'completed' : ''}`}>
      <div className="exercise-header">
        <ExerciseMedia
          exerciseName={exercise.nome}
          exerciseId={exercise.id}
          size="small"
        />
        <div className="exercise-info">
          <h4 className="exercise-name">{exerciseName}</h4>
          <div className="exercise-meta">
            <span className="exercise-sets">{exercise.series}x{exercise.reps}</span>
            {rpeLabel && <span className="exercise-rpe">{rpeLabel}</span>}
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
            onClick={() => onStartTimer(restTime)}
            title={language === 'pt-BR' ? `Timer ${restTime}s` : `${restTime}s Timer`}
          >
            <Icon name="timer-1" />
            <span>{restTime}s</span>
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
