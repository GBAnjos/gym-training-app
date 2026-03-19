// Design System - Vida App
export const DESIGN = {
  palette: {
    bg: "#0d0d0d",
    card: "#141414",
    cardAlt: "#1a1a1a",
    accent: "#c8f55a",       // lime green — primary action/highlight
    accentDim: "#a8d43a",
    muted: "#444",
    mutedLight: "#777",
    text: "#efefef",
    textDim: "#999",
    border: "#222",
    red: "#ff6b6b",          // social / flex
    blue: "#6bcfff",         // office / food
    orange: "#ffb86c",       // morning
    purple: "#c899ff",       // free time
  },

  blockTypeColors: {
    morning: "#ffb86c",
    gym:     "#c8f55a",
    food:    "#6bcfff",
    work:    "#666",
    free:    "#c899ff",
    sleep:   "#333",
    chore:   "#888",
    social:  "#ff6b6b",
    flex:    "#aaa",
    sport:   "#ffc832",
  },

  sportColors: {
    gym: { primary: '#c8f55a', bg: 'rgba(200,245,90,0.1)', border: 'rgba(200,245,90,0.2)' },
    crossfit: { primary: '#ff6b6b', bg: 'rgba(255,107,107,0.1)', border: 'rgba(255,107,107,0.2)' },
    calisthenics: { primary: '#6bcfff', bg: 'rgba(107,207,255,0.1)', border: 'rgba(107,207,255,0.2)' },
    pilates: { primary: '#c899ff', bg: 'rgba(200,153,255,0.1)', border: 'rgba(200,153,255,0.2)' },
    running: { primary: '#ffc832', bg: 'rgba(255,200,50,0.1)', border: 'rgba(255,200,50,0.2)' },
    yoga: { primary: '#82dcb4', bg: 'rgba(130,220,180,0.1)', border: 'rgba(130,220,180,0.2)' },
  },

  typography: {
    heading: "'DM Serif Display', Georgia, serif",
    mono: "'DM Mono', 'Courier New', monospace",
    body: "'Inter', system-ui, sans-serif",
  },
};

// Muscle group colors for gym exercises
export const muscleColors = {
  "Peito": { bg: "rgba(239, 68, 68, 0.2)", text: "#fca5a5", border: "rgba(239, 68, 68, 0.3)" },
  "Costas": { bg: "rgba(59, 130, 246, 0.2)", text: "#93c5fd", border: "rgba(59, 130, 246, 0.3)" },
  "Ombros": { bg: "rgba(168, 85, 247, 0.2)", text: "#d8b4fe", border: "rgba(168, 85, 247, 0.3)" },
  "Bíceps": { bg: "rgba(6, 182, 212, 0.2)", text: "#67e8f9", border: "rgba(6, 182, 212, 0.3)" },
  "Tríceps": { bg: "rgba(236, 72, 153, 0.2)", text: "#f9a8d4", border: "rgba(236, 72, 153, 0.3)" },
  "Quadríceps": { bg: "rgba(34, 197, 94, 0.2)", text: "#86efac", border: "rgba(34, 197, 94, 0.3)" },
  "Posterior": { bg: "rgba(234, 179, 8, 0.2)", text: "#fde047", border: "rgba(234, 179, 8, 0.3)" },
  "Glúteos": { bg: "rgba(99, 102, 241, 0.2)", text: "#a5b4fc", border: "rgba(99, 102, 241, 0.3)" },
  "Panturrilhas": { bg: "rgba(20, 184, 166, 0.2)", text: "#5eead4", border: "rgba(20, 184, 166, 0.3)" },
  "Trapézio": { bg: "rgba(249, 115, 22, 0.2)", text: "#fdba74", border: "rgba(249, 115, 22, 0.3)" },
};
