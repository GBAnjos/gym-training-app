let treinos = {};
let timerInterval = null;

const mapDia = {
  "domingo": "domingo",
  "segunda-feira": "segunda",
  "terça-feira": "terca",
  "quarta-feira": "quarta",
  "quinta-feira": "quinta",
  "sexta-feira": "sexta",
  "sábado": "sabado"
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

    div.innerHTML = `
      <!-- Título do exercício -->
      <div class="flex items-start gap-3 mb-3">
        <span class="text-2xl mt-0.5">${isCompleted ? '✅' : '⚪'}</span>
        <div class="flex-1">
          <h3 class="text-lg font-bold text-white mb-1">${ex.nome}</h3>
          <div class="flex flex-wrap gap-2">
            <span class="px-3 py-1 bg-[#2a2a2a] text-gray-300 text-sm font-semibold rounded-lg">
              ${ex.series}x${ex.reps}
            </span>
            ${ex.obs ? `
              <span class="px-3 py-1 bg-[#3a2a1a] text-[#ffaa66] text-sm font-semibold rounded-lg border border-[#4a3a2a]">
                ${ex.obs}
              </span>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Controles -->
      <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mt-4">
        <!-- Input de peso -->
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

        <!-- Checkbox -->
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
  
  // Evitar duplicatas na mesma data
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
  
  // Remove animação anterior
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
      
      // Vibração no mobile
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, 1000);
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
