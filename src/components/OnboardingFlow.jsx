import { useState } from 'react';
import { useOnboarding, generatePersonalizedSchedule, generatePersonalizedMeals, generatePersonalizedWorkout } from '../hooks/useOnboarding';
import './OnboardingFlow.css';

const STEPS = [
  'welcome',
  'basics',
  'schedule',
  'training',
  'nutrition',
  'generating'
];

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

export function OnboardingFlow({ onComplete }) {
  const { completeOnboarding } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    currentWeight: '',
    targetWeight: '',
    height: '',
    wakeUpTime: '06:30',
    sleepTime: '22:30',
    dinnerTime: '19:30',
    workDays: 5,
    officeDays: ['Ter', 'Qui'],
    goal: 'muscle_gain',
    fitnessLevel: 'intermediate',
    trainingDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
    trainingTime: 'morning',
    dietaryRestrictions: [],
    mealPrep: true
  });

  const updateProfile = (key, value) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const toggleDay = (key, day) => {
    setProfile(prev => {
      const current = prev[key];
      if (current.includes(day)) {
        return { ...prev, [key]: current.filter(d => d !== day) };
      } else {
        return { ...prev, [key]: [...current, day] };
      }
    });
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = async () => {
    setCurrentStep(STEPS.indexOf('generating'));
    setIsGenerating(true);

    // Generate personalized data
    const schedule = generatePersonalizedSchedule(profile);
    const meals = generatePersonalizedMeals(profile);
    const workout = generatePersonalizedWorkout(profile);

    // Save to localStorage
    localStorage.setItem('vida_user_schedule', JSON.stringify(schedule));
    localStorage.setItem('vida_user_meals', JSON.stringify(meals));
    localStorage.setItem('vida_user_workout', JSON.stringify(workout));
    localStorage.setItem('vida_user_profile', JSON.stringify(profile));

    // Simulate generation time for UX
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Complete onboarding
    await completeOnboarding(profile);

    setIsGenerating(false);
    onComplete();
  };

  const renderStep = () => {
    switch (STEPS[currentStep]) {
      case 'welcome':
        return <WelcomeStep onNext={nextStep} />;
      case 'basics':
        return <BasicsStep profile={profile} updateProfile={updateProfile} onNext={nextStep} onBack={prevStep} />;
      case 'schedule':
        return <ScheduleStep profile={profile} updateProfile={updateProfile} toggleDay={toggleDay} onNext={nextStep} onBack={prevStep} />;
      case 'training':
        return <TrainingStep profile={profile} updateProfile={updateProfile} toggleDay={toggleDay} onNext={nextStep} onBack={prevStep} />;
      case 'nutrition':
        return <NutritionStep profile={profile} updateProfile={updateProfile} onNext={handleFinish} onBack={prevStep} />;
      case 'generating':
        return <GeneratingStep />;
      default:
        return null;
    }
  };

  return (
    <div className="onboarding">
      {currentStep > 0 && currentStep < STEPS.length - 1 && (
        <div className="onboarding-progress">
          {STEPS.slice(1, -1).map((_, i) => (
            <div
              key={i}
              className={`progress-dot ${i < currentStep ? 'completed' : ''} ${i === currentStep - 1 ? 'active' : ''}`}
            />
          ))}
        </div>
      )}
      <div className="onboarding-content">
        {renderStep()}
      </div>
    </div>
  );
}

function WelcomeStep({ onNext }) {
  return (
    <div className="step welcome-step animate-fade-in">
      <div className="welcome-icon">🏋️</div>
      <h1>Bem-vindo ao Vida</h1>
      <p className="welcome-tagline">Estrutura real. Vida real.</p>
      <p className="welcome-description">
        Vamos criar uma rotina personalizada para ti.
        Em poucos passos, terás um plano de treino, alimentação e horários adaptados ao teu estilo de vida.
      </p>
      <button className="btn-primary btn-large" onClick={onNext}>
        Começar
        <span className="btn-arrow">→</span>
      </button>
    </div>
  );
}

