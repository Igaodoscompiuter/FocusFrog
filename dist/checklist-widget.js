document.addEventListener('DOMContentLoaded', () => {
  const checklistItemsElement = document.getElementById('checklist-items');

  const renderItems = () => {
    try {
      const leavingHomeItems = JSON.parse(localStorage.getItem('focusfrog_leavingHomeItems') || '[]');
      checklistItemsElement.innerHTML = ''; // Limpa a lista antes de renderizar

      if (leavingHomeItems.length > 0) {
        leavingHomeItems.forEach(item => {
          const li = document.createElement('li');
          li.className = 'checklist-item';

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.id = `widget-${item.id}`;
          checkbox.checked = item.completed;
          checkbox.dataset.itemId = item.id;
          checkbox.addEventListener('change', handleToggle);

          const label = document.createElement('label');
          label.htmlFor = `widget-${item.id}`;
          label.textContent = item.text;

          li.appendChild(checkbox);
          li.appendChild(label);
          checklistItemsElement.appendChild(li);
        });
      } else {
        const li = document.createElement('li');
        li.className = 'placeholder';
        li.textContent = 'Nenhum item no checklist.';
        checklistItemsElement.appendChild(li);
      }
    } catch (error) {
      console.error('Erro ao carregar dados para o widget de checklist:', error);
      checklistItemsElement.innerHTML = '<li class="placeholder">Erro ao carregar.</li>';
    }
  };

  const handleToggle = (event) => {
    const itemId = event.target.dataset.itemId;
    try {
      let leavingHomeItems = JSON.parse(localStorage.getItem('focusfrog_leavingHomeItems') || '[]');
      const updatedItems = leavingHomeItems.map(item => 
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      localStorage.setItem('focusfrog_leavingHomeItems', JSON.stringify(updatedItems));
      // Opcional: Adicionar um feedback visual, mas por enquanto, a mudança de estado é suficiente
    } catch (error) {
      console.error('Erro ao atualizar o item do checklist:', error);
    }
  };

  // Renderiza os itens ao carregar e também ouve por mudanças no storage para refletir atualizações do app
  renderItems();
  window.addEventListener('storage', (e) => {
    if (e.key === 'focusfrog_leavingHomeItems') {
      renderItems();
    }
  });
});
