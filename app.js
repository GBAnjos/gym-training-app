let treinos = {};
let timerInterval = null;
let frequencyChart = null;
let progressChart = null;
let currentView = 'workout';
let allExercises = [];
let importedData = null;

// Google Drive OAuth
let googleAccessToken = null;
let googleTokenClient = null;
const GOOGLE_CLIENT_ID = '109415433089-ofclj565qlh8e7snf8373d27mhiopvut.apps.googleusercontent.com';
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/drive.file';
const BACKUP_FOLDER_NAME = 'GymTrainingBackups';

// Calculadora 1RM
let oneRMChart = null;
let currentExerciseKey = null;
let currentExerciseReps = null;

const mapDia = {
  "domingo": "domingo",
  "segunda-feira": "segunda",
  "terça-feira": "terca",
  "quarta-feira": "quarta",
  "quinta-feira": "quinta",
  "sexta-feira": "sexta",
  "sábado": "sabado"
};

const muscleColors = {
  "Peito": { bg: "bg-red-950/30", text: "text-red-300", border: "border-red-800/30" },
  "Costas": { bg: "bg-blue-950/30", text: "text-blue-300", border: "border-blue-800/30" },
  "Ombros": { bg: "bg-purple-950/30", text: "text-purple-300", border: "border-purple-800/30" },
  "Bíceps": { bg: "bg-cyan-950/30", text: "text-cyan-300", border: "border-cyan-800/30" },
  "Tríceps": { bg: "bg-pink-950/30", text: "text-pink-300", border: "border-pink-800/30" },
  "Quadríceps": { bg: "bg-green-950/30", text: "text-green-300", border: "border-green-800/30" },
  "Posterior": { bg: "bg-yellow-950/30", text: "text-yellow-300", border: "border-yellow-800/30" },
  "Glúteos": { bg: "bg-indigo-950/30", text: "text-indigo-300", border: "border-indigo-800/30" },
  "Panturrilhas": { bg: "bg-teal-950/30", text: "text-teal-300", border: "border-teal-800/30" },
  "Trapézio": { bg: "bg-orange-950/30", text: "text-orange-300", border: "border-orange-800/30" }
};

fetch("data/treinos.json")
  .then(res => res.json())
  .then(data => {
    treinos = data;
    init();
  })
  .catch(error => {
    console.error("Erro ao carregar treinos:", error);
    alert("Erro ao carregar dados de treino. Por favor, recarregue a página.");
  });

function init() {
  const selector = document.getElementById("daySelector");
  if (!selector) return;
  
  selector.innerHTML = "";

  Object.keys(treinos).forEach(dia => {
    const opt = document.createElement("option");
    opt.value = dia;
    opt.textContent = dia.charAt(0).toUpperCase() + dia.slice(1);
    selector.appendChild(opt);
  });

  const hojeRaw = new Date().toLocaleDateString("pt-BR", { weekday: "long" });
  const hoje = mapDia[hojeRaw];

  if (treinos[hoje]) {
    selector.value = hoje;
  }

  selector.onchange = () => renderWorkout(selector.value);
  renderWorkout(selector.value);
  
  populateFilters();
  initGoogleDrive();
  updateStreakBadge();
}

