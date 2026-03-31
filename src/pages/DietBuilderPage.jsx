import { useState, useCallback } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../components/Toast';
import { Icon } from '../components/Icon';
import './DietBuilderPage.css';

function createMeal(name) {
  return { id: crypto.randomUUID(), name, time: '', foods: [] };
}

function createFood() {
  return { id: crypto.randomUUID(), name: '', calories: '', protein: '', carbs: '', fat: '', quantity: '' };
}

export function DietBuilderPage({ onBack, onComplete }) {
  const { t, language } = useLanguage();
  const toast = useToast();

  const [dietName, setDietName] = useState('');
  const [showTargets, setShowTargets] = useState(true);
  const [dailyTargets, setDailyTargets] = useState({
    calories: '', protein: '', carbs: '', fat: '',
  });
  const [meals, setMeals] = useState([
    createMeal(t('diet_builder_meal_breakfast')),
    createMeal(t('diet_builder_meal_lunch')),
    createMeal(t('diet_builder_meal_snack')),
    createMeal(t('diet_builder_meal_dinner')),
  ]);
  const [expandedMeal, setExpandedMeal] = useState(meals[0]?.id || null);

  const updateTarget = useCallback((field, value) => {
    setDailyTargets(prev => ({ ...prev, [field]: value }));
  }, []);

  const addMeal = useCallback(() => {
    const newMeal = createMeal('');
    setMeals(prev => [...prev, newMeal]);
    setExpandedMeal(newMeal.id);
  }, []);

  const removeMeal = useCallback((mealId) => {
    setMeals(prev => prev.filter(m => m.id !== mealId));
    setExpandedMeal(prev => prev === mealId ? null : prev);
  }, []);

  const updateMealName = useCallback((mealId, name) => {
    setMeals(prev => prev.map(m => m.id === mealId ? { ...m, name } : m));
  }, []);

  const addFood = useCallback((mealId) => {
    setMeals(prev => prev.map(m =>
      m.id === mealId ? { ...m, foods: [...m.foods, createFood()] } : m
    ));
  }, []);

  const removeFood = useCallback((mealId, foodId) => {
    setMeals(prev => prev.map(m =>
      m.id === mealId ? { ...m, foods: m.foods.filter(f => f.id !== foodId) } : m
    ));
  }, []);

  const updateFood = useCallback((mealId, foodId, field, value) => {
    setMeals(prev => prev.map(m =>
      m.id === mealId
        ? { ...m, foods: m.foods.map(f => f.id === foodId ? { ...f, [field]: value } : f) }
        : m
    ));
  }, []);

  const handleSave = () => {
    const filledMeals = meals.filter(m => m.name.trim() || m.foods.length > 0);
    if (filledMeals.length === 0) return;

    const targets = showTargets ? {
      calories: dailyTargets.calories ? Number(dailyTargets.calories) : null,
      protein: dailyTargets.protein ? Number(dailyTargets.protein) : null,
      carbs: dailyTargets.carbs ? Number(dailyTargets.carbs) : null,
      fat: dailyTargets.fat ? Number(dailyTargets.fat) : null,
    } : { calories: null, protein: null, carbs: null, fat: null };

    const diet = {
      name: dietName || (language === 'pt-BR' ? 'Minha Dieta' : 'My Diet'),
      meals: filledMeals.map(m => ({
        ...m,
        foods: m.foods.filter(f => f.name.trim()),
      })),
      dailyTargets: targets,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('vida_custom_diet', JSON.stringify(diet));
    toast.success(language === 'pt-BR' ? 'Dieta salva!' : 'Diet saved!');
    onComplete?.();
  };

  const totalFoods = meals.reduce((sum, m) => sum + m.foods.filter(f => f.name.trim()).length, 0);
  const canSave = meals.some(m => m.name.trim() || m.foods.some(f => f.name.trim()));

  return (
    <div className="diet-builder-page">
      <div className="diet-builder-header">
        <button className="diet-builder-back" onClick={onBack}>
          <Icon name="chevron-left" />
        </button>
        <h1 className="diet-builder-title">{t('diet_builder_title')}</h1>
      </div>

      {/* Diet Name */}
      <input
        className="diet-builder-name-input"
        type="text"
        placeholder={t('diet_builder_name_placeholder')}
        value={dietName}
        onChange={e => setDietName(e.target.value)}
      />

      {/* Daily Targets */}
      <div className="diet-targets-section">
        <div className="diet-targets-header">
          <h3 className="diet-targets-title">{t('diet_builder_targets')}</h3>
          <button
            className={`diet-targets-toggle ${!showTargets ? 'skipped' : ''}`}
            onClick={() => setShowTargets(!showTargets)}
          >
            {showTargets ? t('diet_builder_targets_skip') : t('diet_builder_targets')}
          </button>
        </div>
        {showTargets && (
          <div className="diet-targets-grid">
            <div className="diet-target-input">
              <label>{t('diet_builder_calories')}</label>
              <input type="number" min="0" value={dailyTargets.calories} onChange={e => updateTarget('calories', e.target.value)} placeholder="2000" />
            </div>
            <div className="diet-target-input">
              <label>{t('diet_builder_protein')}</label>
              <input type="number" min="0" value={dailyTargets.protein} onChange={e => updateTarget('protein', e.target.value)} placeholder="150" />
            </div>
            <div className="diet-target-input">
              <label>{t('diet_builder_carbs')}</label>
              <input type="number" min="0" value={dailyTargets.carbs} onChange={e => updateTarget('carbs', e.target.value)} placeholder="250" />
            </div>
            <div className="diet-target-input">
              <label>{t('diet_builder_fat')}</label>
              <input type="number" min="0" value={dailyTargets.fat} onChange={e => updateTarget('fat', e.target.value)} placeholder="70" />
            </div>
          </div>
        )}
      </div>

      {/* Meals */}
      <div className="diet-meals-section">
        <h3 className="diet-meals-title">{t('diet_builder_meals')}</h3>

        {meals.map((meal) => (
          <div key={meal.id} className={`diet-meal-card ${expandedMeal === meal.id ? 'expanded' : ''}`}>
            <div className="diet-meal-header" onClick={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}>
              <input
                className="diet-meal-name-input"
                type="text"
                placeholder={t('diet_builder_meal_name')}
                value={meal.name}
                onChange={e => { e.stopPropagation(); updateMealName(meal.id, e.target.value); }}
                onClick={e => e.stopPropagation()}
              />
              <div className="diet-meal-actions">
                {meals.length > 1 && (
                  <button className="diet-meal-delete" onClick={e => { e.stopPropagation(); removeMeal(meal.id); }} title={t('diet_builder_delete_meal')}>
                    <Icon name="trash-1" />
                  </button>
                )}
                <Icon name={expandedMeal === meal.id ? 'chevron-up' : 'chevron-down'} className="diet-meal-arrow" />
              </div>
            </div>

            {expandedMeal === meal.id && (
              <div className="diet-meal-foods">
                {meal.foods.length === 0 ? (
                  <p className="diet-meal-empty">{t('diet_builder_empty')}</p>
                ) : (
                  meal.foods.map(food => (
                    <div key={food.id} className="diet-food-row">
                      <div className="diet-food-main">
                        <input
                          className="diet-food-name"
                          type="text"
                          placeholder={t('diet_builder_food_name')}
                          value={food.name}
                          onChange={e => updateFood(meal.id, food.id, 'name', e.target.value)}
                        />
                        <button className="diet-food-delete" onClick={() => removeFood(meal.id, food.id)} title={t('diet_builder_delete_food')}>
                          <Icon name="xmark" />
                        </button>
                      </div>
                      <div className="diet-food-macros">
                        <div className="diet-food-input">
                          <label>{t('diet_builder_food_qty')}</label>
                          <input type="text" value={food.quantity} onChange={e => updateFood(meal.id, food.id, 'quantity', e.target.value)} placeholder="100g" />
                        </div>
                        <div className="diet-food-input">
                          <label>{t('diet_builder_food_cal')}</label>
                          <input type="number" min="0" value={food.calories} onChange={e => updateFood(meal.id, food.id, 'calories', e.target.value)} placeholder="0" />
                        </div>
                        <div className="diet-food-input">
                          <label>{t('diet_builder_food_protein')}</label>
                          <input type="number" min="0" value={food.protein} onChange={e => updateFood(meal.id, food.id, 'protein', e.target.value)} placeholder="0" />
                        </div>
                        <div className="diet-food-input">
                          <label>{t('diet_builder_food_carbs')}</label>
                          <input type="number" min="0" value={food.carbs} onChange={e => updateFood(meal.id, food.id, 'carbs', e.target.value)} placeholder="0" />
                        </div>
                        <div className="diet-food-input">
                          <label>{t('diet_builder_food_fat')}</label>
                          <input type="number" min="0" value={food.fat} onChange={e => updateFood(meal.id, food.id, 'fat', e.target.value)} placeholder="0" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <button className="diet-add-food-btn" onClick={() => addFood(meal.id)}>
                  <Icon name="plus-circle" />
                  <span>{t('diet_builder_add_food')}</span>
                </button>
              </div>
            )}
          </div>
        ))}

        <button className="diet-add-meal-btn" onClick={addMeal}>
          <Icon name="plus-circle" />
          <span>{t('diet_builder_add_meal')}</span>
        </button>
      </div>

      {/* Save Bar */}
      {canSave && (
        <div className="diet-save-bar">
          <div className="diet-save-info">
            <span>{meals.filter(m => m.name.trim()).length} {language === 'pt-BR' ? 'refeições' : 'meals'}</span>
            <span className="diet-save-dot">&middot;</span>
            <span>{totalFoods} {language === 'pt-BR' ? 'alimentos' : 'foods'}</span>
          </div>
          <button className="diet-save-btn" onClick={handleSave}>
            {t('diet_builder_save')}
          </button>
        </div>
      )}
    </div>
  );
}
