// public/resultado/resultado.js
// Mostrar resultados del examen (ubicado en public/resultado)

document.addEventListener('DOMContentLoaded', async () => {
    // Obtener slug de la URL
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    if (!slug) {
        alert('No se encontró información del examen.');
        window.location.href = '/exams/exams.html';
        return;
    }

    try {
        // Cargar datos del examen
        const response = await fetch(`/data/exams/${slug}.json`);
        if (!response.ok) throw new Error('Examen no encontrado');
        const data = await response.json();
        const exam = Array.isArray(data) ? data[0] : data;
        const questions = exam.examen;

        // Leer respuestas guardadas
        const stored = localStorage.getItem(`answers_${slug}`) || '[]';
        const answers = JSON.parse(stored);

        let correctCount = 0;

        const listEl = document.querySelector('.answers-list');
        questions.forEach((q, idx) => {
            const card = document.createElement('div');
            card.className = 'answer-card';

            const userAns = Array.isArray(answers[idx]) ? answers[idx] : [];
            const correctAns = Array.isArray(q.respuesta_correcta)
                ? q.respuesta_correcta
                : [q.respuesta_correcta];

            const isCorrect =
                userAns.length === correctAns.length &&
                userAns.every(a => correctAns.includes(a));
            const isPartial = !isCorrect && userAns.some(a => correctAns.includes(a));

            if (isCorrect) {
                card.classList.add('correct');
                correctCount++;
            } else if (isPartial) {
                card.classList.add('partial');
            } else {
                card.classList.add('wrong');
            }

            // Construir tarjeta con detalles
            const userList = userAns
                .map(i => `<li>${q.opciones[i]}</li>`)
                .join('');
            card.innerHTML = `
        <h4>Pregunta ${q.numero}</h4>
        <p>${q.pregunta}</p>
        <details>
          <summary>Ver mi respuesta</summary>
          <ul>${userList}</ul>
          ${q.explicacion ? `<p><strong>Explicación:</strong> ${q.explicacion}</p>` : ''}
        </details>
      `;
            listEl.appendChild(card);
        });

        // Mostrar puntuación
        const scoreEl = document.getElementById('score');
        scoreEl.textContent = `Puntuación: ${correctCount}/${questions.length}`;

        // Mostrar retroalimentación
        const percent = (correctCount / questions.length) * 100;
        const feedbackMsg = exam.retroalimentacion
            .find(item => percent >= item.umbral)?.mensaje || '';
        document.getElementById('feedback').textContent = feedbackMsg;

        // Botones
        document.getElementById('retry-btn').addEventListener('click', () => {
            localStorage.removeItem(`answers_${slug}`);
            window.location.href = `/preguntas/preguntas.html?slug=${slug}`;
        });
        document.getElementById('back-btn').addEventListener('click', () => {
            window.location.href = `/exams/exams.html`;
        });
    } catch (error) {
        console.error(error);
        alert('Error cargando los resultados.');
        window.location.href = '/exams/exams.html';
    }
});