function renderWorkout(dia) {
  const container = document.getElementById("workout");
  if (!container) return;
  
  container.innerHTML = "";

  const treino = treinos[dia];
  if (!treino) return;

  const header = document.createElement("div");
  header.className = "mb-6";
  header.innerHTML = `
    <h2 class="text-2xl font-bold text-white mb-2">${treino.nome}</h2>
    <p class="text-gray-400 text-sm">${treino.grupos.join(" • ")}</p>
  `;
  container.appendChild(header);

  let completed = 0;
  treino.exercicios.forEach(ex => {
    const key = `${dia}_${ex.id}`;
    const saved = JSON.parse(localStorage.getItem(key)) || {};
    if (saved.feito) completed++;
  });

  const total = treino.exercicios.length;
  const percent = Math.round((completed / total) * 100);

  const progressDiv = document.createElement("div");
  progressDiv.className = "mb-6 bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a]";
  progressDiv.innerHTML = `
    <div class="flex justify-between items-center mb-2 text-sm">
      <span class="text-gray-400 font-medium">${completed} de ${total} exercícios</span>
      <span class="text-[#4a9eff] font-bold">${percent}%</span>
    </div>
    <div class="w-full h-3 bg-[#2a2a2a] rounded-full overflow-hidden">
      <div class="h-full bg-gradient-to-r from-[#4a9eff] to-[#66b3ff] rounded-full transition-all duration-300" 
        style="width: ${percent}%">
      </div>
    </div>
  `;
  container.appendChild(progressDiv);

  treino.exercicios.forEach(ex => {
    const key = `${dia}_${ex.id}`;
    const saved = JSON.parse(localStorage.getItem(key)) || {};

    const div = document.createElement("div");
    const isCompleted = saved.feito;
    
    const notesCount = saved.notas ? saved.notas.length : 0;
    
    div.className = `mb-4 rounded-2xl p-5 border-2 transition-all ${
      isCompleted 
        ? 'bg-[#1a2a1a] border-[#2d4a2d]' 
        : 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a]'
    }`;

    const muscleTags = ex.musculos ? ex.musculos.map(m => {
      const color = muscleColors[m] || { bg: "bg-gray-950/30", text: "text-gray-300", border: "border-gray-800/30" };
      return `<span class="px-2 py-1 ${color.bg} ${color.text} text-xs font-semibold rounded-md border ${color.border}">${m}</span>`;
    }).join("") : "";

    div.innerHTML = `
      <div class="flex items-start gap-3 mb-3">
        <span class="text-2xl mt-0.5">${isCompleted ? '✅' : '⚪'}</span>
        <div class="flex-1">
          <div class="flex items-start justify-between mb-2">
            <h3 class="text-lg font-bold text-white">${ex.nome}</h3>
            <div class="flex gap-2">
              ${notesCount > 0 ? `
                <button onclick="showNotesModal('${key}', '${ex.nome}')" 
                  class="px-2 py-1 bg-[#2a3a4a] hover:bg-[#3a4a5a] text-[#4a9eff] text-xs font-bold rounded-md border border-[#4a9eff]/30 transition-all flex items-center gap-1">
                  📝 ${notesCount}
                </button>
              ` : ''}
              <button onclick="showOneRMModal('${key}', '${ex.nome}', ${ex.series}, ${ex.reps})" 
                class="px-2 py-1 bg-[#2a2a4a] hover:bg-[#3a3a5a] text-purple-300 text-xs font-bold rounded-md border border-purple-800/30 transition-all flex items-center gap-1">
                💪 1RM
              </button>
            </div>
          </div>
          
          <div class="flex flex-wrap gap-2 mb-2">
            <span class="px-3 py-1 bg-[#2a2a2a] text-gray-300 text-sm font-semibold rounded-lg">
              ${ex.series}x${ex.reps}
            </span>
            ${ex.obs ? `
              <span class="px-3 py-1 bg-[#3a2a1a] text-[#ffaa66] text-sm font-semibold rounded-lg border border-[#4a3a2a]">
                ${ex.obs}
              </span>
            ` : ''}
          </div>
          
          ${muscleTags ? `
          <div class="flex flex-wrap gap-1.5">
            ${muscleTags}
          </div>
          ` : ''}
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mt-4">
        <div class="flex-1">
          <label class="block text-xs font-medium text-gray-500 mb-1.5">Peso (kg)</label>
          <input 
            type="number" 
            step="0.5" 
            value="${saved.peso || ""}"
            placeholder="0.0"
            onchange="savePeso('${key}', this.value, '${dia}')"
            class="w-full px-4 py-3 bg-[#252525] border-2 border-[#3a3a3a] rounded-lg text-white text-lg font-bold text-center transition-all focus:outline-none focus:ring-2 focus:ring-[#4a9eff] focus:border-transparent placeholder-gray-600">
        </div>

        <div class="flex items-center gap-3 px-4 py-3 bg-[#252525] rounded-lg cursor-pointer hover:bg-[#2a2a2a] transition-all"
          onclick="this.querySelector('input').click()">
          <input 
            type="checkbox" 
            id="check_${key}" 
            ${isCompleted ? "checked" : ""}
            onchange="toggleDone('${key}', this.checked, '${dia}')"
            class="w-6 h-6 cursor-pointer accent-[#4a9eff]">
          <label for="check_${key}" class="text-base font-semibold text-gray-200 cursor-pointer select-none">
            Concluído
          </label>
        </div>
      </div>

      <div class="mt-4">
        <label class="block text-xs font-medium text-gray-500 mb-1.5">Nota do Treino (opcional)</label>
        <div class="flex gap-2">
          <input 
            type="text" 
            id="note_${key}"
            placeholder="Ex: Senti muito o músculo hoje..."
            maxlength="200"
            class="flex-1 px-4 py-2 bg-[#252525] border-2 border-[#3a3a3a] rounded-lg text-white text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#4a9eff] focus:border-transparent placeholder-gray-600">
          <button 
            onclick="saveNote('${key}', '${ex.nome}')"
            class="px-4 py-2 bg-[#4a9eff] hover:bg-[#3a8eef] text-white font-semibold rounded-lg transition-all">
            💾
          </button>
        </div>
      </div>
    `;
    
    container.appendChild(div);
  });
}

function savePeso(key, peso, dia) {
  const data = JSON.parse(localStorage.getItem(key)) || {};
  data.peso = peso;
  data.data = new Date().toISOString().split("T")[0];

  if (!data.historico) data.historico = [];
  
  const existingIndex = data.historico.findIndex(h => h.data === data.data);
  if (existingIndex >= 0) {
    data.historico[existingIndex].peso = peso;
  } else {
    data.historico.push({ data: data.data, peso });
  }

  localStorage.setItem(key, JSON.stringify(data));
  saveTrainingDay();
  autoBackupToDrive();
}

function toggleDone(key, done, dia) {
  const data = JSON.parse(localStorage.getItem(key)) || {};
  data.feito = done;
  localStorage.setItem(key, JSON.stringify(data));
  
  if (done) {
    saveTrainingDay();
  }
  
  renderWorkout(dia);
  autoBackupToDrive();
}

function saveTrainingDay() {
  const today = new Date().toISOString().split("T")[0];
  let history = JSON.parse(localStorage.getItem("training_days")) || [];

  if (!history.includes(today)) {
    history.push(today);
    localStorage.setItem("training_days", JSON.stringify(history));
    
    updateStreak();
    updateStreakBadge();
  }
}

// ========== CALCULADORA 1RM ==========

function showOneRMModal(exerciseKey, exerciseName, series, reps) {
  console.log('showOneRMModal chamada com:', { exerciseKey, exerciseName, series, reps });
  
  const modal = document.getElementById('oneRMModal');
  console.log('Modal encontrado:', modal);
  
  const nameEl = document.getElementById('oneRMExerciseName');
  console.log('Nome element encontrado:', nameEl);
  
  const resultDiv = document.getElementById('oneRMResult');
  console.log('Result div encontrado:', resultDiv);
  
  if (!modal || !nameEl) {
    console.error('Modal ou nameEl não encontrados!');
    return;
  }
  
  currentExerciseKey = exerciseKey;
  currentExerciseReps = reps;
  
  nameEl.textContent = exerciseName;
  
  document.getElementById('oneRMWeight').value = '';
  document.getElementById('oneRMReps').value = reps;
  
  if (resultDiv) {
    resultDiv.classList.add('hidden');
  }
  
  renderOneRMHistory(exerciseKey);
  
  console.log('Removendo classe hidden do modal...');
  modal.classList.remove('hidden');
  console.log('Classes do modal após remoção:', modal.className);
}

function closeOneRMModal() {
  const modal = document.getElementById('oneRMModal');
  if (modal) {
    modal.classList.add('hidden');
  }
  
  if (oneRMChart) {
    oneRMChart.destroy();
    oneRMChart = null;
  }
  
  currentExerciseKey = null;
  currentExerciseReps = null;
}

