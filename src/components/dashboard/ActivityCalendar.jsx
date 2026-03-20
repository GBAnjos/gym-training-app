import { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { DESIGN } from '../../data/design';
import { Icon } from '../Icon';

export function ActivityCalendar({ trainingDays, getDateActivityData }) {
  const { t, language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Day labels
  const dayLabels = language === 'pt-BR'
    ? ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
    : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Month/year label
  const monthLabel = currentDate.toLocaleDateString(language, { month: 'long', year: 'numeric' });

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().split('T')[0];

  // Build training days set for fast lookup
  const trainingSet = new Set(trainingDays);

  // Get activity type for a date (simplified — checks plan schedule)
  function getDateDots(dateStr) {
    const activityData = getDateActivityData(dateStr);
    if (!activityData || !trainingSet.has(dateStr)) return [];
    const color = DESIGN.sportColors[activityData.type]?.primary || DESIGN.sportColors.gym.primary;
    return [{ color, type: activityData.type }];
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Selected date detail
  const selectedActivity = selectedDate ? getDateActivityData(selectedDate) : null;

  return (
    <div className="dashboard-section calendar-section">
      {/* Month navigation */}
      <div className="calendar-nav">
        <button className="calendar-nav-btn" onClick={prevMonth}>
          <Icon name="chevron-left" />
        </button>
        <span className="calendar-month-label">
          {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
        </span>
        <button className="calendar-nav-btn" onClick={nextMonth}>
          <Icon name="chevron-right" />
        </button>
      </div>

      {/* Day labels */}
      <div className="calendar-grid">
        {dayLabels.map((label, i) => (
          <div key={`label-${i}`} className="calendar-day-label">{label}</div>
        ))}

        {/* Empty cells before first day */}
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`empty-${i}`} className="calendar-cell empty" />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const dots = getDateDots(dateStr);

          return (
            <button
              key={dateStr}
              className={`calendar-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedDate(isSelected ? null : dateStr)}
            >
              <span className="calendar-day-number">{day}</span>
              {dots.length > 0 && (
                <div className="calendar-dots">
                  {dots.map((dot, j) => (
                    <span key={j} className="calendar-dot" style={{ backgroundColor: dot.color }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date detail */}
      {selectedDate && trainingSet.has(selectedDate) && selectedActivity && (
        <div className="calendar-detail" style={{ borderLeftColor: DESIGN.sportColors[selectedActivity.type]?.primary }}>
          <span className="calendar-detail-date">
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString(language, { weekday: 'short', day: 'numeric' })}
            {' · '}
            {selectedActivity.type.charAt(0).toUpperCase() + selectedActivity.type.slice(1)}
          </span>
          <span className="calendar-detail-info">
            {selectedActivity.session?.name?.[language] || selectedActivity.session?.name || selectedActivity.type}
            {selectedActivity.data?.rounds ? ` · ${selectedActivity.data.rounds} rounds` : ''}
            {selectedActivity.data?.distance ? ` · ${selectedActivity.data.distance} km` : ''}
          </span>
        </div>
      )}

      {/* Empty state */}
      {trainingDays.length === 0 && (
        <p className="calendar-empty">{t('dashboard_empty_calendar')}</p>
      )}
    </div>
  );
}
