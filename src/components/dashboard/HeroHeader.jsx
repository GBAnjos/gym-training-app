import { useLanguage } from '../../hooks/useLanguage';
import { DESIGN } from '../../data/design';
import { Icon } from '../Icon';
import { getWorkoutName, getWorkoutBySplit } from '../../data/treinos';

export function HeroHeader({ data, onNavigateToTraining }) {
  const { t, language } = useLanguage();
  const { profile, todayActivity, weekStreak, weeklyCount, weeklyTarget, primaryActivity, gymStats } = data;

  const firstName = (profile.name || '').split(' ')[0] || '';

  // Goal label
  const goalLabels = {
    muscle_gain: { 'pt-BR': 'Ganho Muscular', en: 'Muscle Gain' },
    weight_loss: { 'pt-BR': 'Perda de Peso', en: 'Weight Loss' },
    maintain: { 'pt-BR': 'Manutenção', en: 'Maintain' },
    general: { 'pt-BR': 'Saúde Geral', en: 'General Health' },
  };
  const goalLabel = goalLabels[profile.goal]?.[language] || '';

  // Today's workout info
  const todayInfo = getTodayInfo(todayActivity, language, t);
  const sportColor = todayActivity ? DESIGN.sportColors[todayActivity.type]?.primary : null;

  // Mini stat cards
  const miniStats = getMiniStats(data, language, t);

  return (
    <div className="dashboard-section hero-header">
      {/* Greeting row */}
      <div className="hero-greeting-row">
        <div className="hero-greeting">
          <span className="hero-name">{t('dashboard_greeting')}, {firstName}</span>
          {goalLabel && <span className="hero-goal-badge">{goalLabel}</span>}
        </div>
        <div className={`hero-streak ${weekStreak > 0 ? 'active' : ''}`}>
          <Icon name="fire-1" />
          <span>{weekStreak} {t('dashboard_week_streak')}</span>
        </div>
      </div>

      {/* Today's workout card */}
      {todayInfo ? (
        <button className="hero-today-card" onClick={onNavigateToTraining} style={{ borderLeftColor: sportColor }}>
          <div className="hero-today-info">
            <span className="hero-today-title">{todayInfo.title}</span>
            <span className="hero-today-subtitle">{todayInfo.subtitle}</span>
          </div>
          <span className="hero-today-action">{t('dashboard_start')} →</span>
        </button>
      ) : (
        <div className="hero-today-card rest">
          <div className="hero-today-info">
            <span className="hero-today-title">{t('dashboard_rest_day')}</span>
            <span className="hero-today-subtitle">{t('dashboard_rest_message')}</span>
          </div>
        </div>
      )}

      {/* Mini stat cards */}
      <div className="hero-stats-row">
        {miniStats.map((stat, i) => (
          <div key={i} className="hero-stat-card">
            <span className="hero-stat-value">{stat.value}</span>
            <span className="hero-stat-label">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getTodayInfo(activity, language, t) {
  if (!activity) return null;

  const session = activity.session;
  switch (activity.type) {
    case 'gym': {
      if (!session) return null;
      const workout = getWorkoutBySplit(session.name);
      const exerciseCount = workout?.exercicios?.length || 0;
      const duration = exerciseCount * 8;
      return {
        title: `${session.label}: ${session.name}`,
        subtitle: `${exerciseCount} ${t('dashboard_exercises')} · ~${duration} min`,
      };
    }
    case 'crossfit': {
      const name = session?.name?.[language] || session?.name || 'CrossFit';
      const movements = session?.movements?.length || 0;
      const cap = session?.timeCap || 20;
      return {
        title: name,
        subtitle: `${movements} ${t('dashboard_movements')} · ${cap} ${t('dashboard_min_cap')}`,
      };
    }
    case 'calisthenics': {
      const name = session?.name?.[language] || session?.name || 'Calisthenics';
      const skills = session?.skills?.length || 0;
      return {
        title: name,
        subtitle: `${skills} ${t('dashboard_progressions')}`,
      };
    }
    case 'pilates': {
      const name = session?.name?.[language] || session?.name || 'Pilates';
      const movements = session?.movements?.length || 0;
      return {
        title: name,
        subtitle: `${movements} ${t('dashboard_movements')} · ~30 min`,
      };
    }
    case 'running': {
      const name = session?.name?.[language] || session?.name || 'Running';
      const distance = session?.targetDistance || '';
      return {
        title: name,
        subtitle: distance ? `${distance} km target` : '~30 min',
      };
    }
    case 'yoga': {
      const name = session?.name?.[language] || session?.name || 'Yoga';
      const poses = session?.poses?.length || 0;
      return {
        title: name,
        subtitle: `${poses} ${t('dashboard_poses')} · ~20 min`,
      };
    }
    default:
      return { title: activity.type, subtitle: '' };
  }
}

function getMiniStats(data, language, t) {
  const { weeklyCount, weeklyTarget, primaryActivity, gymStats, currentMonthCount } = data;

  // Card 1: always sessions this week
  const card1 = {
    value: `${weeklyCount}/${weeklyTarget}`,
    label: t('dashboard_sessions_week'),
  };

  // Card 2: depends on primary activity
  let card2;
  switch (primaryActivity) {
    case 'gym':
      card2 = {
        value: gymStats.totalVolume > 1000
          ? `${(gymStats.totalVolume / 1000).toFixed(1)}k`
          : `${Math.round(gymStats.totalVolume)}`,
        label: t('dashboard_volume') + ' (kg)',
      };
      break;
    case 'running':
      card2 = { value: '—', label: t('dashboard_distance') + ' (km)' };
      break;
    default:
      card2 = { value: String(currentMonthCount), label: t('dashboard_sessions_month') };
  }

  // Card 3: PRs or streak
  const prCount = Object.keys(gymStats.exercisePRs).length;
  const card3 = ['gym', 'crossfit', 'calisthenics'].includes(primaryActivity)
    ? { value: String(prCount), label: t('dashboard_prs_month') }
    : { value: String(data.weekStreak), label: t('dashboard_longest_streak') };

  return [card1, card2, card3];
}