function BasicsStep({ profile, updateProfile, onNext, onBack }) {
  const isValid = profile.currentWeight && profile.targetWeight;

  return (
    <div className="step basics-step animate-fade-in">
      <h2>Sobre ti</h2>
      <p className="step-description">Informações básicas para personalizar a tua experiência</p>

      <div className="form-group">
        <label>Como te chamas? <span className="optional">(opcional)</span></label>
        <input
          type="text"
          value={profile.name}
          onChange={(e) => updateProfile('name', e.target.value)}
          placeholder="O teu nome"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Peso atual (kg)</label>
          <input
            type="number"
            value={profile.currentWeight}
            onChange={(e) => updateProfile('currentWeight', e.target.value)}
            placeholder="Ex: 72"
          />
        </div>
        <div className="form-group">
          <label>Peso alvo (kg)</label>
          <input
            type="number"
            value={profile.targetWeight}
            onChange={(e) => updateProfile('targetWeight', e.target.value)}
            placeholder="Ex: 80"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Altura (cm) <span className="optional">(opcional)</span></label>
        <input
          type="number"
          value={profile.height}
          onChange={(e) => updateProfile('height', e.target.value)}
          placeholder="Ex: 185"
        />
      </div>

      <div className="step-actions">
        <button className="btn-secondary" onClick={onBack}>Voltar</button>
        <button className="btn-primary" onClick={onNext} disabled={!isValid}>
          Continuar
        </button>
      </div>
    </div>
  );
}

