import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import { DESIGN } from '../../data/design';
import { Icon } from '../Icon';
import { getWorkoutBySplit } from '../../data/treinos';

const TIME_MAP = { morning: '7h', afternoon: '14h', evening: '18h' };
const DAY_LABELS = {
  'pt-BR': { 'Dom': 'Domingo', 'Seg': 'Segunda', 'Ter': 'Terça', 'Qua': 'Quarta', 'Qui': 'Quinta', 'Sex': 'Sexta', 'Sáb': 'Sábado' },
  en: { 'Dom': 'Sunday', 'Seg': 'Monday', 'Ter': 'Tuesday', 'Qua': 'Wednesday', 'Qui': 'Thursday', 'Sex': 'Friday', 'Sáb': 'Saturday' },
};

export function HeroHeader({ data, onNavigateToTraining }) {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { profile, todayActivities, nextActivity, weekStreak, weeklyCount, weeklyTarget, primaryActivity, gymStats } = data;

  const firstName = (profile.name || user?.user_metadata?.full_name || '').split(' ')[0] || '';

  const goalLabels = {
    muscle_gain: { 'pt-BR': 'Ganho Muscular', en: 'Muscle Gain' },
    weight_loss: { 'pt-BR': 'Perda de Peso', en: 'Weight Loss' },
    maintain: { 'pt-BR': 'Manutenção', en: 'Maintain' },
    general: { 'pt-BR': 'Saúde Geral', en: 'General Health' },
  };
  const goalLabel = goalLabels[profile.goal]?.[language] || '';

  const timeLabel = TIME_MAP[profile.gymPreference] || null;
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
          <Icon name="bolt-2" />
          <span>{weekStreak} {t('dashboard_week_streak')}</span>
        </div>
      </div>

      {/* Today's activities */}
      {todayActivities.length > 0 ? (
        todayActivities.map((activity, i) => {
          const info = getActivityInfo(activity, language, t);
          const sportColor = DESIGN.sportColors[activity.type]?.primary;
          return (
            <button key={activity.type} className="hero-today-card" onClick={onNavigateToTraining} style={{ borderLeftColor: sportColor }}>
              <div className="hero-today-info">
                <span className="hero-today-title">{info.title}</span>
                <span className="hero-today-subtitle">
                  <span className="hero-sport-dot" style={{ color: sportColor }}>●</span>
                  {' '}{info.sportLabel}{timeLabel ? ` · ${timeLabel}` : ''}{info.subtitle ? ` · ${info.subtitle}` : ''}
                </span>
              </div>
              <span className="hero-today-action">{t('dashboard_start')} →</span>
            </button>
          );
        })
      ) : (
        <div className="hero-today-card rest">
          <div className="hero-today-info">
            <span className="hero-today-title">{t('dashboard_rest_day')}</span>
            <span className="hero-today-subtitle">
              {t('dashboard_rest_message')}
              {nextActivity && (
                <>
                  {'. '}
                  {nextActivity.isTomorrow
                    ? t('dashboard_tomorrow')
                    : DAY_LABELS[language]?.[nextActivity.dayKey] || nextActivity.dayKey
                  }: {getActivityInfo(nextActivity, language, t).title}
                </>
              )}
            </span>
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

const SPORT_LABELS = {
  gym: { 'pt-BR': 'Academia', en: 'Gym' },
  crossfit: { 'pt-BR': 'CrossFit', en: 'CrossFit' },
  calisthenics: { 'pt-BR': 'Calistenia', en: 'Calisthenics' },
  pilates: { 'pt-BR': 'Pilates', en: 'Pilates' },
  running: { 'pt-BR': 'Corrida', en: 'Running' },
  yoga: { 'pt-BR': 'Yoga', en: 'Yoga' },
};

function getActivityInfo(activity, language, t) {
  const session = activity.session;
  const sportLabel = SPORT_LABELS[activity.type]?.[language] || activity.type;

  switch (activity.type) {
    case 'gym': {
      if (!session) return { title: sportLabel, subtitle: '', sportLabel };
      const workout = getWorkoutBySplit(session.name);
      const exerciseCount = workout?.exercicios?.length || 0;
      const duration = exerciseCount * 8;
      return {
        title: `${session.label}: ${session.name}`,
        subtitle: `${exerciseCount} ${t('dashboard_exercises')} · ~${duration} min`,
        sportLabel,
      };
    }
    case 'crossfit': {
      const name = session?.name?.[language] || session?.name || 'CrossFit';
      const movements = session?.movements?.length || 0;
      const cap = session?.timeCap || 20;
      return { title: name, subtitle: `${movements} ${t('dashboard_movements')} · ${cap} ${t('dashboard_min_cap')}`, sportLabel };
    }
    case 'calisthenics': {
      const name = session?.name?.[language] || session?.name || 'Calisthenics';
      const skills = session?.skills?.length || 0;
      return { title: name, subtitle: `${skills} ${t('dashboard_progressions')}`, sportLabel };
    }
    case 'pilates': {
      const name = session?.name?.[language] || session?.name || 'Pilates';
      const movements = session?.movements?.length || 0;
      return { title: name, subtitle: `${movements} ${t('dashboard_movements')} · ~30 min`, sportLabel };
    }
    case 'running': {
      const name = session?.name?.[language] || session?.name || 'Running';
      const distance = session?.distance || '';
      return { title: name, subtitle: distance ? `${distance}${session?.zone ? ` · Z${session.zone}` : ''}` : '~30 min', sportLabel };
    }
    case 'yoga': {
      const name = session?.name?.[language] || session?.name || 'Yoga';
      const poses = session?.poses?.length || 0;
      return { title: name, subtitle: `${poses} ${t('dashboard_poses')} · ~20 min`, sportLabel };
    }
    default:
      return { title: activity.type, subtitle: '', sportLabel };
  }
}

function getMiniStats(data, language, t) {
  const { weeklyCount, weeklyTarget, primaryActivity, gymStats, currentMonthCount } = data;

  const card1 = {
    value: `${weeklyCount}/${weeklyTarget}`,
    label: t('dashboard_sessions_week'),
  };

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

  const prCount = Object.keys(gymStats.exercisePRs).length;
  const card3 = ['gym', 'crossfit', 'calisthenics'].includes(primaryActivity)
    ? { value: String(prCount), label: t('dashboard_prs_month') }
    : { value: String(data.weekStreak), label: t('dashboard_longest_streak') };

  return [card1, card2, card3];
}
