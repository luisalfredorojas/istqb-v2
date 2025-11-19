import './style.css';

const app = document.getElementById('app');
let cleanupFns = [];

const resetView = () => {
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
};

const registerCleanup = (fn) => {
  cleanupFns.push(fn);
};

function renderHome() {
  resetView();
  document.title = 'Inicio - CertifyMe';
  app.innerHTML = `
    <section id="hero" class="hero">
      <div class="hero-overlay">
        <p class="eyebrow">Prepárate desde un solo lugar</p>
        <h1>Exámenes ISTQB de práctica</h1>
        <p>Explora simuladores, roadmaps de aprendizaje y ahora un laboratorio completo de automatización.</p>
        <div class="hero-actions">
          <article class="hero-card">
            <h3>Simulador de exámenes</h3>
            <p>Practica los cuestionarios oficiales y mide tu progreso.</p>
            <button id="start-exams" class="primary-btn">Empezar ahora</button>
          </article>
          <article class="hero-card">
            <h3>QA Automation Practice Lab</h3>
            <p>Interactúa con formularios, tablas y drag & drop para tus pruebas E2E.</p>
            <button id="open-qa-lab" class="secondary-btn">Ir al laboratorio</button>
          </article>
        </div>
      </div>
    </section>

    <section id="noticias" class="section noticias">
      <h2>Noticias QA</h2>
      <div class="cards-container">
        <article class="card">
          <img src="/images/news-1.jpg" alt="Tendencias QA" />
          <div class="card-body">
            <h3>AI copilots llegan a QA</h3>
            <p>Conoce cómo los equipos aceleran pruebas automatizadas con nuevas herramientas.</p>
          </div>
        </article>
        <article class="card">
          <img src="/images/news-2.jpg" alt="Eventos QA" />
          <div class="card-body">
            <h3>Meetups LATAM</h3>
            <p>Regístrate a los encuentros mensuales para practicar ejercicios de certificación.</p>
          </div>
        </article>
      </div>
    </section>

    <section id="roadmaps" class="section roadmaps">
      <h2>Road maps Manual QA</h2>
      <div class="roadmaps-grid manual">
        <div class="roadmap-card">
          <h4>Fundamentos</h4>
          <p>Testing básico, SDLC y prácticas recomendadas.</p>
        </div>
        <div class="roadmap-card">
          <h4>Herramientas</h4>
          <p>Jira, Zephyr, PractiTest y flujos de defectos.</p>
        </div>
      </div>
      <h2>Road maps Automation QA</h2>
      <div class="roadmaps-grid automation">
        <div class="roadmap-card">
          <h4>JavaScript + Playwright</h4>
          <p>Automatiza UI modernas con buenas prácticas.</p>
        </div>
        <div class="roadmap-card">
          <h4>CI/CD</h4>
          <p>Integra tus suites automatizadas en pipelines.</p>
        </div>
      </div>
    </section>

    <section id="about" class="section about">
      <div class="about-content">
        <img src="/images/creator.jpg" alt="Luis Alfredo Rojas" class="about-img" />
        <div class="about-text">
          <h2>Luis Alfredo Rojas</h2>
          <p>Apasionado por procesos optimizados, orientado al detalle y dedicado a reducir errores y riesgos dentro del espacio de desarrollo e integración de aplicaciones.</p>
          <a href="https://www.linkedin.com" class="btn" target="_blank" rel="noreferrer">LinkedIn</a>
          <div class="social-metrics">
            <div class="metric"><span>+1590</span><small>Suscriptores YouTube</small></div>
            <div class="metric"><span>+4400</span><small>TikTok</small></div>
          </div>
        </div>
      </div>
    </section>
  `;

  document
    .getElementById('start-exams')
    .addEventListener('click', () => (window.location.hash = '/exams'));
  document
    .getElementById('open-qa-lab')
    .addEventListener('click', () => (window.location.hash = '/qa-lab'));
}

