import { getBundleExercises } from '../services/exerciseService';

/**
 * Parse AI-generated training plan text into structured data.
 * Handles markdown tables, bullet lists, numbered lists from any AI.
 *
 * @param {string} text - Raw text from paste or file
 * @returns {{ days: Array<{ name: string, exercises: Array<{ name: string, sets: number, reps: string, rest?: number, matched?: object, confidence: string }> }>, errors: string[] }}
 */
export function parseTrainingText(text) {
  const errors = [];
  if (!text || typeof text !== 'string') return { days: [], errors: ['Empty input'] };

  // Pre-process: normalize Portuguese PDF format where sets and "séries" are on separate lines
  // "4\nséries 8-10 reps" → "4 séries 8-10 reps"
  // "séries reps 15" → "séries 15 reps"
  const processed = text
    .replace(/(\d+)\n(séries?|sets?)/gi, '$1 $2')
    .replace(/séries?\s+reps?\s+(\d+(?:[-–]\d+)?)/gi, 'séries $1 reps')
    .replace(/(\d+)\s*séries?\s+reps?\s+(\d+)/gi, '$1 séries $2 reps');

  const lines = processed.split(/\n/);
  const days = [];
  let currentDay = null;
  let pendingExerciseName = null;

  // Expanded day header patterns — handles "01 Segunda-feira — PUSH", "## Push Day", etc.
  const dayPatterns = [
    /^#{1,3}\s+(.+)/,
    /^\*\*(.+?)\*\*\s*$/,
    /^\d{1,2}\s+(?:segunda|terça|quarta|quinta|sexta|sábado|domingo|monday|tuesday|wednesday|thursday|friday|saturday|sunday).+$/i,
    /^(?:segunda|terça|quarta|quinta|sexta|sábado|domingo|monday|tuesday|wednesday|thursday|friday|saturday|sunday)[- —–]+.+$/i,
    /^(?:day|dia)\s+\d+.*/i,
    /^(?:push|pull|legs?|upper|lower|full\s*body|peito|costas|pernas?|ombros?|braços?)\s*(?:day|dia|—|–|-|\s*$)/i,
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check day header
    let isDay = false;
    let dayName = '';
    for (const pattern of dayPatterns) {
      const m = line.match(pattern);
      if (m) {
        isDay = true;
        dayName = (m[1] || line).replace(/[*#]/g, '').trim();
        break;
      }
    }

    if (isDay && !isExerciseLine(line)) {
      pendingExerciseName = null;
      currentDay = { name: dayName || line, exercises: [] };
      days.push(currentDay);
      continue;
    }

    // Skip muscle/subtitle descriptions (contains · or is short ALL CAPS badge like "PUSH"/"PULL")
    if (/·/.test(line)) continue;
    if (/^[A-Z\s]{2,15}$/.test(line) && !/\d/.test(line) && !line.includes('Max')) continue;

    if (!currentDay) {
      if (isExerciseLine(line) || looksLikeExerciseName(line)) {
        currentDay = { name: 'Day 1', exercises: [] };
        days.push(currentDay);
      } else {
        continue;
      }
    }

    // Try to parse as exercise (may or may not include name)
    const exercise = parseExerciseLine(line);
    if (exercise) {
      // If name was on a previous line, use it
      if (!exercise.name && pendingExerciseName) {
        exercise.name = pendingExerciseName;
      }
      pendingExerciseName = null;
      if (exercise.name && exercise.name.length >= 3) {
        const match = matchExerciseToBundle(exercise.name);
        currentDay.exercises.push({
          ...exercise,
          matched: match.exercise,
          confidence: match.confidence,
        });
      }
    } else if (looksLikeExerciseName(line)) {
      // Store name — sets/reps will come on following lines
      pendingExerciseName = line.replace(/^[-*•\d.)\s]+/, '').trim();
    }
  }

  const validDays = days.filter(d => d.exercises.length > 0);

  if (validDays.length === 0) {
    errors.push('no_data');
  }

  return { days: validDays, errors };
}

/**
 * Parse AI-generated diet plan text into structured data.
 *
 * @param {string} text
 * @returns {{ meals: Array<{ id: string, name: string, foods: Array<{ id: string, name: string, quantity?: string, calories?: string, protein?: string, carbs?: string, fat?: string, confidence: string }> }>, dailyTargets?: { calories?: number, protein?: number, carbs?: number, fat?: number }, errors: string[] }}
 */
export function parseDietText(text) {
  const errors = [];
  if (!text || typeof text !== 'string') return { meals: [], errors: ['Empty input'] };

  const lines = text.split(/\n/);
  const meals = [];
  let currentMeal = null;
  let dailyTargets = null;

  // Try to extract daily targets from text
  const targetMatch = text.match(/(?:total|daily|target|meta|objetivo).*?(\d{3,4})\s*(?:cal|kcal)/i);
  if (targetMatch) {
    dailyTargets = { calories: parseInt(targetMatch[1]) };
  }

  // Also look for macro targets
  const macroTarget = text.match(/(\d{3,4})\s*(?:cal|kcal).*?(\d{2,3})\s*g?\s*(?:prot|P).*?(\d{2,3})\s*g?\s*(?:carb|C).*?(\d{2,3})\s*g?\s*(?:fat|gord|F|G)/i);
  if (macroTarget) {
    dailyTargets = {
      calories: parseInt(macroTarget[1]),
      protein: parseInt(macroTarget[2]),
      carbs: parseInt(macroTarget[3]),
      fat: parseInt(macroTarget[4]),
    };
  }

  const mealHeaderRegex = /breakfast|lunch|dinner|snack|meal|café|almoço|jantar|lanche|refeição|pre.?workout|post.?workout|colação|ceia/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check for meal headers
    const headerMatch = line.match(/^#{1,3}\s+(.+)/) || line.match(/^\*\*(.+?)\*\*\s*$/);
    if (headerMatch) {
      const name = (headerMatch[1] || headerMatch[2] || '').replace(/[*#]/g, '').trim();
      if (mealHeaderRegex.test(name)) {
        currentMeal = { id: crypto.randomUUID(), name, foods: [] };
        meals.push(currentMeal);
        continue;
      }
    }

    // Also check plain lines that look like meal headers
    if (mealHeaderRegex.test(line) && !isFoodLine(line) && line.length < 60) {
      const name = line.replace(/^[-*•\d.)\s]+/, '').replace(/[*#:]+$/, '').trim();
      if (name) {
        currentMeal = { id: crypto.randomUUID(), name, foods: [] };
        meals.push(currentMeal);
        continue;
      }
    }

    if (!currentMeal && isFoodLine(line)) {
      currentMeal = { id: crypto.randomUUID(), name: 'Meal 1', foods: [] };
      meals.push(currentMeal);
    }

    if (!currentMeal) continue;

    // Try to parse as food
    const food = parseFoodLine(line);
    if (food) {
      currentMeal.foods.push(food);
    }
  }

  // Filter empty meals
  const validMeals = meals.filter(m => m.foods.length > 0);

  if (validMeals.length === 0) {
    errors.push('no_data');
  }

  return { meals: validMeals, dailyTargets, errors };
}

// ===== Internal helpers =====

function isMetaLine(text) {
  return /^(?:notes?|obs|warm.?up|cool.?down|rest|descanso|aquecimento|volta)/i.test(text);
}

function isExerciseLine(line) {
  // Lines that look like exercises (has sets/reps pattern or is a table row with numbers)
  const clean = line.replace(/^[-*•\d.)\s|]+/, '');
  return /\d+\s*[x×]\s*\d+/.test(clean) ||
    /\|\s*\w+.*\|\s*\d+\s*\|/.test(line) ||
    (/^[A-Z]/.test(clean) && /\d/.test(clean) && clean.length > 5 && clean.length < 100);
}

function parseExerciseLine(line) {
  const clean = line.replace(/^[-*•\d.)\s]+/, '').trim();
  if (!clean || clean.length < 3) return null;
  if (/^[|]?\s*exercise|^[|]?\s*exercício|^[|]?\s*---/i.test(clean)) return null;

  // Table row: | Exercise | Sets | Reps | Rest |
  const tableMatch = line.match(/\|\s*(.+?)\s*\|\s*(\d+)\s*\|\s*(\d+(?:\s*[-–]\s*\d+)?)\s*\|/);
  if (tableMatch) {
    const name = tableMatch[1].trim();
    if (/exercise|exercício|---/i.test(name)) return null;
    return { name, sets: parseInt(tableMatch[2]), reps: tableMatch[3].trim() };
  }

  // Portuguese PDF format: "Exercise Name 4 séries 8-10 reps"
  const ptWithName = clean.match(/^(.+?)\s+(\d+)\s+séries?\s+(\d+(?:[-–]\d+)?)\s*(?:reps?)?/i);
  if (ptWithName && ptWithName[1].length >= 3 && !/^Max/i.test(ptWithName[3])) {
    return { name: ptWithName[1].trim(), sets: parseInt(ptWithName[2]), reps: ptWithName[3].trim() };
  }

  // Portuguese PDF format (name on previous line): "4 séries 8-10 reps" or "4 séries Max. reps"
  const ptNoName = clean.match(/^(\d+)\s+séries?\s+(Max\.?|\d+(?:[-–]\d+)?)\s*(?:reps?)?/i);
  if (ptNoName) {
    const reps = /max/i.test(ptNoName[2]) ? 'Max' : ptNoName[2].trim();
    return { name: '', sets: parseInt(ptNoName[1]), reps };
  }

  // Sets×reps pattern: "Bench Press 4x12" or "Bench Press: 4 x 12"
  const setsRepsMatch = clean.match(/^(.+?)\s*[:\-–—]?\s*(\d+)\s*(?:sets?\s*)?[x×]\s*(\d+(?:\s*[-–]\s*\d+)?)\s*(?:reps?)?/i);
  if (setsRepsMatch) {
    const name = setsRepsMatch[1].replace(/[:\-–—]+$/, '').trim();
    if (name.length >= 3) {
      return { name, sets: parseInt(setsRepsMatch[2]), reps: setsRepsMatch[3].trim() };
    }
  }

  // "Bench Press — 3 sets x 8 reps"
  const verboseMatch = clean.match(/^(.+?)\s*[:\-–—]+\s*(\d+)\s*sets?\s*[x×]?\s*(\d+(?:\s*[-–]\s*\d+)?)\s*reps?/i);
  if (verboseMatch) {
    const name = verboseMatch[1].trim();
    if (name.length >= 3) {
      return { name, sets: parseInt(verboseMatch[2]), reps: verboseMatch[3].trim() };
    }
  }

  return null;
}

function looksLikeExerciseName(line) {
  const clean = line.replace(/^[-*•\d.)\s]+/, '').trim();
  return (
    clean.length >= 3 &&
    clean.length <= 80 &&
    /^[A-ZÀ-Ü]/.test(clean) &&
    !/·/.test(clean) &&
    !/\d+\s*(?:séries?|sets?|reps?|x)\b/i.test(clean) &&
    !/^(?:segunda|terça|quarta|quinta|sexta|sábado|domingo|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(clean) &&
    !/^(?:PUSH|PULL|LEGS|UPPER|LOWER)$/.test(clean)
  );
}

function isFoodLine(line) {
  const clean = line.replace(/^[-*•\d.)\s|]+/, '');
  return /\d+\s*(?:g|ml|oz|cal|kcal)/i.test(clean) || /\d+\s*[PC].*\d+\s*[CG]/i.test(clean);
}

function parseFoodLine(line) {
  const clean = line.replace(/^[-*•\d.)\s]+/, '').trim();
  if (!clean || clean.length < 3) return null;
  if (/^[|]?\s*food|^[|]?\s*alimento|^[|]?\s*---/i.test(clean)) return null;

  const food = {
    id: crypto.randomUUID(),
    name: '',
    quantity: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    confidence: 'medium',
  };

  // Table row: | Food | Qty | Cal | P | C | F |
  const tableMatch = line.match(/\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|/);
  if (tableMatch) {
    food.name = tableMatch[1].trim();
    food.quantity = tableMatch[2].trim();
    food.calories = tableMatch[3];
    food.protein = tableMatch[4];
    food.carbs = tableMatch[5];
    food.fat = tableMatch[6];
    food.confidence = 'high';
    if (/food|alimento|---/i.test(food.name)) return null;
    return food;
  }

  // Inline macros: "Chicken breast 200g (180 cal, 38P/0C/2F)"
  const inlineMatch = clean.match(/^(.+?)\s+(\d+\s*(?:g|ml|oz|un|fatia|colher)(?:[a-z]*)?)\s*[(\-–—]+\s*(\d+)\s*(?:cal|kcal)?.*?(\d+)\s*(?:g\s*)?P.*?(\d+)\s*(?:g\s*)?C.*?(\d+)\s*(?:g\s*)?[FG]/i);
  if (inlineMatch) {
    food.name = inlineMatch[1].trim();
    food.quantity = inlineMatch[2].trim();
    food.calories = inlineMatch[3];
    food.protein = inlineMatch[4];
    food.carbs = inlineMatch[5];
    food.fat = inlineMatch[6];
    food.confidence = 'high';
    return food;
  }

  // Simpler: "Food item 150g — 200 cal" or "Food item - 200 kcal"
  const simpleCalMatch = clean.match(/^(.+?)\s+(\d+\s*(?:g|ml|oz|un)(?:[a-z]*)?)\s*[:\-–—]+\s*(\d+)\s*(?:cal|kcal)/i);
  if (simpleCalMatch) {
    food.name = simpleCalMatch[1].trim();
    food.quantity = simpleCalMatch[2].trim();
    food.calories = simpleCalMatch[3];
    food.confidence = 'medium';
    return food;
  }

  // Just food with quantity: "200g chicken breast"
  const qtyFirst = clean.match(/^(\d+\s*(?:g|ml|oz)(?:[a-z]*)?)\s+(.+)/i);
  if (qtyFirst) {
    food.name = qtyFirst[2].trim();
    food.quantity = qtyFirst[1].trim();
    food.confidence = 'low';
    return food;
  }

  // Food with quantity after: "Chicken breast 200g"
  const qtyAfter = clean.match(/^(.+?)\s+(\d+\s*(?:g|ml|oz|un|fatia|colher)(?:[a-z]*)?)\s*$/i);
  if (qtyAfter && qtyAfter[1].length >= 3) {
    food.name = qtyAfter[1].trim();
    food.quantity = qtyAfter[2].trim();
    food.confidence = 'low';
    return food;
  }

  return null;
}

function matchExerciseToBundle(name) {
  const exercises = getBundleExercises();
  if (!exercises || exercises.length === 0) {
    return { exercise: null, confidence: 'low' };
  }

  const normalized = name.toLowerCase().trim();

  // Exact match by name or id
  const exact = exercises.find(ex =>
    ex.name.toLowerCase() === normalized ||
    ex.id === normalized.replace(/\s+/g, '_')
  );
  if (exact) return { exercise: exact, confidence: 'high' };

  // Token overlap
  const tokens = normalized.split(/\s+/);
  let bestMatch = null;
  let bestScore = 0;
  for (const ex of exercises) {
    const exTokens = ex.name.toLowerCase().split(/\s+/);
    const overlap = tokens.filter(t => exTokens.includes(t)).length / Math.max(tokens.length, exTokens.length);
    if (overlap > bestScore) {
      bestScore = overlap;
      bestMatch = ex;
    }
  }

  if (bestScore >= 0.7) return { exercise: bestMatch, confidence: 'high' };
  if (bestScore >= 0.5) return { exercise: bestMatch, confidence: 'medium' };
  return { exercise: null, confidence: 'low' };
}
