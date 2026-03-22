// Running Session Catalog - Bilingual (pt-BR / en)

export const ZONE_INFO = [
  {
    zone: 1, label: 'Z1', color: '#82dcb4',
    name: { 'pt-BR': 'Recuperação', en: 'Recovery' },
    hr: '50-60%',
    description: { 'pt-BR': 'Esforço muito leve, caminhada rápida', en: 'Very light effort, brisk walk' },
  },
  {
    zone: 2, label: 'Z2', color: '#60c8f0',
    name: { 'pt-BR': 'Aeróbica', en: 'Aerobic' },
    hr: '60-70%',
    description: { 'pt-BR': 'Ritmo de conversa, base aeróbica', en: 'Conversational pace, aerobic base' },
  },
  {
    zone: 3, label: 'Z3', color: '#ffc832',
    name: { 'pt-BR': 'Tempo', en: 'Tempo' },
    hr: '70-80%',
    description: { 'pt-BR': 'Desconforto leve, ritmo sustentado', en: 'Comfortably hard, sustained pace' },
  },
  {
    zone: 4, label: 'Z4', color: '#ff9432',
    name: { 'pt-BR': 'Limiar', en: 'Threshold' },
    hr: '80-90%',
    description: { 'pt-BR': 'Fala difícil, intervalos', en: 'Hard to talk, interval work' },
  },
  {
    zone: 5, label: 'Z5', color: '#ff4f4f',
    name: { 'pt-BR': 'VO2 Max', en: 'VO2 Max' },
    hr: '90-100%',
    description: { 'pt-BR': 'Esforço máximo, sprints', en: 'Maximum effort, sprints' },
  },
];

export const RUN_TYPES = {
  easy: { 'pt-BR': 'Corrida Leve', en: 'Easy Run' },
  long: { 'pt-BR': 'Corrida Longa', en: 'Long Run' },
  intervals: { 'pt-BR': 'Intervalados', en: 'Intervals' },
  tempo: { 'pt-BR': 'Corrida Tempo', en: 'Tempo Run' },
  recovery: { 'pt-BR': 'Trote de Recuperação', en: 'Recovery Jog' },
};

export const RUNNING_SESSIONS = [
  {
    id: 'easy_run',
    type: 'easy',
    name: { 'pt-BR': 'Corrida Leve', en: 'Easy Run' },
    distance: '5K',
    targetPace: {
      'pt-BR': 'Ritmo conversacional, conseguir falar normalmente',
      en: 'Conversational pace, able to speak comfortably',
    },
    zone: 2,
  },
  {
    id: 'long_run',
    type: 'long',
    name: { 'pt-BR': 'Corrida Longa', en: 'Long Run' },
    distance: '10K',
    targetPace: {
      'pt-BR': 'Ritmo constante, manter zona aeróbica',
      en: 'Steady pace, maintain aerobic zone',
    },
    zone: 2,
  },
  {
    id: 'intervals',
    type: 'intervals',
    name: { 'pt-BR': 'Intervalados', en: 'Intervals' },
    distance: '4K',
    targetPace: {
      'pt-BR': '400m rápido / 400m descanso x5',
      en: '400m fast / 400m rest x5',
    },
    zone: 4,
  },
  {
    id: 'tempo_run',
    type: 'tempo',
    name: { 'pt-BR': 'Corrida Tempo', en: 'Tempo Run' },
    distance: '6K',
    targetPace: {
      'pt-BR': 'Confortavelmente forte, ritmo desafiador mas sustentável',
      en: 'Comfortably hard, challenging but sustainable pace',
    },
    zone: 3,
  },
  {
    id: 'recovery_jog',
    type: 'recovery',
    name: { 'pt-BR': 'Trote de Recuperação', en: 'Recovery Jog' },
    distance: '3K',
    targetPace: {
      'pt-BR': 'Bem leve, ritmo muito fácil',
      en: 'Very easy, minimal effort pace',
    },
    zone: 1,
  },
];

export function getRunSessionByIndex(index) {
  return RUNNING_SESSIONS[index] || null;
}
