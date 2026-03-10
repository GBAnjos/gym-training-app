// Meal Plan Data with bilingual support

export const MEAL_PLAN = [
  {
    name: { 'pt-BR': 'Café da manhã', 'en': 'Breakfast' },
    time: { 'pt-BR': 'Pós-academia', 'en': 'Post-workout' },
    icon: "coffee-cup-2",
    note: {
      'pt-BR': 'Dias de escritório: shake rápido. Dias home: refeição completa.',
      'en': 'Office days: quick shake. Home days: full meal.'
    },
    options: {
      'pt-BR': [
        "3 ovos mexidos + aveia com banana e pasta de amendoim",
        "Iogurte grego 500g + granola + frutas vermelhas + mel",
        "Tosta integral x3 + abacate + 2 ovos + salmão defumado",
      ],
      'en': [
        "3 scrambled eggs + oatmeal with banana and peanut butter",
        "Greek yogurt 500g + granola + berries + honey",
        "Whole grain toast x3 + avocado + 2 eggs + smoked salmon",
      ]
    },
  },
  {
    name: { 'pt-BR': 'Almoço', 'en': 'Lunch' },
    time: "13:00",
    icon: "knife-fork-1",
    note: {
      'pt-BR': 'Varia a proteína diariamente — frango, peixe, carne, ovo, leguminosa.',
      'en': 'Vary protein daily — chicken, fish, beef, eggs, legumes.'
    },
    options: {
      'pt-BR': [
        "Frango grelhado + arroz + legumes assados + azeite",
        "Atum + cenoura assada + salada de pepino + sementes",
        "Carne de porco magra + macarrão integral + brócolis",
      ],
      'en': [
        "Grilled chicken + rice + roasted vegetables + olive oil",
        "Tuna + roasted carrots + cucumber salad + seeds",
        "Lean pork + whole wheat pasta + broccoli",
      ]
    },
  },
  {
    name: { 'pt-BR': 'Jantar', 'en': 'Dinner' },
    time: { 'pt-BR': '19:30 (nunca antes)', 'en': '19:30 (never earlier)' },
    icon: "plate-1",
    note: {
      'pt-BR': 'Mais cedo do que isso o utilizador não tem apetite — 19:30 é o âncora fixo.',
      'en': "User doesn't have appetite earlier than this — 19:30 is the fixed anchor."
    },
    options: {
      'pt-BR': [
        "Salmão + quinoa + legumes no vapor + limão",
        "Dal de lentilha + arroz integral + salada grega",
        "Peru moído + pasta + molho de tomate + parmesão",
      ],
      'en': [
        "Salmon + quinoa + steamed vegetables + lemon",
        "Lentil dal + brown rice + Greek salad",
        "Ground turkey + pasta + tomato sauce + parmesan",
      ]
    },
  },
  {
    name: { 'pt-BR': 'Snacks', 'en': 'Snacks' },
    time: { 'pt-BR': 'Entre refeições', 'en': 'Between meals' },
    icon: "apple",
    note: {
      'pt-BR': 'Ectomorfo precisa das calorias — não pula snacks.',
      'en': "Ectomorph needs the calories — don't skip snacks."
    },
    options: {
      'pt-BR': [
        "Mix de castanhas + fruta",
        "Queijo cottage + bolacha de arroz",
        "Shake de proteína + banana (dias de academia)",
      ],
      'en': [
        "Mixed nuts + fruit",
        "Cottage cheese + rice crackers",
        "Protein shake + banana (gym days)",
      ]
    },
  },
];

export const MACRO_TARGETS = {
  calorias: "3000–3200 kcal",
  proteina: "150–160g",
  carboidrato: "380–420g",
  gordura: "80–100g",
};

// Helper functions for translations
export function getMealName(meal, language = 'pt-BR') {
  if (typeof meal.name === 'object') {
    return meal.name[language] || meal.name['pt-BR'];
  }
  return meal.name;
}

export function getMealTime(meal, language = 'pt-BR') {
  if (typeof meal.time === 'object') {
    return meal.time[language] || meal.time['pt-BR'];
  }
  return meal.time;
}

export function getMealNote(meal, language = 'pt-BR') {
  if (typeof meal.note === 'object') {
    return meal.note[language] || meal.note['pt-BR'];
  }
  return meal.note;
}

export function getMealOptions(meal, language = 'pt-BR') {
  if (typeof meal.options === 'object' && !Array.isArray(meal.options)) {
    return meal.options[language] || meal.options['pt-BR'];
  }
  return meal.options;
}
