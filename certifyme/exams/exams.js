// exams.js - Carga y renderiza los exámenes desde /data/index.json

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('.exams-container');
  try {
    const res = await fetch('../data/index.json');
    const exams = await res.json();

    exams.forEach(exam => {
      const card = document.createElement('div');
      card.className = 'exam-card';
      card.innerHTML = `
        <h2>${exam.titulo}</h2>
        <p class="desc">${exam.descripcion}</p>
        <p>Min score to pass: <strong>${exam.minimo_aprobacion}</strong></p>
        <button data-slug="${exam.slug}">Start</button>
      `;
      container.appendChild(card);
    });

    container.addEventListener('click', e => {
      if (e.target.tagName === 'BUTTON') {
        const slug = e.target.dataset.slug;
        window.location.href = `../preguntas/preguntas.html?slug=${slug}`;
      }
    });
  } catch (err) {
    console.error('Error loading exams:', err);
    container.innerHTML = '<p>Error cargando los exámenes.</p>';
  }
});