// Pilates Exercise Catalog - Bilingual (pt-BR / en)

export const PILATES_MOVEMENTS = {
  the_hundred: { 'pt-BR': 'O Cem', en: 'The Hundred' },
  roll_up: { 'pt-BR': 'Rolamento para Cima', en: 'Roll Up' },
  leg_circle: { 'pt-BR': 'Círculo de Perna', en: 'Leg Circle' },
  single_leg_stretch: { 'pt-BR': 'Alongamento de Perna Simples', en: 'Single Leg Stretch' },
  double_leg_stretch: { 'pt-BR': 'Alongamento de Perna Duplo', en: 'Double Leg Stretch' },
  spine_stretch: { 'pt-BR': 'Alongamento da Coluna', en: 'Spine Stretch' },
  saw: { 'pt-BR': 'Serra', en: 'Saw' },
  swan: { 'pt-BR': 'Cisne', en: 'Swan' },
  teaser: { 'pt-BR': 'Teaser', en: 'Teaser' },
  shoulder_bridge: { 'pt-BR': 'Ponte de Ombros', en: 'Shoulder Bridge' },
  side_kick: { 'pt-BR': 'Chute Lateral', en: 'Side Kick' },
  swimming: { 'pt-BR': 'Natação', en: 'Swimming' },
};

export const PILATES_FLOWS = [
  {
    id: 'core_flow',
    name: { 'pt-BR': 'Fluxo de Core', en: 'Core Flow' },
    duration: 45,
    focus: 'core',
    movements: ['the_hundred', 'roll_up', 'single_leg_stretch', 'double_leg_stretch', 'teaser'],
  },
  {
    id: 'full_body',
    name: { 'pt-BR': 'Corpo Inteiro', en: 'Full Body' },
    duration: 50,
    focus: 'strength',
    movements: ['the_hundred', 'roll_up', 'spine_stretch', 'swan', 'shoulder_bridge', 'swimming'],
  },
  {
    id: 'lower_body',
    name: { 'pt-BR': 'Membros Inferiores', en: 'Lower Body' },
    duration: 40,
    focus: 'legs',
    movements: ['leg_circle', 'single_leg_stretch', 'side_kick', 'shoulder_bridge'],
  },
  {
    id: 'flexibility',
    name: { 'pt-BR': 'Flexibilidade', en: 'Flexibility' },
    duration: 45,
    focus: 'flexibility',
    movements: ['spine_stretch', 'saw', 'swan', 'side_kick', 'swimming'],
  },
];

export function getPilatesMovementName(id, language = 'pt-BR') {
  const movement = PILATES_MOVEMENTS[id];
  if (!movement) return id;
  return movement[language] || movement['en'] || id;
}

export function getPilatesFlowByIndex(index) {
  return PILATES_FLOWS[index] || null;
}
