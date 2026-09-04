/* ==========================================================================
   MODULO: Urna Virtual
   ========================================================================== */

const API_URL = 'https://votasena.vercel.app/api/v1';

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
        showToast('No se pudieron cargar los candidatos. Verifica que el servidor esté encendido.', 'error');
    } finally {
        loader.style.display = 'none';
        tarjeton.style.display = 'grid';
    }
}

jornadaSelect.addEventListener('change', cargarCandidatos);
cargarCandidatos();

/* --- Autenticacion de Urna --- */
async function verificarAcceso(code) {
    if (!code) return;

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
            showToast('Acceso concedido. ¡Ya puedes votar!', 'success');
            document.dispatchEvent(new Event('auth-clear'));
            authScreen().classList.add('hidden');
        } else {
            showToast('Código incorrecto. Inténtalo de nuevo.', 'error');
            localStorage.removeItem('votoToken');
        }
    } catch (e) {
        console.error(e);
        showToast('Error conectando al servidor. Verifica la conexión.', 'error');
    } finally {
        document.dispatchEvent(new Event('auth-done'));
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

// Cierre de sesion instantaneo cuando el admin la revoca la sesion
window.addEventListener('storage', (e) => {
    if (e.key === 'votoToken' && !e.newValue) {
        // 1. Limpiar token en memoria
        votoToken = '';

        // 2. Cerrar el modal de confirmacion si esta abierto
        const confirmModal = document.getElementById('confirmModal');
        if (confirmModal) confirmModal.classList.remove('active');
        candidatoSeleccionado = null;

        // 3. Cerrar el modal de exito si estaba visible
        const screen = document.getElementById('successScreen');
        if (screen) screen.classList.remove('active');

        // 4. Mostrar el auth overlay
        const auth = authScreen();
        if (auth) auth.classList.remove('hidden');

        // 5. Limpiar la contrasena guardada en el input
        document.dispatchEvent(new Event('auth-clear'));

        // 6. Avisar al votante
        showToast('Sesion cerrada por el administrador.', 'warning');
    }
});

/* --- Renderizado de Tarjeton --- */
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

/* --- Modal de Confirmacion --- */
function abrirModal(candidato) {
    candidatoSeleccionado = candidato;
    document.getElementById('modalNombre').textContent = candidato.nombre;
    document.getElementById('modalImg').src = candidato.imagen_url;
    document.getElementById('confirmModal').classList.add('active');
}

function cerrarModal() {
    candidatoSeleccionado = null;
    document.getElementById('confirmModal').classList.remove('active');
    
    // Resetear boton si quedo cargando
    const btnConfirm = document.getElementById('btnConfirmVote');
    if (btnConfirm) {
        btnConfirm.disabled = false;
        btnConfirm.textContent = 'Sí, Votar';
    }
}

/* --- Emision de Voto --- */
async function enviarVoto() {
    if (!candidatoSeleccionado) return;

    // Verificar que la sesion sigue activa antes de enviar
    if (!votoToken) {
        cerrarModal();
        authScreen().classList.remove('hidden');
        showToast('La sesion expiro. Solicita acceso nuevamente.', 'warning');
        return;
    }
    // Deshabilitar boton y mostrar estado de carga
    const btnConfirm = document.getElementById('btnConfirmVote');
    if (btnConfirm) {
        btnConfirm.disabled = true;
        btnConfirm.textContent = 'Votando...';
    }

    try {
        const response = await fetch(`${API_URL}/votar/`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${votoToken}`
            },
            body: JSON.stringify({
                candidato_id: candidatoSeleccionado.id
            })
        });

        if (!response.ok) {
            if (response.status === 401) {
                showToast('Sesión inválida o expirada. Por favor, pida al administrador que ingrese el código nuevamente.', 'error');
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
        showToast('Hubo un error al registrar el voto. Inténtalo de nuevo.', 'error');
        cerrarModal();
    } finally {
        if (btnConfirm) {
            btnConfirm.disabled = false;
            btnConfirm.textContent = 'Sí, Votar';
        }
    }
}

function mostrarExito() {
    const fill = document.getElementById('successProgressFill');
    const checkImg = successScreen.querySelector('.success-check-img');

    if (fill) {
        fill.style.animation = 'none';
        void fill.offsetWidth;
        fill.style.animation = '';
    }
    if (checkImg) {
        checkImg.style.animation = 'none';
        void checkImg.offsetWidth;
        checkImg.style.animation = '';
    }

    successScreen.classList.add('active');

    setTimeout(() => {
        successScreen.classList.remove('active');
        if (tarjeton) tarjeton.style.display = 'grid';
    }, 800);
}