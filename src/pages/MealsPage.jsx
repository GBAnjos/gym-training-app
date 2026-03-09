import { useState, useMemo } from 'react';
import { MEAL_PLAN, MACRO_TARGETS } from '../data/meals';
import './MealsPage.css';

export function MealsPage() {
  const [expandedMeal, setExpandedMeal] = useState(null);

  // Load personalized macros from localStorage if available
  const { macros, profile } = useMemo(() => {
    try {
      const savedMeals = localStorage.getItem('vida_user_meals');
      const savedProfile = localStorage.getItem('vida_user_profile');
      if (savedMeals) {
        const meals = JSON.parse(savedMeals);
        return {
          macros: meals.macros || MACRO_TARGETS,
          profile: savedProfile ? JSON.parse(savedProfile) : null
        };
      }
    } catch (e) {
      console.error('Error loading meals:', e);
    }
    return { macros: MACRO_TARGETS, profile: null };
  }, []);

  const getGoalLabel = (goal) => {
    const labels = {
      muscle_gain: 'Foco em ganho de massa',
      weight_loss: 'Foco em perda de gordura',
      maintain: 'Manutenção de peso',
      general: 'Saúde e bem-estar'
    };
    return labels[goal] || labels.general;
  };

  const toggleMeal = (index) => {
    setExpandedMeal(expandedMeal === index ? null : index);
  };

  return (
    <div className="meals-page">
      <h2 className="meals-title">Plano Alimentar</h2>
      <p className="meals-subtitle">
        {macros.calorias} · {profile ? getGoalLabel(profile.goal) : 'Foco em ganho de massa'}
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
          <MacroItem label="Calorias" value={macros.calorias} color="var(--color-accent)" />
          <MacroItem label="Proteína" value={macros.proteina} color="var(--color-red)" />
          <MacroItem label="Carboidrato" value={macros.carboidrato} color="var(--color-blue)" />
          <MacroItem label="Gordura" value={macros.gordura} color="var(--color-orange)" />
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
