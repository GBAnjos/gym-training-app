let treinos = {};
let timerInterval = null;
let frequencyChart = null;
let progressChart = null;
let currentView = 'workout';
let allExercises = []; // Cache de todos os exercícios

const mapDia = {
  "domingo": "domingo",
  "segunda-feira": "segunda",
  "terça-feira": "terca",
  "quarta-feira": "quarta",
  "quinta-feira": "quinta",
  "sexta-feira": "sexta",
  "sábado": "sabado"};

// Mapa de cores por grupo muscular
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
  });

function init() {
  const selector = document.getElementById("daySelector");
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
  
  // Popular filtros para analytics
  populateFilters();
}

function renderWorkout(dia) {
  const container = document.getElementById("workout");
  container.innerHTML = "";

  const treino = treinos[dia];
  if (!treino) return;

  // Header do treino
  const header = document.createElement("div");
  header.className = "mb-6";
  header.innerHTML = `
    <h2 class="text-2xl font-bold text-white mb-2">${treino.nome}</h2>
    <p class="text-gray-400 text-sm">${treino.grupos.join(" • ")}</p>
  `;
  container.appendChild(header);

  // Calcular progresso
  let completed = 0;
  treino.exercicios.forEach(ex => {
    const key = `${dia}_${ex.id}`;
    const saved = JSON.parse(localStorage.getItem(key)) || {};
    if (saved.feito) completed++;
  });

  const total = treino.exercicios.length;
  const percent = Math.round((completed / total) * 100);

  // Progress bar
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

  // Exercícios
  treino.exercicios.forEach(ex => {
    const key = `${dia}_${ex.id}`;
    const saved = JSON.parse(localStorage.getItem(key)) || {};

    const div = document.createElement("div");
    const isCompleted = saved.feito;
    
    div.className = `mb-4 rounded-2xl p-5 border-2 transition-all ${
      isCompleted 
        ? 'bg-[#1a2a1a] border-[#2d4a2d]' 
        : 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a]'
    }`;

    // Criar tags de músculos
    const muscleTags = ex.musculos.map(m => {
      const color = muscleColors[m] || { bg: "bg-gray-950/30", text: "text-gray-300", border: "border-gray-800/30" };
      return `<span class="px-2 py-1 ${color.bg} ${color.text} text-xs font-semibold rounded-md border ${color.border}">${m}</span>`;
    }).join("");

    div.innerHTML = `
      <div class="flex items-start gap-3 mb-3">
        <span class="text-2xl mt-0.5">${isCompleted ? '✅' : '⚪'}</span>
        <div class="flex-1">
          <h3 class="text-lg font-bold text-white mb-2">${ex.nome}</h3>
          
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
          
          <!-- Tags de músculos -->
          <div class="flex flex-wrap gap-1.5">
            ${muscleTags}
          </div>
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
    `;
    
    container.appendChild(div);
  });

  saveTrainingDay();
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
}

function toggleDone(key, done, dia) {
  const data = JSON.parse(localStorage.getItem(key)) || {};
  data.feito = done;
  localStorage.setItem(key, JSON.stringify(data));
  
  renderWorkout(dia);
}

function saveTrainingDay() {
  const today = new Date().toISOString().split("T")[0];
  let history = JSON.parse(localStorage.getItem("training_days")) || [];

  if (!history.includes(today)) {
    history.push(today);
    localStorage.setItem("training_days", JSON.stringify(history));
  }
}