function calculate1RM() {
  const weightInput = document.getElementById('oneRMWeight');
  const repsInput = document.getElementById('oneRMReps');
  const resultDiv = document.getElementById('oneRMResult');
  const valueEl = document.getElementById('oneRMValue');
  const strengthEl = document.getElementById('strengthRange');
  const hypertrophyEl = document.getElementById('hypertrophyRange');
  const enduranceEl = document.getElementById('enduranceRange');
  
  if (!weightInput || !repsInput || !resultDiv) return;
  
  const weight = parseFloat(weightInput.value);
  const reps = parseInt(repsInput.value);
  
  if (!weight || !reps || weight <= 0 || reps < 1 || reps > 12) {
    alert('⚠️ Por favor, insira valores válidos!\n\nPeso: maior que 0\nReps: entre 1 e 12');
    return;
  }
  
  const epley = weight * (1 + reps / 30);
  const brzycki = weight * (36 / (37 - reps));
  
  const oneRM = (epley + brzycki) / 2;
  const oneRMRounded = Math.round(oneRM * 2) / 2;
  
  const strengthMin = Math.round((oneRMRounded * 0.85) * 2) / 2;
  const strengthMax = oneRMRounded;
  
  const hypertrophyMin = Math.round((oneRMRounded * 0.67) * 2) / 2;
  const hypertrophyMax = Math.round((oneRMRounded * 0.85) * 2) / 2;
  
  const enduranceMin = Math.round((oneRMRounded * 0.50) * 2) / 2;
  const enduranceMax = Math.round((oneRMRounded * 0.67) * 2) / 2;
  
  if (valueEl) valueEl.textContent = `${oneRMRounded} kg`;
  if (strengthEl) strengthEl.textContent = `${strengthMin}-${strengthMax} kg`;
  if (hypertrophyEl) hypertrophyEl.textContent = `${hypertrophyMin}-${hypertrophyMax} kg`;
  if (enduranceEl) enduranceEl.textContent = `${enduranceMin}-${enduranceMax} kg`;
  
  resultDiv.classList.remove('hidden');
  
  if (currentExerciseKey) {
    saveOneRMToHistory(currentExerciseKey, oneRMRounded, weight, reps);
    renderOneRMHistory(currentExerciseKey);
  }
}

function saveOneRMToHistory(exerciseKey, oneRM, weight, reps) {
  const data = JSON.parse(localStorage.getItem(exerciseKey)) || {};
  
  if (!data.oneRMHistory) {
    data.oneRMHistory = [];
  }
  
  const today = new Date().toISOString().split("T")[0];
  
  const existingIndex = data.oneRMHistory.findIndex(h => h.data === today);
  
  if (existingIndex >= 0) {
    if (oneRM > data.oneRMHistory[existingIndex].oneRM) {
      data.oneRMHistory[existingIndex] = {
        data: today,
        oneRM: oneRM,
        weight: weight,
        reps: reps,
        timestamp: Date.now()
      };
    }
  } else {
    data.oneRMHistory.push({
      data: today,
      oneRM: oneRM,
      weight: weight,
      reps: reps,
      timestamp: Date.now()
    });
  }
  
  if (data.oneRMHistory.length > 100) {
    data.oneRMHistory = data.oneRMHistory.slice(-100);
  }
  
  localStorage.setItem(exerciseKey, JSON.stringify(data));
  autoBackupToDrive();
}

