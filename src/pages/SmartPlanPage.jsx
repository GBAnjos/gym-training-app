import { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { Icon } from '../components/Icon';
import { PRIORITY_MUSCLE_OPTIONS } from '../data/scienceConfig';
import { generateAdvancedPlan } from '../utils/advancedPlanGenerator';
import './SmartPlanPage.css';

const TOTAL_STEPS = 6;

const GOALS = ['muscle', 'fat_loss', 'strength', 'endurance', 'general'];
const LEVELS = [
  { key: 'beginner', icon: 'leaf-1' },
  { key: 'intermediate', icon: 'bar-chart-4' },
  { key: 'advanced', icon: 'crown-1' },
];
const DAYS_OPTIONS = [2, 3, 4, 5, 6];
const EQUIPMENT = ['full_gym', 'home', 'minimal'];
const DURATIONS = [30, 45, 60, 90];

const GOAL_ICONS = {
  muscle: 'dumbbell-1',
  fat_loss: 'fire-1',
  strength: 'bolt-alt',
  endurance: 'direction-1',
  general: 'heart',
};

const EQUIPMENT_LABELS = {
  full_gym: 'smart_q4_full_gym',
  home: 'smart_q4_home',
  minimal: 'smart_q4_minimal',
};

export function SmartPlanPage({ onBack, onComplete }) {
  const { t, language } = useLanguage();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    goals: [],
    level: null,
    days: null,
    equipment: null,
    duration: null,
    priorityMuscles: [],
  });
  const [showResult, setShowResult] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const setAnswer = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return answers.goals.length > 0;
      case 2: return answers.level !== null;
      case 3: return answers.days !== null;
      case 4: return answers.equipment !== null;
      case 5: return answers.duration !== null;
      case 6: return true; // Priority muscles are optional
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      // Generate the plan when all steps are complete
      const plan = generateAdvancedPlan({
        goals: answers.goals,
        level: answers.level,
        days: answers.days,
        equipment: answers.equipment,
        duration: answers.duration,
        priorityMuscles: answers.priorityMuscles,
      });
      setGeneratedPlan(plan);
      setShowResult(true);
    }
  };

  const handleBack = () => {
    if (showResult) {
      setShowResult(false);
    } else if (step > 1) {
      setStep(step - 1);
    } else {
      onBack?.();
    }
  };

  const handleActivate = () => {
    if (generatedPlan) {
      // Store the full generated plan (consumed by TrainingPage)
      localStorage.setItem('vida_workout_plan', JSON.stringify(generatedPlan));
      // Also store answers for re-generation later
      localStorage.setItem('vida_smart_plan_answers', JSON.stringify(answers));
    }
    onComplete?.();
  };

  if (showResult) {
    const totalExercises = generatedPlan
      ? Object.values(generatedPlan.dayActivities).reduce((sum, da) => sum + (da.exercises?.length || 0), 0)
      : 0;
    const planName = generatedPlan?.name;
    const displayName = planName
      ? (typeof planName === 'object' ? (planName[language] || planName['pt-BR']) : planName)
      : '';

    return (
      <div className="smart-plan-page">
        <div className="smart-plan-header">
          <button className="smart-plan-back" onClick={handleBack}>
            <Icon name="chevron-left" />
          </button>
          <h1 className="smart-plan-title">{t('smart_plan_title')}</h1>
        </div>

        <div className="smart-result">
          <div className="smart-result-hero">
            <Icon name="checkmark-circle-1" className="smart-result-icon" />
            <h2>{t('smart_result_title')}</h2>
            <p>{t('smart_result_desc')}</p>
          </div>

          {displayName && (
            <div className="smart-result-plan-name">{displayName}</div>
          )}

          <div className="smart-result-stats">
            <div className="smart-result-stat">
              <span className="smart-result-stat-label">{t('smart_result_goal')}</span>
              <span className="smart-result-stat-value">{answers.goals.map(g => t(`smart_q1_${g}`)).join(' + ')}</span>
            </div>
            <div className="smart-result-stat">
              <span className="smart-result-stat-label">{t('smart_result_level')}</span>
              <span className="smart-result-stat-value">{t(`smart_q2_${answers.level}`)}</span>
            </div>
            <div className="smart-result-stat">
              <span className="smart-result-stat-label">{t('smart_result_days')}</span>
              <span className="smart-result-stat-value">{answers.days}x</span>
            </div>
            <div className="smart-result-stat">
              <span className="smart-result-stat-label">{t('smart_result_duration')}</span>
              <span className="smart-result-stat-value">{answers.duration} min</span>
            </div>
            <div className="smart-result-stat">
              <span className="smart-result-stat-label">{t('smart_result_equipment')}</span>
              <span className="smart-result-stat-value">{t(EQUIPMENT_LABELS[answers.equipment])}</span>
            </div>
            <div className="smart-result-stat">
              <span className="smart-result-stat-label">{t('smart_result_exercises')}</span>
              <span className="smart-result-stat-value">{totalExercises}</span>
            </div>
          </div>

          {answers.priorityMuscles.length > 0 && (
            <div className="smart-result-priority">
              <span className="smart-result-stat-label">{t('smart_result_priority')}</span>
              <div className="smart-result-priority-tags">
                {answers.priorityMuscles.map(m => (
                  <span key={m} className="smart-result-priority-tag">{t(`muscle_${m}`)}</span>
                ))}
              </div>
            </div>
          )}

          {generatedPlan && (
            <div className="smart-result-progression">
              <span className="smart-result-stat-label">{t('smart_result_progression')}</span>
              <span className="smart-result-stat-value">
                {generatedPlan.progressionModel?.description?.[language] || generatedPlan.progressionModel?.description?.['pt-BR'] || ''}
              </span>
            </div>
          )}

          <button className="smart-plan-activate" onClick={handleActivate}>
            {t('smart_result_activate')}
          </button>
          <button className="smart-plan-adjust" onClick={handleBack}>
            {t('smart_result_back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="smart-plan-page">
      <div className="smart-plan-header">
        <button className="smart-plan-back" onClick={handleBack}>
          <Icon name="chevron-left" />
        </button>
        <h1 className="smart-plan-title">{t('smart_plan_title')}</h1>
      </div>

      {/* Progress */}
      <div className="smart-plan-progress">
        <span className="smart-plan-step-text">
          {t('smart_step')} {step} {t('smart_of')} {TOTAL_STEPS}
        </span>
        <div className="smart-plan-progress-bar">
          <div className="smart-plan-progress-fill" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
        </div>
      </div>

      {/* Step Content */}
      <div className="smart-plan-content">
        {step === 1 && (
          <StepGoal value={answers.goals} onChange={v => setAnswer('goals', v)} t={t} />
        )}
        {step === 2 && (
          <StepLevel value={answers.level} onChange={v => setAnswer('level', v)} t={t} />
        )}
        {step === 3 && (
          <StepDays value={answers.days} onChange={v => setAnswer('days', v)} t={t} />
        )}
        {step === 4 && (
          <StepEquipment value={answers.equipment} onChange={v => setAnswer('equipment', v)} t={t} />
        )}
        {step === 5 && (
          <StepDuration value={answers.duration} onChange={v => setAnswer('duration', v)} t={t} />
        )}
        {step === 6 && (
          <StepPriorityMuscles value={answers.priorityMuscles} onChange={v => setAnswer('priorityMuscles', v)} t={t} />
        )}
      </div>

      {/* Next Button */}
      <button
        className="smart-plan-next"
        disabled={!canProceed()}
        onClick={handleNext}
      >
        {step === TOTAL_STEPS ? t('smart_finish') : t('smart_next')}
      </button>
    </div>
  );
}

function StepGoal({ value, onChange, t }) {
  const toggle = (goal) => {
    if (value.includes(goal)) {
      onChange(value.filter(g => g !== goal));
    } else if (value.length < 3) {
      onChange([...value, goal]);
    }
  };

  return (
    <>
      <h2 className="smart-plan-question">{t('smart_q1_title')}</h2>
      <p className="smart-plan-hint">{t('smart_q1_desc')}</p>
      <div className="smart-plan-options">
        {GOALS.map(goal => (
          <button
            key={goal}
            className={`smart-plan-option ${value.includes(goal) ? 'active' : ''}`}
            onClick={() => toggle(goal)}
          >
            <Icon name={GOAL_ICONS[goal]} className="smart-plan-option-icon" />
            <span>{t(`smart_q1_${goal}`)}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function StepLevel({ value, onChange, t }) {
  return (
    <>
      <h2 className="smart-plan-question">{t('smart_q2_title')}</h2>
      <div className="smart-plan-options vertical">
        {LEVELS.map(lvl => (
          <button
            key={lvl.key}
            className={`smart-plan-option-card ${value === lvl.key ? 'active' : ''}`}
            onClick={() => onChange(lvl.key)}
          >
            <Icon name={lvl.icon} className="smart-plan-option-icon" />
            <div className="smart-plan-option-text">
              <span className="smart-plan-option-label">{t(`smart_q2_${lvl.key}`)}</span>
              <span className="smart-plan-option-desc">{t(`smart_q2_${lvl.key}_desc`)}</span>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

function StepDays({ value, onChange, t }) {
  return (
    <>
      <h2 className="smart-plan-question">{t('smart_q3_title')}</h2>
      <p className="smart-plan-hint">{t('smart_q3_desc')}</p>
      <div className="smart-plan-day-grid">
        {DAYS_OPTIONS.map(d => (
          <button
            key={d}
            className={`smart-plan-day-btn ${value === d ? 'active' : ''}`}
            onClick={() => onChange(d)}
          >
            {d}x
          </button>
        ))}
      </div>
    </>
  );
}

function StepEquipment({ value, onChange, t }) {
  return (
    <>
      <h2 className="smart-plan-question">{t('smart_q4_title')}</h2>
      <div className="smart-plan-options vertical">
        {EQUIPMENT.map(eq => (
          <button
            key={eq}
            className={`smart-plan-option-card ${value === eq ? 'active' : ''}`}
            onClick={() => onChange(eq)}
          >
            <div className="smart-plan-option-text">
              <span className="smart-plan-option-label">{t(`smart_q4_${eq}`)}</span>
              <span className="smart-plan-option-desc">{t(`smart_q4_${eq}_desc`)}</span>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

function StepDuration({ value, onChange, t }) {
  return (
    <>
      <h2 className="smart-plan-question">{t('smart_q5_title')}</h2>
      <div className="smart-plan-options">
        {DURATIONS.map(d => (
          <button
            key={d}
            className={`smart-plan-option ${value === d ? 'active' : ''}`}
            onClick={() => onChange(d)}
          >
            <span>{t(`smart_q5_${d}`)}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function StepPriorityMuscles({ value, onChange, t }) {
  const toggle = (key) => {
    if (value.includes(key)) {
      onChange(value.filter(m => m !== key));
    } else if (value.length < 2) {
      onChange([...value, key]);
    }
  };

  return (
    <>
      <h2 className="smart-plan-question">{t('smart_q6_title')}</h2>
      <p className="smart-plan-hint">{t('smart_q6_desc')}</p>
      <div className="smart-plan-muscle-grid">
        {PRIORITY_MUSCLE_OPTIONS.map(({ key, labelKey }) => (
          <button
            key={key}
            className={`smart-plan-muscle-btn ${value.includes(key) ? 'active' : ''}`}
            onClick={() => toggle(key)}
          >
            <span className="smart-plan-muscle-label">{t(labelKey)}</span>
            {value.includes(key) && <Icon name="checkmark-1" className="smart-plan-muscle-check" />}
          </button>
        ))}
      </div>
      {value.length === 0 && (
        <p className="smart-plan-skip-hint">{t('smart_q6_skip')}</p>
      )}
    </>
  );
}
