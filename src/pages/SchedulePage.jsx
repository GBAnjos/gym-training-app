import { useState, useMemo } from 'react';
import { SCHEDULE, DAY_ORDER } from '../data/schedule';
import { DESIGN } from '../data/design';
import { useOfficeDays } from '../hooks/useOfficeDays';
import { useLanguage } from '../hooks/useLanguage';
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

export function SchedulePage() {
  const { language } = useLanguage();
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

  return (
    <div className="schedule-page">
      {/* Day Tabs */}
      <div className="day-tabs">
        {DAY_ORDER.map(day => {
          const type = getDayType(day);
          const isFlex = day === 'Sex';
          const isToday = day === todayKey;

          return (
            <button
              key={day}
              className={`day-tab ${selectedDay === day ? 'active' : ''} ${isToday ? 'today' : ''}`}
              onClick={() => setSelectedDay(day)}
              onDoubleClick={() => {
                if (!['Sáb', 'Dom'].includes(day)) {
                  toggleOfficeDay(day);
                }
              }}
            >
              <span className="day-name">{day}</span>
              <div className="day-indicators">
                {type === 'office' && <span className="indicator office" />}
                {isFlex && <span className="indicator flex" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Day Note */}
      <div className={`day-note ${getDayType(selectedDay)}`}>
        <Icon name={getDayNoteIcon(getDayType(selectedDay))} className="note-icon" />
        <span className="note-text">{dayData.note}</span>
      </div>

      {/* Timeline */}
      <div className="timeline">
        {dayData.blocks.map((block, index) => (
          <TimeBlock key={index} block={block} />
        ))}
      </div>

      <p className="office-hint">
        {language === 'pt-BR'
          ? 'Dica: clique duplo num dia para alternar entre escritório/home'
          : 'Tip: double-click a day to toggle office/home'}
      </p>
    </div>
  );
}

function TimeBlock({ block }) {
  const isApproximate = block.time.startsWith('~');
  const color = DESIGN.blockTypeColors[block.type] || '#666';
  const iconName = BLOCK_ICONS[block.type] || 'star-fat';

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
          <span className="block-label">{block.label}</span>
          {block.tag && <TagBadge tag={block.tag} />}
        </div>
        <p className="block-sub">{block.sub}</p>
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