function renderOneRMHistory(exerciseKey) {
  const data = JSON.parse(localStorage.getItem(exerciseKey)) || {};
  const history = data.oneRMHistory || [];
  
  const canvas = document.getElementById('oneRMChart');
  if (!canvas) return;
  
  if (oneRMChart) {
    oneRMChart.destroy();
  }
  
  if (history.length === 0) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#666';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Nenhum cálculo de 1RM ainda', canvas.width / 2, canvas.height / 2);
    return;
  }
  
  const sortedHistory = [...history].sort((a, b) => new Date(a.data) - new Date(b.data));
  
  const labels = sortedHistory.map(h => {
    const d = new Date(h.data);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  });
  
  const values = sortedHistory.map(h => h.oneRM);
  
  oneRMChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: '1RM (kg)',
        data: values,
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: '#a855f7',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            color: '#999'
          },
          grid: {
            color: '#2a2a2a'
          }
        },
        x: {
          ticks: {
            color: '#999'
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// ========== STREAK COUNTER ==========

function calculateStreak() {
  const history = JSON.parse(localStorage.getItem("training_days")) || [];
  
  if (history.length === 0) {
    return { current: 0, best: 0, lastWorkout: null };
  }
  
  const sortedDates = history.map(d => new Date(d)).sort((a, b) => b - a);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  let currentStreak = 0;
  let checkDate = new Date(today);
  
  for (let i = 0; i < sortedDates.length; i++) {
    const workoutDate = new Date(sortedDates[i]);
    workoutDate.setHours(0, 0, 0, 0);
    
    if (workoutDate.getTime() === checkDate.getTime()) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (workoutDate.getTime() < checkDate.getTime()) {
      break;
    }
  }
  
  let bestStreak = 0;
  let tempStreak = 1;
  
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const current = new Date(sortedDates[i]);
    const next = new Date(sortedDates[i + 1]);
    
    const diffDays = Math.floor((current - next) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      tempStreak++;
    } else {
      bestStreak = Math.max(bestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  bestStreak = Math.max(bestStreak, tempStreak);
  
  const lastWorkout = sortedDates[0];
  
  return {
    current: currentStreak,
    best: Math.max(bestStreak, currentStreak),
    lastWorkout: lastWorkout
  };
}

function updateStreak() {
  const streak = calculateStreak();
  
  localStorage.setItem('current_streak', streak.current.toString());
  localStorage.setItem('best_streak', streak.best.toString());
  
  const previousBest = parseInt(localStorage.getItem('previous_best_streak') || '0');
  
  if (streak.current > previousBest && streak.current >= 3) {
    localStorage.setItem('previous_best_streak', streak.current.toString());
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🔥 Novo Recorde!', {
        body: `${streak.current} dias consecutivos de treino!`,
        icon: 'icons/icon-192.png'
      });
    }
  }
}

function updateStreakBadge() {
  const streak = calculateStreak();
  const badge = document.getElementById('streakBadge');
  const count = document.getElementById('streakCount');
  
  if (!badge || !count) return;
  
  if (streak.current > 0) {
    badge.classList.remove('hidden');
    count.textContent = streak.current;
  } else {
    badge.classList.add('hidden');
  }
}

function getStreakMessage(streak) {
  if (streak.current === 0) {
    return '💪 Comece seu streak hoje! Cada dia conta.';
  } else if (streak.current === 1) {
    return '🔥 Ótimo começo! Volte amanhã para continuar.';
  } else if (streak.current < 7) {
    return `🔥 ${streak.current} dias! Continue assim para completar uma semana.`;
  } else if (streak.current < 30) {
    return `🔥 Incrível! ${streak.current} dias consecutivos. Você está on fire!`;
  } else if (streak.current < 100) {
    return `🔥🔥 ${streak.current} dias! Você é uma máquina imparável!`;
  } else {
    return `🔥🔥🔥 LENDÁRIO! ${streak.current} dias consecutivos!`;
  }
}

// ========== NOTAS DO EXERCÍCIO ==========

function saveNote(key, exerciseName) {
  const input = document.getElementById(`note_${key}`);
  if (!input) return;
  
  const noteText = input.value.trim();
  
  if (!noteText) {
    alert('📝 Digite uma nota antes de salvar!');
    return;
  }
  
  const data = JSON.parse(localStorage.getItem(key)) || {};
  
  if (!data.notas) data.notas = [];
  
  const today = new Date().toISOString().split("T")[0];
  
  data.notas.push({
    data: today,
    texto: noteText,
    timestamp: Date.now()
  });
  
  if (data.notas.length > 50) {
    data.notas = data.notas.slice(-50);
  }
  
  localStorage.setItem(key, JSON.stringify(data));
  
  input.value = '';
  
  const btn = input.nextElementSibling;
  const originalText = btn.textContent;
  btn.textContent = '✓';
  btn.classList.add('bg-green-600');
  btn.classList.remove('bg-[#4a9eff]');
  
  setTimeout(() => {
    btn.textContent = originalText;
    btn.classList.remove('bg-green-600');
    btn.classList.add('bg-[#4a9eff]');
    
    const selector = document.getElementById("daySelector");
    if (selector) {
      renderWorkout(selector.value);
    }
  }, 1000);
  
  autoBackupToDrive();
}

function showNotesModal(key, exerciseName) {
  const modal = document.getElementById('notesModal');
  const nameEl = document.getElementById('notesExerciseName');
  const historyEl = document.getElementById('notesHistory');
  
  if (!modal || !nameEl || !historyEl) return;
  
  nameEl.textContent = exerciseName;
  
  const data = JSON.parse(localStorage.getItem(key)) || {};
  const notas = data.notas || [];
  
  if (notas.length === 0) {
    historyEl.innerHTML = `
      <div class="text-center py-8 text-gray-400">
        <div class="text-4xl mb-2">📝</div>
        <p>Nenhuma nota ainda para este exercício.</p>
      </div>
    `;
  } else {
    const sortedNotas = [...notas].sort((a, b) => b.timestamp - a.timestamp);
    
    historyEl.innerHTML = sortedNotas.map(nota => {
      const date = new Date(nota.data);
      const formatted = date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
      
      return `
        <div class="bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[#4a9eff] font-semibold text-sm">📅 ${formatted}</span>
          </div>
          <p class="text-gray-200 text-sm leading-relaxed">${nota.texto}</p>
        </div>
      `;
    }).join('');
  }
  
  modal.classList.remove('hidden');
}

function closeNotesModal() {
  const modal = document.getElementById('notesModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// ========== TIMER ==========

function startTimer(seconds) {
  clearInterval(timerInterval);
  let remaining = seconds;
  const display = document.getElementById("timerDisplay");
  if (!display) return;
  
  display.classList.remove("animate-pulse-slow", "text-green-400");
  display.classList.add("text-[#4a9eff]");

  timerInterval = setInterval(() => {
    const minutes = Math.floor(remaining / 60);
    const secs = remaining % 60;
    display.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
    remaining--;

    if (remaining < 0) {
      clearInterval(timerInterval);
      display.textContent = "✓ Descanso finalizado!";
      display.classList.remove("text-[#4a9eff]");
      display.classList.add("text-green-400", "animate-pulse-slow");
      
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, 1000);
}

// ========== VIEW MANAGEMENT ==========

function showView(view) {
  const workoutView = document.getElementById('workoutView');
  const analyticsView = document.getElementById('analyticsView');
  const settingsView = document.getElementById('settingsView');
  const daySelector = document.getElementById('daySelector');
  
  if (!workoutView || !analyticsView || !settingsView || !daySelector) {
    console.error("Elementos da UI não encontrados");
    return;
  }
  
  workoutView.classList.add('hidden');
  analyticsView.classList.add('hidden');
  settingsView.classList.add('hidden');
  
  currentView = view;
  
  if (view === 'workout') {
    workoutView.classList.remove('hidden');
    daySelector.classList.remove('hidden');
  } else if (view === 'analytics') {
    analyticsView.classList.remove('hidden');
    daySelector.classList.add('hidden');
    renderAnalytics();
  } else if (view === 'settings') {
    settingsView.classList.remove('hidden');
    daySelector.classList.add('hidden');
    updateSettingsStats();
    updateDriveStatus();
  }
}

// ========== ANALYTICS ==========

function renderAnalytics() {
  try {
    calculateStats();
    renderStreakStats();
    renderFrequencyChart();
    updateProgressChart();
  } catch (error) {
    console.error("Erro ao renderizar analytics:", error);
  }
}

function calculateStats() {
  const history = JSON.parse(localStorage.getItem("training_days")) || [];
  
  const totalWorkouts = document.getElementById('totalWorkouts');
  const weeklyAvg = document.getElementById('weeklyAvg');
  const thisWeek = document.getElementById('thisWeek');
  const thisMonth = document.getElementById('thisMonth');
  
  if (totalWorkouts) totalWorkouts.textContent = history.length;
  
  const weeks = history.length > 0 ? Math.ceil((Date.now() - new Date(history[0]).getTime()) / (7 * 24 * 60 * 60 * 1000)) : 1;
  const avgWeekly = (history.length / weeks).toFixed(1);
  if (weeklyAvg) weeklyAvg.textContent = avgWeekly;
  
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const weekCount = history.filter(date => new Date(date) >= startOfWeek).length;
  if (thisWeek) thisWeek.textContent = weekCount;
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthCount = history.filter(date => new Date(date) >= startOfMonth).length;
  if (thisMonth) thisMonth.textContent = monthCount;
}

function renderStreakStats() {
  const streak = calculateStreak();
  
  const currentStreakEl = document.getElementById('currentStreakDisplay');
  const bestStreakEl = document.getElementById('bestStreakDisplay');
  const lastWorkoutEl = document.getElementById('lastWorkoutDisplay');
  const messageEl = document.getElementById('streakMessage');
  
  if (currentStreakEl) {
    currentStreakEl.innerHTML = `
      <span>${streak.current}</span>
      <span class="text-2xl">dia${streak.current !== 1 ? 's' : ''}</span>
    `;
  }
  
  if (bestStreakEl) {
    bestStreakEl.innerHTML = `
      <span>${streak.best}</span>
      <span class="text-2xl">dia${streak.best !== 1 ? 's' : ''}</span>
    `;
  }
  
  if (lastWorkoutEl && streak.lastWorkout) {
    const date = new Date(streak.lastWorkout);
    const formatted = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    lastWorkoutEl.textContent = formatted;
  } else if (lastWorkoutEl) {
    lastWorkoutEl.textContent = '-';
  }
  
  if (messageEl) {
    messageEl.textContent = getStreakMessage(streak);
  }
}

function renderFrequencyChart() {
  const history = JSON.parse(localStorage.getItem("training_days")) || [];
  
  const weeks = {};
  const today = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() - (i * 7));
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    const weekKey = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
    weeks[weekKey] = 0;
    
    history.forEach(date => {
      const d = new Date(date);
      if (d >= weekStart && d <= weekEnd) {
        weeks[weekKey]++;
      }
    });
  }
  
  const ctx = document.getElementById('frequencyChart');
  if (!ctx) return;
  
  if (frequencyChart) {
    frequencyChart.destroy();
  }
  
  frequencyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(weeks),
      datasets: [{
        label: 'Treinos por semana',
        data: Object.values(weeks),
        backgroundColor: '#4a9eff',
        borderColor: '#66b3ff',
        borderWidth: 2,
        borderRadius: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#999',
            stepSize: 1
          },
          grid: {
            color: '#2a2a2a'
          }
        },
        x: {
          ticks: {
            color: '#999'
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

function populateFilters() {
  try {
    allExercises = [];
    
    Object.keys(treinos).forEach(dia => {
      if (treinos[dia].exercicios) {
        treinos[dia].exercicios.forEach(ex => {
          allExercises.push({
            dia: dia,
            diaLabel: dia.charAt(0).toUpperCase() + dia.slice(1),
            id: `${dia}_${ex.id}`,
            nome: ex.nome,
            musculos: ex.musculos || []
          });
        });
      }
    });
    
    const dayFilter = document.getElementById('dayFilter');
    if (dayFilter) {
      dayFilter.innerHTML = '<option value="">Todos os dias</option>';
      Object.keys(treinos).forEach(dia => {
        const opt = document.createElement('option');
        opt.value = dia;
        opt.textContent = dia.charAt(0).toUpperCase() + dia.slice(1);
        dayFilter.appendChild(opt);
      });
    }
    
    updateMuscleFilter();
    updateExerciseSelector();
  } catch (error) {
    console.error("Erro ao popular filtros:", error);
  }
}

function filterExercises() {
  try {
    updateMuscleFilter();
    updateExerciseSelector();
  } catch (error) {
    console.error("Erro ao filtrar exercícios:", error);
  }
}

function updateMuscleFilter() {
  const dayFilter = document.getElementById('dayFilter');
  const muscleFilter = document.getElementById('muscleFilter');
  
  if (!dayFilter || !muscleFilter) return;
  
  const dayValue = dayFilter.value;
  const currentMuscle = muscleFilter.value;
  
  let filtered = allExercises;
  if (dayValue) {
    filtered = filtered.filter(ex => ex.dia === dayValue);
  }
  
  const availableMuscles = new Set();
  filtered.forEach(ex => {
    if (ex.musculos) {
      ex.musculos.forEach(m => availableMuscles.add(m));
    }
  });
  
  muscleFilter.innerHTML = '<option value="">Todos os grupos</option>';
  Array.from(availableMuscles).sort().forEach(muscle => {
    const opt = document.createElement('option');
    opt.value = muscle;
    opt.textContent = muscle;
    muscleFilter.appendChild(opt);
  });
  
  if (currentMuscle && availableMuscles.has(currentMuscle)) {
    muscleFilter.value = currentMuscle;
  }
}

function updateExerciseSelector() {
  const dayFilter = document.getElementById('dayFilter');
  const muscleFilter = document.getElementById('muscleFilter');
  const exerciseSelector = document.getElementById('exerciseSelector');
  
  if (!dayFilter || !muscleFilter || !exerciseSelector) return;
  
  const dayValue = dayFilter.value;
  const muscleValue = muscleFilter.value;
  
  exerciseSelector.innerHTML = '<option value="">Selecione um exercício</option>';
  
  let filtered = allExercises;
  
  if (dayValue) {
    filtered = filtered.filter(ex => ex.dia === dayValue);
  }
  
  if (muscleValue) {
    filtered = filtered.filter(ex => ex.musculos && ex.musculos.includes(muscleValue));
  }
  
  filtered.forEach(ex => {
    const opt = document.createElement('option');
    opt.value = ex.id;
    opt.textContent = dayValue ? ex.nome : `${ex.nome} (${ex.diaLabel})`;
    exerciseSelector.appendChild(opt);
  });
  
  const placeholder = document.getElementById('emptyChartPlaceholder');
  const chartContainer = document.getElementById('progressChartContainer');
  
  if (progressChart) {
    progressChart.destroy();
    progressChart = null;
  }
  
  if (placeholder) placeholder.classList.add('hidden');
  if (chartContainer) chartContainer.classList.add('hidden');
}

function updateProgressChart() {
  const selector = document.getElementById('exerciseSelector');
  const placeholder = document.getElementById('emptyChartPlaceholder');
  const chartContainer = document.getElementById('progressChartContainer');
  
  if (!selector || !placeholder || !chartContainer) return;
  
  const exerciseKey = selector.value;
  
  if (!exerciseKey) {
    if (progressChart) {
      progressChart.destroy();
      progressChart = null;
    }
    placeholder.classList.add('hidden');
    chartContainer.classList.add('hidden');
    return;
  }
  
  const data = JSON.parse(localStorage.getItem(exerciseKey)) || {};
  const historico = data.historico || [];
  
  if (historico.length === 0) {
    placeholder.classList.remove('hidden');
    chartContainer.classList.add('hidden');
    
    if (progressChart) {
      progressChart.destroy();
      progressChart = null;
    }
    return;
  }
  
  placeholder.classList.add('hidden');
  chartContainer.classList.remove('hidden');
  
  historico.sort((a, b) => new Date(a.data) - new Date(b.data));
  
  const labels = historico.map(h => {
    const d = new Date(h.data);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  });
  
  const pesos = historico.map(h => parseFloat(h.peso) || 0);
  
  const canvas = document.getElementById('progressChart');
  if (!canvas) return;
  
  if (progressChart) {
    progressChart.destroy();
  }
  
  progressChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Carga (kg)',
        data: pesos,
        borderColor: '#4a9eff',
        backgroundColor: 'rgba(74, 158, 255, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: '#4a9eff',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            color: '#999'
          },
          grid: {
            color: '#2a2a2a'
          }
        },
        x: {
          ticks: {
            color: '#999'
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// ========== SETTINGS ==========

function updateSettingsStats() {
  let exerciseCount = 0;
  Object.keys(localStorage).forEach(key => {
    if (key.includes('_') && !key.startsWith('training')) {
      const data = JSON.parse(localStorage.getItem(key));
      if (data && (data.peso || data.historico)) {
        exerciseCount++;
      }
    }
  });
  
  const history = JSON.parse(localStorage.getItem("training_days")) || [];
  
  let totalSize = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalSize += localStorage[key].length + key.length;
    }
  }
  const sizeInKB = (totalSize / 1024).toFixed(2);
  
  const totalExercises = document.getElementById('totalExercises');
  const totalTrainings = document.getElementById('totalTrainings');
  const storageSize = document.getElementById('storageSize');
  
  if (totalExercises) totalExercises.textContent = exerciseCount;
  if (totalTrainings) totalTrainings.textContent = history.length;
  if (storageSize) storageSize.textContent = `${sizeInKB} KB`;
}

function showResetModal() {
  const modal = document.getElementById('resetModal');
  const input = document.getElementById('resetConfirmInput');
  const btn = document.getElementById('confirmResetBtn');
  
  if (modal && input && btn) {
    modal.classList.remove('hidden');
    input.value = '';
    btn.disabled = true;
    input.focus();
  }
}

function closeResetModal() {
  const modal = document.getElementById('resetModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function checkResetInput(event) {
  const input = document.getElementById('resetConfirmInput');
  const btn = document.getElementById('confirmResetBtn');
  
  if (!input || !btn) return;
  
  const value = input.value.trim();
  btn.disabled = value !== 'RESETAR';
  
  if (event.key === 'Enter' && value === 'RESETAR') {
    confirmReset();
  }
  
  if (event.key === 'Escape') {
    closeResetModal();
  }
}

function confirmReset() {
  const input = document.getElementById('resetConfirmInput');
  
  if (!input || input.value.trim() !== 'RESETAR') {
    alert('Digite "RESETAR" corretamente para confirmar.');
    return;
  }
  
  localStorage.clear();
  closeResetModal();
  alert('✓ Todos os dados foram resetados com sucesso!\n\nA página será recarregada.');
  window.location.reload();
}

// ========== GOOGLE DRIVE INTEGRATION ==========

function initGoogleDrive() {
  if (typeof google === 'undefined' || !google.accounts) {
    console.log('Google API ainda não carregou, tentando novamente...');
    setTimeout(initGoogleDrive, 500);
    return;
  }
  
  try {
    googleTokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: GOOGLE_SCOPES,
      callback: (response) => {
        if (response.error) {
          console.error('Erro na autenticação:', response);
          alert('❌ Erro ao conectar com Google Drive.');
          return;
        }
        
        googleAccessToken = response.access_token;
        localStorage.setItem('google_access_token', googleAccessToken);
        localStorage.setItem('google_token_expiry', Date.now() + (response.expires_in * 1000));
        
        updateDriveUI(true);
        alert('✓ Conectado ao Google Drive com sucesso!');
        autoBackupToDrive();
      }
    });
    
    const savedToken = localStorage.getItem('google_access_token');
    const tokenExpiry = localStorage.getItem('google_token_expiry');
    
    if (savedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
      googleAccessToken = savedToken;
      updateDriveUI(true);
    }
    
  } catch (error) {
    console.error('Erro ao inicializar Google Drive:', error);
  }
}

function handleDriveAuth() {
  if (!googleTokenClient) {
    alert('❌ Google API ainda não foi carregada. Tente novamente em alguns segundos.');
    return;
  }
  
  googleTokenClient.requestAccessToken({ prompt: '' });
}

function disconnectDrive() {
  googleAccessToken = null;
  localStorage.removeItem('google_access_token');
  localStorage.removeItem('google_token_expiry');
  localStorage.removeItem('drive_folder_id');
  
  if (googleAccessToken) {
    google.accounts.oauth2.revoke(googleAccessToken);
  }
  
  updateDriveUI(false);
  alert('✓ Desconectado do Google Drive.');
}

function updateDriveUI(connected) {
  const badge = document.getElementById('driveStatusBadge');
  const info = document.getElementById('driveInfo');
  const connectBtn = document.getElementById('driveConnectBtn');
  const disconnectBtn = document.getElementById('driveDisconnectBtn');
  const manualBackupBtn = document.getElementById('manualBackupBtn');
  const restoreBtn = document.getElementById('restoreBtn');
  
  if (connected) {
    if (badge) {
      badge.textContent = 'Conectado';
      badge.className = 'px-3 py-1 bg-green-700 text-green-100 text-xs font-bold rounded-full';
    }
    if (info) info.classList.remove('hidden');
    if (connectBtn) connectBtn.classList.add('hidden');
    if (disconnectBtn) disconnectBtn.classList.remove('hidden');
    if (manualBackupBtn) manualBackupBtn.disabled = false;
    if (restoreBtn) restoreBtn.disabled = false;
  } else {
    if (badge) {
      badge.textContent = 'Desconectado';
      badge.className = 'px-3 py-1 bg-gray-700 text-gray-300 text-xs font-bold rounded-full';
    }
    if (info) info.classList.add('hidden');
    if (connectBtn) connectBtn.classList.remove('hidden');
    if (disconnectBtn) disconnectBtn.classList.add('hidden');
    if (manualBackupBtn) manualBackupBtn.disabled = true;
    if (restoreBtn) restoreBtn.disabled = true;
  }
}

async function updateDriveStatus() {
  if (!googleAccessToken) {
    updateDriveUI(false);
    return;
  }
  
  try {
    const backups = await listDriveBackups();
    const backupCount = document.getElementById('backupCount');
    const lastBackupTime = document.getElementById('lastBackupTime');
    
    if (backupCount) backupCount.textContent = backups.length;
    
    if (backups.length > 0 && lastBackupTime) {
      const lastBackup = backups[0];
      const date = new Date(lastBackup.modifiedTime);
      const formatted = date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      lastBackupTime.textContent = formatted;
    }
    
    updateDriveUI(true);
  } catch (error) {
    console.error('Erro ao atualizar status do Drive:', error);
  }
}

async function getOrCreateBackupFolder() {
  let folderId = localStorage.getItem('drive_folder_id');
  
  if (folderId) {
    return folderId;
  }
  
  const searchResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${BACKUP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    {
      headers: { Authorization: `Bearer ${googleAccessToken}` }
    }
  );
  
  const searchData = await searchResponse.json();
  
  if (searchData.files && searchData.files.length > 0) {
    folderId = searchData.files[0].id;
    localStorage.setItem('drive_folder_id', folderId);
    return folderId;
  }
  
  const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${googleAccessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: BACKUP_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder'
    })
  });
  
  const createData = await createResponse.json();
  folderId = createData.id;
  localStorage.setItem('drive_folder_id', folderId);
  
  return folderId;
}

let backupTimeout = null;

function autoBackupToDrive() {
  if (!googleAccessToken) return;
  
  clearTimeout(backupTimeout);
  backupTimeout = setTimeout(async () => {
    try {
      await backupToDrive();
      console.log('✓ Backup automático realizado');
    } catch (error) {
      console.error('Erro no backup automático:', error);
    }
  }, 2000);
}

async function manualBackupToDrive() {
  if (!googleAccessToken) {
    alert('❌ Não conectado ao Google Drive.');
    return;
  }
  
  try {
    await backupToDrive();
    alert('✓ Backup realizado com sucesso!');
    updateDriveStatus();
  } catch (error) {
    console.error('Erro ao fazer backup:', error);
    alert('❌ Erro ao fazer backup. Tente novamente.');
  }
}

async function backupToDrive() {
  if (!googleAccessToken) return;
  
  const folderId = await getOrCreateBackupFolder();
  
  const dataToExport = {};
  Object.keys(localStorage).forEach(key => {
    if (key.includes("_") || key === "training_days" || key === "current_streak" || key === "best_streak") {
      dataToExport[key] = JSON.parse(localStorage.getItem(key));
    }
  });
  
  const content = JSON.stringify(dataToExport, null, 2);
  const filename = `gym-backup-${new Date().toISOString().split('T')[0]}.json`;
  
  const metadata = {
    name: filename,
    mimeType: 'application/json',
    parents: [folderId]
  };
  
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([content], { type: 'application/json' }));
  
  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${googleAccessToken}`
    },
    body: form
  });
  
  if (!response.ok) {
    throw new Error('Falha no upload do backup');
  }
  
  return await response.json();
}

async function listDriveBackups() {
  if (!googleAccessToken) return [];
  
  const folderId = await getOrCreateBackupFolder();
  
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and trashed=false&orderBy=modifiedTime desc&fields=files(id,name,modifiedTime)`,
    {
      headers: { Authorization: `Bearer ${googleAccessToken}` }
    }
  );
  
  const data = await response.json();
  return data.files || [];
}

