import { useState, useMemo, useRef, useCallback } from 'react';
import { SCHEDULE, DAY_ORDER, getBlockLabel, getBlockSub, getDayName } from '../data/schedule';
import { DESIGN } from '../data/design';
import { useOfficeDays } from '../hooks/useOfficeDays';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../components/Toast';
import { Icon } from '../components/Icon';
import './SchedulePage.css';

// Get day type note based on dynamically determined type
const getDayTypeNote = (type, language = 'pt-BR') => {
  const notes = {
    office: {
      'pt-BR': 'Dia de escritório',
      'en': 'Office day'
    },
    home: {
      'pt-BR': 'Home office',
      'en': 'Work from home'
    },
    weekend: {
      'pt-BR': 'Fim de semana',
      'en': 'Weekend'
    }
  };
  return notes[type]?.[language] || notes[type]?.['pt-BR'] || '';
};

// Map block types to LineIcon names
const BLOCK_ICONS = {
  morning: 'sun-1',
  coffee: 'coffee-cup-2',
  gym: 'dumbbell-1',
  food: 'knife-fork-1',
  work: 'briefcase-1',
  free: 'book-1',
  sleep: 'moon-half-right-5',
  chore: 'home-2',
  social: 'heart',
  sport: 'busket-ball',
};

// Custom hook for long press detection
function useLongPress(onLongPress, onClick, { delay = 500 } = {}) {
  const timeoutRef = useRef(null);
  const isLongPress = useRef(false);

  const start = useCallback((e) => {
    isLongPress.current = false;
    timeoutRef.current = setTimeout(() => {
      isLongPress.current = true;
      if (navigator.vibrate) navigator.vibrate(50);
      onLongPress(e);
    }, delay);
  }, [onLongPress, delay]);

  const clear = useCallback((e, shouldClick = true) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (shouldClick && !isLongPress.current) {
      onClick?.(e);
    }
  }, [onClick]);

  return {
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: () => clear(null, false),
    onTouchStart: start,
    onTouchEnd: clear,
  };
}

