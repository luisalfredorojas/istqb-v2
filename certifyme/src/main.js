import './style.css';

const app = document.getElementById('app');

// function renderHome() {
//   document.title = 'Inicio - CertifyMe';
//   app.innerHTML = `
//     <section id="hero" class="hero">
//       <div class="hero-overlay">
//         <h1>Exámenes ISTQB de práctica</h1>
//         <p>Prepárate para obtener la certificación ISTQB con simuladores y materiales prácticos.</p>
//         <button id="start-exams">Empezar ahora</button>
//       </div>
//     </section>

//     <section id="noticias" class="section noticias">
//       <h2>Noticias QA</h2>
//       <div class="cards-container"></div>
//     </section>

//     <section id="roadmaps" class="section roadmaps">
//       <h2>Road maps Manual QA</h2>
//       <div class="roadmaps-grid manual"></div>
//       <h2>Road maps Automation QA</h2>
//       <div class="roadmaps-grid automation"></div>
//     </section>

//     <section id="about" class="section about">
//       <div class="about-content">
//         <img src="/images/creator.jpg" alt="Luis Alfredo Rojas" class="about-img" />
//         <div class="about-text">
//           <h2>Luis Alfredo Rojas</h2>
//           <p>Apasionado por procesos optimizados, orientado al detalle y dedicado a reducir errores y riesgos dentro del espacio de desarrollo e integración de aplicaciones.</p>
//           <a href="#" class="btn">LinkedIn</a>
//           <div class="social-metrics">
//             <div class="metric"><span>+1590</span><small>Suscriptores YouTube</small></div>
//             <div class="metric"><span>+4400</span><small>TikTok</small></div>
//           </div>
//         </div>
//       </div>
//     </section>
//   `;
//   document
//     .getElementById('start-exams')
//     .addEventListener('click', () => (window.location.hash = '/exams'));
// }

async function renderExams() {
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

    // Timer
    let seconds = 0;
    const timerEl = document.getElementById('timer');
    const intervalId = setInterval(() => {
      seconds++;
      const m = String(Math.floor(seconds / 60)).padStart(2, '0');
      const s = String(seconds % 60).padStart(2, '0');
      timerEl.textContent = `${m}:${s}`;
    }, 1000);

    // Mostrar preguntas de 2 en 2
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

function router() {
  const hash = window.location.hash.slice(1) || '/';
  if (hash === '/exams') {
    renderExams();
  } else if (hash.startsWith('/exam/')) {
    const slug = hash.split('/')[2];
    renderExamDetail(slug);
  } else {
    renderHome();
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
