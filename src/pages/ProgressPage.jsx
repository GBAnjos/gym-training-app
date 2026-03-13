import { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../components/Toast';
import { BottomSheet } from '../components/BottomSheet';
import { Icon } from '../components/Icon';
import './ProgressPage.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Motivational messages
const MOTIVATIONAL_MESSAGES = [
  'progress_motivational_1',
  'progress_motivational_2',
  'progress_motivational_3',
  'progress_motivational_4',
  'progress_motivational_5',
];

export function ProgressPage() {
  const { t, language } = useLanguage();
  const toast = useToast();
  const {
    weightLog,
    addWeight,
    currentWeight,
    startWeight,
    targetWeight,
    progress,
    mode,
    toggleMode,
    addBodyCompEntry,
    latestEntry,
    measurementDeltas,
    bodyFatHistory
  } = useProgress();

  const [showEntrySheet, setShowEntrySheet] = useState(false);
  const [entryForm, setEntryForm] = useState({
    weight: '',
    bodyFat: '',
    braco: '',
    cintura: '',
    peito: '',
    coxa: ''
  });

  // Calculate stats
  const trainingDays = JSON.parse(localStorage.getItem('training_days') || '[]');
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  thisWeekStart.setHours(0, 0, 0, 0);

  const thisWeekCount = trainingDays.filter(d => new Date(d) >= thisWeekStart).length;

  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  thisMonthStart.setHours(0, 0, 0, 0);
  const thisMonthCount = trainingDays.filter(d => new Date(d) >= thisMonthStart).length;

  // Calculate streak
  const calculateStreak = () => {
    if (trainingDays.length === 0) return 0;

    const sorted = [...trainingDays].sort((a, b) => new Date(b) - new Date(a));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let checkDate = new Date(today);

    for (const dateStr of sorted) {
      const workoutDate = new Date(dateStr);
      workoutDate.setHours(0, 0, 0, 0);

      if (workoutDate.getTime() === checkDate.getTime()) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (workoutDate.getTime() < checkDate.getTime()) {
        break;
      }
    }

    return streak;
  };

  const streak = calculateStreak();

  // Get random motivational message
  const motivationalMessage = useMemo(() => {
    const idx = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length);
    return MOTIVATIONAL_MESSAGES[idx];
  }, []);

  const handleSubmitEntry = () => {
    if (!entryForm.weight && !entryForm.bodyFat && !entryForm.braco) {
      return;
    }

    if (mode === 'basic') {
      if (entryForm.weight) {
        addWeight(entryForm.weight);
        toast.success(t(motivationalMessage));
      }
    } else {
      addBodyCompEntry(entryForm);
      toast.success(t(motivationalMessage));
    }

    setEntryForm({ weight: '', bodyFat: '', braco: '', cintura: '', peito: '', coxa: '' });
    setShowEntrySheet(false);

    if (navigator.vibrate) navigator.vibrate(50);
  };

  // Weight Chart data
  const weightChartData = {
    labels: weightLog.map(entry => {
      const d = new Date(entry.date);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    }),
    datasets: [
      {
        label: language === 'pt-BR' ? 'Peso (kg)' : 'Weight (kg)',
        data: weightLog.map(entry => entry.weight),
        borderColor: '#c8f55a',
        backgroundColor: 'rgba(200, 245, 90, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: '#c8f55a',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  // Body fat chart data
  const bodyFatChartData = {
    labels: bodyFatHistory.map(entry => {
      const d = new Date(entry.date);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    }),
    datasets: [
      {
        label: language === 'pt-BR' ? 'Gordura (%)' : 'Body Fat (%)',
        data: bodyFatHistory.map(entry => entry.value),
        borderColor: '#6bcfff',
        backgroundColor: 'rgba(107, 207, 255, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: '#6bcfff',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  // Dynamic chart range based on user's weights
  const minWeight = Math.min(startWeight, targetWeight, ...weightLog.map(e => e.weight)) - 2;
  const maxWeight = Math.max(startWeight, targetWeight, ...weightLog.map(e => e.weight)) + 2;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        min: Math.floor(minWeight),
        max: Math.ceil(maxWeight),
        ticks: { color: '#999' },
        grid: { color: '#222' },
      },
      x: {
        ticks: { color: '#999' },
        grid: { display: false },
      },
    },
  };

  const bodyFatChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        min: 0,
        max: 40,
        ticks: { color: '#999' },
        grid: { color: '#222' },
      },
      x: {
        ticks: { color: '#999' },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="progress-page">
      {/* Header with Mode Toggle */}
      <div className="progress-header">
        <h2 className="progress-title">
          {language === 'pt-BR' ? 'Progresso' : 'Progress'}
        </h2>
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'basic' ? 'active' : ''}`}
            onClick={() => mode !== 'basic' && toggleMode()}
          >
            {t('progress_mode_basic')}
          </button>
          <button
            className={`mode-btn ${mode === 'advanced' ? 'active' : ''}`}
            onClick={() => mode !== 'advanced' && toggleMode()}
          >
            {t('progress_mode_advanced')}
          </button>
        </div>
      </div>

      {/* Weight Goal Progress */}
      <div className="goal-section">
        <div className="goal-header">
          <Icon name="target-4" className="goal-icon" />
          <div className="goal-info">
            <span className="goal-label">
              {language === 'pt-BR' ? 'Meta de Peso' : 'Weight Goal'}
            </span>
            <span className="goal-range">{startWeight}kg → {targetWeight}kg</span>
          </div>
        </div>
        <div className="goal-progress-bar">
          <div className="goal-fill" style={{ width: `${Math.min(progress, 100)}%` }}>
            <span className="goal-current">{currentWeight}kg</span>
          </div>
        </div>
        <div className="goal-markers">
          <span>{startWeight}kg</span>
          <span>{targetWeight}kg</span>
        </div>
      </div>

      {/* Educational Card (Advanced Mode) */}
      {mode === 'advanced' && (
        <div className="recomp-card">
          <div className="recomp-icon">
            <Icon name="information-circle-1" />
          </div>
          <div className="recomp-content">
            <h4>{t('progress_recomp_title')}</h4>
            <p>{t('progress_recomp_desc')}</p>
          </div>
        </div>
      )}

      {/* Add Entry Button */}
      <button className="add-weight-btn" onClick={() => setShowEntrySheet(true)}>
        <Icon name="add-item" />
        <span>{t('progress_add_entry')}</span>
      </button>

      {/* Measurements Cards (Advanced Mode) */}
      {mode === 'advanced' && latestEntry && (
        <div className="measurements-section">
          <h3>{t('progress_measurements')}</h3>
          <div className="measurements-grid">
            <MeasurementCard
              label={t('progress_body_fat')}
              value={latestEntry.bodyFat}
              delta={measurementDeltas?.bodyFat}
              unit="%"
              icon="fire-1"
              inverted
            />
            <MeasurementCard
              label={t('progress_arm')}
              value={latestEntry.measurements?.braco}
              delta={measurementDeltas?.braco}
              unit="cm"
              icon="dumbbell-1"
            />
            <MeasurementCard
              label={t('progress_waist')}
              value={latestEntry.measurements?.cintura}
              delta={measurementDeltas?.cintura}
              unit="cm"
              icon="target-4"
              inverted
            />
            <MeasurementCard
              label={t('progress_chest')}
              value={latestEntry.measurements?.peito}
              delta={measurementDeltas?.peito}
              unit="cm"
              icon="heart"
            />
            <MeasurementCard
              label={t('progress_thigh')}
              value={latestEntry.measurements?.coxa}
              delta={measurementDeltas?.coxa}
              unit="cm"
              icon="bolt-alt"
            />
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{trainingDays.length}</span>
          <span className="stat-label">
            {language === 'pt-BR' ? 'Total Treinos' : 'Total Workouts'}
          </span>
        </div>
        <div className="stat-card accent">
          <span className="stat-value">{streak}</span>
          <span className="stat-label">
            <Icon name="fire-1" /> Streak
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{thisWeekCount}</span>
          <span className="stat-label">
            {language === 'pt-BR' ? 'Esta Semana' : 'This Week'}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{thisMonthCount}</span>
          <span className="stat-label">
            {language === 'pt-BR' ? 'Este Mês' : 'This Month'}
          </span>
        </div>
      </div>

      {/* Weight Chart */}
      {weightLog.length > 0 && (
        <div className="chart-section">
          <h3>{t('progress_weight_chart')}</h3>
          <div className="chart-container">
            <Line data={weightChartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Body Fat Chart (Advanced Mode) */}
      {mode === 'advanced' && bodyFatHistory.length > 0 && (
        <div className="chart-section bodyfat-chart">
          <h3>{t('progress_bodyfat_chart')}</h3>
          <div className="chart-container">
            <Line data={bodyFatChartData} options={bodyFatChartOptions} />
          </div>
        </div>
      )}

      {mode === 'advanced' && bodyFatHistory.length === 0 && (
        <div className="no-data bodyfat-no-data">
          <Icon name="fire-1" className="no-data-icon" />
          <p>{t('progress_no_bodyfat_data')}</p>
        </div>
      )}

      {weightLog.length === 0 && (
        <div className="no-data">
          <Icon name="bar-chart-4" className="no-data-icon" />
          <p>
            {language === 'pt-BR'
              ? 'Registre seu peso para ver o gráfico de evolução'
              : 'Log your weight to see progress chart'}
          </p>
        </div>
      )}

      {/* Entry Bottom Sheet */}
      <BottomSheet
        isOpen={showEntrySheet}
        onClose={() => setShowEntrySheet(false)}
        title={t('progress_add_entry')}
      >
        <div className="entry-form">
          {/* Weight Input */}
          <div className="entry-input-group">
            <label>
              <Icon name="bar-chart-4" />
              {language === 'pt-BR' ? 'Peso (kg)' : 'Weight (kg)'}
            </label>
            <input
              type="number"
              step="0.1"
              value={entryForm.weight}
              onChange={(e) => setEntryForm(prev => ({ ...prev, weight: e.target.value }))}
              placeholder={currentWeight ? `${currentWeight}` : '70.0'}
            />
          </div>

          {/* Advanced Fields */}
          {mode === 'advanced' && (
            <>
              <div className="entry-input-group">
                <label>
                  <Icon name="fire-1" />
                  {t('progress_body_fat')} (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={entryForm.bodyFat}
                  onChange={(e) => setEntryForm(prev => ({ ...prev, bodyFat: e.target.value }))}
                  placeholder="18.0"
                />
              </div>

              <div className="entry-section-title">{t('progress_measurements')}</div>

              <div className="entry-row">
                <div className="entry-input-group half">
                  <label>{t('progress_arm')} (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={entryForm.braco}
                    onChange={(e) => setEntryForm(prev => ({ ...prev, braco: e.target.value }))}
                    placeholder="35"
                  />
                </div>
                <div className="entry-input-group half">
                  <label>{t('progress_chest')} (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={entryForm.peito}
                    onChange={(e) => setEntryForm(prev => ({ ...prev, peito: e.target.value }))}
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="entry-row">
                <div className="entry-input-group half">
                  <label>{t('progress_waist')} (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={entryForm.cintura}
                    onChange={(e) => setEntryForm(prev => ({ ...prev, cintura: e.target.value }))}
                    placeholder="80"
                  />
                </div>
                <div className="entry-input-group half">
                  <label>{t('progress_thigh')} (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={entryForm.coxa}
                    onChange={(e) => setEntryForm(prev => ({ ...prev, coxa: e.target.value }))}
                    placeholder="55"
                  />
                </div>
              </div>
            </>
          )}

          <button
            className="entry-submit"
            onClick={handleSubmitEntry}
            disabled={!entryForm.weight && !entryForm.bodyFat}
          >
            <Icon name="checkmark-1" />
            <span>{language === 'pt-BR' ? 'Confirmar' : 'Confirm'}</span>
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}

// Measurement Card Component
function MeasurementCard({ label, value, delta, unit, icon, inverted = false }) {
  if (value == null) return null;

  // For inverted metrics (like body fat, waist), negative delta is good
  const isPositive = inverted ? delta < 0 : delta > 0;
  const deltaClass = delta != null ? (isPositive ? 'positive' : 'negative') : '';

  return (
    <div className="measurement-card">
      <div className="measurement-header">
        <Icon name={icon} className="measurement-icon" />
        <span className="measurement-label">{label}</span>
      </div>
      <div className="measurement-value">
        {value}{unit}
      </div>
      {delta != null && (
        <div className={`measurement-delta ${deltaClass}`}>
          <Icon name={delta > 0 ? 'arrow-up-1' : 'arrow-down-1'} />
          <span>{Math.abs(delta).toFixed(1)}{unit}</span>
        </div>
      )}
    </div>
  );
}
