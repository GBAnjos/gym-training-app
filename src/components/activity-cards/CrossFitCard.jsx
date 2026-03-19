import { useState } from 'react';
import { getCrossFitMovementName } from '../../data/crossfit.js';
import { DESIGN } from '../../data/design.js';
import { Icon } from '../Icon';
import './ActivityCard.css';

const colors = DESIGN.sportColors.crossfit;

export function CrossFitCard({ dayActivity, day, language, toast }) {
  const today = new Date().toISOString().split('T')[0];
  const storageKey = `crossfit_${day}_${today}`;

  const [state, setState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '{}');
    } catch { return {}; }
  });

  const save = (updates) => {
    const newState = { ...state, ...updates };
    setState(newState);
    localStorage.setItem(storageKey, JSON.stringify(newState));
  };

  const session = dayActivity?.session;
  if (!session) return null;

  const wodTypeName = session.type?.toUpperCase() || 'WOD';
  const wodName = session.name?.[language] || session.name?.['pt-BR'] || 'WOD';
  const rounds = state.rounds || 0;
  const completed = state.completed || false;

  return (
    <div className="activity-training-card" style={{ borderColor: colors.border }}>
      <div className="activity-training-card-header">
        <Icon name="fire-1" className="sport-icon" style={{ color: colors.primary }} />
        <span className="sport-name">{wodName}</span>
        <span className="activity-training-card-badge" style={{ background: colors.bg, color: colors.primary }}>
          {wodTypeName}
        </span>
      </div>

      <div className="activity-training-card-body">
        {/* Timer cap */}
        <div className="crossfit-timer">
          <Icon name="timer-1" />
          <span>{language === 'pt-BR' ? 'Tempo' : 'Time Cap'}:</span>
          <span className="timer-value">{session.timeCap} min</span>
        </div>

        {/* Movement list */}
        <ul className="crossfit-movements">
          {session.movements?.map((mov, i) => (
            <li key={i} className="crossfit-movement">
              <span className="crossfit-movement-name">
                {getCrossFitMovementName(mov.id, language)}
              </span>
              <span className="crossfit-movement-reps">{mov.reps}</span>
            </li>
          ))}
        </ul>

        {/* Round counter (for AMRAP/EMOM) */}
        {(session.type === 'amrap' || session.type === 'emom') && (
          <div className="crossfit-round-counter">
            <button onClick={() => save({ rounds: Math.max(0, rounds - 1) })}>-</button>
            <span className="round-value" style={{ color: colors.primary }}>{rounds}</span>
            <button onClick={() => save({ rounds: rounds + 1 })}>+</button>
          </div>
        )}

        {/* Score input (for fortime) */}
        {session.type === 'fortime' && (
          <div className="activity-training-card-field">
            <label>{language === 'pt-BR' ? 'Tempo final' : 'Final time'}</label>
            <input
              type="text"
              placeholder="00:00"
              value={state.score || ''}
              onChange={e => save({ score: e.target.value })}
            />
          </div>
        )}
      </div>

      <div className="activity-training-card-actions">
        <button
          className={`activity-training-card-complete ${completed ? 'done' : ''}`}
          style={completed ? { borderColor: colors.primary, color: colors.primary } : {}}
          onClick={() => {
            save({ completed: !completed, date: today });
            if (!completed && toast) {
              toast.success(language === 'pt-BR' ? 'WOD completo!' : 'WOD complete!');
            }
          }}
        >
          <Icon name={completed ? 'checkmark-circle-1' : 'circle'} className="check-icon" />
          {completed
            ? (language === 'pt-BR' ? 'Completo' : 'Complete')
            : (language === 'pt-BR' ? 'Marcar completo' : 'Mark complete')
          }
        </button>
      </div>
    </div>
  );
}
