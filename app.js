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
  header.className = "workout-header";
  header.innerHTML = `
    <h2>${treino.nome}</h2>
    <p>${treino.grupos.join(", ")}</p>
  `;
  container.appendChild(header);

  // Progress bar
  const progressDiv = document.createElement("div");
  progressDiv.className = "progress-container";
  progressDiv.innerHTML = `
    <div class="progress-info">
      <span id="progressText">0 de ${treino.exercicios.length} exercícios</span>
      <span id="progressPercent">0%</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" id="progressFill" style="width: 0%"></div>
    </div>
  `;
  container.appendChild(progressDiv);

  // Exercícios
  treino.exercicios.forEach(ex => {
    const key = `${dia}_${ex.id}`;
    const saved = JSON.parse(localStorage.getItem(key)) || {};

    const div = document.createElement("div");
    div.className = `exercise ${saved.feito ? 'completed' : ''}`;
    div.innerHTML = `
      <h3>
        ${saved.feito ? '✓' : '○'} ${ex.nome}
      </h3>
      
      <div class="exercise-info">
        <span class="info-badge">${ex.series}x${ex.reps}</span>
        ${ex.obs ? `<span class="info-badge obs">${ex.obs}</span>` : ''}
      </div>

      <div class="exercise-controls">
        <div class="input-group">
          <label>Peso (kg)</label>
          <input type="number" step="0.5" value="${saved.peso || ""}"
            onchange="savePeso('${key}', this.value, '${dia}')">
        </div>

        <div class="checkbox-container">
          <input type="checkbox" id="check_${key}" ${saved.feito ? "checked" : ""}
            onchange="toggleDone('${key}', this.checked, '${dia}')">
          <label for="check_${key}">Concluído</label>
        </div>
      </div>
    `;
    container.appendChild(div);
  });

  updateProgress(dia);
  saveTrainingDay();
}

function updateProgress(dia) {
  const treino = treinos[dia];
  if (!treino) return;

  let completed = 0;
  treino.exercicios.forEach(ex => {
    const key = `${dia}_${ex.id}`;
    const saved = JSON.parse(localStorage.getItem(key)) || {};
    if (saved.feito) completed++;
  });

  const total = treino.exercicios.length;
  const percent = Math.round((completed / total) * 100);

  const progressText = document.getElementById("progressText");
  const progressPercent = document.getElementById("progressPercent");
  const progressFill = document.getElementById("progressFill");

  if (progressText) progressText.textContent = `${completed} de ${total} exercícios`;
  if (progressPercent) progressPercent.textContent = `${percent}%`;
  if (progressFill) progressFill.style.width = `${percent}%`;
}

function savePeso(key, peso, dia) {
  const data = JSON.parse(localStorage.getItem(key)) || {};
  data.peso = peso;
  data.data = new Date().toISOString().split("T")[0];

  if (!data.historico) data.historico = [];
  data.historico.push({ data: data.data, peso });

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
  display.classList.remove("finished");

  timerInterval = setInterval(() => {
    display.textContent = `${remaining}s`;
    remaining--;

    if (remaining < 0) {
      clearInterval(timerInterval);
      display.textContent = "✓ Descanso finalizado!";
      display.classList.add("finished");
      
      // Vibração no mobile (se disponível)
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
