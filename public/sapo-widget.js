document.addEventListener('DOMContentLoaded', () => {
  const taskTitleElement = document.getElementById('task-title');

  try {
    const allTasks = JSON.parse(localStorage.getItem('focusfrog_tasks') || '[]');
    const frogTaskId = JSON.parse(localStorage.getItem('focusfrog_frogTaskId') || 'null');

    if (frogTaskId && allTasks.length > 0) {
      const frogTask = allTasks.find(task => task.id === frogTaskId);

      if (frogTask) {
        taskTitleElement.textContent = frogTask.title;
        taskTitleElement.classList.remove('placeholder');
      } else {
        taskTitleElement.textContent = 'Sapo não encontrado!';
        taskTitleElement.classList.add('placeholder');
      }
    } else {
      taskTitleElement.textContent = 'Escolha um sapo para hoje!';
      taskTitleElement.classList.add('placeholder');
    }
  } catch (error) {
    console.error('Erro ao carregar dados para o widget:', error);
    taskTitleElement.textContent = 'Erro ao carregar.';
    taskTitleElement.classList.add('placeholder');
  }
});
