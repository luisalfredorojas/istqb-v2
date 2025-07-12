// resultado.js - Mostrar resultados del examen

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if (!slug) {
    console.error('No exam slug provided');
    return;
  }

  fetch(`/data/exams/${slug}.json`)
    .then((res) => res.json())
    .then((data) => {
      const exam = Array.isArray(data) ? data[0] : data;
      const questions = exam.examen;
      const answers = JSON.parse(localStorage.getItem(`answers_${slug}`)) || [];

      let correctCount = 0;
      let partialCount = 0;

      const listEl = document.querySelector('.answers-list');
      // …antes de este fragmento todo igual…

      questions.forEach((q, idx) => {
        const card = document.createElement('div');
        card.className = 'answer-card';

        // Determinar estado
        const userAns = answers[idx] || [];
        const correctAns = Array.isArray(q.respuesta_correcta)
          ? q.respuesta_correcta
          : [q.respuesta_correcta];

        const isCorrect =
          userAns.length === correctAns.length &&
          userAns.every((a) => correctAns.includes(a));
        const isPartial =
          !isCorrect && userAns.some((a) => correctAns.includes(a));

        if (isCorrect) card.classList.add('correct');
        else if (isPartial) card.classList.add('partial');
        else card.classList.add('wrong');

        // Título y pregunta
        card.innerHTML = `
    <h4>Pregunta ${q.numero}</h4>
    <p>${q.pregunta}</p>
    <details>
      <summary>Ver mi respuesta</summary>
      <ul>
        ${userAns.map((i) => `<li>${q.opciones[i]}</li>`).join('')}
      </ul>
      ${
        q.explicacion
          ? `<p><strong>Explicación:</strong> ${q.explicacion}</p>`
          : ''
      }
    </details>
  `;

        listEl.appendChild(card);
      });

      // …resto del código igual…

      // Mostrar puntuación y retroalimentación
      const scoreEl = document.getElementById('score');
      const feedbackEl = document.getElementById('feedback');
      scoreEl.textContent = `Puntuación: ${correctCount}/${questions.length}`;

      const percent = (correctCount / questions.length) * 100;
      const msg =
        exam.retroalimentacion.find((t) => percent >= t.umbral)?.mensaje || '';
      feedbackEl.textContent = msg;

      // Botones
      document.getElementById('retry-btn').addEventListener('click', () => {
        localStorage.removeItem(`answers_${slug}`);
        window.location.href = `../preguntas/preguntas.html?slug=${slug}`;
      });
      document.getElementById('back-btn').addEventListener('click', () => {
        window.location.href = `../exams/exams.html`;
      });
    })
    .catch((err) => console.error('Error loading exam data:', err));
});