async function renderExams() {
  resetView();
  document.title = 'Exámenes - CertifyMe';
  app.innerHTML = `
    <section id="exams-list">
      <h1>ISTQB Exams</h1>
      <div class="exams-container"></div>
    </section>
  `;

  try {
    const res = await fetch('/data/index.json');
    const list = await res.json();
    const container = document.querySelector('.exams-container');

    list.forEach((exam) => {
      const card = document.createElement('div');
      card.className = 'exam-card';
      card.innerHTML = `
        <h3>${exam.titulo}</h3>
        <p>${exam.descripcion}</p>
        <p><strong>Min score:</strong> ${exam.minimo_aprobacion}</p>
        <button data-slug="${exam.slug}">Practicar</button>
      `;
      card
        .querySelector('button')
        .addEventListener(
          'click',
          () => (window.location.hash = `/exam/${exam.slug}`)
        );
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading exams index:', err);
    app.innerHTML += '<p>Error al cargar los exámenes.</p>';
  }
}

async function renderExamDetail(slug) {
  resetView();
  document.title = `Examen - ${slug.replace(/-/g, ' ')}`;
  app.innerHTML = `
    <section id="exam-detail">
      <h1>${slug.replace(/-/g, ' ')}</h1>
      <div id="timer">00:00</div>
      <div id="questions"></div>
      <button id="next-btn">Siguiente</button>
    </section>
  `;

  try {
    const res = await fetch(`/data/exams/${slug}.json`);
    const exam = await res.json();
    const totalQuestions = exam.examen.length;
    let currentPage = 0;
    let answers = JSON.parse(localStorage.getItem(`answers_${slug}`)) || [];

    let seconds = 0;
    const timerEl = document.getElementById('timer');
    const intervalId = setInterval(() => {
      seconds++;
      const m = String(Math.floor(seconds / 60)).padStart(2, '0');
      const s = String(seconds % 60).padStart(2, '0');
      timerEl.textContent = `${m}:${s}`;
    }, 1000);
    registerCleanup(() => clearInterval(intervalId));

    function renderPage() {
      const start = currentPage * 2;
      const end = start + 2;
      const slice = exam.examen.slice(start, end);
      const container = document.getElementById('questions');
      container.innerHTML = '';

      slice.forEach((q, i) => {
        const idx = start + i;
        const type = q.numero_respuestas === 'ONE' ? 'radio' : 'checkbox';
        const qEl = document.createElement('div');
        qEl.className = 'question';
        let html = `<p>${q.numero}. ${q.pregunta}</p>`;

        q.opciones.forEach((opt, j) => {
          const checked = answers[idx]?.includes(j) || false;
          html += `
            <label>
              <input type="${type}" name="q${idx}" value="${j}" ${
            checked ? 'checked' : ''
          }/> ${opt}
            </label>
          `;
        });

        qEl.innerHTML = html;
        container.appendChild(qEl);
      });

      document.getElementById('next-btn').textContent =
        end < totalQuestions ? 'Siguiente' : 'Terminar';
    }

    renderPage();

    document.getElementById('next-btn').addEventListener('click', () => {
      const start = currentPage * 2;
      const end = start + 2;
      for (let i = start; i < end; i++) {
        const selected = [];
        document.querySelectorAll(`input[name="q${i}"]`).forEach((input) => {
          if (input.checked) selected.push(Number(input.value));
        });
        answers[i] = selected;
      }
      localStorage.setItem(`answers_${slug}`, JSON.stringify(answers));

      if (end >= totalQuestions) {
        clearInterval(intervalId);
        window.location.hash = `/exam/${slug}/results`;
      } else {
        currentPage++;
        renderPage();
      }
    });
  } catch (err) {
    console.error('Error loading exam detail:', err);
    app.innerHTML = '<p>Error al cargar el examen.</p>';
  }
}

function renderQALab() {
  resetView();
  document.title = 'QA Automation Practice Lab - CertifyMe';
  app.innerHTML = `
    <section id="qa-playground" class="qa-section" data-testid="qa-playground">
      <header class="qa-header">
        <div>
          <p class="eyebrow">Hands-on widgets para practicar</p>
          <h1>QA Automation Practice Lab</h1>
          <p>Interactúa con formularios, tablas, drag-and-drop, modales y operaciones async.</p>
        </div>
        <div class="status-bar" aria-live="polite">
          <span class="status-label">Session timer:</span>
          <span id="session-timer" data-testid="session-timer">00:00</span>
          <button id="trigger-async" class="primary" data-testid="async-button">Simular API</button>
          <span id="async-status" class="status-message" data-testid="async-status">Idle</span>
        </div>
      </header>

      <div class="grid two">
        <article class="card" id="login-card">
          <h2>1. Login Form</h2>
          <p class="helper">Botón habilitado solo cuando hay datos.</p>
          <form id="login-form" data-testid="login-form">
            <label>Email
              <input id="login-email" name="email" type="email" data-testid="login-email" required />
            </label>
            <label>Password
              <input id="login-password" name="password" type="password" data-testid="login-password" required />
            </label>
            <div class="form-actions">
              <button type="button" id="clear-login" class="ghost">Limpiar</button>
              <button type="submit" id="login-submit" data-testid="login-submit" disabled>Access</button>
            </div>
            <p id="login-message" class="message" data-testid="login-message"></p>
          </form>
        </article>

        <article class="card" id="registration-card">
          <h2>2. Registro + Validación</h2>
          <p class="helper">Dropdowns, radios, checkbox y file input.</p>
          <form id="register-form" data-testid="register-form">
            <label>Full name
              <input id="register-name" type="text" placeholder="Ada Lovelace" required />
            </label>
            <label>Work email
              <input id="register-email" type="email" placeholder="qa@example.com" required />
            </label>
            <label>Preferred role
              <select id="register-role" data-testid="role-select" required>
                <option value="">Select</option>
                <option value="manual">Manual QA</option>
                <option value="automation">Automation QA</option>
                <option value="lead">QA Lead</option>
              </select>
            </label>
            <fieldset>
              <legend>Experience level</legend>
              <label><input type="radio" name="experience" value="junior" checked /> Junior</label>
              <label><input type="radio" name="experience" value="mid" /> Mid</label>
              <label><input type="radio" name="experience" value="senior" /> Senior</label>
            </fieldset>
            <label>Upload resume (simulado)
              <input id="resume-upload" type="file" data-testid="resume-input" />
            </label>
            <p id="file-feedback" class="helper" data-testid="file-feedback">No file selected.</p>
            <label class="terms">
              <input id="register-terms" type="checkbox" /> Acepto los términos
            </label>
            <button type="submit" id="register-submit" data-testid="register-submit" disabled>Completar registro</button>
            <p id="register-errors" class="message" data-testid="register-message"></p>
          </form>
        </article>
      </div>

      <div class="grid two">
        <article class="card" id="table-card">
          <h2>3. Tabla ordenable/filtrable</h2>
          <div class="table-controls">
            <input id="table-search" type="search" placeholder="Search suite" data-testid="table-search" />
            <select id="table-filter" data-testid="table-filter">
              <option value="all">All statuses</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="blocked">Blocked</option>
            </select>
            <button id="table-clear" class="ghost" type="button">Clear filters</button>
          </div>
          <table id="qa-table" data-testid="qa-table">
            <thead>
              <tr>
                <th data-sort="suite">Suite ▲▼</th>
                <th data-sort="status">Status ▲▼</th>
                <th data-sort="duration">Duration (ms) ▲▼</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
          <p class="helper"><span id="table-count" data-testid="table-count">0</span> rows shown.</p>
        </article>

        <article class="card" id="todo-card">
          <h2>4. Checklist</h2>
          <form id="todo-form" class="todo-form" data-testid="todo-form">
            <input id="todo-input" type="text" placeholder="Add a QA step" data-testid="todo-input" />
            <button type="submit" class="primary">Add</button>
          </form>
          <ul id="todo-list" class="todo-list" data-testid="todo-list"></ul>
          <p class="helper"><span id="todo-count" data-testid="todo-count">0</span> pending steps.</p>
        </article>
      </div>

      <div class="grid two">
        <article class="card" id="drag-card">
          <h2>5. Drag & Drop Scenarios</h2>
          <p class="helper">Arrastra los casos al panel ejecutado.</p>
          <div class="drag-columns">
            <div class="drag-column" id="drag-pending" data-testid="drag-pending">
              <h3>Pending</h3>
              <div class="drag-list" id="pending-list"></div>
            </div>
            <div class="drag-column" id="drag-done" data-testid="drag-done">
              <h3>Executed</h3>
              <div class="drag-list" id="done-list"></div>
            </div>
          </div>
          <p id="drop-status" class="message" data-testid="drop-status">Nothing moved yet.</p>
        </article>

        <article class="card" id="interactions-card">
          <h2>6. Modals, Tooltips & States</h2>
          <button id="open-modal" class="primary" data-testid="open-modal">Abrir modal</button>
          <div class="tooltip-wrapper" data-testid="tooltip-target">
            Hover info icon
            <span class="tooltip" role="tooltip">Environment ready ✔️</span>
          </div>
          <button id="toggle-disabled" type="button" class="ghost" data-testid="toggle-disabled">Toggle disabled field</button>
          <input id="toggle-target" type="text" value="Cannot edit" disabled data-testid="toggle-target" />
          <div class="radio-group">
            <p>Notification channel</p>
            <label><input type="radio" name="channel" value="email" checked /> Email</label>
            <label><input type="radio" name="channel" value="slack" /> Slack</label>
            <label><input type="radio" name="channel" value="sms" /> SMS</label>
          </div>
          <div class="file-simulated">
            <label>Attach screenshot<input id="screenshot-input" type="file" data-testid="screenshot-input" /></label>
            <p id="screenshot-feedback" class="helper">Waiting for a file...</p>
          </div>
        </article>
      </div>

      <div class="grid two">
        <article class="card" id="scroll-card">
          <h2>7. Scroll & Visibility</h2>
          <div id="scroll-box" class="scroll-box" data-testid="scroll-box" tabindex="0">
            <p>Scroll this panel to reveal checkpoints. Testers can assert scrollTop changes.</p>
            <p>Checkpoint 1</p>
            <p>Checkpoint 2</p>
            <p>Checkpoint 3</p>
            <p>Checkpoint 4</p>
            <p>Checkpoint 5</p>
            <p>Checkpoint 6</p>
            <p>Checkpoint 7</p>
            <p class="hidden-checkpoint" aria-hidden="true">Hidden checkpoint revealed!</p>
          </div>
          <p id="scroll-status" class="message" data-testid="scroll-status">Not scrolled yet.</p>
        </article>

        <article class="card" id="delayed-card">
          <h2>8. Async Widgets</h2>
          <p id="delayed-widget" data-testid="delayed-widget">Loading metrics...</p>
          <button id="delayed-refresh" type="button" class="ghost" data-testid="delayed-refresh">Reload metrics</button>
        </article>
      </div>
    </section>
    <div class="lab-actions">
      <button id="back-home" class="ghost">Volver al inicio</button>
    </div>
    <div id="modal-overlay" class="modal-overlay" hidden></div>
    <dialog id="qa-modal" class="qa-modal" data-testid="qa-modal">
      <h3>Execution summary</h3>
      <p>Usa este modal para validar estados abierto/cerrado.</p>
      <button id="close-modal" class="primary" data-testid="close-modal">Close</button>
    </dialog>
  `;

  document
    .getElementById('back-home')
    .addEventListener('click', () => (window.location.hash = '/'));

  const sessionTimer = document.getElementById('session-timer');
  let elapsedSeconds = 0;
  const timerInterval = setInterval(() => {
    elapsedSeconds += 1;
    const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
    const seconds = String(elapsedSeconds % 60).padStart(2, '0');
    sessionTimer.textContent = `${minutes}:${seconds}`;
  }, 1000);
  registerCleanup(() => clearInterval(timerInterval));

  const asyncButton = document.getElementById('trigger-async');
  const asyncStatus = document.getElementById('async-status');
  asyncButton.addEventListener('click', () => {
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

  loginForm.addEventListener('submit', (event) => {
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

  clearLogin.addEventListener('click', () => {
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

  registerTerms.addEventListener('change', () => {
    registerSubmit.disabled = !registerTerms.checked;
  });

  resumeUpload.addEventListener('change', (event) => {
    const fileName = event.target.files[0]?.name;
    fileFeedback.textContent = fileName ? `Selected: ${fileName}` : 'No file selected.';
  });

  registerForm.addEventListener('submit', (event) => {
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
      registerForm.reset();
      registerSubmit.disabled = true;
      fileFeedback.textContent = 'No file selected.';
    }
  });

  const tableData = [
    { suite: 'Smoke', status: 'passed', duration: 520 },
    { suite: 'Regression', status: 'failed', duration: 1340 },
    { suite: 'API', status: 'blocked', duration: 250 },
    { suite: 'Mobile', status: 'passed', duration: 910 },
    { suite: 'Performance', status: 'failed', duration: 2200 },
  ];
  const tableBody = document.querySelector('#qa-table tbody');
  const tableSearch = document.getElementById('table-search');
  const tableFilter = document.getElementById('table-filter');
  const tableCount = document.getElementById('table-count');
  const clearFilters = document.getElementById('table-clear');
  let sortConfig = { key: null, direction: 'asc' };

  const renderTable = (rows) => {
    tableBody.innerHTML = rows
      .map(
        (row, index) => `
          <tr data-testid="table-row" data-index="${index}">
            <td>${row.suite}</td>
            <td class="status ${row.status}">${row.status}</td>
            <td>${row.duration}</td>
          </tr>
        `
      )
      .join('');
    tableCount.textContent = rows.length;
  };

  const applyTableFilters = () => {
    let rows = [...tableData];
    const term = tableSearch.value.toLowerCase();
    if (term) {
      rows = rows.filter((row) => row.suite.toLowerCase().includes(term));
    }
    if (tableFilter.value !== 'all') {
      rows = rows.filter((row) => row.status === tableFilter.value);
    }
    if (sortConfig.key) {
      rows.sort((a, b) => {
        const valueA = a[sortConfig.key];
        const valueB = b[sortConfig.key];
        if (valueA < valueB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    renderTable(rows);
  };

  applyTableFilters();

  tableSearch.addEventListener('input', applyTableFilters);
  tableFilter.addEventListener('change', applyTableFilters);
  clearFilters.addEventListener('click', () => {
    tableSearch.value = '';
    tableFilter.value = 'all';
    sortConfig = { key: null, direction: 'asc' };
    applyTableFilters();
  });

  document.querySelectorAll('#qa-table th').forEach((header) => {
    header.addEventListener('click', () => {
      const key = header.dataset.sort;
      if (sortConfig.key === key) {
        sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
      } else {
        sortConfig = { key, direction: 'asc' };
      }
      applyTableFilters();
    });
  });

  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');
  const todoCount = document.getElementById('todo-count');
  let todoItems = [];

  const updateTodoCount = () => {
    const pending = todoItems.filter((item) => !item.done).length;
    todoCount.textContent = pending;
  };

  const renderTodos = () => {
    todoList.innerHTML = '';
    todoItems.forEach((item) => {
      const li = document.createElement('li');
      li.dataset.id = item.id;
      li.innerHTML = `
        <label>
          <input type="checkbox" ${item.done ? 'checked' : ''} />
          <span class="todo-text ${item.done ? 'done' : ''}" data-testid="todo-text">${item.text}</span>
        </label>
        <div class="todo-actions">
          <button type="button" class="ghost edit" data-action="edit">Edit</button>
          <button type="button" class="ghost" data-action="delete">Delete</button>
        </div>
      `;
      const checkbox = li.querySelector('input[type="checkbox"]');
      const textSpan = li.querySelector('.todo-text');

      checkbox.addEventListener('change', () => {
        item.done = checkbox.checked;
        textSpan.classList.toggle('done', item.done);
        updateTodoCount();
      });

      textSpan.addEventListener('dblclick', () => {
        textSpan.contentEditable = 'true';
        textSpan.focus();
      });

      textSpan.addEventListener('blur', () => {
        textSpan.contentEditable = 'false';
        item.text = textSpan.textContent.trim() || item.text;
      });

      li.addEventListener('click', (event) => {
        const action = event.target.dataset.action;
        if (action === 'delete') {
          todoItems = todoItems.filter((todo) => todo.id !== item.id);
          renderTodos();
        }
        if (action === 'edit') {
          const newText = prompt('Update step', item.text);
          if (newText) {
            item.text = newText;
            renderTodos();
          }
        }
      });

      todoList.appendChild(li);
    });
    updateTodoCount();
  };

  const addTodo = (text) => {
    if (!text) return;
    todoItems.push({ id: crypto.randomUUID(), text, done: false });
    renderTodos();
  };

  todoForm.addEventListener('submit', (event) => {
    event.preventDefault();
    addTodo(todoInput.value.trim());
    todoInput.value = '';
    todoInput.focus();
  });

  addTodo('Verify login validation');
  addTodo('Check modal visibility');

  const dragItems = ['Checkout flow', 'Profile update', 'Billing error'];
  const pendingList = document.getElementById('pending-list');
  const doneList = document.getElementById('done-list');
  const dropStatus = document.getElementById('drop-status');

  dragItems.forEach((text, index) => {
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
      dropStatus.textContent = `Moved ${item.textContent} to ${list.id === 'done-list' ? 'Executed' : 'Pending'}`;
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

  openModalButton.addEventListener('click', openModal);
  closeModalButton.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  const toggleButton = document.getElementById('toggle-disabled');
  const toggleTarget = document.getElementById('toggle-target');

  toggleButton.addEventListener('click', () => {
    toggleTarget.disabled = !toggleTarget.disabled;
  });

  const screenshotInput = document.getElementById('screenshot-input');
  const screenshotFeedback = document.getElementById('screenshot-feedback');

  screenshotInput.addEventListener('change', (event) => {
    screenshotFeedback.textContent = event.target.files[0]
      ? `Attached: ${event.target.files[0].name}`
      : 'Waiting for a file...';
  });

  const scrollBox = document.getElementById('scroll-box');
  const scrollStatus = document.getElementById('scroll-status');
  scrollBox.addEventListener('scroll', () => {
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
  delayedRefresh.addEventListener('click', loadDelayedWidget);
}

function router() {
  const hash = window.location.hash.slice(1) || '/';
  if (hash === '/exams') {
    renderExams();
  } else if (hash.startsWith('/exam/')) {
    const [, , slug, extra] = hash.split('/');
    if (extra === 'results') {
      app.innerHTML = '<p>Resultados próximamente.</p>';
    } else {
      renderExamDetail(slug);
    }
  } else if (hash === '/qa-lab') {
    renderQALab();
  } else {
    renderHome();
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
