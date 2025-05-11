const params = new URLSearchParams(location.search);
const empresa = params.get('empresa');
const examen = params.get('examen');
const examForm = document.getElementById('exam-form');
const examTitle = document.getElementById('exam-title');
const timerEl = document.getElementById('timer');
const nextBtn = document.getElementById('next-btn');
const backBtn = document.getElementById('back-btn');
const finishBtn = document.getElementById('finish-btn');

let examData = null;
let currentPage = 0;
const preguntasPorPagina = 2;
let respuestasUsuario = {};
let startTime;

document.addEventListener('DOMContentLoaded', async () => {
    const path = `data/examenes/tiposCertificaciones/${empresa}/${examen}`;
    const res = await fetch(path);
    examData = await res.json();
    examTitle.textContent = examData.titulo;

    startTime = Date.now();
    startTimer();
    loadPreguntas();
});

// Timer
function startTimer() {
    setInterval(() => {
        const now = Date.now();
        const diff = Math.floor((now - startTime) / 1000);
        const min = String(Math.floor(diff / 60)).padStart(2, '0');
        const sec = String(diff % 60).padStart(2, '0');
        timerEl.textContent = `${min}:${sec}`;
    }, 1000);
}

// Cargar preguntas por página
function loadPreguntas() {
    examForm.innerHTML = '';
    const start = currentPage * preguntasPorPagina;
    const end = start + preguntasPorPagina;
    const preguntasPagina = examData.examen.slice(start, end);

    preguntasPagina.forEach((pregunta, idx) => {
        const div = document.createElement('div');
        div.className = 'question-block';

        const qIndex = start + idx + 1;
        div.innerHTML = `<div class="question-title">Q${qIndex}: ${pregunta.pregunta}</div>`;

        const esMultiple = Array.isArray(pregunta.respuesta_correcta);
        const tipo = esMultiple ? 'checkbox' : 'radio';

        pregunta.opciones.forEach((opcion, i) => {
            const id = `q${pregunta.numero}_o${i}`;
            const checked = isChecked(pregunta.numero, i);
            div.innerHTML += `
        <div>
          <input type="${tipo}" name="q${pregunta.numero}${esMultiple ? '[]' : ''}" id="${id}" value="${i}" ${checked ? 'checked' : ''}>
          <label for="${id}">${opcion}</label>
        </div>
      `;
        });

        examForm.appendChild(div);
    });

    backBtn.disabled = currentPage === 0;
    nextBtn.style.display = end < examData.examen.length ? 'inline-block' : 'none';
    finishBtn.style.display = end >= examData.examen.length ? 'inline-block' : 'none';
}


function isChecked(preguntaNum, opcionIndex) {
    const r = respuestasUsuario[preguntaNum];
    if (r === undefined) return false;
    return Array.isArray(r) ? r.includes(opcionIndex) : r == opcionIndex;
}


// Guardar respuestas
function saveRespuestas() {
    const bloques = examForm.querySelectorAll('.question-block');

    bloques.forEach(bloque => {
        const inputs = bloque.querySelectorAll('input');
        if (!inputs.length) return;

        const pregunta = inputs[0].name.replace('[]', '').replace('q', '');
        const tipo = inputs[0].type;

        if (tipo === 'radio') {
            const selected = bloque.querySelector('input:checked');
            if (selected) {
                respuestasUsuario[pregunta] = parseInt(selected.value);
            }
        }

        if (tipo === 'checkbox') {
            respuestasUsuario[pregunta] = Array.from(inputs)
                .filter(i => i.checked)
                .map(i => parseInt(i.value));
        }
    });
}


// Navegación
nextBtn.addEventListener('click', () => {
    saveRespuestas();
    currentPage++;
    loadPreguntas();
});

backBtn.addEventListener('click', () => {
    saveRespuestas();
    currentPage--;
    loadPreguntas();
});

// Finalizar
finishBtn.addEventListener('click', () => {
    saveRespuestas();
    const examenResultado = {
        respuestasUsuario,
        examenOriginal: examData,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('resultadoExamen', JSON.stringify(examenResultado));
    window.location.href = 'resultados.html';
});
