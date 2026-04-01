import { useState, useMemo, useEffect, useCallback } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../components/Toast';
import { Icon } from '../components/Icon';
import './MealsPage.css';

export function MealsPage({ onTabChange }) {
  const { t, language } = useLanguage();
  const toast = useToast();

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
    />
  );
}

function DefaultMealsView({ t, language, toast, onTabChange }) {
  return (
    <div className="meals-page">
      <h2 className="meals-title">
        {language === 'pt-BR' ? 'Plano Alimentar' : 'Meal Plan'}
      </h2>
      <p className="meals-subtitle">
        {language === 'pt-BR' ? 'Configure sua dieta personalizada' : 'Set up your personalized diet'}
      </p>

      <div className="meals-empty-state">
        <Icon name="knife-fork-1" className="meals-empty-icon" />
        <p className="meals-empty-text">
          {language === 'pt-BR'
            ? 'Crie sua dieta personalizada ou importe de outra fonte'
            : 'Create your personalized diet or import from another source'}
        </p>
      </div>

      <div className="meals-action-row">
        <button className="meals-create-diet-btn" onClick={() => onTabChange?.('diet-builder')}>
          <Icon name="plus-circle" className="meals-create-diet-icon" />
          <span>{t('meals_create_diet')}</span>
          <Icon name="chevron-right" className="meals-create-diet-arrow" />
        </button>
        <button className="meals-import-diet-btn" onClick={() => onTabChange?.('import-diet')}>
          <Icon name="upload-1" />
          <span>{t('meals_import_diet')}</span>
        </button>
      </div>
    </div>
  );
}

/* ===== Custom Diet View ===== */
function CustomDietView({ diet, t, language, toast, onTabChange }) {
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

      {/* Consumed vs Targets — as progress bars */}
      {(targets.calories || targets.protein || targets.carbs || targets.fat) && (
        <div className="meals-macro-bars">
          <h3 className="meals-macro-bars-title">
            {language === 'pt-BR' ? 'Consumo de Hoje' : "Today's Intake"}
          </h3>
          {targets.calories && (
            <MacroBar label={language === 'pt-BR' ? 'Calorias' : 'Calories'} current={consumed.calories} target={targets.calories} unit="cal" color="var(--color-accent-primary)" />
          )}
          {targets.protein && (
            <MacroBar label={language === 'pt-BR' ? 'Proteína' : 'Protein'} current={consumed.protein} target={targets.protein} unit="g" color="var(--color-red, #ff3b30)" />
          )}
          {targets.carbs && (
            <MacroBar label={language === 'pt-BR' ? 'Carboidrato' : 'Carbs'} current={consumed.carbs} target={targets.carbs} unit="g" color="var(--color-blue, #007aff)" />
          )}
          {targets.fat && (
            <MacroBar label={language === 'pt-BR' ? 'Gordura' : 'Fat'} current={consumed.fat} target={targets.fat} unit="g" color="var(--color-orange, #ff9f0a)" />
          )}
        </div>
      )}

      {/* Meal Cards */}
      <div className="meals-list">
        {diet.meals.map(meal => {
          const mealChecked = checkedFoods[meal.id] || [];
          const allChecked = meal.foods.length > 0 && mealChecked.length === meal.foods.length;

          return (
            <div key={meal.id} className={`meal-card ${allChecked ? 'completed' : ''}`}>
              <div className="meal-header">
                <div className={`meal-check ${allChecked ? 'checked' : ''}`}>
                  <Icon name="checkmark-1" />
                </div>
                <div className="meal-info">
                  <span className="meal-name">{meal.name}</span>
                  <span className="meal-time">
                    {mealChecked.length}/{meal.foods.length} {language === 'pt-BR' ? 'alimentos' : 'foods'}
                  </span>
                </div>
              </div>

              {/* Always visible foods */}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MacroBar({ label, current, target, unit, color }) {
  const pct = Math.min(Math.round((current / target) * 100), 100);
  return (
    <div className="macro-bar-item">
      <div className="macro-bar-header">
        <span className="macro-bar-label">{label}</span>
        <span className="macro-bar-value">{current}{unit} / {target}{unit}</span>
      </div>
      <div className="macro-bar-track">
        <div className="macro-bar-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
