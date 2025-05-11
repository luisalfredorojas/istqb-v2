const contenedor = document.getElementById('certificaciones-container');

// Lista estática si no puedes leer carpetas directamente desde JS
const certificaciones = [
    {
        nombre: 'ISTQB',
        descripcion: 'Testing Foundation & Advanced Level',
        imagen: 'assets/img/istqb.png'
    },
    {
        nombre: 'Oracle',
        descripcion: 'Oracle SQL, Java, and DBA certifications',
        imagen: 'assets/img/oracle.png'
    },
    {
        nombre: 'ISO',
        descripcion: 'ISO standards and quality management',
        imagen: 'assets/img/iso.png'
    }
];

// Crear tarjeta HTML
function crearCard(cert) {
    const div = document.createElement('div');
    div.className = 'card-cert';
    div.onclick = () => {
        window.location.href = `certificacion.html?empresa=${cert.nombre.toLowerCase()}`;
    };

    div.innerHTML = `
    <img src="${cert.imagen}" alt="${cert.nombre} logo" style="max-width: 100px; margin: auto; margin-bottom: 1rem;" />
    <h2>${cert.nombre}</h2>
    <p>${cert.descripcion}</p>
  `;
    contenedor.appendChild(div);
}

// Cargar todas las tarjetas
certificaciones.forEach(crearCard);
