// Weekly Schedule Data with bilingual support

export const SCHEDULE = {
  Seg: {
    type: "home",
    note: {
      'pt-BR': "Home office · Início de semana, energia alta — bom momento pra limpeza rápida à noite",
      'en': "Home office · Start of week, high energy — good time for quick cleaning at night"
    },
    blocks: [
      { time: "6:30", label: { 'pt-BR': "Acorda", 'en': "Wake up" }, sub: { 'pt-BR': "Água, respira. Semana começa agora.", 'en': "Water, breathe. Week starts now." }, type: "morning" },
      { time: "6:45", label: { 'pt-BR': "Ritual matinal", 'en': "Morning ritual" }, sub: { 'pt-BR': "Café, 5 min de silêncio ou alongamento leve", 'en': "Coffee, 5 min of silence or light stretching" }, type: "morning" },
      { time: "7:15", label: { 'pt-BR': "Academia", 'en': "Gym" }, sub: { 'pt-BR': "60–75 min · Dia A: Push (Peito, Ombro, Tríceps)", 'en': "60–75 min · Day A: Push (Chest, Shoulder, Triceps)" }, type: "gym", tag: "gym" },
      { time: "8:45", label: { 'pt-BR': "Ducha + café da manhã", 'en': "Shower + breakfast" }, sub: { 'pt-BR': "Ovos, aveia, fruta — come devagar, sem pressa", 'en': "Eggs, oatmeal, fruit — eat slowly, no rush" }, type: "food" },
      { time: "9:30", label: { 'pt-BR': "Trabalho — bloco profundo", 'en': "Work — deep focus block" }, sub: { 'pt-BR': "Tarefa mais importante do dia primeiro", 'en': "Most important task of the day first" }, type: "work" },
      { time: "13:00", label: { 'pt-BR': "Almoço", 'en': "Lunch" }, sub: { 'pt-BR': "Refeição de verdade · sai da mesa pra comer", 'en': "Real meal · step away from desk to eat" }, type: "food" },
      { time: "13:45", label: { 'pt-BR': "Caminhada curta", 'en': "Short walk" }, sub: { 'pt-BR': "15 min fora de casa · obrigatório em dias home", 'en': "15 min outside · mandatory on home days" }, type: "free" },
      { time: "14:00", label: { 'pt-BR': "Trabalho — tarde", 'en': "Work — afternoon" }, sub: { 'pt-BR': "Emails, reuniões, tarefas menores", 'en': "Emails, meetings, smaller tasks" }, type: "work" },
      { time: "17:00", label: { 'pt-BR': "Fecha o laptop", 'en': "Close laptop" }, sub: { 'pt-BR': "Acabou. Não volta mais hoje.", 'en': "Done. Not coming back today." }, type: "work" },
      { time: "17:15", label: { 'pt-BR': "Limpeza rápida da casa", 'en': "Quick house cleaning" }, sub: { 'pt-BR': "30–40 min · aspirar, limpar banheiro, organizar", 'en': "30–40 min · vacuum, clean bathroom, organize" }, type: "chore", tag: "chore" },
      { time: "18:00", label: { 'pt-BR': "Tempo seu", 'en': "Your time" }, sub: { 'pt-BR': "Leitura, projeto pessoal, criatividade — sem culpa", 'en': "Reading, personal project, creativity — guilt-free" }, type: "free" },
      { time: "19:30", label: { 'pt-BR': "Jantar", 'en': "Dinner" }, sub: { 'pt-BR': "Proteína + carboidrato + legume · varia a proteína", 'en': "Protein + carb + veggie · vary the protein" }, type: "food" },
      { time: "21:00", label: { 'pt-BR': "Wind down", 'en': "Wind down" }, sub: { 'pt-BR': "Prepara roupa, sem telas, leitura leve", 'en': "Prepare clothes, no screens, light reading" }, type: "sleep" },
      { time: "22:30", label: { 'pt-BR': "Dorme", 'en': "Sleep" }, sub: { 'pt-BR': "8h. Músculo cresce aqui, não na academia.", 'en': "8h. Muscle grows here, not at the gym." }, type: "sleep" },
    ],
  },

  Ter: {
    type: "office",
    note: {
      'pt-BR': "Dia de escritório · Manhã mais curta, tudo mais compacto",
      'en': "Office day · Shorter morning, everything more compact"
    },
    blocks: [
      { time: "6:30", label: { 'pt-BR': "Acorda", 'en': "Wake up" }, sub: { 'pt-BR': "Alarme. Mas você curte manhã — tá fácil.", 'en': "Alarm. But you're a morning person — easy." }, type: "morning" },
      { time: "6:45", label: { 'pt-BR': "Academia", 'en': "Gym" }, sub: { 'pt-BR': "60 min direto · Dia B: Pull (Costas, Bíceps)", 'en': "60 min straight · Day B: Pull (Back, Biceps)" }, type: "gym", tag: "gym" },
      { time: "7:50", label: { 'pt-BR': "Ducha + prepara", 'en': "Shower + prep" }, sub: { 'pt-BR': "Shake ou lanche rápido — tem que ser prático", 'en': "Shake or quick snack — needs to be practical" }, type: "food" },
      { time: "8:30", label: { 'pt-BR': "Deslocamento", 'en': "Commute" }, sub: { 'pt-BR': "Podcast, música, ou só observa o mundo", 'en': "Podcast, music, or just watch the world" }, type: "free" },
      { time: "9:00", label: { 'pt-BR': "Escritório", 'en': "Office" }, sub: { 'pt-BR': "Foco. Você já ganhou o dia antes de chegar.", 'en': "Focus. You already won the day before arriving." }, type: "work", tag: "office" },
      { time: "12:30", label: { 'pt-BR': "Almoço", 'en': "Lunch" }, sub: { 'pt-BR': "Lunchbox de casa ou opção proteica decente", 'en': "Lunchbox from home or decent protein option" }, type: "food" },
      { time: "16:30", label: { 'pt-BR': "Fim do trabalho", 'en': "End of work" }, sub: { 'pt-BR': "Saiu. Não abre o email em casa.", 'en': "Left. Don't open email at home." }, type: "work" },
      { time: "17:15", label: { 'pt-BR': "Mercado", 'en': "Grocery store" }, sub: { 'pt-BR': "Lista pronta no celular · compra pra semana toda", 'en': "List ready on phone · buy for the whole week" }, type: "chore", tag: "chore" },
      { time: "18:30", label: { 'pt-BR': "Descomprime", 'en': "Decompress" }, sub: { 'pt-BR': "Chega em casa, larga as coisas, respira 15 min", 'en': "Get home, put things down, breathe 15 min" }, type: "free" },
      { time: "19:30", label: { 'pt-BR': "Jantar", 'en': "Dinner" }, sub: { 'pt-BR': "Salmão, ovo, frango — varia. Come com calma.", 'en': "Salmon, egg, chicken — vary. Eat calmly." }, type: "food" },
      { time: "21:00", label: { 'pt-BR': "Tempo livre", 'en': "Free time" }, sub: { 'pt-BR': "Série, leitura, amigos online — o que der vontade", 'en': "Series, reading, online friends — whatever you want" }, type: "free" },
      { time: "22:30", label: { 'pt-BR': "Dorme", 'en': "Sleep" }, sub: { 'pt-BR': "8h target.", 'en': "8h target." }, type: "sleep" },
    ],
  },

  Qua: {
    type: "home",
    note: {
      'pt-BR': "Home office · Meio de semana, mantém o ritmo",
      'en': "Home office · Midweek, keep the rhythm"
    },
    blocks: [
      { time: "6:30", label: { 'pt-BR': "Acorda", 'en': "Wake up" }, sub: { 'pt-BR': "Metade da semana — você tá no caminho.", 'en': "Halfway through the week — you're on track." }, type: "morning" },
      { time: "6:45", label: { 'pt-BR': "Ritual matinal", 'en': "Morning ritual" }, sub: { 'pt-BR': "Café, alongamento, intenção do dia", 'en': "Coffee, stretching, day's intention" }, type: "morning" },
      { time: "7:15", label: { 'pt-BR': "Academia", 'en': "Gym" }, sub: { 'pt-BR': "60–75 min · Dia C: Legs (Quadríceps, Glúteo, Posterior)", 'en': "60–75 min · Day C: Legs (Quads, Glutes, Hamstrings)" }, type: "gym", tag: "gym" },
      { time: "8:45", label: { 'pt-BR': "Café da manhã", 'en': "Breakfast" }, sub: { 'pt-BR': "Iogurte grego + granola + frutas + mel", 'en': "Greek yogurt + granola + fruits + honey" }, type: "food" },
      { time: "9:30", label: { 'pt-BR': "Trabalho — bloco profundo", 'en': "Work — deep focus block" }, sub: { 'pt-BR': "Tarefa que exige concentração agora", 'en': "Task that requires focus now" }, type: "work" },
      { time: "13:00", label: { 'pt-BR': "Almoço", 'en': "Lunch" }, sub: { 'pt-BR': "Refeição real · sai da frente do computador", 'en': "Real meal · step away from computer" }, type: "food" },
      { time: "13:45", label: { 'pt-BR': "Caminhada", 'en': "Walk" }, sub: { 'pt-BR': "15 min fora · ar, luz, pausa de verdade", 'en': "15 min outside · air, light, real break" }, type: "free" },
      { time: "14:00", label: { 'pt-BR': "Trabalho — tarde", 'en': "Work — afternoon" }, sub: { 'pt-BR': "Reuniões, revisões, tarefas secundárias", 'en': "Meetings, reviews, secondary tasks" }, type: "work" },
      { time: "17:00", label: { 'pt-BR': "Fecha o laptop", 'en': "Close laptop" }, sub: { 'pt-BR': "Parou.", 'en': "Done." }, type: "work" },
      { time: "17:15", label: { 'pt-BR': "Lavar roupa", 'en': "Do laundry" }, sub: { 'pt-BR': "Coloca na máquina agora — termina sozinha enquanto você vive", 'en': "Put in machine now — finishes on its own while you live" }, type: "chore", tag: "chore" },
      { time: "17:30", label: { 'pt-BR': "Leitura ou projeto pessoal", 'en': "Reading or personal project" }, sub: { 'pt-BR': "Enquanto a roupa lava — aproveita bem esse tempo", 'en': "While laundry runs — use this time well" }, type: "free" },
      { time: "19:00", label: { 'pt-BR': "Estende a roupa", 'en': "Hang laundry" }, sub: { 'pt-BR': "10 min só. Feito.", 'en': "Just 10 min. Done." }, type: "chore" },
      { time: "19:30", label: { 'pt-BR': "Jantar", 'en': "Dinner" }, sub: { 'pt-BR': "Carne vermelha ou leguminosa essa noite", 'en': "Red meat or legumes tonight" }, type: "food" },
      { time: "21:00", label: { 'pt-BR': "Wind down", 'en': "Wind down" }, sub: { 'pt-BR': "Descomprime sem tela, prepara o dia seguinte", 'en': "Decompress without screens, prepare next day" }, type: "sleep" },
      { time: "22:30", label: { 'pt-BR': "Dorme", 'en': "Sleep" }, sub: { 'pt-BR': "8h.", 'en': "8h." }, type: "sleep" },
    ],
  },

  Qui: {
    type: "office",
    note: {
      'pt-BR': "Dia de escritório · Penúltimo dia útil — mantém energia",
      'en': "Office day · Second to last workday — keep the energy"
    },
    blocks: [
      { time: "6:30", label: { 'pt-BR': "Acorda", 'en': "Wake up" }, sub: { 'pt-BR': "Quase lá. Foco mais um dia.", 'en': "Almost there. Focus one more day." }, type: "morning" },
      { time: "6:45", label: { 'pt-BR': "Academia", 'en': "Gym" }, sub: { 'pt-BR': "60 min · Dia D: Push+ (Ombro, Tríceps foco)", 'en': "60 min · Day D: Push+ (Shoulder, Triceps focus)" }, type: "gym", tag: "gym" },
      { time: "7:50", label: { 'pt-BR': "Ducha + prepara", 'en': "Shower + prep" }, sub: { 'pt-BR': "Rápido e eficiente", 'en': "Quick and efficient" }, type: "food" },
      { time: "8:30", label: { 'pt-BR': "Deslocamento", 'en': "Commute" }, sub: { 'pt-BR': "Mindset pro dia", 'en': "Mindset for the day" }, type: "free" },
      { time: "9:00", label: { 'pt-BR': "Escritório", 'en': "Office" }, sub: { 'pt-BR': "Entrega o que precisa ser entregue essa semana", 'en': "Deliver what needs to be delivered this week" }, type: "work", tag: "office" },
      { time: "12:30", label: { 'pt-BR': "Almoço", 'en': "Lunch" }, sub: { 'pt-BR': "Proteína + carboidrato. Não pula.", 'en': "Protein + carb. Don't skip." }, type: "food" },
      { time: "16:30", label: { 'pt-BR': "Fim do trabalho", 'en': "End of work" }, sub: { 'pt-BR': "Semana quase fechada.", 'en': "Week almost done." }, type: "work" },
      { time: "17:15", label: { 'pt-BR': "Descomprime", 'en': "Decompress" }, sub: { 'pt-BR': "Chegou em casa. Pausa real de 20 min.", 'en': "Got home. Real 20 min break." }, type: "free" },
      { time: "17:30", label: { 'pt-BR': "Projeto pessoal ou hobby", 'en': "Personal project or hobby" }, sub: { 'pt-BR': "Side project, desenho, música — o que te move", 'en': "Side project, drawing, music — whatever moves you" }, type: "free" },
      { time: "19:30", label: { 'pt-BR': "Jantar", 'en': "Dinner" }, sub: { 'pt-BR': "Peru, atum, frango — varia. Come com calma.", 'en': "Turkey, tuna, chicken — vary. Eat calmly." }, type: "food" },
      { time: "21:00", label: { 'pt-BR': "Social ou leitura", 'en': "Social or reading" }, sub: { 'pt-BR': "Conversa com amigos, série, o que vier", 'en': "Chat with friends, series, whatever comes" }, type: "free" },
      { time: "22:30", label: { 'pt-BR': "Dorme", 'en': "Sleep" }, sub: { 'pt-BR': "8h — amanhã é sexta.", 'en': "8h — tomorrow is Friday." }, type: "sleep" },
    ],
  },

  Sex: {
    type: "home",
    flex: true,
    note: {
      'pt-BR': "Home office · SEXTA É FLEX — a noite é sua, pode acontecer qualquer coisa",
      'en': "Home office · FRIDAY IS FLEX — the night is yours, anything can happen"
    },
    blocks: [
      { time: "6:30", label: { 'pt-BR': "Acorda", 'en': "Wake up" }, sub: { 'pt-BR': "Sexta. A semana te pertence agora.", 'en': "Friday. The week is yours now." }, type: "morning" },
      { time: "6:45", label: { 'pt-BR': "Ritual matinal", 'en': "Morning ritual" }, sub: { 'pt-BR': "Mais leve que os outros dias — você merece", 'en': "Lighter than other days — you deserve it" }, type: "morning" },
      { time: "7:15", label: { 'pt-BR': "Academia", 'en': "Gym" }, sub: { 'pt-BR': "60 min · Dia E: Pull+ (Costas largura + braços)", 'en': "60 min · Day E: Pull+ (Back width + arms)" }, type: "gym", tag: "gym" },
      { time: "8:45", label: { 'pt-BR': "Café da manhã", 'en': "Breakfast" }, sub: { 'pt-BR': "Capricha — tosta, ovos, frutas, o que der vontade", 'en': "Go big — toast, eggs, fruits, whatever you want" }, type: "food" },
      { time: "9:30", label: { 'pt-BR': "Trabalho — fecha semana", 'en': "Work — close the week" }, sub: { 'pt-BR': "Fecha pendências, não começa coisa nova", 'en': "Close pending items, don't start new things" }, type: "work" },
      { time: "13:00", label: { 'pt-BR': "Almoço", 'en': "Lunch" }, sub: { 'pt-BR': "Última refeição no modo 'semana'", 'en': "Last meal in 'week mode'" }, type: "food" },
      { time: "14:00", label: { 'pt-BR': "Trabalho — tarde curta", 'en': "Work — short afternoon" }, sub: { 'pt-BR': "Termina logo, faz bem feito", 'en': "Finish soon, do it well" }, type: "work" },
      { time: "17:00", label: { 'pt-BR': "Fecha o laptop", 'en': "Close laptop" }, sub: { 'pt-BR': "Semana encerrada. Sério.", 'en': "Week closed. Seriously." }, type: "work" },
      { time: "17:15", label: { 'pt-BR': "BLOCO FLEX", 'en': "FLEX BLOCK" }, sub: { 'pt-BR': "Festa? Fica em casa? Amigos? Série? Você decide na hora.", 'en': "Party? Stay home? Friends? Series? You decide on the spot." }, type: "flex", tag: "flex" },
      { time: "19:30", label: { 'pt-BR': "Jantar (se em casa)", 'en': "Dinner (if at home)" }, sub: { 'pt-BR': "Algo gostoso. Não precisa ser perfeito hoje.", 'en': "Something tasty. Doesn't need to be perfect today." }, type: "food" },
      { time: "?", label: { 'pt-BR': "A noite é sua", 'en': "The night is yours" }, sub: { 'pt-BR': "Sem horário, sem regra. Só não dorme menos de 6h.", 'en': "No schedule, no rules. Just don't sleep less than 6h." }, type: "social", tag: "social" },
    ],
  },

  Sáb: {
    type: "weekend",
    note: {
      'pt-BR': "Fim de semana · Sem obrigação de horário fixo — só os âncoras",
      'en': "Weekend · No fixed schedule obligation — just the anchors"
    },
    blocks: [
      { time: "~7:00", label: { 'pt-BR': "Acorda no seu tempo", 'en': "Wake up at your pace" }, sub: { 'pt-BR': "Sem alarme se a sexta foi pesada", 'en': "No alarm if Friday was heavy" }, type: "morning" },
      { time: "~8:00", label: { 'pt-BR': "Café da manhã calmo", 'en': "Calm breakfast" }, sub: { 'pt-BR': "Capricha no café da manhã. É sábado.", 'en': "Treat yourself at breakfast. It's Saturday." }, type: "food" },
      { time: "~9:30", label: { 'pt-BR': "Academia (opcional)", 'en': "Gym (optional)" }, sub: { 'pt-BR': "Sessão leve, cardio, ou mobilidade — sem pressão", 'en': "Light session, cardio, or mobility — no pressure" }, type: "gym", tag: "gym" },
      { time: "~11:00", label: { 'pt-BR': "Mercado se precisar", 'en': "Grocery if needed" }, sub: { 'pt-BR': "Reposição rápida se o estoque da semana baixou", 'en': "Quick restock if weekly supplies are low" }, type: "chore", tag: "chore" },
      { time: "~13:00", label: { 'pt-BR': "Almoço", 'en': "Lunch" }, sub: { 'pt-BR': "Come bem — pode ser algo diferente do habitual", 'en': "Eat well — can be something different from usual" }, type: "food" },
      { time: "~14:00", label: { 'pt-BR': "Tarde livre", 'en': "Free afternoon" }, sub: { 'pt-BR': "Amigos, passeio, hobby, ou absoluto ócio — tudo válido", 'en': "Friends, outing, hobby, or absolute idleness — all valid" }, type: "free" },
      { time: "~17:00", label: { 'pt-BR': "Gaming com os amigos", 'en': "Gaming with friends" }, sub: { 'pt-BR': "Sem culpa. Isso é vida social e lazer de verdade.", 'en': "No guilt. This is real social life and leisure." }, type: "social", tag: "social" },
      { time: "~19:30", label: { 'pt-BR': "Jantar", 'en': "Dinner" }, sub: { 'pt-BR': "Pode ser mais solto — entrega, restaurante, o que vier", 'en': "Can be more relaxed — delivery, restaurant, whatever" }, type: "food" },
      { time: "~23:00", label: { 'pt-BR': "Dorme quando fizer sentido", 'en': "Sleep when it makes sense" }, sub: { 'pt-BR': "Só não exagera — domingo tem meal prep", 'en': "Just don't overdo it — Sunday has meal prep" }, type: "sleep" },
    ],
  },

  Dom: {
    type: "weekend",
    note: {
      'pt-BR': "Domingo · Recarrega E prepara a semana — o dia mais estratégico",
      'en': "Sunday · Recharge AND prepare the week — the most strategic day"
    },
    blocks: [
      { time: "~7:30", label: { 'pt-BR': "Acorda devagar", 'en': "Wake up slowly" }, sub: { 'pt-BR': "Sem pressa. É domingo.", 'en': "No rush. It's Sunday." }, type: "morning" },
      { time: "~8:30", label: { 'pt-BR': "Café da manhã", 'en': "Breakfast" }, sub: { 'pt-BR': "Aveia, ovos, frutas — começa bem o dia mais calmo", 'en': "Oatmeal, eggs, fruits — start the calmest day well" }, type: "food" },
      { time: "~10:00", label: { 'pt-BR': "Tempo de qualidade", 'en': "Quality time" }, sub: { 'pt-BR': "Leitura, série, hobby, saída curta — o que renova", 'en': "Reading, series, hobby, short outing — whatever renews you" }, type: "free" },
      { time: "~13:00", label: { 'pt-BR': "Almoço", 'en': "Lunch" }, sub: { 'pt-BR': "Leve — você vai cozinhar muito à tarde", 'en': "Light — you'll cook a lot in the afternoon" }, type: "food" },
      { time: "~14:30", label: { 'pt-BR': "MEAL PREP", 'en': "MEAL PREP" }, sub: { 'pt-BR': "2–3h cozinhando pra semana · arroz, proteínas, legumes assados", 'en': "2–3h cooking for the week · rice, proteins, roasted veggies" }, type: "chore", tag: "meal" },
      { time: "~17:30", label: { 'pt-BR': "Limpeza rápida", 'en': "Quick cleaning" }, sub: { 'pt-BR': "30 min · passa aspirador, banheiro, organiza — não precisa ser fundo", 'en': "30 min · vacuum, bathroom, organize — doesn't need to be deep" }, type: "chore", tag: "chore" },
      { time: "~18:30", label: { 'pt-BR': "Semana planejada", 'en': "Week planned" }, sub: { 'pt-BR': "5 min: quais dias vai ao escritório? O que tem pra fazer? Pronto.", 'en': "5 min: which days in office? What to do? Done." }, type: "free" },
      { time: "19:30", label: { 'pt-BR': "Jantar", 'en': "Dinner" }, sub: { 'pt-BR': "Já tem comida pronta da semana — usa ela.", 'en': "Already have food ready for the week — use it." }, type: "food" },
      { time: "~21:00", label: { 'pt-BR': "Wind down longo", 'en': "Long wind down" }, sub: { 'pt-BR': "Banho, leitura, sem tela. Você preparou tudo — relaxa.", 'en': "Bath, reading, no screens. You prepared everything — relax." }, type: "sleep" },
      { time: "22:30", label: { 'pt-BR': "Dorme", 'en': "Sleep" }, sub: { 'pt-BR': "8h. Segunda começa bem.", 'en': "8h. Monday starts well." }, type: "sleep" },
    ],
  },
};