function startTimer(seconds) {
  clearInterval(timerInterval);
  let remaining = seconds;
  const display = document.getElementById("timerDisplay");
  
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

// ========== ANALYTICS ==========

function toggleView() {
  const workoutView = document.getElementById('workoutView');
  const analyticsView = document.getElementById('analyticsView');
  const daySelector = document.getElementById('daySelector');
  const viewIcon = document.getElementById('viewIcon');
  const viewText = document.getElementById('viewText');
  
  if (currentView === 'workout') {
    workoutView.classList.add('hidden');
    analyticsView.classList.remove('hidden');
    daySelector.classList.add('hidden');
    viewIcon.textContent = '🏋️';
    viewText.textContent = 'Treino';
    currentView = 'analytics';
    
    renderAnalytics();
  } else {
    analyticsView.classList.add('hidden');
    workoutView.classList.remove('hidden');
    daySelector.classList.remove('hidden');
    viewIcon.textContent = '📊';
    viewText.textContent = 'Analytics';
    currentView = 'workout';
  }
}

function renderAnalytics() {
  calculateStats();
  renderFrequencyChart();
  updateProgressChart();
}

function calculateStats() {
  const history = JSON.parse(localStorage.getItem("training_days")) || [];
  
  document.getElementById('totalWorkouts').textContent = history.length;
  
  const weeks = history.length > 0 ? Math.ceil((Date.now() - new Date(history[0]).getTime()) / (7 * 24 * 60 * 60 * 1000)) : 1;
  const weeklyAvg = (history.length / weeks).toFixed(1);
  document.getElementById('weeklyAvg').textContent = weeklyAvg;
  
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const thisWeek = history.filter(date => new Date(date) >= startOfWeek).length;
  document.getElementById('thisWeek').textContent = thisWeek;
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const thisMonth = history.filter(date => new Date(date) >= startOfMonth).length;
  document.getElementById('thisMonth').textContent = thisMonth;
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
      maintainAspectRatio: true,
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
  // Cache de todos os exercícios
  allExercises = [];
  const allMuscles = new Set();
  
  Object.keys(treinos).forEach(dia => {
    treinos[dia].exercicios.forEach(ex => {
      allExercises.push({
        dia: dia,
        diaLabel: dia.charAt(0).toUpperCase() + dia.slice(1),
        id: `${dia}_${ex.id}`,
        nome: ex.nome,
        musculos: ex.musculos
      });
      
      ex.musculos.forEach(m => allMuscles.add(m));
    });
  });
  
  // Popular filtro de dias
  const dayFilter = document.getElementById('dayFilter');
  Object.keys(treinos).forEach(dia => {
    const opt = document.createElement('option');
    opt.value = dia;
    opt.textContent = dia.charAt(0).toUpperCase() + dia.slice(1);
    dayFilter.appendChild(opt);
  });
  
  // Popular filtro de músculos
  const muscleFilter = document.getElementById('muscleFilter');
  Array.from(allMuscles).sort().forEach(muscle => {
    const opt = document.createElement('option');
    opt.value = muscle;
    opt.textContent = muscle;
    muscleFilter.appendChild(opt);
  });
  
  // Popular lista inicial de exercícios
  filterExercises();
}

function filterExercises() {
  const dayFilter = document.getElementById('dayFilter').value;
  const muscleFilter = document.getElementById('muscleFilter').value;
  const exerciseSelector = document.getElementById('exerciseSelector');
  
  // Limpar seletor
  exerciseSelector.innerHTML = '<option value="">Selecione um exercício</option>';
  
  // Filtrar exercícios
  let filtered = allExercises;
  
  if (dayFilter) {
    filtered = filtered.filter(ex => ex.dia === dayFilter);
  }
  
  if (muscleFilter) {
    filtered = filtered.filter(ex => ex.musculos.includes(muscleFilter));
  }
  
  // Popular seletor com exercícios filtrados
  filtered.forEach(ex => {
    const opt = document.createElement('option');
    opt.value = ex.id;
    opt.textContent = `${ex.nome} (${ex.diaLabel})`;
    exerciseSelector.appendChild(opt);
  });
  
  // Limpar gráfico
  if (progressChart) {
    progressChart.destroy();
    progressChart = null;
  }
}

function updateProgressChart() {
  const selector = document.getElementById('exerciseSelector');
  const exerciseKey = selector.value;
  
  if (!exerciseKey) {
    if (progressChart) {
      progressChart.destroy();
      progressChart = null;
    }
    return;
  }
  
  const data = JSON.parse(localStorage.getItem(exerciseKey)) || {};
  const historico = data.historico || [];
  
  if (historico.length === 0) {
    if (progressChart) {
      progressChart.destroy();
      progressChart = null;
    }
    return;
  }
  
  historico.sort((a, b) => new Date(a.data) - new Date(b.data));
  
  const labels = historico.map(h => {
    const d = new Date(h.data);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  });
  
  const pesos = historico.map(h => parseFloat(h.peso) || 0);
  
  const ctx = document.getElementById('progressChart');
  
  if (progressChart) {
    progressChart.destroy();
  }
  
  progressChart = new Chart(ctx, {
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
      maintainAspectRatio: true,
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
