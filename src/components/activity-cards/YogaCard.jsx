import { useState } from 'react';
import { DESIGN } from '../../data/design.js';
import { YOGA_STYLES } from '../../data/yoga.js';
import { Icon } from '../Icon';
import './ActivityCard.css';

const colors = DESIGN.sportColors.yoga;

export function YogaCard({ dayActivity, day, language, toast }) {
  const today = new Date().toISOString().split('T')[0];
  const session = dayActivity?.session;

  const [completed, setCompleted] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem(`yoga_${day}_${today}`) || '{}');
      return data.completed || false;
    } catch { return false; }
  });

  if (!session) return null;

  const styleName = YOGA_STYLES[session.style]?.[language]
    || YOGA_STYLES[session.style]?.['pt-BR']
    || session.style;
  const sessionName = session.name?.[language] || session.name?.['pt-BR'] || styleName;

  const handleComplete = () => {
    const newVal = !completed;
    setCompleted(newVal);
    localStorage.setItem(`yoga_${day}_${today}`, JSON.stringify({
      completed: newVal,
      date: today,
    }));
    if (newVal && toast) {
      toast.success(language === 'pt-BR' ? 'Yoga completo!' : 'Yoga complete!');
    }
  };

  return (
    <div className="activity-training-card" style={{ borderColor: colors.border }}>
      <div className="activity-training-card-header">
        <Icon name="moon-half-right-5" className="sport-icon" style={{ color: colors.primary }} />
        <span className="sport-name">{sessionName}</span>
        <span className="activity-training-card-badge" style={{ background: colors.bg, color: colors.primary }}>
          {styleName}
        </span>
      </div>

      <div className="activity-training-card-body">
        <div className="activity-training-card-field" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            {language === 'pt-BR' ? 'Estilo' : 'Style'}
          </span>
          <span className="activity-training-card-badge" style={{ background: colors.bg, color: colors.primary }}>
            {session.duration} min
          </span>
        </div>

        <ol className="yoga-poses" style={{ marginTop: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
          {session.poses?.map((pose) => (
            <li key={pose.id} className="yoga-pose">
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                {pose.name?.[language] || pose.name?.['pt-BR'] || pose.id}
              </span>
            </li>
          ))}
        </ol>

        {session.focus && (
          <div>
            <span
              className="yoga-focus-tag"
              style={{ background: colors.bg, color: colors.primary }}
            >
              {session.focus}
            </span>
          </div>
        )}

        <div className="activity-training-card-field" style={{ marginTop: 'var(--space-sm)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            {language === 'pt-BR' ? 'Duração' : 'Duration'}
          </span>
          <span style={{ fontWeight: 700, color: colors.primary }}>
            {session.duration} min
          </span>
        </div>
      </div>

      <div className="activity-training-card-actions">
        <button
          className={`activity-training-card-complete ${completed ? 'done' : ''}`}
          style={completed ? { borderColor: colors.primary, color: colors.primary } : {}}
          onClick={handleComplete}
        >
          <Icon name={completed ? 'checkmark-circle-1' : 'circle'} className="check-icon" />
          {completed
            ? (language === 'pt-BR' ? 'Completo' : 'Complete')
            : (language === 'pt-BR' ? 'Marcar Completo' : 'Mark Complete')
          }
        </button>
      </div>
    </div>
  );
}
