import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useLanguage } from '../../hooks/useLanguage';

const MONTH_LABELS = {
  'pt-BR': ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

export function MonthlyReport({ trainingDays, gymStats }) {
  const { t, language } = useLanguage();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [activeTab, setActiveTab] = useState('workouts');

  const labels = MONTH_LABELS[language] || MONTH_LABELS.en;

  // Compute available years from training data
  const availableYears = useMemo(() => {
    const years = new Set();
    years.add(currentYear);
    trainingDays.forEach(d => {
      const y = parseInt(d.substring(0, 4));
      if (y) years.add(y);
    });
    return [...years].sort((a, b) => b - a);
  }, [trainingDays, currentYear]);

  // Compute monthly counts for selected year (Jan-Dec)
  const chartData = useMemo(() => {
    return labels.map((label, i) => {
      const yearMonth = `${selectedYear}-${String(i + 1).padStart(2, '0')}`;
      const count = trainingDays.filter(d => d.startsWith(yearMonth)).length;
      return {
        name: label,
        value: activeTab === 'workouts' ? count
          : activeTab === 'duration' ? parseFloat((count * 55 / 60).toFixed(1))
          : 0,
      };
    });
  }, [trainingDays, selectedYear, activeTab, labels]);

  // Year totals for summary
  const yearTotal = useMemo(() => {
    const prefix = `${selectedYear}-`;
    return trainingDays.filter(d => d.startsWith(prefix)).length;
  }, [trainingDays, selectedYear]);

  const prevYearTotal = useMemo(() => {
    const prefix = `${selectedYear - 1}-`;
    return trainingDays.filter(d => d.startsWith(prefix)).length;
  }, [trainingDays, selectedYear]);

  // Current month stats (only relevant if viewing current year)
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthCount = trainingDays.filter(d => d.startsWith(currentMonthKey)).length;
  const prevMonthCount = trainingDays.filter(d => d.startsWith(prevMonthKey)).length;

  const workoutDelta = currentMonthCount - prevMonthCount;
  const durationCurrent = (currentMonthCount * 55 / 60).toFixed(1);
  const durationPrev = (prevMonthCount * 55 / 60).toFixed(1);
  const durationDelta = (durationCurrent - durationPrev).toFixed(1);

  const tabs = [
    { key: 'workouts', label: t('dashboard_workouts') },
    { key: 'duration', label: t('dashboard_duration') },
    { key: 'volume', label: t('dashboard_volume') },
    { key: 'sets', label: t('dashboard_sets') },
  ];

  const summaryCards = [
    { label: t('dashboard_workouts'), value: String(currentMonthCount), delta: workoutDelta, unit: '' },
    { label: t('dashboard_duration'), value: `~${durationCurrent}h`, delta: parseFloat(durationDelta), unit: 'h' },
    { label: t('dashboard_volume'), value: gymStats.totalVolume > 1000 ? `${(gymStats.totalVolume / 1000).toFixed(1)}k kg` : `${Math.round(gymStats.totalVolume)} kg`, delta: 0, unit: '' },
    { label: t('dashboard_sets'), value: String(gymStats.totalSets), delta: 0, unit: '' },
  ];

  const canGoNext = selectedYear < currentYear;

  return (
    <div className="dashboard-section">
      <div className="monthly-header-row">
        <h3 className="dashboard-section-title">{t('dashboard_monthly_report')}</h3>
        <div className="year-selector">
          <button className="year-nav-btn" onClick={() => setSelectedYear(y => y - 1)}>‹</button>
          <span className="year-label">{selectedYear}</span>
          <button className="year-nav-btn" onClick={() => setSelectedYear(y => y + 1)} disabled={!canGoNext}>›</button>
        </div>
      </div>

      <div className="monthly-chart-container">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
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
