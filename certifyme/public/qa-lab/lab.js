const backHomeBtn = document.getElementById('back-home');
if (backHomeBtn) {
  backHomeBtn.addEventListener('click', () => {
    window.location.href = '/index.html';
  });
}

const sessionTimer = document.getElementById('session-timer');
let elapsedSeconds = 0;
setInterval(() => {
  elapsedSeconds += 1;
  const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
  const seconds = String(elapsedSeconds % 60).padStart(2, '0');
  sessionTimer.textContent = `${minutes}:${seconds}`;
}, 1000);

const asyncButton = document.getElementById('trigger-async');
const asyncStatus = document.getElementById('async-status');
asyncButton?.addEventListener('click', () => {
  asyncButton.disabled = true;
  asyncStatus.textContent = 'Calling API...';
  setTimeout(() => {
    asyncStatus.textContent = 'Success: 42 items synced';
    asyncButton.disabled = false;
  }, 1500);
});

const loginForm = document.getElementById('login-form');
const loginInputs = [
  document.getElementById('login-email'),
  document.getElementById('login-password'),
];
const loginSubmit = document.getElementById('login-submit');
const loginMessage = document.getElementById('login-message');
const clearLogin = document.getElementById('clear-login');

const toggleLoginButton = () => {
  const filled = loginInputs.every((input) => input.value.trim().length > 0);
  loginSubmit.disabled = !filled;
};
loginInputs.forEach((input) => input.addEventListener('input', toggleLoginButton));

loginForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const [email, password] = loginInputs.map((input) => input.value.trim());
  if (email === 'qa@practice.dev' && password === 'automation') {
    loginMessage.textContent = 'Login success!';
    loginMessage.classList.add('success');
    loginMessage.classList.remove('error');
  } else {
    loginMessage.textContent = 'Invalid credentials, try qa@practice.dev / automation';
    loginMessage.classList.add('error');
    loginMessage.classList.remove('success');
  }
});

clearLogin?.addEventListener('click', () => {
  loginInputs.forEach((input) => (input.value = ''));
  loginMessage.textContent = '';
  toggleLoginButton();
});

const registerForm = document.getElementById('register-form');
const registerTerms = document.getElementById('register-terms');
const registerSubmit = document.getElementById('register-submit');
const registerMessage = document.getElementById('register-errors');
const registerName = document.getElementById('register-name');
const registerEmail = document.getElementById('register-email');
const registerRole = document.getElementById('register-role');
const resumeUpload = document.getElementById('resume-upload');
const fileFeedback = document.getElementById('file-feedback');

registerTerms?.addEventListener('change', () => {
  registerSubmit.disabled = !registerTerms.checked;
});

resumeUpload?.addEventListener('change', (event) => {
  const fileName = event.target.files[0]?.name;
  fileFeedback.textContent = fileName ? `Selected: ${fileName}` : 'No file selected.';
});

registerForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const errors = [];
  if (registerName.value.trim().length < 3) {
    errors.push('Name must have at least 3 characters.');
  }
  if (!registerEmail.value.includes('@')) {
    errors.push('Use a valid email.');
  }
  if (!registerRole.value) {
    errors.push('Select a role.');
  }
  if (!registerTerms.checked) {
    errors.push('Accept the terms to continue.');
  }
  if (errors.length) {
    registerMessage.textContent = errors.join(' ');
    registerMessage.classList.add('error');
    registerMessage.classList.remove('success');
  } else {
    registerMessage.textContent = 'Registration saved! (no real backend)';
    registerMessage.classList.add('success');
    registerMessage.classList.remove('error');
  }
});

const qaRows = [
  { suite: 'Checkout', status: 'passed', duration: 892 },
  { suite: 'Profile update', status: 'failed', duration: 1210 },
  { suite: 'Billing', status: 'blocked', duration: 2000 },
  { suite: 'Notifications', status: 'passed', duration: 640 },
  { suite: 'Settings', status: 'failed', duration: 1300 },
];
let currentSort = { key: 'suite', direction: 'asc' };
const tableBody = document.querySelector('#qa-table tbody');
const searchInput = document.getElementById('table-search');
const filterSelect = document.getElementById('table-filter');
const tableCount = document.getElementById('table-count');

