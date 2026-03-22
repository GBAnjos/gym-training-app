import { useState, useMemo } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useOnboarding } from '../hooks/useOnboarding';
import { PROGRAMS, MODALITY_META, PROGRAM_MODALITIES, PROGRAM_LEVELS } from '../data/programs';
import { Icon } from '../components/Icon';
import './ProgramsPage.css';

const MODALITY_FILTERS = ['all', ...PROGRAM_MODALITIES];

function getSmartDefaults(userProfile) {
  if (!userProfile) return { modality: 'all', level: null };
  const activities = userProfile.mainActivities || ['gym'];
  const modality = activities[0] || 'gym';
  return { modality, level: null };
}

export function ProgramsPage({ onBack }) {
  const { t, language } = useLanguage();
  const { userProfile } = useOnboarding();
  const defaults = useMemo(() => getSmartDefaults(userProfile), [userProfile]);

  const [activeModality, setActiveModality] = useState(defaults.modality);
  const [activeLevel, setActiveLevel] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState(null);

  const filtered = useMemo(() => {
    return PROGRAMS.filter(p => {
      if (activeModality !== 'all' && p.modality !== activeModality) return false;
      if (activeLevel && p.level !== activeLevel) return false;
      return true;
    });
  }, [activeModality, activeLevel]);

  if (selectedProgram) {
    return (
      <ProgramDetail
        program={selectedProgram}
        language={language}
        t={t}
        onBack={() => setSelectedProgram(null)}
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

      {/* Modality Filter */}
      <div className="programs-filter-row">
        {MODALITY_FILTERS.map(mod => (
          <button
            key={mod}
            className={`programs-filter-pill ${activeModality === mod ? 'active' : ''}`}
            onClick={() => setActiveModality(mod)}
            style={activeModality === mod && mod !== 'all' ? {
              borderColor: MODALITY_META[mod]?.color,
              backgroundColor: `${MODALITY_META[mod]?.color}18`,
              color: MODALITY_META[mod]?.color,
            } : undefined}
          >
            {mod === 'all' ? t('programs_all') : t(`programs_modality_${mod}`)}
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

function ProgramDetail({ program, language, t, onBack }) {
  const meta = MODALITY_META[program.modality] || {};

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

        <button className="program-detail-start">
          {t('programs_start')}
        </button>
      </div>
    </div>
  );
}
