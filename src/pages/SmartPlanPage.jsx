import { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { Icon } from '../components/Icon';
import './SmartPlanPage.css';

const TOTAL_STEPS = 5;

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
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    goal: null,
    level: null,
    days: null,
    equipment: null,
    duration: null,
  });
  const [showResult, setShowResult] = useState(false);

  const setAnswer = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return answers.goal !== null;
      case 2: return answers.level !== null;
      case 3: return answers.days !== null;
      case 4: return answers.equipment !== null;
      case 5: return answers.duration !== null;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
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
    // Store answers and navigate back to training
    localStorage.setItem('vida_smart_plan_answers', JSON.stringify(answers));
    onComplete?.();
  };

  if (showResult) {
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

          <div className="smart-result-stats">
            <div className="smart-result-stat">
              <span className="smart-result-stat-label">{t('smart_result_goal')}</span>
              <span className="smart-result-stat-value">{t(`smart_q1_${answers.goal}`)}</span>
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
            <div className="smart-result-stat full-width">
              <span className="smart-result-stat-label">{t('smart_result_equipment')}</span>
              <span className="smart-result-stat-value">{t(EQUIPMENT_LABELS[answers.equipment])}</span>
            </div>
          </div>

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
          <StepGoal value={answers.goal} onChange={v => setAnswer('goal', v)} t={t} />
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
  return (
    <>
      <h2 className="smart-plan-question">{t('smart_q1_title')}</h2>
      <div className="smart-plan-options">
        {GOALS.map(goal => (
          <button
            key={goal}
            className={`smart-plan-option ${value === goal ? 'active' : ''}`}
            onClick={() => onChange(goal)}
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
