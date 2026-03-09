import { useState } from 'react';
import { MEAL_PLAN, MACRO_TARGETS } from '../data/meals';
import './MealsPage.css';

export function MealsPage() {
  const [expandedMeal, setExpandedMeal] = useState(null);

  const toggleMeal = (index) => {
    setExpandedMeal(expandedMeal === index ? null : index);
  };

  return (
    <div className="meals-page">
      <h2 className="meals-title">Plano Alimentar</h2>
      <p className="meals-subtitle">
        Ectomorfo · 3000-3200 kcal/dia · Foco em ganho de massa
      </p>

      <div className="meals-list">
        {MEAL_PLAN.map((meal, index) => (
          <MealCard
            key={index}
            meal={meal}
            isExpanded={expandedMeal === index}
            onClick={() => toggleMeal(index)}
          />
        ))}
      </div>

      <div className="macros-panel">
        <h3 className="macros-title">Metas Diárias</h3>
        <div className="macros-grid">
          <MacroItem label="Calorias" value={MACRO_TARGETS.calorias} color="var(--color-accent)" />
          <MacroItem label="Proteína" value={MACRO_TARGETS.proteina} color="var(--color-red)" />
          <MacroItem label="Carboidrato" value={MACRO_TARGETS.carboidrato} color="var(--color-blue)" />
          <MacroItem label="Gordura" value={MACRO_TARGETS.gordura} color="var(--color-orange)" />
        </div>
      </div>
    </div>
  );
}

function MealCard({ meal, isExpanded, onClick }) {
  return (
    <div className={`meal-card ${isExpanded ? 'expanded' : ''}`} onClick={onClick}>
      <div className="meal-header">
        <span className="meal-icon">{meal.icon}</span>
        <div className="meal-info">
          <span className="meal-name">{meal.name}</span>
          <span className="meal-time">{meal.time}</span>
        </div>
        <span className={`meal-arrow ${isExpanded ? 'open' : ''}`}>▼</span>
      </div>

      {isExpanded && (
        <div className="meal-content animate-slide-up">
          <p className="meal-note">{meal.note}</p>
          <div className="meal-options">
            {meal.options.map((option, i) => (
              <div key={i} className="meal-option">
                <span className="option-number">{i + 1}</span>
                <span className="option-text">{option}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MacroItem({ label, value, color }) {
  return (
    <div className="macro-item">
      <span className="macro-dot" style={{ backgroundColor: color }} />
      <div className="macro-info">
        <span className="macro-label">{label}</span>
        <span className="macro-value">{value}</span>
      </div>
    </div>
  );
}
