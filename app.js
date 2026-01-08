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
    opt.textContent = dia.toUpperCase();
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

  treino.exercicios.forEach(ex => {
    const key = `${dia}_${ex.id}`;
    const saved = JSON.parse(localStorage.getItem(key)) || {};

    const div = document.createElement("div");
    div.className = "exercise";
    div.innerHTML = `
      <h3>${ex.nome}</h3>
      <p>${ex.series}x${ex.reps} ${ex.obs || ""}</p>

      <label>
        Peso (kg):
        <input type="number" step="0.5" value="${saved.peso || ""}"
          onchange="savePeso('${key}', this.value)">
      </label>

      <label>
        <input type="checkbox" ${saved.feito ? "checked" : ""}
          onchange="toggleDone('${key}', this.checked)">
        Feito
      </label>
    `;
    container.appendChild(div);
  });

  saveTrainingDay();
}

function savePeso(key, peso) {
  const data = JSON.parse(localStorage.getItem(key)) || {};
  data.peso = peso;
  data.data = new Date().toISOString().split("T")[0];

  if (!data.historico) data.historico = [];
  data.historico.push({ data: data.data, peso });

  localStorage.setItem(key, JSON.stringify(data));
}

function toggleDone(key, done) {
  const data = JSON.parse(localStorage.getItem(key)) || {};
  data.feito = done;
  localStorage.setItem(key, JSON.stringify(data));
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

  timerInterval = setInterval(() => {
    display.textContent = `Descanso: ${remaining}s`;
    remaining--;

    if (remaining < 0) {
      clearInterval(timerInterval);
      display.textContent = "Descanso finalizado!";
    }
  }, 1000);
}

function exportCSV() {
  let csv = "data,exercicio,peso\n";

  Object.keys(localStorage).forEach(key => {
    if (key.includes("_")) {
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
  download(JSON.stringify(localStorage, null, 2), "progresso.json");
}

function download(content, fileName) {
  const blob = new Blob([content], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  a.click();
}
