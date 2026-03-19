import { useState } from 'react';
import { DESIGN } from '../../data/design.js';
import { RUN_TYPES } from '../../data/running.js';
import { Icon } from '../Icon';
import './ActivityCard.css';

const colors = DESIGN.sportColors.running;

const ZONE_COLORS = {
  1: '#82dcb4',
  2: '#60c8f0',
  3: '#ffc832',
  4: '#ff9432',
  5: '#ff4f4f',
};

function formatPace(durationMin, distanceKm) {
  if (!distanceKm || distanceKm <= 0 || !durationMin || durationMin <= 0) return '--\'--"';
  const paceDecimal = durationMin / distanceKm;
  const minutes = Math.floor(paceDecimal);
  const seconds = Math.round((paceDecimal - minutes) * 60);
  return `${minutes}'${String(seconds).padStart(2, '0')}"`;
}

export function RunCard({ dayActivity, day, language, toast }) {
  const today = new Date().toISOString().split('T')[0];
  const session = dayActivity?.session;

  const [distance, setDistance] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem(`run_${day}_${today}`) || '{}');
      return data.distance || '';
    } catch { return ''; }
  });

  const [duration, setDuration] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem(`run_${day}_${today}`) || '{}');
      return data.duration || '';
    } catch { return ''; }
  });

  const [completed, setCompleted] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem(`run_${day}_${today}`) || '{}');
      return data.completed || false;
    } catch { return false; }
  });

  if (!session) return null;

  const runTypeName = RUN_TYPES[session.type]?.[language]
    || RUN_TYPES[session.type]?.['pt-BR']
    || session.type;
  const sessionName = session.name?.[language] || session.name?.['pt-BR'] || runTypeName;
  const pace = formatPace(parseFloat(duration), parseFloat(distance));

  const saveToStorage = (newDistance, newDuration, newCompleted) => {
    const paceCalc = formatPace(parseFloat(newDuration), parseFloat(newDistance));
    localStorage.setItem(`run_${day}_${today}`, JSON.stringify({
      distance: newDistance,
      duration: newDuration,
      pace: paceCalc,
      zone: session.zone,
      completed: newCompleted,
      date: today,
    }));
  };

  const handleDistanceChange = (e) => {
    const val = e.target.value;
    setDistance(val);
    saveToStorage(val, duration, completed);
  };

  const handleDurationChange = (e) => {
    const val = e.target.value;
    setDuration(val);
    saveToStorage(distance, val, completed);
  };

  const handleComplete = () => {
    const newVal = !completed;
    setCompleted(newVal);
    saveToStorage(distance, duration, newVal);
    if (newVal && toast) {
      toast.success(language === 'pt-BR' ? 'Corrida completa!' : 'Run complete!');
    }
  };

  return (
    <div className="activity-training-card" style={{ borderColor: colors.border }}>
      <div className="activity-training-card-header">
        <Icon name="direction-1" className="sport-icon" style={{ color: colors.primary }} />
        <span className="sport-name">{sessionName}</span>
        <span className="activity-training-card-badge" style={{ background: colors.bg, color: colors.primary }}>
          {runTypeName}
        </span>
      </div>

      <div className="activity-training-card-body">
        <div className="activity-training-card-field">
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            {language === 'pt-BR' ? 'Distância alvo' : 'Target Distance'}
          </span>
          <span className="activity-training-card-badge" style={{ background: colors.bg, color: colors.primary }}>
            {session.distance}
          </span>
        </div>

        <div className="run-inputs">
          <div className="run-input-group">
            <label>{language === 'pt-BR' ? 'Distância (km)' : 'Distance (km)'}</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={distance}
              onChange={handleDistanceChange}
              placeholder="0.0"
            />
          </div>
          <div className="run-input-group">
            <label>{language === 'pt-BR' ? 'Duração (min)' : 'Duration (min)'}</label>
            <input
              type="number"
              min="0"
              step="1"
              value={duration}
              onChange={handleDurationChange}
              placeholder="0"
            />
          </div>
        </div>

        <div className="run-pace">
          <Icon name="stopwatch" style={{ color: colors.primary }} />
          <span className="run-pace-value" style={{ color: colors.primary }}>{pace}</span>
          <span className="run-pace-unit">min/km</span>
        </div>

        <div className="run-zones">
          {[1, 2, 3, 4, 5].map((zone) => {
            const isActive = zone === session.zone;
            return (
              <div
                key={zone}
                className={`run-zone ${isActive ? 'active' : ''}`}
                style={isActive ? {
                  background: ZONE_COLORS[zone],
                  borderColor: ZONE_COLORS[zone],
                  color: '#1a1a2e',
                } : {}}
              >
                Z{zone}
              </div>
            );
          })}
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
