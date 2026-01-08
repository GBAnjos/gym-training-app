let treinos = {};
let timerInterval = null;

fetch("data/treinos.json")
  .then(res => res.json())
  .then(data => {
    treinos = data;
    init();
  });

function init() {
  const selector = document.getElementById("daySelector");
  Object.keys(treinos).forEach(dia => {
    const opt = document.createElement("option");
    opt.value = dia;
    opt.textContent = dia.toUpperCase();
    selector.appendChild(opt);
  });

  const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long" }).split("-")[0];
  if (treinos[hoje]) selector.value = hoje;

  selector.onchange = () => renderWorkout(selector.value);
  renderWorkout(selector.value);
}

function renderWorkout(dia) {
  const container = document.getElementById("workout");
  container.innerHTML = "";

  treinos[dia].exercicios.forEach(ex => {
    const key = `${dia}_${ex.id}`;
    const saved = JSON.parse(localStorage.getItem(key)) || {};

    const div = document.createElement("div");
    div.className = "exercise";
    div.innerHTML = `
      <h3>${ex.nome}</h3>
      <p>${ex.series}x${ex.reps} ${ex.obs}</p>
      <input type="number" placeholder="kg" value="${saved.peso || ""}"
        onchange="save('${key}', this.value)">
      <input type="checkbox" ${saved.feito ? "checked" : ""}
        onchange="toggleDone('${key}', this.checked)"> Feito
    `;
    container.appendChild(div);
  });

  saveTrainingDay();
}

function save(key, peso) {
  const data = JSON.parse(localStorage.getItem(key)) || {};
  data.peso = peso;
  data.data = new Date().toISOString().split("T")[0];
  localStorage.setItem(key, JSON.stringify(data));
}

function toggleDone(key, done) {
  const data = JSON.parse(localStorage.getItem(key)) || {};
  data.feito = done;
  localStorage.setItem(key, JSON.stringify(data));
}

function saveTrainingDay() {
  const today = new Date().toISOString().split("T")[0];
  let history = JSON.parse(localStorage.getItem("history")) || [];
  if (!history.includes(today)) {
    history.push(today);
    localStorage.setItem("history", JSON.stringify(history));
  }
}

function startTimer(seconds) {
  clearInterval(timerInterval);
  let remaining = seconds;
  const display = document.getElementById("timerDisplay");

  timerInterval = setInterval(() => {
    display.textContent = `Restante: ${remaining}s`;
    remaining--;
    if (remaining < 0) {
      clearInterval(timerInterval);
      display.textContent = "Descanso finalizado!";
    }
  }, 1000);
}

function exportCSV() {
  let csv = "data,exercicio,peso\n";
  Object.keys(localStorage).forEach(k => {
    if (k.includes("_")) {
      const d = JSON.parse(localStorage.getItem(k));
      csv += `${d.data || ""},${k},${d.peso || ""}\n`;
    }
  });

  download(csv, "progresso.csv");
}

function exportJSON() {
  download(JSON.stringify(localStorage, null, 2), "progresso.json");
}

function download(content, fileName) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content]));
  a.download = fileName;
  a.click();
}