async function restoreFromDrive() {
  if (!googleAccessToken) {
    alert('❌ Não conectado ao Google Drive.');
    return;
  }
  
  try {
    const backups = await listDriveBackups();
    
    if (backups.length === 0) {
      alert('❌ Nenhum backup encontrado no Google Drive.');
      return;
    }
    
    const latestBackup = backups[0];
    
    const confirm = window.confirm(
      `Restaurar backup de ${new Date(latestBackup.modifiedTime).toLocaleString('pt-BR')}?\n\nISTO VAI SUBSTITUIR TODOS OS DADOS ATUAIS!`
    );
    
    if (!confirm) return;
    
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${latestBackup.id}?alt=media`,
      {
        headers: { Authorization: `Bearer ${googleAccessToken}` }
      }
    );
    
    const data = await response.json();
    
    localStorage.clear();
    Object.keys(data).forEach(key => {
      localStorage.setItem(key, JSON.stringify(data[key]));
    });
    
    alert('✓ Backup restaurado com sucesso!\n\nA página será recarregada.');
    window.location.reload();
    
  } catch (error) {
    console.error('Erro ao restaurar backup:', error);
    alert('❌ Erro ao restaurar backup. Tente novamente.');
  }
}

// ========== IMPORT/EXPORT LOCAL ==========

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      const content = e.target.result;
      const fileType = file.name.split('.').pop().toLowerCase();
      
      if (fileType === 'json') {
        importedData = JSON.parse(content);
        showImportPreview(importedData, 'json');
      } else if (fileType === 'csv') {
        importedData = parseCSV(content);
        showImportPreview(importedData, 'csv');
      } else {
        alert('❌ Formato não suportado. Use JSON ou CSV.');
        return;
      }
      
    } catch (error) {
      console.error('Erro ao ler arquivo:', error);
      alert('❌ Erro ao ler o arquivo. Verifique se está no formato correto.');
    }
  };
  
  reader.readAsText(file);
  event.target.value = '';
}

function parseCSV(csv) {
  const lines = csv.trim().split('\n');
  const data = {};
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const [date, exerciseKey, weight] = line.split(',');
    
    if (!data[exerciseKey]) {
      data[exerciseKey] = {
        peso: weight,
        data: date,
        historico: []
      };
    }
    
    data[exerciseKey].historico.push({
      data: date,
      peso: weight
    });
  }
  
  return data;
}

function showImportPreview(data, type) {
  const modal = document.getElementById('importModal');
  const preview = document.getElementById('importPreview');
  
  if (!modal || !preview) return;
  
  let exerciseCount = 0;
  let trainingDaysCount = 0;
  let totalRecords = 0;
  
  Object.keys(data).forEach(key => {
    if (key === 'training_days') {
      trainingDaysCount = data[key].length;
    } else if (key.includes('_')) {
      exerciseCount++;
      if (data[key].historico) {
        totalRecords += data[key].historico.length;
      }
    }
  });
  
  preview.innerHTML = `
    <h4 class="text-lg font-bold text-white mb-3">Preview dos Dados</h4>
    <div class="space-y-2 text-sm">
      <div class="flex justify-between">
        <span class="text-gray-400">Formato:</span>
        <span class="text-white font-semibold">${type.toUpperCase()}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-400">Exercícios encontrados:</span>
        <span class="text-[#4a9eff] font-bold">${exerciseCount}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-400">Total de registros:</span>
        <span class="text-[#4a9eff] font-bold">${totalRecords}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-400">Dias de treino:</span>
        <span class="text-[#4a9eff] font-bold">${trainingDaysCount}</span>
      </div>
    </div>
  `;
  
  modal.classList.remove('hidden');
}

function closeImportModal() {
  const modal = document.getElementById('importModal');
  if (modal) {
    modal.classList.add('hidden');
  }
  importedData = null;
}

function confirmImport() {
  if (!importedData) {
    alert('❌ Nenhum dado para importar.');
    return;
  }
  
  const mode = document.querySelector('input[name="importMode"]:checked').value;
  
  try {
    if (mode === 'replace') {
      localStorage.clear();
      Object.keys(importedData).forEach(key => {
        localStorage.setItem(key, JSON.stringify(importedData[key]));
      });
      alert('✓ Dados importados com sucesso!\n\nTodos os dados anteriores foram substituídos.');
    } else {
      Object.keys(importedData).forEach(key => {
        const existing = localStorage.getItem(key);
        
        if (key === 'training_days') {
          const existingDays = existing ? JSON.parse(existing) : [];
          const newDays = importedData[key];
          const merged = [...new Set([...existingDays, ...newDays])];
          localStorage.setItem(key, JSON.stringify(merged));
        } else if (existing) {
          const existingData = JSON.parse(existing);
          const newData = importedData[key];
          
          if (newData.historico && existingData.historico) {
            const allRecords = [...existingData.historico, ...newData.historico];
            const uniqueRecords = {};
            allRecords.forEach(record => {
              if (!uniqueRecords[record.data] || parseFloat(record.peso) > parseFloat(uniqueRecords[record.data].peso)) {
                uniqueRecords[record.data] = record;
              }
            });
            existingData.historico = Object.values(uniqueRecords);
          }
          
          if (newData.peso && newData.data) {
            if (!existingData.data || newData.data > existingData.data) {
              existingData.peso = newData.peso;
              existingData.data = newData.data;
            }
          }
          
          localStorage.setItem(key, JSON.stringify(existingData));
        } else {
          localStorage.setItem(key, JSON.stringify(importedData[key]));
        }
      });
      
      alert('✓ Dados mesclados com sucesso!\n\nOs novos dados foram combinados com os existentes.');
    }
    
    closeImportModal();
    
    updateStreak();
    
    if (googleAccessToken) {
      autoBackupToDrive();
    }
    
    window.location.reload();
    
  } catch (error) {
    console.error('Erro ao importar:', error);
    alert('❌ Erro ao importar dados. Tente novamente.');
  }
}

function exportCSV() {
  let csv = "data,exercicio,peso\n";

  Object.keys(localStorage).forEach(key => {
    if (key.includes("_") && !key.startsWith("training")) {
      const d = JSON.parse(localStorage.getItem(key));
      if (d.historico) {
        d.historico.forEach(h => {
          csv += `${h.data},${key},${h.peso}\n`;
        });
      }
    }
  });

  download(csv, "progresso.csv");
}

function exportJSON() {
  const dataToExport = {};
  
  Object.keys(localStorage).forEach(key => {
    if (key.includes("_") || key === "training_days") {
      dataToExport[key] = JSON.parse(localStorage.getItem(key));
    }
  });

  download(JSON.stringify(dataToExport, null, 2), "progresso.json");
}

function download(content, fileName) {
  const blob = new Blob([content], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  a.click();
}

// ========== PWA SERVICE WORKER ==========

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/gym-training-app/service-worker.js')
      .then(registration => {
        console.log('✓ Service Worker registrado:', registration.scope);
      })
      .catch(error => {
        console.error('✗ Erro ao registrar Service Worker:', error);
      });
  });
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA pode ser instalado!');
  e.preventDefault();
  deferredPrompt = e;
});

window.addEventListener('appinstalled', () => {
  console.log('✓ PWA instalado com sucesso!');
  deferredPrompt = null;
});
