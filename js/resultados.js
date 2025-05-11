const resumenDiv = document.getElementById('resumen');
const detalleDiv = document.getElementById('detalle');
const resultado = JSON.parse(localStorage.getItem('resultadoExamen'));

if (!resultado) {
    resumenDiv.innerHTML = "<p>No exam data found.</p>";
    throw new Error("No exam data");
}

const { respuestasUsuario, examenOriginal } = resultado;
const totalPreguntas = examenOriginal.examen.length;
let puntajeTotal = 0;

examenOriginal.examen.forEach(pregunta => {
    const numero = pregunta.numero;
    const usuario = respuestasUsuario[numero];
    const correcta = pregunta.respuesta_correcta;
    const esMultiple = Array.isArray(correcta);

    let puntajePregunta = 0;
    let esCorrecta = false;

    if (esMultiple) {
        if (Array.isArray(usuario)) {
            const totalCorrectas = correcta.length;
            const correctasMarcadas = usuario.filter(val => correcta.includes(val)).length;
            puntajePregunta = correctasMarcadas / totalCorrectas;
            esCorrecta = puntajePregunta === 1;
        }
    } else {
        esCorrecta = usuario === correcta;
        puntajePregunta = esCorrecta ? 1 : 0;
    }

    puntajeTotal += puntajePregunta;

    // Determinar clase visual
    let claseResultado = 'incorrect';
    if (esCorrecta) {
        claseResultado = 'correct';
    } else if (puntajePregunta > 0) {
        claseResultado = 'partial';
    }

    // Construir bloque visual
    const div = document.createElement('div');
    div.className = `question-block ${claseResultado}`;

    const respuestaTexto = Array.isArray(usuario)
        ? usuario.map(i => pregunta.opciones[i]).join(', ') || 'No answer'
        : pregunta.opciones[usuario] || 'No answer';

    const correctaTexto = Array.isArray(correcta)
        ? correcta.map(i => pregunta.opciones[i]).join(', ')
        : pregunta.opciones[correcta];

    div.innerHTML = `
    <p><strong>Q${pregunta.numero}:</strong> ${pregunta.pregunta}</p>
    <p><strong>Your answer:</strong> ${respuestaTexto}</p>
    <p><strong>Correct answer:</strong> ${correctaTexto}</p>
    <p><strong>Score:</strong> ${puntajePregunta.toFixed(2)}</p>
  `;

    detalleDiv.appendChild(div);
});

// Calcular y mostrar resumen general
const porcentaje = Math.round((puntajeTotal / totalPreguntas) * 100);
const aprobado = puntajeTotal >= examenOriginal.minimo_aprobacion;
const feedback = examenOriginal.retroalimentacion.find(r => porcentaje >= r.umbral);

resumenDiv.innerHTML = `
  <h2>${aprobado ? '✅ Passed!' : '❌ Failed'}</h2>
  <p>Total score: <strong>${puntajeTotal.toFixed(2)} / ${totalPreguntas}</strong></p>
  <p>Score: <strong>${porcentaje}%</strong></p>
  <p class="feedback">${feedback ? feedback.mensaje : ''}</p>
`;
