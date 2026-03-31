import { useState, useMemo, useEffect, useCallback } from 'react';
import { MEAL_PLAN, MACRO_TARGETS, getMealName, getMealTime, getMealNote, getMealOptions } from '../data/meals';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../components/Toast';
import { Icon } from '../components/Icon';
import './MealsPage.css';

export function MealsPage({ onTabChange }) {
  const { t, language } = useLanguage();
  const toast = useToast();
  const [expandedMeal, setExpandedMeal] = useState(null);

  // Load custom diet from localStorage
  const customDiet = useMemo(() => {
    try {
      const raw = localStorage.getItem('vida_custom_diet');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, []);

  // If custom diet exists, show custom diet view
  if (customDiet) {
    return (
      <CustomDietView
        diet={customDiet}
        t={t}
        language={language}
        toast={toast}
        onTabChange={onTabChange}
      />
    );
  }

  return (
    <DefaultMealsView
      t={t}
      language={language}
      toast={toast}
      onTabChange={onTabChange}
      expandedMeal={expandedMeal}
      setExpandedMeal={setExpandedMeal}
    />
  );
}

function DefaultMealsView({ t, language, toast, onTabChange, expandedMeal, setExpandedMeal }) {
  const today = new Date().toISOString().split('T')[0];
  const storageKey = `meals_completed_${today}`;

  const [completedMeals, setCompletedMeals] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(completedMeals));
  }, [completedMeals, storageKey]);

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

      {/* Create Diet CTA */}
      <button className="meals-create-diet-btn" onClick={() => onTabChange?.('diet-builder')}>
        <Icon name="plus-circle" className="meals-create-diet-icon" />
        <span>{t('meals_create_diet')}</span>
        <Icon name="chevron-right" className="meals-create-diet-arrow" />
      </button>

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

