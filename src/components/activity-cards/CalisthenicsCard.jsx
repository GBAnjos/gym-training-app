import { useState } from 'react';
import { getCalisthenicsSkill } from '../../data/calisthenics.js';
import { DESIGN } from '../../data/design.js';
import { Icon } from '../Icon';
import './ActivityCard.css';

const colors = DESIGN.sportColors.calisthenics;

export function CalisthenicsCard({ dayActivity, day, language, toast }) {
  const today = new Date().toISOString().split('T')[0];
  const session = dayActivity?.session;

  const [completedSkills, setCompletedSkills] = useState(() => {
    const map = {};
    session?.skills?.forEach(s => {
      try {
        const data = JSON.parse(localStorage.getItem(`calisthenics_${day}_${s.skillId}_${today}`) || '{}');
        map[s.skillId] = data.completed || false;
      } catch { map[s.skillId] = false; }
    });
    return map;
  });

  if (!session) return null;

  const getLevel = (skillId) => {
    try {
      return parseInt(localStorage.getItem(`calisthenics_level_${skillId}`) || '1');
    } catch { return 1; }
  };

  const toggleSkill = (skillId) => {
    const newVal = !completedSkills[skillId];
    setCompletedSkills(prev => ({ ...prev, [skillId]: newVal }));
    localStorage.setItem(`calisthenics_${day}_${skillId}_${today}`, JSON.stringify({
      level: getLevel(skillId),
      completed: newVal,
      date: today,
    }));
  };

  const splitName = session.name?.[language] || session.name?.['pt-BR'] || 'Calisthenics';
  const allDone = session.skills?.every(s => completedSkills[s.skillId]);

  return (
    <div className="activity-training-card" style={{ borderColor: colors.border }}>
      <div className="activity-training-card-header">
        <Icon name="bolt-alt" className="sport-icon" style={{ color: colors.primary }} />
        <span className="sport-name">{splitName}</span>
        <span className="activity-training-card-badge" style={{ background: colors.bg, color: colors.primary }}>
          Calisthenics
        </span>
      </div>

      <div className="activity-training-card-body">
        {session.skills?.map(skillEntry => {
          const skill = getCalisthenicsSkill(skillEntry.skillId);
          if (!skill) return null;
          const level = getLevel(skillEntry.skillId);
          const levelData = skill.levels?.find(l => l.level === level) || skill.levels?.[0];
          const levelName = levelData?.name?.[language] || levelData?.name?.['pt-BR'] || skillEntry.skillId;
          const detail = skillEntry.reps || levelData?.reps || levelData?.hold || '';
          const sets = skillEntry.sets || levelData?.sets || 3;
          const done = completedSkills[skillEntry.skillId];

          return (
            <div key={skillEntry.skillId} className={`calisthenics-skill ${done ? 'done' : ''}`}
              onClick={() => toggleSkill(skillEntry.skillId)}>
              <div className="calisthenics-skill-info">
                <span className="calisthenics-skill-name">{levelName}</span>
                <span className="calisthenics-level-badge" style={{ background: colors.bg, color: colors.primary }}>
                  LVL {level}
                </span>
              </div>
              <div className="calisthenics-detail">
                {sets} x {detail}
              </div>
              <Icon name={done ? 'checkmark-circle-1' : 'circle'} className="check-icon"
                style={done ? { color: colors.primary } : {}} />
            </div>
          );
        })}
      </div>

      <div className="activity-training-card-actions">
        <button
          className={`activity-training-card-complete ${allDone ? 'done' : ''}`}
          style={allDone ? { borderColor: colors.primary, color: colors.primary } : {}}
          onClick={() => {
            if (!allDone && toast) {
              toast.success(language === 'pt-BR' ? 'Treino completo!' : 'Workout complete!');
            }
          }}
        >
          <Icon name={allDone ? 'checkmark-circle-1' : 'circle'} className="check-icon" />
          {allDone
            ? (language === 'pt-BR' ? 'Completo' : 'Complete')
            : `${Object.values(completedSkills).filter(Boolean).length}/${session.skills?.length || 0}`
          }
        </button>
      </div>
    </div>
  );
}
