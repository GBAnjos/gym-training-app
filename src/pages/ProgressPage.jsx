import { useState } from 'react';
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

export function ProgressPage() {
  const { language } = useLanguage();
  const toast = useToast();
  const { weightLog, addWeight, currentWeight, startWeight, targetWeight, progress } = useProgress();
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');

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

  // Get previous weight for comparison
  const getPreviousWeight = () => {
    if (weightLog.length === 0) return null;
    return weightLog[weightLog.length - 1].weight;
  };

  const previousWeight = getPreviousWeight();

  const handleAddWeight = () => {
    if (newWeight && parseFloat(newWeight) > 0) {
      const weight = parseFloat(newWeight);
      addWeight(newWeight);
      setNewWeight('');
      setShowWeightModal(false);

      // Show feedback with comparison
      if (previousWeight) {
        const diff = weight - previousWeight;
        const diffText = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
        toast.success(
          language === 'pt-BR'
            ? `Peso registrado! ${diffText}kg desde o último registro`
            : `Weight logged! ${diffText}kg since last entry`
        );
      } else {
        toast.success(
          language === 'pt-BR' ? 'Peso registrado!' : 'Weight logged!'
        );
      }

      if (navigator.vibrate) navigator.vibrate(50);
    }
  };

  // Chart data
  const chartData = {
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

  return (
    <div className="progress-page">
      <h2 className="progress-title">
        {language === 'pt-BR' ? 'Progresso' : 'Progress'}
      </h2>

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

      {/* Add Weight Button */}
      <button className="add-weight-btn" onClick={() => setShowWeightModal(true)}>
        <Icon name="add-item" />
        <span>{language === 'pt-BR' ? 'Registrar Peso' : 'Log Weight'}</span>
      </button>

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
          <h3>{language === 'pt-BR' ? 'Evolução do Peso' : 'Weight History'}</h3>
          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
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

      {/* Weight Modal */}
      {showWeightModal && (
        <div className="weight-modal" onClick={() => setShowWeightModal(false)}>
          <div className="weight-modal-content" onClick={e => e.stopPropagation()}>
            <button className="weight-modal-close" onClick={() => setShowWeightModal(false)}>
              <Icon name="xmark" />
            </button>

            <div className="weight-modal-header">
              <Icon name="bar-chart-4" className="weight-modal-icon" />
              <h3>{language === 'pt-BR' ? 'Registrar Peso' : 'Log Weight'}</h3>
            </div>

            {previousWeight && (
              <div className="weight-modal-previous">
                <span className="previous-label">
                  {language === 'pt-BR' ? 'Último registro:' : 'Last entry:'}
                </span>
                <span className="previous-value">{previousWeight}kg</span>
              </div>
            )}

            <div className="weight-modal-input">
              <input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder={previousWeight ? `${previousWeight}` : '70.0'}
                autoFocus
              />
              <span className="weight-unit">kg</span>
            </div>

            {newWeight && previousWeight && (
              <div className={`weight-diff ${parseFloat(newWeight) > previousWeight ? 'up' : 'down'}`}>
                <Icon name={parseFloat(newWeight) > previousWeight ? 'arrow-up-1' : 'arrow-down-1'} />
                <span>
                  {(parseFloat(newWeight) - previousWeight).toFixed(1)}kg
                </span>
              </div>
            )}

            <button
              className="weight-modal-submit"
              onClick={handleAddWeight}
              disabled={!newWeight || parseFloat(newWeight) <= 0}
            >
              <Icon name="checkmark-1" />
              <span>{language === 'pt-BR' ? 'Confirmar' : 'Confirm'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
