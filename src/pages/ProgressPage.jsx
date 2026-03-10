import { useState, useEffect } from 'react';
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
  const { weightLog, addWeight, currentWeight, startWeight, targetWeight, progress } = useProgress();
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

  const handleAddWeight = () => {
    if (newWeight && parseFloat(newWeight) > 0) {
      addWeight(newWeight);
      setNewWeight('');
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
        label: 'Peso (kg)',
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
      <h2 className="progress-title">Progresso</h2>

      {/* Weight Goal Progress */}
      <div className="goal-section">
        <div className="goal-header">
          <Icon name="target-4" className="goal-icon" />
          <div className="goal-info">
            <span className="goal-label">Meta de Peso</span>
            <span className="goal-range">{startWeight}kg → {targetWeight}kg</span>
          </div>
        </div>
        <div className="goal-progress-bar">
          <div className="goal-fill" style={{ width: `${progress}%` }}>
            <span className="goal-current">{currentWeight}kg</span>
          </div>
        </div>
        <div className="goal-markers">
          <span>{startWeight}kg</span>
          <span>{targetWeight}kg</span>
        </div>
      </div>

      {/* Weight Input */}
      <div className="weight-section">
        <h3>Registrar Peso</h3>
        <div className="weight-input-row">
          <input
            type="number"
            step="0.1"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            placeholder="Ex: 73.5"
            onKeyPress={(e) => e.key === 'Enter' && handleAddWeight()}
          />
          <button className="add-weight-btn" onClick={handleAddWeight}>
            Registrar
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{trainingDays.length}</span>
          <span className="stat-label">Total Treinos</span>
        </div>
        <div className="stat-card accent">
          <span className="stat-value">{streak}</span>
          <span className="stat-label"><Icon name="fire-1" /> Streak</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{thisWeekCount}</span>
          <span className="stat-label">Esta Semana</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{thisMonthCount}</span>
          <span className="stat-label">Este Mês</span>
        </div>
      </div>

      {/* Weight Chart */}
      {weightLog.length > 0 && (
        <div className="chart-section">
          <h3>Evolução do Peso</h3>
          <div className="chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {weightLog.length === 0 && (
        <div className="no-data">
          <p><Icon name="bar-chart-4" /> Registre seu peso para ver o gráfico de evolução</p>
        </div>
      )}
    </div>
  );
}
