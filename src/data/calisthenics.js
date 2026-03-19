// Calisthenics Progressions Catalog (bilingual pt-BR / en)

export const CALISTHENICS_SKILLS = {
  push_up_progression: {
    id: 'push_up_progression',
    name: { 'pt-BR': 'Progressão de Flexão', en: 'Push-Up Progression' },
    category: 'push',
    levels: [
      {
        level: 1,
        name: { 'pt-BR': 'Flexão Inclinada', en: 'Incline Push-Up' },
        sets: 3,
        reps: '10-15',
      },
      {
        level: 2,
        name: { 'pt-BR': 'Flexão Padrão', en: 'Standard Push-Up' },
        sets: 4,
        reps: '10-15',
      },
      {
        level: 3,
        name: { 'pt-BR': 'Flexão Diamante', en: 'Diamond Push-Up' },
        sets: 4,
        reps: '8-12',
      },
      {
        level: 4,
        name: { 'pt-BR': 'Flexão Arqueiro', en: 'Archer Push-Up' },
        sets: 4,
        reps: '6-10',
      },
      {
        level: 5,
        name: { 'pt-BR': 'Flexão com Um Braço', en: 'One-Arm Push-Up' },
        sets: 3,
        reps: '3-6',
      },
    ],
  },

  pull_up_progression: {
    id: 'pull_up_progression',
    name: { 'pt-BR': 'Progressão de Barra', en: 'Pull-Up Progression' },
    category: 'pull',
    levels: [
      {
        level: 1,
        name: { 'pt-BR': 'Barra Australiana', en: 'Australian Pull-Up' },
        sets: 3,
        reps: '10-15',
      },
      {
        level: 2,
        name: { 'pt-BR': 'Barra Negativa', en: 'Negative Pull-Up' },
        sets: 4,
        reps: '6-8',
      },
      {
        level: 3,
        name: { 'pt-BR': 'Barra Fixa', en: 'Pull-Up' },
        sets: 4,
        reps: '6-10',
      },
      {
        level: 4,
        name: { 'pt-BR': 'Barra com Peso', en: 'Weighted Pull-Up' },
        sets: 4,
        reps: '5-8',
      },
      {
        level: 5,
        name: { 'pt-BR': 'Muscle-Up', en: 'Muscle-Up' },
        sets: 3,
        reps: '3-5',
      },
    ],
  },

  front_lever: {
    id: 'front_lever',
    name: { 'pt-BR': 'Front Lever', en: 'Front Lever' },
    category: 'pull/static',
    levels: [
      {
        level: 1,
        name: { 'pt-BR': 'Tuck Front Lever', en: 'Tuck Front Lever' },
        sets: 4,
        hold: '10-15s',
      },
      {
        level: 2,
        name: { 'pt-BR': 'Tuck Avançado', en: 'Advanced Tuck' },
        sets: 4,
        hold: '8-12s',
      },
      {
        level: 3,
        name: { 'pt-BR': 'Straddle Front Lever', en: 'Straddle Front Lever' },
        sets: 4,
        hold: '6-10s',
      },
      {
        level: 4,
        name: { 'pt-BR': 'Half Lay Front Lever', en: 'Half Lay Front Lever' },
        sets: 3,
        hold: '5-8s',
      },
      {
        level: 5,
        name: { 'pt-BR': 'Front Lever Completo', en: 'Full Front Lever' },
        sets: 3,
        hold: '3-6s',
      },
    ],
  },

  pistol_squat: {
    id: 'pistol_squat',
    name: { 'pt-BR': 'Agachamento Pistol', en: 'Pistol Squat' },
    category: 'legs',
    levels: [
      {
        level: 1,
        name: { 'pt-BR': 'Agachamento Búlgaro', en: 'Bulgarian Split Squat' },
        sets: 3,
        reps: '10-12',
      },
      {
        level: 2,
        name: { 'pt-BR': 'Pistol Assistido', en: 'Assisted Pistol' },
        sets: 3,
        reps: '8-10',
      },
      {
        level: 3,
        name: { 'pt-BR': 'Pistol Negativo', en: 'Negative Pistol' },
        sets: 4,
        reps: '5-8',
      },
      {
        level: 4,
        name: { 'pt-BR': 'Pistol Squat', en: 'Pistol Squat' },
        sets: 4,
        reps: '5-8',
      },
      {
        level: 5,
        name: { 'pt-BR': 'Pistol com Peso', en: 'Weighted Pistol' },
        sets: 3,
        reps: '3-6',
      },
    ],
  },

  handstand: {
    id: 'handstand',
    name: { 'pt-BR': 'Parada de Mão', en: 'Handstand' },
    category: 'push',
    levels: [
      {
        level: 1,
        name: { 'pt-BR': 'Pike na Parede', en: 'Wall Pike' },
        sets: 3,
        hold: '20-30s',
      },
      {
        level: 2,
        name: { 'pt-BR': 'Parada de Mão na Parede', en: 'Wall Handstand' },
        sets: 4,
        hold: '20-30s',
      },
      {
        level: 3,
        name: { 'pt-BR': 'Parada de Mão Livre (kick-up)', en: 'Freestanding Kick-Up' },
        sets: 5,
        hold: '5-10s',
      },
      {
        level: 4,
        name: { 'pt-BR': 'Parada de Mão Livre Sólida', en: 'Solid Freestanding Handstand' },
        sets: 4,
        hold: '15-30s',
      },
      {
        level: 5,
        name: { 'pt-BR': 'Flexão em Parada de Mão', en: 'Handstand Push-Up (HSPU)' },
        sets: 3,
        reps: '3-6',
      },
    ],
  },

  planche: {
    id: 'planche',
    name: { 'pt-BR': 'Planche', en: 'Planche' },
    category: 'push/static',
    levels: [
      {
        level: 1,
        name: { 'pt-BR': 'Planche Lean', en: 'Planche Lean' },
        sets: 4,
        hold: '15-20s',
      },
      {
        level: 2,
        name: { 'pt-BR': 'Tuck Planche', en: 'Tuck Planche' },
        sets: 4,
        hold: '10-15s',
      },
      {
        level: 3,
        name: { 'pt-BR': 'Tuck Avançado Planche', en: 'Advanced Tuck Planche' },
        sets: 4,
        hold: '8-12s',
      },
      {
        level: 4,
        name: { 'pt-BR': 'Straddle Planche', en: 'Straddle Planche' },
        sets: 3,
        hold: '5-8s',
      },
      {
        level: 5,
        name: { 'pt-BR': 'Planche Completa', en: 'Full Planche' },
        sets: 3,
        hold: '3-5s',
      },
    ],
  },
};

export const CALISTHENICS_SPLITS = [
  {
    name: { 'pt-BR': 'Push Skills', en: 'Push Skills' },
    skills: ['push_up_progression', 'handstand', 'planche'],
  },
  {
    name: { 'pt-BR': 'Pull Skills', en: 'Pull Skills' },
    skills: ['pull_up_progression', 'front_lever'],
  },
  {
    name: { 'pt-BR': 'Pernas & Core', en: 'Legs & Core' },
    skills: ['pistol_squat'],
  },
  {
    name: { 'pt-BR': 'Isometrias', en: 'Static Holds' },
    skills: ['front_lever', 'planche', 'handstand'],
  },
];

export function getCalisthenicsSkill(skillId) {
  return CALISTHENICS_SKILLS[skillId] ?? null;
}

export function getCalisthenicsSplitByIndex(index) {
  return CALISTHENICS_SPLITS[index % CALISTHENICS_SPLITS.length];
}