/* ===== Custom Diet View ===== */
function CustomDietView({ diet, t, language, toast, onTabChange }) {
  const [expandedMeal, setExpandedMeal] = useState(diet.meals[0]?.id || null);

  const today = new Date().toISOString().split('T')[0];
  const dietStorageKey = `diet_completed_${today}`;

  // checkedFoods: { [mealId]: [foodId, ...] }
  const [checkedFoods, setCheckedFoods] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(dietStorageKey) || '{}');
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem(dietStorageKey, JSON.stringify(checkedFoods));
  }, [checkedFoods, dietStorageKey]);

  const toggleFood = useCallback((mealId, foodId) => {
    setCheckedFoods(prev => {
      const mealChecked = prev[mealId] || [];
      const isChecked = mealChecked.includes(foodId);
      const updated = isChecked
        ? mealChecked.filter(id => id !== foodId)
        : [...mealChecked, foodId];
      return { ...prev, [mealId]: updated };
    });
    if (navigator.vibrate) navigator.vibrate(50);
  }, []);

  // Calculate totals
  const totalFoods = diet.meals.reduce((sum, m) => sum + m.foods.length, 0);
  const checkedCount = Object.values(checkedFoods).reduce((sum, arr) => sum + arr.length, 0);
  const progress = totalFoods > 0 ? Math.round((checkedCount / totalFoods) * 100) : 0;

  // Calculate consumed macros
  const consumed = useMemo(() => {
    let cal = 0, pro = 0, carb = 0, fat = 0;
    diet.meals.forEach(meal => {
      const mealChecked = checkedFoods[meal.id] || [];
      meal.foods.forEach(food => {
        if (mealChecked.includes(food.id)) {
          cal += Number(food.calories) || 0;
          pro += Number(food.protein) || 0;
          carb += Number(food.carbs) || 0;
          fat += Number(food.fat) || 0;
        }
      });
    });
    return { calories: cal, protein: pro, carbs: carb, fat };
  }, [diet.meals, checkedFoods]);

  // Check all foods completed
  useEffect(() => {
    if (totalFoods > 0 && checkedCount === totalFoods) {
      toast.success(language === 'pt-BR' ? 'Todas as refeições concluídas!' : 'All meals completed!');
    }
  }, [checkedCount, totalFoods, toast, language]);

  const targets = diet.dailyTargets || {};

  return (
    <div className="meals-page">
      <div className="meals-diet-header">
        <h2 className="meals-title">{diet.name || t('meals_my_diet')}</h2>
        <button className="meals-diet-edit-btn" onClick={() => onTabChange?.('diet-builder')}>
          <Icon name="pencil-1" />
          <span>{t('meals_edit_diet')}</span>
        </button>
      </div>

      {/* Daily Progress */}
      <div className="meals-progress">
        <div className="meals-progress-header">
          <span className="meals-progress-label">
            {language === 'pt-BR' ? 'Progresso de hoje' : "Today's progress"}
          </span>
          <span className="meals-progress-count">
            {checkedCount}/{totalFoods}
          </span>
        </div>
        <div className="meals-progress-bar">
          <div className="meals-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Consumed vs Targets */}
      {(targets.calories || targets.protein || targets.carbs || targets.fat) && (
        <div className="macros-panel">
          <h3 className="macros-title">
            {language === 'pt-BR' ? 'Consumo de Hoje' : "Today's Intake"}
          </h3>
          <div className="macros-grid">
            {targets.calories && (
              <MacroItem
                label={language === 'pt-BR' ? 'Calorias' : 'Calories'}
                value={`${consumed.calories} / ${targets.calories}`}
                color="var(--color-accent)"
              />
            )}
            {targets.protein && (
              <MacroItem
                label={language === 'pt-BR' ? 'Proteína' : 'Protein'}
                value={`${consumed.protein}g / ${targets.protein}g`}
                color="var(--color-red)"
              />
            )}
            {targets.carbs && (
              <MacroItem
                label={language === 'pt-BR' ? 'Carboidrato' : 'Carbs'}
                value={`${consumed.carbs}g / ${targets.carbs}g`}
                color="var(--color-blue)"
              />
            )}
            {targets.fat && (
              <MacroItem
                label={language === 'pt-BR' ? 'Gordura' : 'Fat'}
                value={`${consumed.fat}g / ${targets.fat}g`}
                color="var(--color-orange)"
              />
            )}
          </div>
        </div>
      )}

      {/* Meal Cards */}
      <div className="meals-list">
        {diet.meals.map(meal => {
          const mealChecked = checkedFoods[meal.id] || [];
          const allChecked = meal.foods.length > 0 && mealChecked.length === meal.foods.length;
          const isExpanded = expandedMeal === meal.id;

          return (
            <div key={meal.id} className={`meal-card ${isExpanded ? 'expanded' : ''} ${allChecked ? 'completed' : ''}`}>
              <div className="meal-header" onClick={() => setExpandedMeal(isExpanded ? null : meal.id)}>
                <div className={`meal-check ${allChecked ? 'checked' : ''}`}>
                  <Icon name="checkmark-1" />
                </div>
                <div className="meal-info">
                  <span className="meal-name">{meal.name}</span>
                  <span className="meal-time">
                    {mealChecked.length}/{meal.foods.length} {language === 'pt-BR' ? 'alimentos' : 'foods'}
                  </span>
                </div>
                <Icon name={isExpanded ? 'chevron-up-1' : 'chevron-down-1'} className="meal-arrow" />
              </div>

              {isExpanded && (
                <div className="meal-content">
                  {meal.foods.length === 0 ? (
                    <p className="meals-diet-empty">{t('diet_builder_empty')}</p>
                  ) : (
                    <div className="meals-diet-foods">
                      {meal.foods.map(food => {
                        const isChecked = mealChecked.includes(food.id);
                        return (
                          <div
                            key={food.id}
                            className={`meals-diet-food-row ${isChecked ? 'checked' : ''}`}
                            onClick={() => toggleFood(meal.id, food.id)}
                          >
                            <div className={`meals-diet-food-check ${isChecked ? 'checked' : ''}`}>
                              <Icon name="checkmark-1" />
                            </div>
                            <div className="meals-diet-food-info">
                              <span className="meals-diet-food-name">{food.name}</span>
                              <span className="meals-diet-food-meta">
                                {food.quantity && `${food.quantity} · `}
                                {food.calories && `${food.calories} cal`}
                                {food.protein && ` · ${food.protein}g P`}
                                {food.carbs && ` · ${food.carbs}g C`}
                                {food.fat && ` · ${food.fat}g ${language === 'pt-BR' ? 'G' : 'F'}`}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
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
          <Icon name="checkmark-1" />
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
