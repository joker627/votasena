/* ==========================================================================
   MÓDULO: Urna Virtual
   ========================================================================== */

const API_URL = 'http://127.0.0.1:8000/api/v1';

/* --- Estado Global y Nodos DOM --- */
let candidatoSeleccionado = null;
let votoToken = '';

const tarjeton          = document.getElementById('tarjeton');
const loader            = document.getElementById('loader');
const successScreen     = document.getElementById('successScreen');
const jornadaSelect     = document.getElementById('jornadaSelect');
const jornadaContainer  = document.getElementById('jornadaSelectorContainer');
const jornadaOptions    = document.querySelectorAll('.custom-option');
const jornadaSelectedText = document.getElementById('jornadaSelectedText');

const authScreen = () => document.getElementById('authScreen');
const authError  = () => document.getElementById('authError');

/* --- Selector de Jornada --- */
if (jornadaContainer) {
    jornadaContainer.addEventListener('click', () => {
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

/* --- Consulta de Candidatos --- */
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

jornadaSelect.addEventListener('change', cargarCandidatos);
cargarCandidatos();

/* --- Autenticación de Urna --- */
async function verificarAcceso(code) {
    if (!code) return;

    if (authError()) authError().style.display = 'none';

    try {
        const response = await fetch(`${API_URL}/auth/verificar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo: 'voto', codigo: code })
        });

        if (response.ok) {
            const data = await response.json();
            votoToken = data.token;
            localStorage.setItem('votoToken', votoToken);
            authScreen().classList.add('hidden');
        } else {
            authError().style.display = 'block';
            localStorage.removeItem('votoToken');
            authScreen().classList.remove('hidden');
        }
    } catch (e) {
        console.error(e);
        alert('Error conectando al servidor');
        authScreen().classList.remove('hidden');
    }
}

document.addEventListener('auth-submit', (e) => verificarAcceso(e.detail.code));

async function checkVotoAutologin() {
    const savedToken = localStorage.getItem('votoToken');
    if (savedToken) {
        votoToken = savedToken;
        authScreen().classList.add('hidden');
    } else {
        authScreen().classList.remove('hidden');
    }
}
checkVotoAutologin();

/* --- Renderizado de Tarjetón --- */
function renderizarCandidatos(candidatos) {
    tarjeton.innerHTML = '';

    candidatos.forEach(candidato => {
        const card = document.createElement('div');
        card.className = 'candidato-card';
        card.onclick = () => abrirModal(candidato);

        card.innerHTML = `
            <div class="card-image-wrapper" style="background: radial-gradient(circle at top center, ${candidato.color}20 0%, transparent 70%);">
                <img src="${candidato.imagen_url}" alt="${candidato.nombre}" class="candidato-img" onerror="this.onerror=null; this.src='assets/icons/user.svg';" style="border-color: ${candidato.color};">
            </div>
            <div class="candidato-info">
                <div class="candidato-badge" style="background: ${candidato.color}15; color: ${candidato.color};">
                    Tarjetón #${candidato.numero_tarjeton}
                </div>
                <h3 class="candidato-nombre">${candidato.nombre}</h3>
            </div>
            <div class="card-action">
                <span class="btn-vote-hover">Elegir Candidato</span>
            </div>
        `;

        card.addEventListener('mouseenter', () => {
            card.style.borderColor = candidato.color;
            card.style.boxShadow = `0 20px 40px -10px ${candidato.color}30`;
            const action = card.querySelector('.card-action');
            action.style.background = candidato.color;
            action.style.borderColor = candidato.color;
            action.querySelector('.btn-vote-hover').style.color = '#ffffff';
        });
        card.addEventListener('mouseleave', () => {
            card.style.borderColor = 'rgba(255, 255, 255, 0.9)';
            card.style.boxShadow = '0 4px 20px -5px rgba(0, 0, 0, 0.05)';
            const action = card.querySelector('.card-action');
            action.style.background = 'rgba(255, 255, 255, 0.4)';
            action.style.borderColor = 'transparent';
            action.querySelector('.btn-vote-hover').style.color = 'var(--text-muted)';
        });
        
        tarjeton.appendChild(card);
    });
}

/* --- Modal de Confirmación --- */
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

/* --- Emisión de Voto --- */
async function enviarVoto() {
    if (!candidatoSeleccionado) return;

    try {
        const jornada = document.getElementById('jornadaSelect').value;
        const response = await fetch(`${API_URL}/votar/`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${votoToken}`
            },
            body: JSON.stringify({
                candidato_id: candidatoSeleccionado.id,
                jornada: jornada
            })
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('Sesión inválida o expirada. Por favor, pida al administrador que ingrese el código nuevamente.');
                votoToken = '';
                localStorage.removeItem('votoToken');
                authScreen().classList.remove('hidden');
                cerrarModal();
                return;
            }
            throw new Error('Error al registrar el voto');
        }
        
        cerrarModal();
        mostrarExito();

    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al registrar el voto. Inténtalo de nuevo.');
        cerrarModal();
    }
}

function mostrarExito() {
    successScreen.classList.add('active');

    setTimeout(() => {
        successScreen.classList.remove('active');
        if (tarjeton) tarjeton.style.display = 'grid';
    }, 850);
}
