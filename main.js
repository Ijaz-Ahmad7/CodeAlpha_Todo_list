import './style.css'

const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const categorySelect = document.getElementById('categorySelect');
const prioritySelect = document.getElementById('prioritySelect');
const dueDateInput = document.getElementById('dueDateInput');
const todoList = document.getElementById('todoList');
const taskCount = document.getElementById('taskCount');
const clearCompleted = document.getElementById('clearCompleted');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.querySelector('.theme-icon');
const filterBtns = document.querySelectorAll('.filter-btn');
const sortBtn = document.getElementById('sortBtn');
const searchInput = document.getElementById('searchInput');
const editModal = document.getElementById('editModal');
const editInput = document.getElementById('editInput');
const editCategory = document.getElementById('editCategory');
const editPriority = document.getElementById('editPriority');
const editDueDate = document.getElementById('editDueDate');
const saveEdit = document.getElementById('saveEdit');
const cancelEdit = document.getElementById('cancelEdit');
const modalClose = document.querySelector('.modal-close');
const emptyState = document.getElementById('emptyState');
const totalTasksEl = document.getElementById('totalTasks');
const completedCountEl = document.getElementById('completedCount');
const activeTasksEl = document.getElementById('activeTasks');
const completionRateEl = document.getElementById('completionRate');
const categoriesList = document.getElementById('categoriesList');

let todos = [];
let currentFilter = 'all';
let currentSort = false;
let searchQuery = '';
let editingId = null;

const categories = ['work', 'personal', 'shopping', 'health', 'other'];
const categoryEmojis = {
  work: '💼',
  personal: '🏠',
  shopping: '🛍️',
  health: '💪',
  other: '📌'
};

function loadFromLocalStorage() {
  const savedTodos = localStorage.getItem('todos');
  const savedTheme = localStorage.getItem('theme');

  if (savedTodos) {
    todos = JSON.parse(savedTodos);
  }

  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    themeIcon.textContent = '☀️';
  }
}

function saveToLocalStorage() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function createTodo(text, category, priority, dueDate) {
  const todo = {
    id: Date.now(),
    text: text,
    completed: false,
    category: category,
    priority: priority,
    dueDate: dueDate
  };

  todos.push(todo);
  saveToLocalStorage();
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter(todo => todo.id !== id);
  saveToLocalStorage();
  renderTodos();
}

function toggleTodo(id) {
  const todo = todos.find(todo => todo.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveToLocalStorage();
    renderTodos();
  }
}

function openEditModal(id) {
  const todo = todos.find(todo => todo.id === id);
  if (todo) {
    editingId = id;
    editInput.value = todo.text;
    editCategory.value = todo.category;
    editPriority.value = todo.priority;
    editDueDate.value = todo.dueDate;
    editModal.classList.remove('hidden');
    editInput.focus();
  }
}

function closeEditModal() {
  editModal.classList.add('hidden');
  editingId = null;
  editInput.value = '';
}

function updateTodo() {
  if (editingId && editInput.value.trim()) {
    const todo = todos.find(todo => todo.id === editingId);
    if (todo) {
      todo.text = editInput.value.trim();
      todo.category = editCategory.value;
      todo.priority = editPriority.value;
      todo.dueDate = editDueDate.value;
      saveToLocalStorage();
      renderTodos();
      closeEditModal();
    }
  }
}

function clearCompletedTodos() {
  todos = todos.filter(todo => !todo.completed);
  saveToLocalStorage();
  renderTodos();
}