function ScheduleStep({ profile, updateProfile, toggleDay, onNext, onBack }) {
  return (
    <div className="step schedule-step animate-fade-in">
      <h2>A tua rotina</h2>
      <p className="step-description">Como é o teu dia-a-dia?</p>

      <div className="form-row">
        <div className="form-group">
          <label>Acordas às</label>
          <input
            type="time"
            value={profile.wakeUpTime}
            onChange={(e) => updateProfile('wakeUpTime', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Dormes às</label>
          <input
            type="time"
            value={profile.sleepTime}
            onChange={(e) => updateProfile('sleepTime', e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Dias de escritório <span className="hint">(máx. 2)</span></label>
        <div className="day-selector">
          {WEEKDAYS.map(day => (
            <button
              key={day}
              className={`day-btn ${profile.officeDays.includes(day) ? 'selected' : ''}`}
              onClick={() => {
                if (profile.officeDays.includes(day)) {
                  toggleDay('officeDays', day);
                } else if (profile.officeDays.length < 2) {
                  toggleDay('officeDays', day);
                }
              }}
            >
              {day}
            </button>
          ))}
        </div>
        <p className="field-hint">Ou trabalhas sempre de casa? Deixa em branco.</p>
      </div>

      <div className="form-group">
        <label>Jantas normalmente às</label>
        <input
          type="time"
          value={profile.dinnerTime}
          onChange={(e) => updateProfile('dinnerTime', e.target.value)}
        />
      </div>

      <div className="step-actions">
        <button className="btn-secondary" onClick={onBack}>Voltar</button>
        <button className="btn-primary" onClick={onNext}>Continuar</button>
      </div>
    </div>
  );
}

function TrainingStep({ profile, updateProfile, toggleDay, onNext, onBack }) {
  const isValid = profile.trainingDays.length > 0;

  return (
    <div className="step training-step animate-fade-in">
      <h2>Treino</h2>
      <p className="step-description">Personaliza o teu plano de treino</p>

      <div className="form-group">
        <label>Qual é o teu objetivo principal?</label>
        <div className="option-cards">
          {[
            { id: 'muscle_gain', icon: '💪', label: 'Ganhar massa', desc: 'Hipertrofia muscular' },
            { id: 'weight_loss', icon: '🔥', label: 'Perder peso', desc: 'Queimar gordura' },
            { id: 'maintain', icon: '⚖️', label: 'Manter forma', desc: 'Estabilidade' },
            { id: 'general', icon: '🎯', label: 'Fitness geral', desc: 'Saúde e bem-estar' },
          ].map(opt => (
            <button
              key={opt.id}
              className={`option-card ${profile.goal === opt.id ? 'selected' : ''}`}
              onClick={() => updateProfile('goal', opt.id)}
            >
              <span className="option-icon">{opt.icon}</span>
              <span className="option-label">{opt.label}</span>
              <span className="option-desc">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Nível de experiência</label>
        <div className="level-selector">
          {[
            { id: 'beginner', label: 'Iniciante', desc: '< 1 ano' },
            { id: 'intermediate', label: 'Intermédio', desc: '1-3 anos' },
            { id: 'advanced', label: 'Avançado', desc: '3+ anos' },
          ].map(level => (
            <button
              key={level.id}
              className={`level-btn ${profile.fitnessLevel === level.id ? 'selected' : ''}`}
              onClick={() => updateProfile('fitnessLevel', level.id)}
            >
              <span className="level-label">{level.label}</span>
              <span className="level-desc">{level.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Dias de treino por semana</label>
        <div className="day-selector">
          {DAYS.map(day => (
            <button
              key={day}
              className={`day-btn ${profile.trainingDays.includes(day) ? 'selected' : ''}`}
              onClick={() => toggleDay('trainingDays', day)}
            >
              {day}
            </button>
          ))}
        </div>
        <p className="field-hint">{profile.trainingDays.length} dias selecionados</p>
      </div>

      <div className="form-group">
        <label>Horário preferido de treino</label>
        <div className="time-selector">
          {[
            { id: 'morning', icon: '🌅', label: 'Manhã' },
            { id: 'afternoon', icon: '☀️', label: 'Tarde' },
            { id: 'evening', icon: '🌙', label: 'Noite' },
          ].map(time => (
            <button
              key={time.id}
              className={`time-btn ${profile.trainingTime === time.id ? 'selected' : ''}`}
              onClick={() => updateProfile('trainingTime', time.id)}
            >
              <span>{time.icon}</span>
              <span>{time.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="step-actions">
        <button className="btn-secondary" onClick={onBack}>Voltar</button>
        <button className="btn-primary" onClick={onNext} disabled={!isValid}>Continuar</button>
      </div>
    </div>
  );
}

function NutritionStep({ profile, updateProfile, onNext, onBack }) {
  const restrictions = [
    { id: 'vegetarian', label: 'Vegetariano' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'lactose_free', label: 'Sem lactose' },
    { id: 'gluten_free', label: 'Sem glúten' },
  ];

  const toggleRestriction = (id) => {
    const current = profile.dietaryRestrictions;
    if (current.includes(id)) {
      updateProfile('dietaryRestrictions', current.filter(r => r !== id));
    } else {
      updateProfile('dietaryRestrictions', [...current, id]);
    }
  };

  return (
    <div className="step nutrition-step animate-fade-in">
      <h2>Alimentação</h2>
      <p className="step-description">Últimos detalhes para o teu plano alimentar</p>

      <div className="form-group">
        <label>Restrições alimentares <span className="optional">(opcional)</span></label>
        <div className="restriction-chips">
          {restrictions.map(r => (
            <button
              key={r.id}
              className={`chip ${profile.dietaryRestrictions.includes(r.id) ? 'selected' : ''}`}
              onClick={() => toggleRestriction(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Fazes meal prep?</label>
        <div className="toggle-group">
          <button
            className={`toggle-btn ${profile.mealPrep ? 'selected' : ''}`}
            onClick={() => updateProfile('mealPrep', true)}
          >
            Sim, preparo refeições
          </button>
          <button
            className={`toggle-btn ${!profile.mealPrep ? 'selected' : ''}`}
            onClick={() => updateProfile('mealPrep', false)}
          >
            Não, cozinho no dia
          </button>
        </div>
      </div>

      <div className="summary-card">
        <h4>Resumo do teu plano</h4>
        <ul>
          <li>🎯 Objetivo: <strong>{profile.goal === 'muscle_gain' ? 'Ganhar massa' : profile.goal === 'weight_loss' ? 'Perder peso' : profile.goal === 'maintain' ? 'Manter forma' : 'Fitness geral'}</strong></li>
          <li>🏋️ Treino: <strong>{profile.trainingDays.length}x por semana</strong></li>
          <li>⏰ Horário: <strong>{profile.trainingTime === 'morning' ? 'Manhã' : profile.trainingTime === 'afternoon' ? 'Tarde' : 'Noite'}</strong></li>
          <li>⚖️ Meta: <strong>{profile.currentWeight}kg → {profile.targetWeight}kg</strong></li>
        </ul>
      </div>

      <div className="step-actions">
        <button className="btn-secondary" onClick={onBack}>Voltar</button>
        <button className="btn-primary btn-finish" onClick={onNext}>
          Criar minha rotina
          <span className="btn-icon">✨</span>
        </button>
      </div>
    </div>
  );
}

function GeneratingStep() {
  return (
    <div className="step generating-step animate-fade-in">
      <div className="generating-animation">
        <div className="spinner"></div>
        <div className="generating-icons">
          <span className="gen-icon">📅</span>
          <span className="gen-icon">🏋️</span>
          <span className="gen-icon">🥗</span>
        </div>
      </div>
      <h2>A criar a tua rotina...</h2>
      <p className="generating-text">
        Estamos a personalizar o teu plano de treino, alimentação e horários.
      </p>
      <div className="generating-steps">
        <div className="gen-step done">✓ Analisando objetivos</div>
        <div className="gen-step active">⟳ Criando plano de treino</div>
        <div className="gen-step">○ Montando horários</div>
        <div className="gen-step">○ Ajustando alimentação</div>
      </div>
    </div>
  );
}