export function SchedulePage({ onTabChange }) {
  const { language } = useLanguage();
  const toast = useToast();
  const today = new Date();
  const dayIndex = today.getDay();
  const dayMap = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const todayKey = dayMap[dayIndex];

  const [selectedDay, setSelectedDay] = useState(todayKey);
  const { isOfficeDay, toggleOfficeDay } = useOfficeDays();

  // Load personalized schedule from localStorage if available
  // Check new key first (vida_generated_schedule), then legacy (vida_user_schedule)
  const schedule = useMemo(() => {
    try {
      const generated = localStorage.getItem('vida_generated_schedule');
      if (generated) return JSON.parse(generated);
      const saved = localStorage.getItem('vida_user_schedule');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return SCHEDULE;
  }, []);

  // Load workout plan for the selected day
  const workoutInfo = useMemo(() => {
    try {
      const raw = localStorage.getItem('vida_workout_plan');
      if (!raw) return null;
      const plan = JSON.parse(raw);
      const dayActivity = plan.dayActivities?.[selectedDay];
      if (!dayActivity) return null;

      const type = dayActivity.type || 'gym';
      let name = '';
      let detail = '';

      if (type === 'gym') {
        name = dayActivity.session?.name || (language === 'pt-BR' ? 'Treino' : 'Workout');
        const count = dayActivity.exercises?.length || 0;
        detail = count > 0
          ? `${count} ${language === 'pt-BR' ? 'exercícios' : 'exercises'}`
          : (language === 'pt-BR' ? 'Ver treino' : 'View workout');
      } else {
        const sessionName = dayActivity.session?.name;
        name = (typeof sessionName === 'object' ? sessionName[language] || sessionName['pt-BR'] : sessionName) || type;
        detail = type.charAt(0).toUpperCase() + type.slice(1);
      }

      return { type, name, detail };
    } catch { return null; }
  }, [selectedDay, language]);

  // Load diet info
  const dietInfo = useMemo(() => {
    try {
      const raw = localStorage.getItem('vida_custom_diet');
      if (!raw) return null;
      const diet = JSON.parse(raw);
      const mealCount = diet.meals?.length || 0;

      // Check today's progress
      const todayStr = new Date().toISOString().split('T')[0];
      const checked = JSON.parse(localStorage.getItem(`diet_completed_${todayStr}`) || '{}');
      const totalFoods = diet.meals.reduce((sum, m) => sum + m.foods.length, 0);
      const checkedCount = Object.values(checked).reduce((sum, arr) => sum + arr.length, 0);

      return {
        name: diet.name || (language === 'pt-BR' ? 'Minha Dieta' : 'My Diet'),
        progress: totalFoods > 0 ? `${checkedCount}/${totalFoods}` : `${mealCount} ${language === 'pt-BR' ? 'refeições' : 'meals'}`,
      };
    } catch { return null; }
  }, [language]);

  const dayData = schedule[selectedDay] || SCHEDULE[selectedDay];

  const getDayType = (day) => {
    if (day === 'Sáb' || day === 'Dom') return 'weekend';
    if (isOfficeDay(day)) return 'office';
    return 'home';
  };

  const getDayNoteIcon = (type) => {
    switch (type) {
      case 'office': return 'briefcase-1';
      case 'weekend': return 'sun-1';
      default: return 'home-2';
    }
  };

  const handleToggleOffice = (day) => {
    if (!['Sáb', 'Dom'].includes(day)) {
      toggleOfficeDay(day);
      const newType = isOfficeDay(day) ? 'home' : 'office';
      toast.info(
        language === 'pt-BR'
          ? `${day}: ${newType === 'office' ? 'Escritório' : 'Home office'}`
          : `${day}: ${newType === 'office' ? 'Office' : 'Work from home'}`
      );
    }
  };

  // Modality colors and icons
  const getModColor = (type) => {
    const colors = { gym: '#c8f55a', crossfit: '#ff6b6b', calisthenics: '#6bcfff', pilates: '#c899ff', running: '#ffc832', yoga: '#82dcb4' };
    return colors[type] || '#c8f55a';
  };

  const getModIcon = (type) => {
    const icons = { gym: 'dumbbell-1', crossfit: 'fire-1', calisthenics: 'bolt-alt', pilates: 'heart', running: 'direction-1', yoga: 'moon-half-right-5' };
    return icons[type] || 'dumbbell-1';
  };

  const isToday = selectedDay === todayKey;

  return (
    <div className="schedule-page">
      {/* Day Tabs */}
      <div className="day-tabs">
        {DAY_ORDER.map(day => (
          <DayTab
            key={day}
            day={day}
            displayName={getDayName(day, language)}
            isSelected={selectedDay === day}
            isToday={day === todayKey}
            type={getDayType(day)}
            isFlex={day === 'Sex'}
            onSelect={() => setSelectedDay(day)}
            onToggleOffice={() => handleToggleOffice(day)}
          />
        ))}
      </div>

      {/* Day Note */}
      <div className={`day-note ${getDayType(selectedDay)}`}>
        <Icon name={getDayNoteIcon(getDayType(selectedDay))} className="note-icon" />
        <span className="note-text">
          {isToday && <strong>{language === 'pt-BR' ? 'Hoje' : 'Today'} · </strong>}
          {getDayTypeNote(getDayType(selectedDay), language)}
        </span>
      </div>

      {/* Action Cards */}
      <div className="schedule-cards">
        {workoutInfo ? (
          <button className="schedule-card" onClick={() => onTabChange?.('training')} style={{ borderLeftColor: getModColor(workoutInfo.type) }}>
            <div className="schedule-card-icon" style={{ background: `${getModColor(workoutInfo.type)}20` }}>
              <Icon name={getModIcon(workoutInfo.type)} style={{ color: getModColor(workoutInfo.type) }} />
            </div>
            <div className="schedule-card-info">
              <span className="schedule-card-title">{workoutInfo.name}</span>
              <span className="schedule-card-sub">{workoutInfo.detail}</span>
            </div>
            <Icon name="chevron-right" className="schedule-card-arrow" />
          </button>
        ) : (
          <button className="schedule-card empty" onClick={() => onTabChange?.('training')}>
            <div className="schedule-card-icon">
              <Icon name="dumbbell-1" />
            </div>
            <div className="schedule-card-info">
              <span className="schedule-card-title">{language === 'pt-BR' ? 'Sem treino hoje' : 'No workout today'}</span>
              <span className="schedule-card-sub">{language === 'pt-BR' ? 'Configurar treino' : 'Set up workout'}</span>
            </div>
            <Icon name="chevron-right" className="schedule-card-arrow" />
          </button>
        )}

        <button className="schedule-card" onClick={() => onTabChange?.('meals')} style={{ borderLeftColor: 'var(--color-accent-secondary, #6bcfff)' }}>
          <div className="schedule-card-icon" style={{ background: 'rgba(107, 207, 255, 0.15)' }}>
            <Icon name="knife-fork-1" style={{ color: 'var(--color-accent-secondary, #6bcfff)' }} />
          </div>
          <div className="schedule-card-info">
            <span className="schedule-card-title">
              {dietInfo ? dietInfo.name : (language === 'pt-BR' ? 'Alimentação' : 'Nutrition')}
            </span>
            <span className="schedule-card-sub">
              {dietInfo ? dietInfo.progress : (language === 'pt-BR' ? 'Configurar dieta' : 'Set up diet')}
            </span>
          </div>
          <Icon name="chevron-right" className="schedule-card-arrow" />
        </button>
      </div>

      {/* Daily Blocks - simplified flat list */}
      <h3 className="schedule-blocks-title">
        {language === 'pt-BR' ? 'Rotina do dia' : 'Daily routine'}
      </h3>
      <div className="schedule-blocks">
        {dayData.blocks.map((block, index) => {
          const color = DESIGN.blockTypeColors[block.type] || '#666';
          const iconName = BLOCK_ICONS[block.type] || 'star-fat';
          return (
            <div key={index} className={`schedule-block ${block.type}`}>
              <span className="schedule-block-time">{block.time}</span>
              <Icon name={iconName} className="schedule-block-icon" style={{ color }} />
              <span className="schedule-block-label">{getBlockLabel(block, language)}</span>
              {block.tag && <span className="schedule-block-tag">{block.tag}</span>}
            </div>
          );
        })}
      </div>

      <p className="office-hint">
        <Icon name="hand-1" className="hint-icon" />
        {language === 'pt-BR'
          ? 'Segure num dia da semana para alternar escritório/home'
          : 'Long-press a weekday to toggle office/home'}
      </p>
    </div>
  );
}

function DayTab({ day, displayName, isSelected, isToday, type, isFlex, onSelect, onToggleOffice }) {
  const longPressProps = useLongPress(onToggleOffice, onSelect);

  return (
    <button
      className={`day-tab ${isSelected ? 'active' : ''} ${isToday ? 'today' : ''}`}
      {...longPressProps}
    >
      <span className="day-name">{displayName}</span>
      <div className="day-indicators">
        {type === 'office' && <span className="indicator office" />}
        {isFlex && <span className="indicator flex" />}
      </div>
    </button>
  );
}
