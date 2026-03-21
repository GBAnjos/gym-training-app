import { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useOnboarding } from '../../hooks/useOnboarding';
import { useToast } from '../Toast';
import { BottomSheet } from '../BottomSheet';
import { Icon } from '../Icon';
import { generateWorkoutPlan } from '../../utils/planGenerator';

const MAIN_TYPES = ['gym', 'crossfit', 'calisthenics', 'pilates'];
const ADDON_TYPES = ['running', 'yoga'];
const ALL_TYPES = [...MAIN_TYPES, ...ADDON_TYPES];
const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

// Icon names verified from actual activity cards (RunCard, CrossFitCard, etc.)
const ACTIVITY_META = {
  gym: { icon: 'dumbbell-1', color: '#c8f55a' },
  crossfit: { icon: 'fire-1', color: '#ff6b6b' },
  calisthenics: { icon: 'bolt-alt', color: '#6bcfff' },
  pilates: { icon: 'heart', color: '#c899ff' },
  running: { icon: 'direction-1', color: '#ffc832' },
  yoga: { icon: 'moon-half-right-5', color: '#82dcb4' },
};

const ACTIVITY_NAMES = {
  gym: { 'pt-BR': 'Academia', en: 'Gym' },
  crossfit: { 'pt-BR': 'CrossFit', en: 'CrossFit' },
  calisthenics: { 'pt-BR': 'Calistenia', en: 'Calisthenics' },
  pilates: { 'pt-BR': 'Pilates', en: 'Pilates' },
  running: { 'pt-BR': 'Corrida', en: 'Running' },
  yoga: { 'pt-BR': 'Yoga', en: 'Yoga' },
};

