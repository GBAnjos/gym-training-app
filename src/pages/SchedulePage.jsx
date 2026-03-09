import { useState } from 'react';
import { SCHEDULE, DAY_ORDER } from '../data/schedule';
import { DESIGN } from '../data/design';
import { useOfficeDays } from '../hooks/useOfficeDays';
import './SchedulePage.css';

export function SchedulePage() {
  const today = new Date();
  const dayIndex = today.getDay();
  const dayMap = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const todayKey = dayMap[dayIndex];

  const [selectedDay, setSelectedDay] = useState(todayKey);
  const { isOfficeDay, toggleOfficeDay } = useOfficeDays();

  const dayData = SCHEDULE[selectedDay];

  const getDayType = (day) => {
    if (day === 'Sáb' || day === 'Dom') return 'weekend';
    if (isOfficeDay(day)) return 'office';
    return 'home';
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
        <span className="note-icon">
          {getDayType(selectedDay) === 'office' ? '💼' : getDayType(selectedDay) === 'weekend' ? '🌴' : '🏠'}
        </span>
        <span className="note-text">{dayData.note}</span>
      </div>

      {/* Timeline */}
      <div className="timeline">
        {dayData.blocks.map((block, index) => (
          <TimeBlock key={index} block={block} />
        ))}
      </div>

      <p className="office-hint">
        Dica: clique duplo num dia para alternar entre escritório/home
      </p>
    </div>
  );
}

function TimeBlock({ block }) {
  const isApproximate = block.time.startsWith('~');
  const color = DESIGN.blockTypeColors[block.type] || '#666';

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
          <span className="block-icon">{block.icon}</span>
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
