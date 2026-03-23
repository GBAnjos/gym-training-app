import { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useOnboarding } from '../hooks/useOnboarding';
import { PROGRAMS, MODALITY_META, PROGRAM_MODALITIES, PROGRAM_LEVELS } from '../data/programs';
import { Icon } from '../components/Icon';
import './ProgramsPage.css';

function getUserModalities(userProfile) {
  if (!userProfile) return [];
  const activities = userProfile.mainActivities || [];
  const addOns = (userProfile.addOnActivities || []).map(a => a.type).filter(Boolean);
  // Combine and deduplicate
  return [...new Set([...activities, ...addOns])];
}

export function ProgramsPage({ onBack, onComplete, onTabChange }) {
  const { t, language } = useLanguage();
  const { userProfile } = useOnboarding();
  const userMods = useMemo(() => getUserModalities(userProfile), [userProfile]);

  // Default to 'user' mode (show only user's modalities), or 'all' if no profile
  const [activeModality, setActiveModality] = useState(userMods.length > 0 ? 'user' : 'all');
  const [activeLevel, setActiveLevel] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);

  const filtered = useMemo(() => {
    return PROGRAMS.filter(p => {
      if (activeModality === 'user') {
        if (!userMods.includes(p.modality) && p.modality !== 'mixed') return false;
      } else if (activeModality !== 'all') {
        if (p.modality !== activeModality) return false;
      }
      if (activeLevel && p.level !== activeLevel) return false;
      return true;
    });
  }, [activeModality, activeLevel, userMods]);

  if (selectedProgram) {
    return (
      <ProgramDetail
        program={selectedProgram}
        language={language}
        t={t}
        onBack={() => setSelectedProgram(null)}
        onStart={onComplete}
      />
    );
  }

  return (
    <div className="programs-page">
      <div className="programs-header">
        {onBack && (
          <button className="programs-back-btn" onClick={onBack}>
            <Icon name="chevron-left" />
          </button>
        )}
        <h1 className="programs-title">{t('programs_title')}</h1>
      </div>

      {/* Smart Trainer CTA */}
      <button className="smart-trainer-card" onClick={() => onTabChange?.('smart-plan')}>
        <div className="smart-trainer-icon">
          <Icon name="wand" />
        </div>
        <div className="smart-trainer-text">
          <h3 className="smart-trainer-title">{t('programs_smart_title')}</h3>
          <p className="smart-trainer-desc">{t('programs_smart_desc')}</p>
        </div>
        <Icon name="chevron-right" className="smart-trainer-arrow" />
      </button>

      {/* Modality Filter */}
      <div className="programs-filter-row">
        {userMods.length > 0 && (
          <button
            className={`programs-filter-pill ${activeModality === 'user' ? 'active' : ''}`}
            onClick={() => setActiveModality('user')}
          >
            {t('programs_for_you')}
          </button>
        )}
        <button
          className={`programs-filter-pill ${activeModality === 'all' ? 'active' : ''}`}
          onClick={() => setActiveModality('all')}
        >
          {t('programs_all')}
        </button>
        {PROGRAM_MODALITIES.map(mod => (
          <button
            key={mod}
            className={`programs-filter-pill ${activeModality === mod ? 'active' : ''}`}
            onClick={() => setActiveModality(mod)}
            style={activeModality === mod ? {
              borderColor: MODALITY_META[mod]?.color,
              backgroundColor: `${MODALITY_META[mod]?.color}18`,
              color: MODALITY_META[mod]?.color,
            } : undefined}
          >
            {t(`programs_modality_${mod}`)}
          </button>
        ))}
      </div>

      {/* Level Filter */}
      <div className="programs-filter-row">
        {PROGRAM_LEVELS.map(lvl => (
          <button
            key={lvl}
            className={`programs-filter-pill ${activeLevel === lvl ? 'active' : ''}`}
            onClick={() => setActiveLevel(activeLevel === lvl ? null : lvl)}
          >
            {t(`programs_level_${lvl}`)}
          </button>
        ))}
      </div>

      {/* Program Cards */}
      {filtered.length > 0 ? (
        <div className="programs-list">
          {filtered.map(program => (
            <ProgramCard
              key={program.id}
              program={program}
              language={language}
              t={t}
              onClick={() => setSelectedProgram(program)}
            />
          ))}
        </div>
      ) : (
        <div className="programs-empty">
          <Icon name="list-3" className="programs-empty-icon" />
          <p>{t('programs_empty')}</p>
        </div>
      )}
    </div>
  );
}