const renderRows = () => {
  const searchTerm = searchInput.value.toLowerCase();
  const statusFilter = filterSelect.value;
  let filtered = qaRows.filter((row) => {
    const matchSearch = row.suite.toLowerCase().includes(searchTerm);
    const matchStatus = statusFilter === 'all' || row.status === statusFilter;
    return matchSearch && matchStatus;
  });
  filtered.sort((a, b) => {
    const { key, direction } = currentSort;
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });
  tableBody.innerHTML = '';
  filtered.forEach((row) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${row.suite}</td><td>${row.status}</td><td>${row.duration}</td>`;
    tableBody.appendChild(tr);
  });
  tableCount.textContent = filtered.length;
};

document.querySelectorAll('#qa-table th').forEach((th) => {
  th.addEventListener('click', () => {
    const key = th.dataset.sort;
    if (currentSort.key === key) {
      currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      currentSort.key = key;
      currentSort.direction = 'asc';
    }
    renderRows();
  });
});

searchInput?.addEventListener('input', renderRows);
filterSelect?.addEventListener('change', renderRows);

document.getElementById('table-clear')?.addEventListener('click', () => {
  searchInput.value = '';
  filterSelect.value = 'all';
  renderRows();
});

renderRows();

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const todoCount = document.getElementById('todo-count');
let todos = [];

const renderTodos = () => {
  todoList.innerHTML = '';
  todos.forEach((todo) => {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.done ? 'completed' : ''}`;
    li.dataset.id = todo.id;
    li.innerHTML = `
      <input type="checkbox" ${todo.done ? 'checked' : ''} />
      <span class="todo-text" contenteditable="false">${todo.text}</span>
      <button class="ghost" type="button">Delete</button>
    `;
    todoList.appendChild(li);
  });
  todoCount.textContent = todos.filter((todo) => !todo.done).length;
};

const addTodo = (text) => {
  if (!text) return;
  todos.push({ id: crypto.randomUUID(), text, done: false });
  renderTodos();
};

todoForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  addTodo(todoInput.value.trim());
  todoInput.value = '';
  todoInput.focus();
});

todoList?.addEventListener('click', (event) => {
  const li = event.target.closest('.todo-item');
  if (!li) return;
  const id = li.dataset.id;
  if (event.target.matches('input[type="checkbox"]')) {
    todos = todos.map((todo) =>
      todo.id === id ? { ...todo, done: event.target.checked } : todo
    );
    renderTodos();
  } else if (event.target.matches('button')) {
    todos = todos.filter((todo) => todo.id !== id);
    renderTodos();
  }
});

addTodo('Verify login validation');
addTodo('Check modal visibility');

const pendingList = document.getElementById('pending-list');
const doneList = document.getElementById('done-list');
const dropStatus = document.getElementById('drop-status');
['Checkout flow', 'Profile update', 'Billing error'].forEach((text, index) => {
  const item = document.createElement('div');
  item.textContent = text;
  item.className = 'draggable';
  item.draggable = true;
  item.dataset.id = `drag-${index}`;
  pendingList.appendChild(item);
});

const handleDragStart = (event) => {
  event.dataTransfer.setData('text/plain', event.target.dataset.id);
  event.dataTransfer.effectAllowed = 'move';
};

[pendingList, doneList].forEach((list) => {
  list.addEventListener('dragstart', handleDragStart);
  list.addEventListener('dragover', (event) => {
    event.preventDefault();
    list.classList.add('droppable');
  });
  list.addEventListener('dragleave', () => list.classList.remove('droppable'));
  list.addEventListener('drop', (event) => {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain');
    const item = document.querySelector(`[data-id="${id}"]`);
    list.appendChild(item);
    list.classList.remove('droppable');
    dropStatus.textContent = `Moved ${item.textContent} to ${
      list.id === 'done-list' ? 'Executed' : 'Pending'
    }`;
  });
});

const modal = document.getElementById('qa-modal');
const overlay = document.getElementById('modal-overlay');
const openModalButton = document.getElementById('open-modal');
const closeModalButton = document.getElementById('close-modal');

const openModal = () => {
  overlay.hidden = false;
  modal.showModal();
};
const closeModal = () => {
  overlay.hidden = true;
  modal.close();
};

openModalButton?.addEventListener('click', openModal);
closeModalButton?.addEventListener('click', closeModal);
overlay?.addEventListener('click', closeModal);

const toggleButton = document.getElementById('toggle-disabled');
const toggleTarget = document.getElementById('toggle-target');

toggleButton?.addEventListener('click', () => {
  toggleTarget.disabled = !toggleTarget.disabled;
});

const screenshotInput = document.getElementById('screenshot-input');
const screenshotFeedback = document.getElementById('screenshot-feedback');

screenshotInput?.addEventListener('change', (event) => {
  screenshotFeedback.textContent = event.target.files[0]
    ? `Attached: ${event.target.files[0].name}`
    : 'Waiting for a file...';
});

const scrollBox = document.getElementById('scroll-box');
const scrollStatus = document.getElementById('scroll-status');
scrollBox?.addEventListener('scroll', () => {
  scrollStatus.textContent = `Scroll position: ${scrollBox.scrollTop}px`;
});

const delayedWidget = document.getElementById('delayed-widget');
const delayedRefresh = document.getElementById('delayed-refresh');

const loadDelayedWidget = () => {
  delayedWidget.textContent = 'Fetching...';
  setTimeout(() => {
    const timestamp = new Date().toLocaleTimeString();
    delayedWidget.textContent = `Last refresh: ${timestamp}`;
  }, 1200);
};

loadDelayedWidget();
delayedRefresh?.addEventListener('click', loadDelayedWidget);
