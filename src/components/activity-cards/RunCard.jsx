import { useState } from 'react';
import { DESIGN } from '../../data/design.js';
import { RUN_TYPES, ZONE_INFO } from '../../data/running.js';
import { Icon } from '../Icon';
import './ActivityCard.css';

const colors = DESIGN.sportColors.running;


function formatPace(durationMin, distanceKm) {
  if (!distanceKm || distanceKm <= 0 || !durationMin || durationMin <= 0) return '--\'--"';
  const paceDecimal = durationMin / distanceKm;
  const minutes = Math.floor(paceDecimal);
  const seconds = Math.round((paceDecimal - minutes) * 60);
  return `${minutes}'${String(seconds).padStart(2, '0')}"`;
}

// Parse a distance string like "5K" or "10K" into a number
function parseDistanceKm(distanceStr) {
  if (!distanceStr) return null;
  const match = String(distanceStr).match(/([\d.]+)\s*[Kk]/);
  if (match) return parseFloat(match[1]);
  const num = parseFloat(distanceStr);
  return isNaN(num) ? null : num;
}

// Derive phases from session data
function derivePhases(session, language) {
  const zoneInfo = ZONE_INFO.find(z => z.zone === session?.zone) || ZONE_INFO[1];
  const zoneLabel = zoneInfo.label;
  const distanceKm = parseDistanceKm(session?.distance);
  const warmupLabel = language === 'pt-BR' ? 'Aquecimento' : 'Warm-up';
  const mainLabel = language === 'pt-BR' ? 'Principal' : 'Main';
  const cooldownLabel = language === 'pt-BR' ? 'Volta à calma' : 'Cool-down';

  if (session?.type === 'intervals') {
    return [
      { name: warmupLabel, detail: '10 min · Z1', isMain: false },
      { name: mainLabel, detail: session?.targetPace?.[language] || session?.targetPace?.['pt-BR'] || `${session?.distance} · ${zoneLabel}`, isMain: true },
      { name: cooldownLabel, detail: '10 min · Z1', isMain: false },
    ];
  }

  const warmupDist = distanceKm ? `${(distanceKm * 0.1).toFixed(1)} km` : '10%';
  const mainDist = distanceKm ? `${(distanceKm * 0.8).toFixed(1)} km` : '80%';
  const cooldownDist = distanceKm ? `${(distanceKm * 0.1).toFixed(1)} km` : '10%';

  return [
    { name: warmupLabel, detail: `${warmupDist} · Z1`, isMain: false },
    { name: mainLabel, detail: `${mainDist} · ${zoneLabel}`, isMain: true },
    { name: cooldownLabel, detail: `${cooldownDist} · Z1`, isMain: false },
  ];
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

  const [showZones, setShowZones] = useState(false);

  if (!session) return null;

  const runTypeName = RUN_TYPES[session.type]?.[language]
    || RUN_TYPES[session.type]?.['pt-BR']
    || session.type;
  const sessionName = session.name?.[language] || session.name?.['pt-BR'] || runTypeName;
  const pace = formatPace(parseFloat(duration), parseFloat(distance));

  // Zone info for color
  const zoneInfo = ZONE_INFO.find(z => z.zone === session.zone) || ZONE_INFO[1];
  const zoneColor = zoneInfo.color;
  const zoneName = zoneInfo.name[language] || zoneInfo.name['en'];

  // Distance progress
  const targetDistanceKm = parseDistanceKm(session.distance);
  const enteredDistance = parseFloat(distance) || 0;
  const distanceProgress = targetDistanceKm && enteredDistance > 0
    ? Math.min(100, (enteredDistance / targetDistanceKm) * 100)
    : 0;

  // Phases
  const phases = derivePhases(session, language);

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

        {/* Session Summary Header */}
        <div className="run-session-summary">
          <div className="run-summary-goal">
            <span className="run-summary-distance">{session.distance}</span>
            <span
              className="run-summary-zone-badge"
              style={{ background: zoneColor + '22', color: zoneColor, border: `1px solid ${zoneColor}55` }}
            >
              {zoneInfo.label} · {zoneName}
            </span>
          </div>
          <p className="run-summary-desc">
            {zoneInfo.description[language] || zoneInfo.description['en']}
          </p>
          {session.targetPace?.[language] && (
            <p className="run-summary-pace-hint">{session.targetPace[language]}</p>
          )}
        </div>

        {/* Workout Phases Breakdown */}
        <div className="run-phases">
          {phases.map((phase, i) => (
            <div key={i} className={`run-phase${phase.isMain ? ' main' : ''}`}>
              <span className="run-phase-name">{phase.name}</span>
              <span className="run-phase-detail">{phase.detail}</span>
            </div>
          ))}
        </div>

        {/* Distance Progress Bar */}
        {targetDistanceKm && (
          <div className="run-distance-progress">
            <div className="run-distance-progress-info">
              <span className="run-distance-label">
                {language === 'pt-BR' ? 'Distância' : 'Distance'}
              </span>
              <span className="run-distance-value" style={{ color: distanceProgress > 0 ? colors.primary : 'var(--color-text-muted)' }}>
                {enteredDistance > 0 ? `${enteredDistance.toFixed(1)} / ${targetDistanceKm} km` : `— / ${targetDistanceKm} km`}
              </span>
            </div>
            <div className="run-distance-bar">
              <div
                className="run-distance-fill"
                style={{ width: `${distanceProgress}%`, background: zoneColor }}
              />
            </div>
          </div>
        )}

        {/* Pace/Distance Inputs */}
        <div className="run-inputs run-inputs-prominent">
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

        {/* Zone badges with ZONE_INFO colors */}
        <div className="run-zone-badges">
          {ZONE_INFO.map(z => (
            <span
              key={z.zone}
              className={`run-zone-badge ${session.zone === z.zone ? 'active' : ''}`}
              style={session.zone === z.zone
                ? { background: z.color + '33', border: `1px solid ${z.color}`, color: z.color }
                : { background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-muted)' }
              }
            >
              {z.label}{session.zone === z.zone ? ' \u2713' : ''}
            </span>
          ))}
        </div>

        {/* Zone explainer - collapsible */}
        <button
          type="button"
          className="zone-explainer-toggle"
          onClick={() => setShowZones(!showZones)}
        >
          <span>{'\u2139'} {language === 'pt-BR' ? 'O que são zonas de treino?' : 'What are training zones?'}</span>
          <span className={`zone-toggle-arrow ${showZones ? 'open' : ''}`}>{'\u25BC'}</span>
        </button>
        {showZones && (
          <div className="zone-explainer-content">
            {ZONE_INFO.map(z => (
              <div key={z.zone} className="zone-explainer-row">
                <span className="zone-explainer-badge" style={{ background: z.color }}>
                  {z.label}
                </span>
                <div className="zone-explainer-info">
                  <span className="zone-explainer-name">{z.name[language] || z.name['en']}</span>
                  <span className="zone-explainer-hr">{z.hr} {language === 'pt-BR' ? 'FC máx' : 'HR max'}</span>
                  <span className="zone-explainer-desc">{z.description[language] || z.description['en']}</span>
                </div>
              </div>
            ))}
          </div>
        )}
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
