import 'lineicons/dist/lineicons.css';

// Icon component that wraps LineIcons
export function Icon({ name, size, className = '', ...props }) {
  const sizeClass = size ? `lni-${size}` : '';
  return (
    <i
      className={`lni lni-${name} ${sizeClass} ${className}`.trim()}
      {...props}
    />
  );
}

// Pre-defined icon mappings for the app
export const AppIcons = {
  // Navigation
  schedule: 'calendar-days',
  meals: 'knife-fork-1',
  training: 'dumbbell-1',
  progress: 'bar-chart-4',
  settings: 'gear-1',

  // Schedule blocks
  morning: 'sun-1',
  coffee: 'coffee-cup-2',
  gym: 'dumbbell-1',
  food: 'knife-fork-1',
  work: 'briefcase-1',
  office: 'briefcase-1',
  home: 'home-2',
  laptop: 'laptop-2',
  sleep: 'moon-half-right-5',
  night: 'moon-half-right-5',
  free: 'book-1',
  chore: 'home-2',
  social: 'heart',

  // User & Profile
  user: 'user-4',
  male: 'user-4',
  female: 'user-4',
  logout: 'exit',
  login: 'enter-down',

  // Actions
  check: 'check-circle-1',
  checkSquare: 'check-square-2',
  close: 'xmark',
  add: 'plus',
  remove: 'minus',
  edit: 'pencil-1',
  delete: 'trash-3',
  save: 'check',
  cancel: 'xmark',

  // Arrows
  arrowRight: 'arrow-right',
  arrowLeft: 'arrow-left',
  arrowUp: 'arrow-upward',
  arrowDown: 'arrow-downward',
  chevronRight: 'chevron-right',
  chevronLeft: 'chevron-left',
  chevronUp: 'chevron-up',
  chevronDown: 'chevron-down',

  // Training
  dumbbell: 'dumbbell-1',
  target: 'target-user',
  fire: 'bolt-2',
  bolt: 'bolt-2',
  timer: 'hourglass',
  stopwatch: 'hourglass',

  // Goals
  muscleGain: 'dumbbell-1',
  weightLoss: 'bolt-2',
  maintain: 'target-user',
  general: 'heart',

  // Sports
  soccer: 'busket-ball',
  basketball: 'busket-ball',
  volleyball: 'busket-ball',
  swimming: 'life-guard-tube-1',
  running: 'bolt-2',
  cycling: 'bike',
  tennis: 'busket-ball',
  martialArts: 'hand-stop',
  dance: 'music-1',
  yoga: 'leaf-1',
  climbing: 'flag-1',
  other: 'star-fat',

  // Gym types
  weights: 'dumbbell-1',
  crossfit: 'bolt-2',
  calisthenics: 'user-4',
  functional: 'bolt-3',
  cardio: 'heart',

  // Nutrition
  vegetarian: 'leaf-1',
  vegan: 'leaf-6',
  lactoseFree: 'xmark',
  glutenFree: 'xmark',
  mealPrep: 'box-closed',
  cookDaily: 'knife-fork-1',

  // Lifestyle
  hobby: 'star-fat',
  weekend: 'sun-1',
  relaxed: 'moon-half-right-5',
  active: 'bolt-2',

  // Misc
  language: 'globe-1',
  brazil: 'flag-1',
  usa: 'flag-2',
  bell: 'bell-1',
  lock: 'locked-1',
  unlock: 'unlocked-2',
  key: 'key-1',
  star: 'star-fat',
  heart: 'heart',
  flag: 'flag-1',
  trophy: 'certificate-badge-1',
  medal: 'certificate-badge-1',
  gift: 'box-gift-1',
  calendar: 'calendar-days',
  clock: 'hourglass',
  alarm: 'alarm-1',
  power: 'power-button',
  refresh: 'refresh-circle-1-clockwise',
  sync: 'cloud-refresh-clockwise',
  download: 'download-1',
  upload: 'cloud-upload',
  share: 'comment-1-share',
  link: 'link-2-angular-right',
  info: 'question-circle',
  help: 'question-circle',
  warning: 'warning',
  error: 'xmark-circle',
  success: 'check-circle-1',
};

// Helper function to get icon name
export function getIconName(key) {
  return AppIcons[key] || key;
}

export default Icon;
