import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useLanguage } from '../../hooks/useLanguage';
import { useProgress } from '../../hooks/useProgress';
import { BottomSheet } from '../BottomSheet';
import { useToast } from '../Toast';

export function BodyComposition({ profile }) {
  const { t, language } = useLanguage();
  const toast = useToast();
  const {
    weightLog, addWeight, mode, toggleMode,
    addBodyCompEntry, latestEntry, measurementDeltas, bodyFatHistory
  } = useProgress();

  const [metricTab, setMetricTab] = useState('weight');
  const [rangeTab, setRangeTab] = useState('6m');
  const [showLogSheet, setShowLogSheet] = useState(false);
  const [formData, setFormData] = useState({
    weight: '', bodyFat: '', braco: '', cintura: '', peito: '', coxa: ''
  });

  // Filter data by range
  const getRangeMonths = () => ({ '3m': 3, '6m': 6, '1y': 12 }[rangeTab] || 6);
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - getRangeMonths());
  const cutoff = cutoffDate.toISOString().split('T')[0];

  const weightData = weightLog
    .filter(e => e.date >= cutoff)
    .map(e => ({ date: e.date.slice(5), value: parseFloat(e.weight) }));

  const fatData = bodyFatHistory
    .filter(e => e.date >= cutoff)
    .map(e => ({ date: e.date.slice(5), value: e.value }));

  const chartData = metricTab === 'weight' ? weightData : fatData;
  const chartColor = metricTab === 'weight' ? 'var(--color-accent-primary)' : 'var(--color-accent-secondary)';

  // Current values and deltas
  const currentWeight = latestEntry?.weight || profile.currentWeight || '--';
  const currentFat = latestEntry?.bodyFat || '--';
  const prevWeight = weightLog.length >= 2 ? parseFloat(weightLog[weightLog.length - 2]?.weight) : null;
  const weightDelta = prevWeight && currentWeight !== '--' ? (parseFloat(currentWeight) - prevWeight).toFixed(1) : null;

  // Goal progress
  const goalDiff = Math.abs(profile.targetWeight - profile.currentWeight);
  const goalProgress = profile.currentWeight && profile.targetWeight && goalDiff > 0
    ? Math.min(100, Math.max(0, Math.round(
        Math.abs(parseFloat(currentWeight) - profile.currentWeight) / goalDiff * 100
      ))) : null;

  // Delta color based on goal
  const getDeltaClass = (delta) => {
    if (!delta || delta === 0) return '';
    if (profile.goal === 'weight_loss') return delta < 0 ? 'positive' : 'negative';
    if (profile.goal === 'muscle_gain') return delta > 0 ? 'positive' : 'negative';
    return '';
  };

  // Measurement cards
  const measurements = latestEntry?.measurements || {};
  const measurementKeys = [
    { key: 'braco', label: language === 'pt-BR' ? 'Braço' : 'Arm' },
    { key: 'cintura', label: language === 'pt-BR' ? 'Cintura' : 'Waist' },
    { key: 'peito', label: language === 'pt-BR' ? 'Peito' : 'Chest' },
    { key: 'coxa', label: language === 'pt-BR' ? 'Coxa' : 'Thigh' },
  ];

  const handleSubmit = () => {
    const weight = parseFloat(formData.weight);
    if (!weight || weight <= 0) return;

    if (mode === 'advanced') {
      addBodyCompEntry({
        weight,
        bodyFat: parseFloat(formData.bodyFat) || null,
        measurements: {
          braco: parseFloat(formData.braco) || null,
          cintura: parseFloat(formData.cintura) || null,
          peito: parseFloat(formData.peito) || null,
          coxa: parseFloat(formData.coxa) || null,
        }
      });
    } else {
      addWeight(weight);
    }

    setFormData({ weight: '', bodyFat: '', braco: '', cintura: '', peito: '', coxa: '' });
    setShowLogSheet(false);
    toast.success(language === 'pt-BR' ? 'Medida registrada!' : 'Measurement logged!');
  };

  return (
    <div className="dashboard-section">
      <h3 className="dashboard-section-title">{t('dashboard_body')}</h3>

      {/* Highlight cards */}
      <div className="body-highlights">
        <div className="body-highlight-card">
          <span className="body-highlight-value">{currentWeight}{currentWeight !== '--' ? ' kg' : ''}</span>
          {weightDelta && (
            <span className={`body-highlight-delta ${getDeltaClass(parseFloat(weightDelta))}`}>
              {parseFloat(weightDelta) > 0 ? '↑' : '↓'} {Math.abs(parseFloat(weightDelta))}
            </span>
          )}
          <span className="body-highlight-label">{t('dashboard_weight').toLowerCase()}</span>
        </div>
        <div className="body-highlight-card">
          <span className="body-highlight-value">{currentFat}{currentFat !== '--' ? '%' : ''}</span>
          <span className="body-highlight-label">{t('dashboard_body_fat').toLowerCase()}</span>
        </div>
      </div>

      {/* Goal progress bar */}
      {goalProgress !== null && (
        <div className="body-goal-bar">
          <div className="body-goal-labels">
            <span>{profile.currentWeight}kg</span>
            <span>{goalProgress}% {t('dashboard_to_goal')}</span>
            <span>{profile.targetWeight}kg</span>
          </div>
          <div className="body-goal-track">
            <div className="body-goal-fill" style={{ width: `${goalProgress}%` }} />
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="body-chart-card">
          <div className="body-chart-tabs">
            <button className={`monthly-tab ${metricTab === 'weight' ? 'active' : ''}`} onClick={() => setMetricTab('weight')}>
              {t('dashboard_weight')}
            </button>
            <button className={`monthly-tab ${metricTab === 'fat' ? 'active' : ''}`} onClick={() => setMetricTab('fat')}>
              {t('dashboard_body_fat')}
            </button>
            <span className="body-chart-spacer" />
            {['3m', '6m', '1y'].map(r => (
              <button key={r} className={`monthly-tab ${rangeTab === r ? 'active' : ''}`} onClick={() => setRangeTab(r)}>
                {t(`dashboard_${r}`)}
              </button>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="bodyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={35} domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip contentStyle={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-default)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="value" stroke={chartColor} fill="url(#bodyGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Measurement cards (advanced mode only) */}
      {mode === 'advanced' && (
        <div className="body-measurements">
          {measurementKeys.map(({ key, label }) => {
            const value = measurements[key];
            const delta = measurementDeltas?.[key];
            return (
              <div key={key} className="body-measurement-card">
                <span className="body-measurement-label">{label}</span>
                <span className="body-measurement-value">{value ? `${value}cm` : '--'}</span>
                {delta && delta !== 0 && (
                  <span className={`body-measurement-delta ${delta > 0 ? 'positive' : 'negative'}`}>
                    {delta > 0 ? '+' : ''}{delta}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Log button */}
      <button className="body-log-btn" onClick={() => setShowLogSheet(true)}>
        + {t('dashboard_log_measurement')}
      </button>

      {/* Log measurement bottom sheet */}
      <BottomSheet isOpen={showLogSheet} onClose={() => setShowLogSheet(false)} title={t('dashboard_log_measurement')}>
        <div className="body-log-form">
          <div className="body-log-field">
            <label>{t('dashboard_weight')} (kg)</label>
            <input
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              placeholder="0.0"
            />
          </div>

          {mode === 'advanced' && (
            <>
              <div className="body-log-field">
                <label>{t('dashboard_body_fat')} (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.bodyFat}
                  onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value })}
                  placeholder="0.0"
                />
              </div>
              {measurementKeys.map(({ key, label }) => (
                <div key={key} className="body-log-field">
                  <label>{label} (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    placeholder="0.0"
                  />
                </div>
              ))}
            </>
          )}

          <button className="body-log-submit" onClick={handleSubmit}>
            {t('continue')}
          </button>

          <button className="body-mode-toggle" onClick={toggleMode}>
            {mode === 'basic' ? t('progress_mode_advanced') : t('progress_mode_basic')}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