export const DAY_ORDER = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

// Day name translations
export const DAY_TRANSLATIONS = {
  "Seg": { 'pt-BR': "Seg", 'en': "Mon" },
  "Ter": { 'pt-BR': "Ter", 'en': "Tue" },
  "Qua": { 'pt-BR': "Qua", 'en': "Wed" },
  "Qui": { 'pt-BR': "Qui", 'en': "Thu" },
  "Sex": { 'pt-BR': "Sex", 'en': "Fri" },
  "Sáb": { 'pt-BR': "Sáb", 'en': "Sat" },
  "Dom": { 'pt-BR': "Dom", 'en': "Sun" },
};

// Helper functions for translations
export function getDayNote(day, language = 'pt-BR') {
  const dayData = SCHEDULE[day];
  if (!dayData) return '';
  if (typeof dayData.note === 'object') {
    return dayData.note[language] || dayData.note['pt-BR'];
  }
  return dayData.note;
}

export function getBlockLabel(block, language = 'pt-BR') {
  if (typeof block.label === 'object') {
    return block.label[language] || block.label['pt-BR'];
  }
  return block.label;
}

export function getBlockSub(block, language = 'pt-BR') {
  if (typeof block.sub === 'object') {
    return block.sub[language] || block.sub['pt-BR'];
  }
  return block.sub;
}

export function getDayName(day, language = 'pt-BR') {
  return DAY_TRANSLATIONS[day]?.[language] || day;
}
