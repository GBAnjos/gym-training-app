// Meal Plan Data
export const MEAL_PLAN = [
  {
    name: "Café da manhã",
    time: "Pós-academia",
    icon: "🍳",
    note: "Dias de escritório: shake rápido. Dias home: refeição completa.",
    options: [
      "3 ovos mexidos + aveia com banana e pasta de amendoim",
      "Iogurte grego 500g + granola + frutas vermelhas + mel",
      "Tosta integral x3 + abacate + 2 ovos + salmão defumado",
    ],
  },
  {
    name: "Almoço",
    time: "13:00",
    icon: "🥗",
    note: "Varia a proteína diariamente — frango, peixe, carne, ovo, leguminosa.",
    options: [
      "Frango grelhado + arroz + legumes assados + azeite",
      "Atum + cenoura assada + salada de pepino + sementes",
      "Carne de porco magra + macarrão integral + brócolis",
    ],
  },
  {
    name: "Jantar",
    time: "19:30 (nunca antes)",
    icon: "🍽️",
    note: "Mais cedo do que isso o utilizador não tem apetite — 19:30 é o âncora fixo.",
    options: [
      "Salmão + quinoa + legumes no vapor + limão",
      "Dal de lentilha + arroz integral + salada grega",
      "Peru moído + pasta + molho de tomate + parmesão",
    ],
  },
  {
    name: "Snacks",
    time: "Entre refeições",
    icon: "🥜",
    note: "Ectomorfo precisa das calorias — não pula snacks.",
    options: [
      "Mix de castanhas + fruta",
      "Queijo cottage + bolacha de arroz",
      "Shake de proteína + banana (dias de academia)",
    ],
  },
];

export const MACRO_TARGETS = {
  calorias: "3000–3200 kcal",
  proteina: "150–160g",
  carboidrato: "380–420g",
  gordura: "80–100g",
};
