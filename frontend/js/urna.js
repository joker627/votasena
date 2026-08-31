const API_URL = 'http://127.0.0.1:8000/api/v1';

let candidatoSeleccionado = null;

// Nodos DOM
const tarjeton = document.getElementById('tarjeton');
const loader = document.getElementById('loader');
const modal = document.getElementById('confirmModal');
const successScreen = document.getElementById('successScreen');
const jornadaSelect = document.getElementById('jornadaSelect');

// Selector
const jornadaContainer = document.getElementById('jornadaSelectorContainer');
const jornadaOptions = document.querySelectorAll('.custom-option');
const jornadaSelectedText = document.getElementById('jornadaSelectedText');

if (jornadaContainer) {
    jornadaContainer.addEventListener('click', (e) => {
        jornadaContainer.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!jornadaContainer.contains(e.target)) {
            jornadaContainer.classList.remove('open');
        }
    });

    jornadaOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            jornadaOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            const value = option.getAttribute('data-value');
            jornadaSelectedText.textContent = value;
            
            jornadaSelect.value = value;
            jornadaSelect.dispatchEvent(new Event('change'));
            
            jornadaContainer.classList.remove('open');
        });
    });
}

// Fetch API
async function cargarCandidatos() {
    const jornada = jornadaSelect.value;
    try {
        loader.style.display = 'block';
        tarjeton.style.display = 'none';
        
        const response = await fetch(`${API_URL}/candidatos?jornada=${jornada}`);
        if (!response.ok) throw new Error('Error al cargar candidatos');
        
        const candidatos = await response.json();
        renderizarCandidatos(candidatos);
    } catch (error) {
        console.error('Error:', error);
        alert('No se pudieron cargar los candidatos. Verifica que el servidor esté encendido.');
    } finally {
        loader.style.display = 'none';
        tarjeton.style.display = 'grid';
    }
}

// Filtro
jornadaSelect.addEventListener('change', cargarCandidatos);

// Init
document.addEventListener('DOMContentLoaded', cargarCandidatos);

function renderizarCandidatos(candidatos) {
    const contenedor = document.getElementById('tarjeton');
    contenedor.innerHTML = '';

    candidatos.forEach(candidato => {
        const card = document.createElement('div');
        card.className = 'candidato-card';
        card.onclick = () => abrirModal(candidato);

        card.innerHTML = `
            <div class="card-image-wrapper">
                <img src="${candidato.imagen_url}" alt="${candidato.nombre}" class="candidato-img" onerror="this.onerror=null; this.src='assets/icons/user.svg';">
            </div>
            <div class="candidato-info">
                <div class="candidato-badge">
                    Tarjetón #${candidato.numero_tarjeton}
                </div>
                <h3 class="candidato-nombre">${candidato.nombre}</h3>
            </div>
            <div class="card-action">
                <span class="btn-vote-hover">Elegir Candidato</span>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

function abrirModal(candidato) {
    candidatoSeleccionado = candidato;
    document.getElementById('modalNombre').textContent = candidato.nombre;
    document.getElementById('modalImg').src = candidato.imagen_url;
    document.getElementById('confirmModal').classList.add('active');
}

function cerrarModal() {
    candidatoSeleccionado = null;
    document.getElementById('confirmModal').classList.remove('active');
}

async function enviarVoto() {
    if (!candidatoSeleccionado) return;

    try {
        const jornada = document.getElementById('jornadaSelect').value;
        const response = await fetch(`${API_URL}/votar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ candidato_id: candidatoSeleccionado.id, jornada: jornada })
        });

        if (!response.ok) throw new Error('Error al registrar el voto');
        
        // Éxito
        cerrarModal();
        mostrarExito();

    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al registrar el voto. Inténtalo de nuevo.');
        cerrarModal();
    }
}

function mostrarExito() {
    const successScreen = document.getElementById('successScreen');
    successScreen.classList.add('active');

    // Reset 3s
    setTimeout(() => {
        successScreen.classList.remove('active');
    }, 3000);
}