export function MyActivities() {
  const { t, language } = useLanguage();
  const { userProfile, updateProfile } = useOnboarding();
  const toast = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(null);

  if (!userProfile) return null;

  const mainActivities = userProfile.mainActivities || ['gym'];
  const addOnActivities = userProfile.addOnActivities || [];
  const trainingDays = userProfile.trainingDays || [];

  // Get all currently active types
  const activeTypes = [...mainActivities, ...addOnActivities.map(a => a.type)];

  const saveAndRegenerate = async (updates) => {
    const merged = { ...userProfile, ...updates };
    await updateProfile(updates);
    const plan = generateWorkoutPlan(merged);
    localStorage.setItem('vida_workout_plan', JSON.stringify(plan));
    toast.success(t('settings_plan_updated'));
  };

  // --- Main activity day toggle ---
  const toggleMainDay = (day) => {
    const current = [...trainingDays];
    const idx = current.indexOf(day);
    if (idx >= 0) {
      if (current.length <= 1) return; // minimum 1 day
      current.splice(idx, 1);
    } else {
      const unique = getUniqueDays();
      if (unique.length >= 7 && !unique.includes(day)) {
        toast.error(t('settings_max_days_warning'));
        return;
      }
      current.push(day);
    }
    saveAndRegenerate({ trainingDays: current });
  };

  // --- Add-on frequency change ---
  const changeAddonFrequency = (type, delta) => {
    const updated = addOnActivities.map(a => {
      if (a.type !== type) return a;
      const newFreq = Math.max(1, Math.min(7, (a.frequency || 1) + delta));
      // Trim days if reducing frequency below current day count
      const days = (a.days || []).slice(0, newFreq);
      return { ...a, frequency: newFreq, days };
    });
    saveAndRegenerate({ addOnActivities: updated });
  };

  // --- Add-on day toggle ---
  const toggleAddonDay = (type, day) => {
    const updated = addOnActivities.map(a => {
      if (a.type !== type) return a;
      const days = a.days ? [...a.days] : [];
      const idx = days.indexOf(day);
      if (idx >= 0) {
        if (days.length <= 1) return a; // minimum 1 day
        days.splice(idx, 1);
      } else {
        if (days.length >= (a.frequency || 1)) return a; // can't exceed frequency
        days.push(day);
      }
      return { ...a, days };
    });
    saveAndRegenerate({ addOnActivities: updated });
  };

  // --- Add activity ---
  const addActivity = (type) => {
    if (activeTypes.includes(type)) return;
    setShowAdd(false);

    if (MAIN_TYPES.includes(type)) {
      saveAndRegenerate({ mainActivities: [...mainActivities, type] });
    } else {
      saveAndRegenerate({
        addOnActivities: [...addOnActivities, { type, frequency: 1, days: [] }],
      });
    }
  };

  // --- Remove activity ---
  const removeActivity = (type) => {
    setConfirmRemove(null);

    if (MAIN_TYPES.includes(type)) {
      if (mainActivities.length <= 1) {
        toast.error(t('settings_min_main_warning'));
        return;
      }
      saveAndRegenerate({ mainActivities: mainActivities.filter(a => a !== type) });
    } else {
      saveAndRegenerate({
        addOnActivities: addOnActivities.filter(a => a.type !== type),
      });
    }
  };

  // Count unique days used
  const getUniqueDays = () => {
    const days = new Set(trainingDays);
    addOnActivities.forEach(a => (a.days || []).forEach(d => days.add(d)));
    return [...days];
  };

  return (
    <section className="settings-section">
      <div className="settings-section-header">
        <Icon name="bar-chart-4" className="section-icon" />
        <h2>{t('settings_my_activities')}</h2>
        <button className="activity-add-btn" onClick={() => setShowAdd(true)}>
          + {t('settings_add_activity')}
        </button>
      </div>

      {/* Main activities */}
      {mainActivities.map(type => (
        <div key={type} className="activity-card">
          <div className="activity-card-header">
            <div className="activity-card-info">
              <Icon name={ACTIVITY_META[type]?.icon || 'star-1'} className="activity-card-icon" style={{ color: ACTIVITY_META[type]?.color }} />
              <div>
                <span className="activity-card-name">{ACTIVITY_NAMES[type]?.[language] || type}</span>
                <span className="activity-card-badge main">{t('settings_main_activity')}</span>
              </div>
            </div>
            <div className="activity-card-actions">
              <span className="activity-freq-badge">{trainingDays.length}x{t('settings_per_week')}</span>
              <button className="activity-remove-btn" onClick={() => setConfirmRemove(type)}>
                <Icon name="trash-3" />
              </button>
            </div>
          </div>
          <div className="activity-day-pills">
            {DAYS.map(day => (
              <button
                key={day}
                className={`day-pill ${trainingDays.includes(day) ? 'active' : ''}`}
                style={trainingDays.includes(day) ? { background: ACTIVITY_META[type]?.color + '33', borderColor: ACTIVITY_META[type]?.color, color: ACTIVITY_META[type]?.color } : {}}
                onClick={() => toggleMainDay(day)}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Add-on activities */}
      {addOnActivities.map(addon => {
        const meta = ACTIVITY_META[addon.type] || {};
        return (
          <div key={addon.type} className="activity-card">
            <div className="activity-card-header">
              <div className="activity-card-info">
                <Icon name={meta.icon || 'star-1'} className="activity-card-icon" style={{ color: meta.color }} />
                <div>
                  <span className="activity-card-name">{ACTIVITY_NAMES[addon.type]?.[language] || addon.type}</span>
                  <span className="activity-card-badge addon">{t('settings_addon_activity')}</span>
                </div>
              </div>
              <div className="activity-card-actions">
                <div className="activity-freq-stepper">
                  <button className="freq-btn" onClick={() => changeAddonFrequency(addon.type, -1)}>&#8722;</button>
                  <span className="freq-value">{addon.frequency || 1}x</span>
                  <button className="freq-btn" onClick={() => changeAddonFrequency(addon.type, 1)}>+</button>
                </div>
                <span className="activity-per-week">{t('settings_per_week')}</span>
                <button className="activity-remove-btn" onClick={() => setConfirmRemove(addon.type)}>
                  <Icon name="trash-3" />
                </button>
              </div>
            </div>
            <div className="activity-day-pills">
              {DAYS.map(day => (
                <button
                  key={day}
                  className={`day-pill ${(addon.days || []).includes(day) ? 'active' : ''}`}
                  style={(addon.days || []).includes(day) ? { background: meta.color + '33', borderColor: meta.color, color: meta.color } : {}}
                  onClick={() => toggleAddonDay(addon.type, day)}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Add Activity BottomSheet */}
      <BottomSheet isOpen={showAdd} onClose={() => setShowAdd(false)} title={t('settings_add_activity')}>
        <div className="add-activity-grid">
          {ALL_TYPES.map(type => {
            const isAdded = activeTypes.includes(type);
            const meta = ACTIVITY_META[type] || {};
            return (
              <button
                key={type}
                className={`add-activity-option ${isAdded ? 'disabled' : ''}`}
                onClick={() => !isAdded && addActivity(type)}
                disabled={isAdded}
              >
                <Icon name={meta.icon || 'star-1'} style={{ color: isAdded ? undefined : meta.color }} />
                <span>{ACTIVITY_NAMES[type]?.[language] || type}</span>
                {isAdded && <span className="add-activity-added">{t('settings_already_added')}</span>}
              </button>
            );
          })}
        </div>
      </BottomSheet>

      {/* Remove confirmation modal */}
      {confirmRemove && (
        <div className="modal-overlay" onClick={() => setConfirmRemove(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-icon"><Icon name="warning" /></div>
            <h3>{t('settings_remove')}</h3>
            <p>{t('settings_remove_confirm').replace('{activity}', ACTIVITY_NAMES[confirmRemove]?.[language] || confirmRemove)}</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setConfirmRemove(null)}>{t('cancel')}</button>
              <button className="btn-confirm" onClick={() => removeActivity(confirmRemove)}>{t('settings_remove')}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
