const urlParams = new URLSearchParams(window.location.search);
const empresa = urlParams.get('empresa');
const titulo = document.getElementById('titulo-certificacion');
const listaExamenes = document.getElementById('lista-examenes');

if (!empresa) {
    titulo.innerText = "No certification specified";
} else {
    titulo.innerText = `${empresa.toUpperCase()} Exams`;
    cargarExamenes();
}

async function cargarExamenes() {
    try {
        const path = `data/examenes/tiposCertificaciones/${empresa}/`;
        const indexRes = await fetch(`${path}index.json`);

        if (!indexRes.ok) {
            throw new Error(`Cannot load ${path}index.json`);
        }

        const archivos = await indexRes.json();

        if (!Array.isArray(archivos) || archivos.length === 0) {
            listaExamenes.innerHTML = `<p>No exams found in index.json for ${empresa.toUpperCase()}.</p>`;
            return;
        }

        for (let archivo of archivos) {
            const examRes = await fetch(`${path}${archivo}`);
            if (!examRes.ok) {
                console.warn(`Cannot load exam file: ${archivo}`);
                continue;
            }

            const data = await examRes.json();
            mostrarExamen(data, archivo);
        }
    } catch (error) {
        console.error(error);
        listaExamenes.innerHTML = `<p>Error loading exams. Make sure you're running from a local server and index.json exists in the ${empresa} folder.</p>`;
    }
}

function mostrarExamen(data, archivo) {
    const div = document.createElement('div');
    div.className = 'card-examen';
    div.onclick = () => {
        window.location.href = `examen.html?empresa=${empresa}&examen=${archivo}`;
    };
    div.innerHTML = `
    <h3>${data.titulo || 'Untitled Exam'}</h3>
    <p>${data.descripcion || 'No description available.'}</p>
    <p><strong>Min score to pass:</strong> ${data.minimo_aprobacion ?? 'N/A'}</p>
  `;
    listaExamenes.appendChild(div);
}
