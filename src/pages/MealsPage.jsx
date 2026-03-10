import { useState, useMemo, useEffect } from 'react';
import { MEAL_PLAN, MACRO_TARGETS, getMealName, getMealTime, getMealNote, getMealOptions } from '../data/meals';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../components/Toast';
import { Icon } from '../components/Icon';
import './MealsPage.css';

export function MealsPage() {
  const { language } = useLanguage();
  const toast = useToast();
  const [expandedMeal, setExpandedMeal] = useState(null);

  // Get today's key for meal tracking
  const today = new Date().toISOString().split('T')[0];
  const storageKey = `meals_completed_${today}`;

  const [completedMeals, setCompletedMeals] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch {
      return [];
    }
  });

  // Save completed meals to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(completedMeals));
  }, [completedMeals, storageKey]);

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
      muscle_gain: language === 'pt-BR' ? 'Foco em ganho de massa' : 'Focus on muscle gain',
      weight_loss: language === 'pt-BR' ? 'Foco em perda de gordura' : 'Focus on fat loss',
      maintain: language === 'pt-BR' ? 'Manutenção de peso' : 'Weight maintenance',
      general: language === 'pt-BR' ? 'Saúde e bem-estar' : 'Health and wellness'
    };
    return labels[goal] || labels.general;
  };

  const toggleMeal = (index) => {
    setExpandedMeal(expandedMeal === index ? null : index);
  };

  const toggleMealComplete = (index, e) => {
    e.stopPropagation();
    const isCompleting = !completedMeals.includes(index);

    if (isCompleting) {
      setCompletedMeals([...completedMeals, index]);
      if (navigator.vibrate) navigator.vibrate(50);

      // Check if all meals completed
      if (completedMeals.length + 1 === MEAL_PLAN.length) {
        toast.success(language === 'pt-BR' ? 'Todas as refeições concluídas!' : 'All meals completed!');
      }
    } else {
      setCompletedMeals(completedMeals.filter(i => i !== index));
    }
  };

  const progress = Math.round((completedMeals.length / MEAL_PLAN.length) * 100);

  return (
    <div className="meals-page">
      <h2 className="meals-title">
        {language === 'pt-BR' ? 'Plano Alimentar' : 'Meal Plan'}
      </h2>
      <p className="meals-subtitle">
        {macros.calorias} · {profile ? getGoalLabel(profile.goal) : getGoalLabel('muscle_gain')}
      </p>

      {/* Daily Progress */}
      <div className="meals-progress">
        <div className="meals-progress-header">
          <span className="meals-progress-label">
            {language === 'pt-BR' ? 'Progresso de hoje' : "Today's progress"}
          </span>
          <span className="meals-progress-count">
            {completedMeals.length}/{MEAL_PLAN.length}
          </span>
        </div>
        <div className="meals-progress-bar">
          <div className="meals-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="meals-list">
        {MEAL_PLAN.map((meal, index) => (
          <MealCard
            key={index}
            meal={meal}
            index={index}
            isExpanded={expandedMeal === index}
            isCompleted={completedMeals.includes(index)}
            onClick={() => toggleMeal(index)}
            onToggleComplete={(e) => toggleMealComplete(index, e)}
            language={language}
          />
        ))}
      </div>

      <div className="macros-panel">
        <h3 className="macros-title">
          {language === 'pt-BR' ? 'Metas Diárias' : 'Daily Goals'}
        </h3>
        <div className="macros-grid">
          <MacroItem
            label={language === 'pt-BR' ? 'Calorias' : 'Calories'}
            value={macros.calorias}
            color="var(--color-accent)"
          />
          <MacroItem
            label={language === 'pt-BR' ? 'Proteína' : 'Protein'}
            value={macros.proteina}
            color="var(--color-red)"
          />
          <MacroItem
            label={language === 'pt-BR' ? 'Carboidrato' : 'Carbs'}
            value={macros.carboidrato}
            color="var(--color-blue)"
          />
          <MacroItem
            label={language === 'pt-BR' ? 'Gordura' : 'Fat'}
            value={macros.gordura}
            color="var(--color-orange)"
          />
        </div>
      </div>
    </div>
  );
}

function MealCard({ meal, index, isExpanded, isCompleted, onClick, onToggleComplete, language }) {
  const mealName = getMealName(meal, language);
  const mealTime = getMealTime(meal, language);
  const mealNote = getMealNote(meal, language);
  const mealOptions = getMealOptions(meal, language);

  return (
    <div className={`meal-card ${isExpanded ? 'expanded' : ''} ${isCompleted ? 'completed' : ''}`}>
      <div className="meal-header" onClick={onClick}>
        <button
          type="button"
          className={`meal-check ${isCompleted ? 'checked' : ''}`}
          onClick={onToggleComplete}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          <Icon name={isCompleted ? 'checkmark-1' : 'circle-1'} />
        </button>
        <Icon name={meal.icon} className="meal-icon" />
        <div className="meal-info">
          <span className="meal-name">{mealName}</span>
          <span className="meal-time">{mealTime}</span>
        </div>
        <Icon
          name={isExpanded ? 'chevron-up-1' : 'chevron-down-1'}
          className="meal-arrow"
        />
      </div>

      {isExpanded && (
        <div className="meal-content">
          <p className="meal-note">{mealNote}</p>
          <div className="meal-options">
            {mealOptions.map((option, i) => (
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
