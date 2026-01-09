// ========== SETTINGS & RESET ==========

let currentView = 'workout';

function showView(view) {
  const workoutView = document.getElementById('workoutView');
  const analyticsView = document.getElementById('analyticsView');
  const settingsView = document.getElementById('settingsView');
  const daySelector = document.getElementById('daySelector');
  
  if (!workoutView || !analyticsView || !settingsView || !daySelector) return;
  
  // Esconder todas as views
  workoutView.classList.add('hidden');
  analyticsView.classList.add('hidden');
  settingsView.classList.add('hidden');
  
  currentView = view;
  
  // Mostrar a view solicitada
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
  }
}

function updateSettingsStats() {
  // Contar exercícios com dados
  let exerciseCount = 0;
  Object.keys(localStorage).forEach(key => {
    if (key.includes('_') && !key.startsWith('training')) {
      const data = JSON.parse(localStorage.getItem(key));
      if (data && (data.peso || data.historico)) {
        exerciseCount++;
      }
    }
  });
  
  // Contar treinos
  const history = JSON.parse(localStorage.getItem("training_days")) || [];
  
  // Calcular tamanho do storage
  let totalSize = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalSize += localStorage[key].length + key.length;
    }
  }
  const sizeInKB = (totalSize / 1024).toFixed(2);
  
  // Atualizar UI
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
  
  // Enter key
  if (event.key === 'Enter' && value === 'RESETAR') {
    confirmReset();
  }
  
  // Escape key
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
  
  // Limpar todo o localStorage
  localStorage.clear();
  
  // Fechar modal
  closeResetModal();
  
  // Voltar para workout
  showView('workout');
  
  // Recarregar treino atual
  const selector = document.getElementById('daySelector');
  if (selector && selector.value) {
    renderWorkout(selector.value);
  }
  
  // Feedback visual
  alert('✓ Todos os dados foram resetados com sucesso!');
}
