// Yoga Session Catalog - Bilingual (pt-BR / en)

export const YOGA_STYLES = {
  vinyasa: { 'pt-BR': 'Vinyasa', en: 'Vinyasa' },
  hatha: { 'pt-BR': 'Hatha', en: 'Hatha' },
  yin: { 'pt-BR': 'Yin', en: 'Yin' },
  power: { 'pt-BR': 'Power Yoga', en: 'Power Yoga' },
};

export const YOGA_SESSIONS = [
  {
    id: 'vinyasa_flow',
    style: 'vinyasa',
    name: { 'pt-BR': 'Fluxo Vinyasa', en: 'Vinyasa Flow' },
    duration: 60,
    focus: 'strength',
    poses: [
      { id: 'sun_salutation', name: { 'pt-BR': 'Saudação ao Sol', en: 'Sun Salutation' } },
      { id: 'warrior_i', name: { 'pt-BR': 'Guerreiro I', en: 'Warrior I' } },
      { id: 'warrior_ii', name: { 'pt-BR': 'Guerreiro II', en: 'Warrior II' } },
      { id: 'warrior_iii', name: { 'pt-BR': 'Guerreiro III', en: 'Warrior III' } },
      { id: 'tree', name: { 'pt-BR': 'Árvore', en: 'Tree' } },
      { id: 'savasana', name: { 'pt-BR': 'Savasana', en: 'Savasana' } },
    ],
  },
  {
    id: 'hatha_balance',
    style: 'hatha',
    name: { 'pt-BR': 'Hatha Equilíbrio', en: 'Hatha Balance' },
    duration: 50,
    focus: 'balance',
    poses: [
      { id: 'mountain', name: { 'pt-BR': 'Montanha', en: 'Mountain' } },
      { id: 'triangle', name: { 'pt-BR': 'Triângulo', en: 'Triangle' } },
      { id: 'half_moon', name: { 'pt-BR': 'Meia Lua', en: 'Half Moon' } },
      { id: 'eagle', name: { 'pt-BR': 'Águia', en: 'Eagle' } },
      { id: 'corpse', name: { 'pt-BR': 'Postura do Cadáver', en: 'Corpse' } },
    ],
  },
  {
    id: 'yin_deep_stretch',
    style: 'yin',
    name: { 'pt-BR': 'Yin Alongamento Profundo', en: 'Yin Deep Stretch' },
    duration: 60,
    focus: 'flexibility',
    poses: [
      { id: 'butterfly', name: { 'pt-BR': 'Borboleta', en: 'Butterfly' } },
      { id: 'dragon', name: { 'pt-BR': 'Dragão', en: 'Dragon' } },
      { id: 'sleeping_swan', name: { 'pt-BR': 'Cisne Adormecido', en: 'Sleeping Swan' } },
      { id: 'caterpillar', name: { 'pt-BR': 'Lagarta', en: 'Caterpillar' } },
      { id: 'savasana', name: { 'pt-BR': 'Savasana', en: 'Savasana' } },
    ],
  },
  {
    id: 'power_yoga',
    style: 'power',
    name: { 'pt-BR': 'Power Yoga', en: 'Power Yoga' },
    duration: 45,
    focus: 'strength',
    poses: [
      { id: 'chair', name: { 'pt-BR': 'Cadeira', en: 'Chair' } },
      { id: 'plank', name: { 'pt-BR': 'Prancha', en: 'Plank' } },
      { id: 'chaturanga', name: { 'pt-BR': 'Chaturanga', en: 'Chaturanga' } },
      { id: 'upward_dog', name: { 'pt-BR': 'Cachorro Olhando para Cima', en: 'Upward Dog' } },
      { id: 'crow', name: { 'pt-BR': 'Corvo', en: 'Crow' } },
      { id: 'headstand_prep', name: { 'pt-BR': 'Preparação para Parada de Cabeça', en: 'Headstand Prep' } },
    ],
  },
];

export function getYogaSessionByIndex(index) {
  return YOGA_SESSIONS[index] || null;
}
