import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useLanguage } from '../../hooks/useLanguage';
import { TREINOS, EXERCISE_TRANSLATIONS, getExerciseName } from '../../data/treinos';
import { Icon } from '../Icon';

function getAllExercises() {
  const exercises = new Map();
  Object.values(TREINOS).forEach(treino => {
    if (!treino?.exercicios) return;
    treino.exercicios.forEach(ex => {
      if (!exercises.has(ex.id)) {
        exercises.set(ex.id, ex);
      }
    });
  });
  return [...exercises.values()];
}

function getExerciseHistory(exerciseId) {
  const history = [];
  const allKeys = Object.keys(localStorage);

  allKeys.forEach(key => {
    if (!key.endsWith(`_${exerciseId}`)) return;
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (data?.historico) {
        data.historico.forEach(entry => {
          if (entry.peso && parseFloat(entry.peso) > 0) {
            history.push({
              date: entry.data,
              weight: parseFloat(entry.peso),
            });
          }
        });
      }
    } catch { /* skip */ }
  });

  return history.sort((a, b) => a.date.localeCompare(b.date));
}

export function ProgressionChart({ activityTypes }) {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [activeTab, setActiveTab] = useState('heaviest');

  const allExercises = useMemo(() => getAllExercises(), []);

  const filteredExercises = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const q = searchQuery.toLowerCase();
    return allExercises.filter(ex => {
      const name = getExerciseName(ex.id, language).toLowerCase();
      return name.includes(q);
    }).slice(0, 5);
  }, [searchQuery, language, allExercises]);

  const recentExercises = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('vida_recent_exercises') || '[]');
    } catch { return []; }
  }, []);

  const history = useMemo(() => {
    if (!selectedExercise) return [];
    return getExerciseHistory(selectedExercise.id);
  }, [selectedExercise]);

  const chartData = history.map(h => ({
    date: h.date.slice(5),
    value: h.weight,
  }));

  const lastValue = history.length > 0 ? history[history.length - 1].weight : 0;
  const bestValue = history.length > 0 ? Math.max(...history.map(h => h.weight)) : 0;

  const selectExercise = (ex) => {
    setSelectedExercise(ex);
    setSearchQuery('');
    try {
      let recent = JSON.parse(localStorage.getItem('vida_recent_exercises') || '[]');
      recent = recent.filter(r => r.id !== ex.id);
      recent.unshift({ type: 'gym', id: ex.id });
      if (recent.length > 3) recent = recent.slice(0, 3);
      localStorage.setItem('vida_recent_exercises', JSON.stringify(recent));
    } catch { /* skip */ }
  };

  const tabs = [
    { key: 'heaviest', label: t('dashboard_heaviest') },
    { key: '1rm', label: t('dashboard_one_rm') },
    { key: 'volume', label: t('dashboard_volume') },
  ];

  return (
    <div className="dashboard-section">
      <h3 className="dashboard-section-title">{t('dashboard_progression')}</h3>

      <div className="progression-search">
        <Icon name="search-1" className="progression-search-icon" />
        <input
          type="text"
          className="progression-search-input"
          placeholder={t('dashboard_search_exercise')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredExercises.length > 0 && (
        <div className="progression-results">
          {filteredExercises.map(ex => (
            <button key={ex.id} className="progression-result-item" onClick={() => selectExercise(ex)}>
              {getExerciseName(ex.id, language)}
            </button>
          ))}
        </div>
      )}

      {!selectedExercise && recentExercises.length > 0 && (
        <div className="progression-recent">
          <span className="progression-recent-label">{t('dashboard_recent')}:</span>
          {recentExercises.map((r, i) => (
            <button key={i} className="progression-recent-chip" onClick={() => {
              const ex = allExercises.find(e => e.id === r.id);
              if (ex) selectExercise(ex);
            }}>
              {getExerciseName(r.id, language)}
            </button>
          ))}
        </div>
      )}

      {!selectedExercise && recentExercises.length === 0 && (
        <p className="progression-empty">{t('dashboard_empty_progression')}</p>
      )}

      {selectedExercise && (
        <div className="progression-chart-card">
          <div className="progression-chart-header">
            <span className="progression-chart-name">{getExerciseName(selectedExercise.id, language)}</span>
            {bestValue > 0 && <span className="progression-chart-pr">PR: {bestValue}kg</span>}
          </div>

          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={35} />
                <Tooltip contentStyle={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-default)', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="value" stroke="var(--color-accent-primary)" strokeWidth={2} dot={{ fill: 'var(--color-accent-primary)', r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="progression-no-data" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem 0', fontSize: '0.85rem' }}>
              {language === 'pt-BR' ? 'Dados insuficientes para o gráfico' : 'Not enough data for chart'}
            </p>
          )}

          <div className="monthly-tabs" style={{ marginTop: 'var(--space-sm)' }}>
            {tabs.map(tab => (
              <button key={tab.key} className={`monthly-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="progression-summary">
            <span>{t('dashboard_last')}: <strong>{lastValue}kg</strong></span>
            <span>{t('dashboard_best')}: <strong>{bestValue}kg</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
