import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useLanguage } from '../../hooks/useLanguage';

export function MonthlyReport({ monthlyData, currentMonthCount, prevMonthCount, gymStats }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('workouts');

  const tabs = [
    { key: 'workouts', label: t('dashboard_workouts') },
    { key: 'duration', label: t('dashboard_duration') },
    { key: 'volume', label: t('dashboard_volume') },
    { key: 'sets', label: t('dashboard_sets') },
  ];

  const chartData = monthlyData.map(m => ({
    name: m.label,
    value: activeTab === 'workouts' ? m.workouts
      : activeTab === 'duration' ? m.workouts * 55 / 60
      : activeTab === 'volume' ? 0
      : 0,
  }));

  const workoutDelta = currentMonthCount - prevMonthCount;
  const durationCurrent = (currentMonthCount * 55 / 60).toFixed(1);
  const durationPrev = (prevMonthCount * 55 / 60).toFixed(1);
  const durationDelta = (durationCurrent - durationPrev).toFixed(1);

  const summaryCards = [
    { label: t('dashboard_workouts'), value: String(currentMonthCount), delta: workoutDelta, unit: '' },
    { label: t('dashboard_duration'), value: `~${durationCurrent}h`, delta: parseFloat(durationDelta), unit: 'h' },
    { label: t('dashboard_volume'), value: gymStats.totalVolume > 1000 ? `${(gymStats.totalVolume / 1000).toFixed(1)}k kg` : `${Math.round(gymStats.totalVolume)} kg`, delta: 0, unit: '' },
    { label: t('dashboard_sets'), value: String(gymStats.totalSets), delta: 0, unit: '' },
  ];

  return (
    <div className="dashboard-section">
      <h3 className="dashboard-section-title">{t('dashboard_monthly_report')}</h3>

      <div className="monthly-chart-container">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip contentStyle={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-default)', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="value" fill="var(--color-accent-primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="monthly-tabs">
        {tabs.map(tab => (
          <button key={tab.key} className={`monthly-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="monthly-summary-grid">
        {summaryCards.map((card, i) => (
          <div key={i} className="monthly-summary-card">
            <span className="monthly-summary-label">{card.label}</span>
            <span className="monthly-summary-value">{card.value}</span>
            {card.delta !== 0 && (
              <span className={`monthly-summary-delta ${card.delta > 0 ? 'positive' : 'negative'}`}>
                {card.delta > 0 ? '↑' : '↓'} {Math.abs(card.delta)}{card.unit}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
