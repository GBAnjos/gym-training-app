import { useState, useMemo, useRef, useCallback } from 'react';
import { SCHEDULE, DAY_ORDER, getDayNote, getBlockLabel, getBlockSub, getDayName } from '../data/schedule';
import { DESIGN } from '../data/design';
import { useOfficeDays } from '../hooks/useOfficeDays';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../components/Toast';
import { Icon } from '../components/Icon';
import './SchedulePage.css';

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

export function SchedulePage() {
  const { language } = useLanguage();
  const toast = useToast();
  const today = new Date();
  const dayIndex = today.getDay();
  const dayMap = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const todayKey = dayMap[dayIndex];

  const [selectedDay, setSelectedDay] = useState(todayKey);
  const { isOfficeDay, toggleOfficeDay } = useOfficeDays();

  // Load personalized schedule from localStorage if available
  const schedule = useMemo(() => {
    try {
      const saved = localStorage.getItem('vida_user_schedule');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading schedule:', e);
    }
    return SCHEDULE;
  }, []);

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
        <span className="note-text">{getDayNote(selectedDay, language)}</span>
      </div>

      {/* Timeline */}
      <div className="timeline">
        {dayData.blocks.map((block, index) => (
          <TimeBlock key={index} block={block} language={language} />
        ))}
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

function TimeBlock({ block, language }) {
  const isApproximate = block.time.startsWith('~');
  const color = DESIGN.blockTypeColors[block.type] || '#666';
  const iconName = BLOCK_ICONS[block.type] || 'star-fat';
  const label = getBlockLabel(block, language);
  const sub = getBlockSub(block, language);

  return (
    <div className={`time-block ${isApproximate ? 'approximate' : ''} ${block.type}`}>
      <div className="block-time" style={{ fontFamily: 'var(--font-mono)' }}>
        {block.time}
      </div>
      <div className="block-line">
        <span className="block-dot" style={{ backgroundColor: color }} />
        <span className="block-connector" />
      </div>
      <div className="block-content">
        <div className="block-header">
          <Icon name={iconName} className="block-icon" style={{ color }} />
          <span className="block-label">{label}</span>
          {block.tag && <TagBadge tag={block.tag} />}
        </div>
        <p className="block-sub">{sub}</p>
      </div>
    </div>
  );
}

function TagBadge({ tag }) {
  const tagColors = {
    gym: { bg: 'rgba(200, 245, 90, 0.2)', color: '#c8f55a' },
    office: { bg: 'rgba(107, 207, 255, 0.2)', color: '#6bcfff' },
    chore: { bg: 'rgba(136, 136, 136, 0.2)', color: '#888' },
    social: { bg: 'rgba(255, 107, 107, 0.2)', color: '#ff6b6b' },
    flex: { bg: 'rgba(170, 170, 170, 0.2)', color: '#aaa' },
    meal: { bg: 'rgba(107, 207, 255, 0.2)', color: '#6bcfff' },
    sport: { bg: 'rgba(200, 153, 255, 0.2)', color: '#c899ff' },
  };

  const style = tagColors[tag] || tagColors.chore;

  return (
    <span
      className="tag-badge"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {tag.toUpperCase()}
    </span>
  );
}
