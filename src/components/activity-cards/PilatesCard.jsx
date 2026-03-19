import { useState } from 'react';
import { DESIGN } from '../../data/design.js';
import { getPilatesMovementName } from '../../data/pilates.js';
import { Icon } from '../Icon';
import './ActivityCard.css';

const colors = DESIGN.sportColors.pilates;

export function PilatesCard({ dayActivity, day, language, toast }) {
  const today = new Date().toISOString().split('T')[0];
  const session = dayActivity?.session;

  const [completed, setCompleted] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem(`pilates_${day}_${today}`) || '{}');
      return data.completed || false;
    } catch { return false; }
  });

  if (!session) return null;

  const flowName = session.name?.[language] || session.name?.['pt-BR'] || 'Pilates';

  const handleComplete = () => {
    const newVal = !completed;
    setCompleted(newVal);
    localStorage.setItem(`pilates_${day}_${today}`, JSON.stringify({
      completed: newVal,
      date: today,
    }));
    if (newVal && toast) {
      toast.success(language === 'pt-BR' ? 'Pilates completo!' : 'Pilates complete!');
    }
  };

  return (
    <div className="activity-training-card" style={{ borderColor: colors.border }}>
      <div className="activity-training-card-header">
        <Icon name="heart" className="sport-icon" style={{ color: colors.primary }} />
        <span className="sport-name">{flowName}</span>
        <span className="activity-training-card-badge" style={{ background: colors.bg, color: colors.primary }}>
          Pilates
        </span>
      </div>

      <div className="activity-training-card-body">
        <div className="activity-training-card-field" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            {language === 'pt-BR' ? 'Fluxo' : 'Flow'}
          </span>
          <span className="activity-training-card-badge" style={{ background: colors.bg, color: colors.primary }}>
            {session.duration} min
          </span>
        </div>

        <ol className="pilates-movements" style={{ marginTop: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
          {session.movements?.map((movementId) => (
            <li key={movementId} className="pilates-movement">
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                {getPilatesMovementName(movementId, language)}
              </span>
            </li>
          ))}
        </ol>

        {session.focus && (
          <div>
            <span
              className="pilates-focus-tag"
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
