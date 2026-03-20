import { useState } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../../hooks/useLanguage';
import { BodySilhouette } from './BodySilhouette';

const GROUP_LABELS = {
  'pt-BR': { Chest: 'Peito', Back: 'Costas', Shoulders: 'Ombros', Arms: 'Braços', Legs: 'Pernas', Core: 'Core' },
  'en': { Chest: 'Chest', Back: 'Back', Shoulders: 'Shoulders', Arms: 'Arms', Legs: 'Legs', Core: 'Core' },
};

export function MuscleDistribution({ muscleSets }) {
  const { t, language } = useLanguage();
  const [period, setPeriod] = useState('30');

  const labels = GROUP_LABELS[language] || GROUP_LABELS['en'];
  const groups = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'];
  const maxSets = Math.max(...groups.map(g => muscleSets[g] || 0), 1);

  const radarData = groups.map(g => ({
    subject: labels[g],
    current: muscleSets[g] || 0,
    fullMark: maxSets,
  }));

  const sortedGroups = [...groups].sort((a, b) => (muscleSets[b] || 0) - (muscleSets[a] || 0));

  const periods = [
    { key: '7', label: t('dashboard_last_7_days') },
    { key: '30', label: t('dashboard_last_30_days') },
    { key: '90', label: t('dashboard_last_90_days') },
  ];

  return (
    <div className="dashboard-section">
      <div className="muscle-header">
        <h3 className="dashboard-section-title">{t('dashboard_muscle_distribution')}</h3>
        <select className="muscle-period-select" value={period} onChange={(e) => setPeriod(e.target.value)}>
          {periods.map(p => (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
        </select>
      </div>

      <div className="muscle-radar-container">
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="var(--color-border-default)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} />
            <Radar name={t('dashboard_current')} dataKey="current" stroke="var(--color-accent-primary)" fill="var(--color-accent-primary)" fillOpacity={0.2} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="muscle-heatmap">
        <BodySilhouette muscleSets={muscleSets} view="front" maxSets={maxSets} />
        <BodySilhouette muscleSets={muscleSets} view="back" maxSets={maxSets} />
      </div>

      <div className="muscle-table">
        {sortedGroups.map(group => (
          <div key={group} className="muscle-table-row">
            <span className="muscle-table-name">{labels[group]}</span>
            <span className="muscle-table-count">{muscleSets[group] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
