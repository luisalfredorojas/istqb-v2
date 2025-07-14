// preguntas.js - Lógica para mostrar preguntas de examen

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if (!slug) {
    console.error('No exam slug provided');
    return;
  }

  // Fetch examen JSON (puede ser un objeto o un array con un objeto)
  let resp;
  try {
    resp = await fetch(`../data/exams/${slug}.json`);
  } catch (err) {
    console.error('Fetch error:', err);
    return;
  }

  let examData;
  try {
    examData = await resp.json();
  } catch (err) {
    console.error('JSON parse error:', err);
    return;
  }

  // Si el JSON es un array, tomamos el primer elemento
  const exam = Array.isArray(examData) ? examData[0] : examData;
  if (!exam || !Array.isArray(exam.examen)) {
    console.error('Formato de examen inválido');
    return;
  }

  // Inserta dinámicamente el título del examen
  const titleEl = document.getElementById('exam-title');
  if (titleEl) {
    titleEl.textContent = exam.titulo;
  }
  document.title = exam.titulo;

  const questions = exam.examen;
  const total = questions.length;

  // State
  let currentPage = 0;
  const perPage = 2;
  let answers =
    JSON.parse(localStorage.getItem(`answers_${slug}`)) ||
    Array(total).fill([]);

  // Timer (120 minutos)
  let timeLeft = 120 * 60;
  const timerEl = document.getElementById('timer');
  setInterval(() => {
    if (timeLeft > 0) timeLeft--;
    const m = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const s = String(timeLeft % 60).padStart(2, '0');
    timerEl.textContent = `${m}:${s}`;
  }, 1000);

  // Elementos de UI
  const container = document.querySelector('.questions-container');
  const progressEl = document.getElementById('progress');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  function render() {
    // Actualizar progreso
    const start = currentPage * perPage;
    const end = Math.min(start + perPage, total);
    progressEl.textContent = `Pregunta ${start + 1} - ${end} de ${total}`;

    // Render preguntas
    container.innerHTML = '';
    questions.slice(start, end).forEach((q, i) => {
      const idx = start + i;
      const card = document.createElement('div');
      card.className = 'question-card';
      let html = `<p>${q.numero}. ${q.pregunta}</p>`;
      if (q.imageUrl) html += `<img src="${q.imageUrl}" alt="Imagen pregunta">`;
      html += `<div class="options">`;
      const type = q.numero_respuestas === 'ONE' ? 'radio' : 'checkbox';
      q.opciones.forEach((opt, j) => {
        const checked = answers[idx]?.includes(j) ? 'checked' : '';
        html += `
          <label>
            <input type="${type}" name="q${idx}" value="${j}" ${checked}/> ${opt}
          </label>`;
      });
      html += `</div>`;
      card.innerHTML = html;
      container.appendChild(card);
    });

    // Botones
    prevBtn.disabled = currentPage === 0;
    nextBtn.textContent = end < total ? 'Siguiente' : 'Terminar';
  }

  function saveAnswers() {
    const start = currentPage * perPage;
    const end = Math.min(start + perPage, total);
    for (let i = start; i < end; i++) {
      const selected = [];
      document.querySelectorAll(`input[name="q${i}"]`).forEach((inp) => {
        if (inp.checked) selected.push(Number(inp.value));
      });
      answers[i] = selected;
    }
    localStorage.setItem(`answers_${slug}`, JSON.stringify(answers));
  }

  prevBtn.addEventListener('click', () => {
    saveAnswers();
    if (currentPage > 0) currentPage--;
    render();
  });
  nextBtn.addEventListener('click', () => {
    saveAnswers();
    const start = currentPage * perPage;
    const end = Math.min(start + perPage, total);
    if (end >= total) {
      window.location.href = `../resultado/resultado.html?slug=${slug}`;
    } else {
      currentPage++;
      render();
    }
  });

  // Primera renderización
  render();
});