function ProgramCard({ program, language, t, onClick }) {
  const meta = MODALITY_META[program.modality] || {};

  return (
    <button className="program-card" onClick={onClick}>
      <div className="program-card-icon" style={{ backgroundColor: `${meta.color}20`, color: meta.color }}>
        <Icon name={program.icon || meta.icon} />
      </div>
      <div className="program-card-body">
        <h3 className="program-card-name">{program.name[language] || program.name['pt-BR']}</h3>
        <div className="program-card-meta">
          <span className="program-card-badge" style={{ color: meta.color }}>
            {t(`programs_modality_${program.modality}`)}
          </span>
          <span className="program-card-dot">&middot;</span>
          <span>{t(`programs_level_${program.level}`)}</span>
          <span className="program-card-dot">&middot;</span>
          <span>{program.weeks} {t('programs_weeks')}</span>
          <span className="program-card-dot">&middot;</span>
          <span>{program.daysPerWeek} {t('programs_days_week')}</span>
        </div>
      </div>
      <Icon name="chevron-right" className="program-card-arrow" />
    </button>
  );
}

function ProgramDetail({ program, language, t, onBack, onStart }) {
  // Scroll to top when detail view mounts (fixes blank page when list was scrolled)
  useEffect(() => {
    const main = document.querySelector('.main-content');
    if (main) main.scrollTop = 0;
    else window.scrollTo(0, 0);
  }, []);

  const meta = MODALITY_META[program.modality] || {};

  const handleStart = () => {
    // Build a workout plan from the program and persist it
    const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const trainingDays = WEEKDAYS.slice(0, program.daysPerWeek);
    const dayActivities = {};
    trainingDays.forEach((day, i) => {
      dayActivities[day] = {
        type: program.modality === 'mixed' ? 'gym' : program.modality,
        session: {
          label: String(i + 1),
          name: `${program.name[language] || program.name['pt-BR']} — ${t('programs_day')} ${i + 1}`,
          focus: program.goal,
          icon: program.icon,
        },
      };
    });

    const plan = {
      name: program.name[language] || program.name['pt-BR'],
      programId: program.id,
      splitType: program.modality,
      trainingDays,
      dayActivities,
      goals: [program.goal],
      generatedAt: new Date().toISOString(),
    };

    localStorage.setItem('vida_workout_plan', JSON.stringify(plan));
    onStart?.();
  };

  return (
    <div className="programs-page">
      <div className="programs-header">
        <button className="programs-back-btn" onClick={onBack}>
          <Icon name="chevron-left" />
        </button>
        <h1 className="programs-title">{program.name[language] || program.name['pt-BR']}</h1>
      </div>

      <div className="program-detail">
        <div className="program-detail-icon" style={{ backgroundColor: `${meta.color}20`, color: meta.color }}>
          <Icon name={program.icon || meta.icon} />
        </div>

        <div className="program-detail-stats">
          <div className="program-detail-stat">
            <span className="program-detail-stat-label">{t('programs_duration')}</span>
            <span className="program-detail-stat-value">{program.weeks} {t('programs_weeks')}</span>
          </div>
          <div className="program-detail-stat">
            <span className="program-detail-stat-label">{t('programs_frequency')}</span>
            <span className="program-detail-stat-value">{program.daysPerWeek} {t('programs_days_week')}</span>
          </div>
          <div className="program-detail-stat">
            <span className="program-detail-stat-label">{t('programs_level')}</span>
            <span className="program-detail-stat-value">{t(`programs_level_${program.level}`)}</span>
          </div>
          <div className="program-detail-stat">
            <span className="program-detail-stat-label">{t('programs_goal')}</span>
            <span className="program-detail-stat-value">{t(`programs_goal_${program.goal}`)}</span>
          </div>
        </div>

        <div className="program-detail-section">
          <h4 className="program-detail-section-title">{t('programs_about')}</h4>
          <p className="program-detail-description">
            {program.description[language] || program.description['pt-BR']}
          </p>
        </div>

        <button className="program-detail-start" onClick={handleStart}>
          {t('programs_start')}
        </button>
      </div>
    </div>
  );
}