function getFilteredAndSearchedTodos() {
  let filtered = todos;

  if (currentFilter === 'active') {
    filtered = filtered.filter(todo => !todo.completed);
  } else if (currentFilter === 'completed') {
    filtered = filtered.filter(todo => todo.completed);
  } else if (currentFilter === 'high') {
    filtered = filtered.filter(todo => todo.priority === 'high');
  }

  if (searchQuery) {
    filtered = filtered.filter(todo =>
      todo.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (currentSort) {
    filtered.sort((a, b) => {
      const dateA = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
      const dateB = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
      return dateA - dateB;
    });
  }

  return filtered;
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString + 'T00:00:00');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

function isOverdue(dueDate) {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + 'T00:00:00');
  return due < today;
}

function renderTodos() {
  const filteredTodos = getFilteredAndSearchedTodos();

  todoList.innerHTML = '';

  if (filteredTodos.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
  }

  filteredTodos.forEach(todo => {
    const li = document.createElement('li');
    const priorityClass = `${todo.priority}-priority`;
    const completedClass = todo.completed ? 'completed' : '';
    li.className = `todo-item ${completedClass} ${priorityClass}`;

    const overdueClass = isOverdue(todo.dueDate) && !todo.completed ? 'warning' : '';
    const dueDateDisplay = formatDate(todo.dueDate);

    li.innerHTML = `
      <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}">
      <div class="todo-content">
        <span class="todo-text">${todo.text}</span>
        <div class="todo-meta">
          <span class="todo-category">
            <span class="category-badge ${todo.category}"></span>
            ${categoryEmojis[todo.category]} ${todo.category}
          </span>
          ${dueDateDisplay ? `<span class="todo-due-date ${overdueClass}">📅 ${dueDateDisplay}</span>` : ''}
        </div>
      </div>
      <div class="todo-actions">
        <button class="edit-btn" data-id="${todo.id}">Edit</button>
        <button class="delete-btn" data-id="${todo.id}">Delete</button>
      </div>
    `;

    todoList.appendChild(li);
  });

  updateStats();
}

function updateStats() {
  const total = todos.length;
  const completed = todos.filter(todo => todo.completed).length;
  const active = total - completed;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

  totalTasksEl.textContent = total;
  completedCountEl.textContent = completed;
  activeTasksEl.textContent = active;
  completionRateEl.textContent = `${rate}%`;

  const activeTasks = todos.filter(todo => !todo.completed).length;
  taskCount.textContent = `${activeTasks} ${activeTasks === 1 ? 'task' : 'tasks'} remaining`;

  renderCategories();
}

function renderCategories() {
  categoriesList.innerHTML = '';

  categories.forEach(cat => {
    const count = todos.filter(t => t.category === cat && !t.completed).length;
    const item = document.createElement('div');
    item.className = 'category-item';
    item.innerHTML = `
      <span class="category-dot"></span>
      <span>${categoryEmojis[cat]} ${cat}</span>
      <span style="margin-left: auto; font-weight: 500;">${count}</span>
    `;
    item.addEventListener('click', () => {
      currentFilter = 'all';
      searchQuery = cat;
      filterBtns.forEach(btn => btn.classList.remove('active'));
      filterBtns[0].classList.add('active');
      searchInput.value = cat;
      renderTodos();
    });
    categoriesList.appendChild(item);
  });
}

function toggleTheme() {
  document.body.classList.toggle('dark-theme');

  if (document.body.classList.contains('dark-theme')) {
    themeIcon.textContent = '☀️';
    localStorage.setItem('theme', 'dark');
  } else {
    themeIcon.textContent = '🌙';
    localStorage.setItem('theme', 'light');
  }
}

function setFilter(filter) {
  currentFilter = filter;

  filterBtns.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.filter === filter) {
      btn.classList.add('active');
    }
  });

  renderTodos();
}

todoForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const text = todoInput.value.trim();
  const category = categorySelect.value;
  const priority = prioritySelect.value;
  const dueDate = dueDateInput.value;

  if (text) {
    createTodo(text, category, priority, dueDate);
    todoInput.value = '';
    dueDateInput.value = '';
    categorySelect.value = 'work';
    prioritySelect.value = 'medium';
  }
});

todoList.addEventListener('click', (e) => {
  const id = parseInt(e.target.dataset.id);

  if (e.target.classList.contains('todo-checkbox')) {
    toggleTodo(id);
  } else if (e.target.classList.contains('delete-btn')) {
    deleteTodo(id);
  } else if (e.target.classList.contains('edit-btn')) {
    openEditModal(id);
  }
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    setFilter(btn.dataset.filter);
  });
});

sortBtn.addEventListener('click', () => {
  currentSort = !currentSort;
  sortBtn.style.opacity = currentSort ? '1' : '0.5';
  renderTodos();
});

searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderTodos();
});

clearCompleted.addEventListener('click', clearCompletedTodos);

themeToggle.addEventListener('click', toggleTheme);

saveEdit.addEventListener('click', updateTodo);

cancelEdit.addEventListener('click', closeEditModal);

modalClose.addEventListener('click', closeEditModal);

editModal.addEventListener('click', (e) => {
  if (e.target === editModal) {
    closeEditModal();
  }
});

editInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    updateTodo();
  }
});

loadFromLocalStorage();
renderTodos();
