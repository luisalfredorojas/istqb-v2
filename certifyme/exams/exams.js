// exams.js - Carga exámenes y renderiza tarjetas estáticas o dinámicas

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('.exams-container');
  try {
    const res = await fetch('/data/index.json');
    const exams = await res.json();
    exams.forEach((exam) => {
      const card = document.createElement('div');
      card.className = 'exam-card';
      card.innerHTML = `
        <h3>${exam.titulo}</h3>
        <p>${exam.descripcion}</p>
        <div class="min-score">Mínimo para aprobar: ${exam.minimo_aprobacion}</div>
        <button data-slug="${exam.slug}">Start</button>
      `;
      card.querySelector('button').addEventListener('click', () => {
        window.location.href = `../preguntas/preguntas.html?slug=${exam.slug}`;
      });
      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML = '<p>Error al cargar exámenes.</p>';
    console.error(err);
  }
});
