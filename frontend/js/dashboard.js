/* ==========================================================================
   MODULO: Dashboard Analitico
   ========================================================================== */

const API_URL = 'https://votasena.vercel.app/api/v1';


/* --- Estado Global --- */
let adminAcceso = false;
let adminToken = '';
let countdownInterval = null;
let secondsLeft = 60;
let isLiveUpdateEnabled = true;

const authScreen = () => document.getElementById('authScreen');

/* --- Autenticacion --- */
async function verificarAcceso(code) {
    if (!code) return;

    try {
        const response = await fetch(`${API_URL}/auth/verificar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo: 'admin', codigo: code })
        });

        if (response.ok) {
            const data = await response.json();
            adminAcceso = true;
            adminToken = data.token;
            localStorage.setItem('adminToken', adminToken);
            showToast('Acceso concedido. Bienvenido al dashboard.', 'success');
            document.dispatchEvent(new Event('auth-clear'));
            authScreen().classList.add('hidden');
            await cargarEstadoLiveUpdate();
            cargarResultados();
        } else {
            showToast('Código incorrecto. Inténtalo de nuevo.', 'error');
            localStorage.removeItem('adminToken');
        }
    } catch (e) {
        console.error(e);
        showToast('Error conectando al servidor.', 'error');
    } finally {
        document.dispatchEvent(new Event('auth-done'));
    }
}

document.addEventListener('auth-submit', (e) => verificarAcceso(e.detail.code));

async function checkAdminAutologin() {
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
        adminToken = savedToken;
        adminAcceso = true;
        authScreen().classList.add('hidden');
        await cargarEstadoLiveUpdate();
        cargarResultados();
    } else {
        authScreen().classList.remove('hidden');
    }
}
checkAdminAutologin();

/* --- Conteo en Vivo --- */
function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);
    if (!isLiveUpdateEnabled) return;

    secondsLeft = 60;
    actualizarTextoCountdown();
    countdownInterval = setInterval(() => {
        secondsLeft--;
        if (secondsLeft <= 0) {
            cargarResultados();
        } else {
            actualizarTextoCountdown();
        }
    }, 1000);
}

function actualizarTextoCountdown() {
    const cd = document.getElementById('countdownTimer');
    if (!cd) return;

    if (isLiveUpdateEnabled) {
        cd.style.background = 'var(--secondary)';
        cd.style.boxShadow = '0 4px 12px rgba(255, 108, 0, 0.3)';
        cd.innerHTML = `
            <img src="assets/icons/clock-white.svg" width="16" height="16" alt="">
            Actualizando en ${secondsLeft}s
        `;
    } else {
        cd.style.background = 'var(--text-muted)';
        cd.style.boxShadow = 'none';
        cd.innerHTML = `
            <img src="assets/icons/pause-white.svg" width="16" height="16" alt="">
            Pausado
        `;
    }
}

async function cargarEstadoLiveUpdate() {
    try {
        const res = await fetch(`${API_URL}/config/live-update`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (res.ok) {
            const data = await res.json();
            isLiveUpdateEnabled = data.live_update;
            const icon = document.getElementById('liveUpdateIcon');
            const btn  = document.getElementById('toggleLiveUpdateBtn');
            if (isLiveUpdateEnabled) {
                if (icon) icon.src = 'assets/icons/pause.svg';
                if (btn)  btn.title = 'Pausar actualización en vivo';
                startCountdown();
            } else {
                if (icon) icon.src = 'assets/icons/play.svg';
                if (btn)  btn.title = 'Reanudar actualización en vivo';
                actualizarTextoCountdown();
            }
        }
    } catch (e) {
        console.error(e);
        startCountdown();
    }
}

/* --- Control de Actualizacion --- */
const toggleLiveUpdateBtn = document.getElementById('toggleLiveUpdateBtn');
const liveUpdateIcon      = document.getElementById('liveUpdateIcon');
if (toggleLiveUpdateBtn) {
    toggleLiveUpdateBtn.addEventListener('click', async () => {
        isLiveUpdateEnabled = !isLiveUpdateEnabled;

        if (isLiveUpdateEnabled) {
            liveUpdateIcon.src = 'assets/icons/pause.svg';
            toggleLiveUpdateBtn.title = 'Pausar actualización en vivo';
            startCountdown();
        } else {
            liveUpdateIcon.src = 'assets/icons/play.svg';
            toggleLiveUpdateBtn.title = 'Reanudar actualización en vivo';
            if (countdownInterval) clearInterval(countdownInterval);
            actualizarTextoCountdown();
        }

        try {
            await fetch(`${API_URL}/config/live-update`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({ valor: isLiveUpdateEnabled ? 'true' : 'false' })
            });
        } catch (e) {
            console.error(e);
        }
    });
}

/* --- Gestion de Clave de Urna --- */
async function cambiarCodigoVotante() {
    const input = document.getElementById('voterCodeInput');
    const newCode = input.value.trim();
    if (!newCode) return;

    if (!confirm('¿Estás seguro de que deseas cambiar el código de acceso de la Urna? Todas las sesiones abiertas se cerrarán y requerirán esta nueva clave.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/codigo-voto`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({ nuevo_codigo: newCode })
        });

        if (response.ok) {
            showToast('Código de votante actualizado exitosamente.', 'success');
            input.value = '';
        } else {
            showToast('Error al actualizar el código.', 'error');
        }
    } catch (e) {
        console.error(e);
        showToast('Error conectando al servidor.', 'error');
    }
}

/* --- Métricas y Resultados --- */
async function cargarResultados() {
    if (!adminAcceso) return;

    secondsLeft = 60;
    actualizarTextoCountdown();

    try {
        const filterElement = document.getElementById('jornadaDashboardFilter');
        const jornada = filterElement ? filterElement.value : 'Todas';
        const params = new URLSearchParams();
        if (jornada !== 'Todas') params.append('jornada', jornada);
        const queryParams = params.toString() ? `?${params.toString()}` : '';

        const response = await fetch(`${API_URL}/resultados${queryParams}`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (!response.ok) {
            if (response.status === 401) {
                adminAcceso = false;
                localStorage.removeItem('adminToken');
                authScreen().classList.remove('hidden');
            }
            throw new Error('Error al cargar resultados');
        }

        const data = await response.json();

        const wVotos      = document.getElementById('widgetTotalVotos');
        const wCandidatos = document.getElementById('widgetTotalCandidatos');
        if (wVotos)      wVotos.textContent      = data.total_votos;
        if (wCandidatos) wCandidatos.textContent = data.resultados.length;

        const podiumContainer = document.getElementById('podiumContainer');
        const listaResto      = document.getElementById('listaResto');
        podiumContainer.innerHTML = '';
        listaResto.innerHTML      = '';

        const top3 = data.resultados.slice(0, 3);
        const resto = data.resultados.slice(3);

        const podiumOrder      = [top3[1], top3[0], top3[2]].filter(Boolean);
        const podiumVisualRanks = top3[1] ? [2, 1, 3] : [1, 2, 3];

        const medals = {
            1: { color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
            2: { color: '#94A3B8', bg: '#F8FAFC', border: '#CBD5E1' },
            3: { color: '#F97316', bg: '#FFF7ED', border: '#FED7AA' }
        };

        podiumOrder.forEach((c, i) => {
            const vRank = podiumVisualRanks[i];
            const m = medals[vRank];
            const slot = document.createElement('div');
            slot.className = `podium-slot podium-slot-${vRank}`;
            slot.innerHTML = `
                <div class="podium-avatar-wrap" style="border-color:${m.border};background:${m.bg};">
                    <img src="${c.imagen_url}" class="podium-avatar" alt="${c.nombre}" onerror="this.onerror=null;this.src='assets/icons/user.svg';">
                    <div class="podium-medal" style="background:${m.color};box-shadow:0 4px 12px ${m.color}60;">${vRank}</div>
                </div>
                <div class="podium-name">${c.nombre}</div>
                <div class="podium-votes" style="color:${m.color}">${c.votos} <span>votos</span></div>
                <div class="podium-pct" style="color:${m.color}">${c.porcentaje}%</div>
            `;
            podiumContainer.appendChild(slot);
        });

        if (resto.length > 0) {
            listaResto.style.display = 'flex';
            resto.forEach((c, index) => {
                const rank = index + 4;
                const item = document.createElement('div');
                item.className = 'leaderboard-item';
                item.innerHTML = `
                    <div class="lb-left">
                        <div class="lb-rank">${rank}</div>
                        <img src="${c.imagen_url}" class="lb-avatar" alt="${c.nombre}" onerror="this.onerror=null;this.src='assets/icons/user.svg';">
                        <div class="lb-details">
                            <div class="lb-name" style="color:${c.color || 'var(--text-main)'};">${c.nombre}</div>
                            <div class="lb-meta">
                                <span>Tarjetón #${c.tarjeton_formateado}</span>
                                <span class="lb-badge" style="background:${c.color}20;color:${c.color};border:1px solid ${c.color}40">${c.jornada}</span>
                            </div>
                        </div>
                    </div>
                    <div class="lb-right">
                        <div class="lb-votes">
                            <div class="lb-votes-count">${c.votos}</div>
                            <div class="lb-votes-label">Votos</div>
                        </div>
                        <div class="lb-progress-wrapper">
                            <div class="lb-progress-header">
                                <span style="color:var(--text-muted)">Fuerza Electoral</span>
                                <span style="color:var(--text-main);font-weight:800">${c.porcentaje}%</span>
                            </div>
                            <div class="lb-progress-bg">
                                <div class="lb-progress-fill" style="width:0%;background:${c.color || 'var(--primary)'};box-shadow:0 0 10px ${c.color}80"></div>
                            </div>
                        </div>
                    </div>
                `;
                listaResto.appendChild(item);
                setTimeout(() => {
                    const bar = item.querySelector('.lb-progress-fill');
                    if (bar) bar.style.width = `${c.porcentaje}%`;
                }, 100);
            });
        } else {
            listaResto.style.display = 'none';
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('tablaResultados').classList.remove('hidden-results');
    }
}

/* --- Filtros y Navegacion --- */
const filterElement = document.getElementById('jornadaDashboardFilter');
if (filterElement) {
    filterElement.addEventListener('change', () => {
        if (!adminAcceso) return;
        document.getElementById('loader').style.display = 'block';
        document.getElementById('tablaResultados').classList.add('hidden-results');
        cargarResultados();
    });
}

const navDashboard = document.getElementById('navDashboard');
if (navDashboard) {
    navDashboard.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'index.html';
    });
}

/* --- Exportacion de Reportes --- */
async function descargarExport(endpoint, filename) {
    if (!adminAcceso) return;
    const filter = document.getElementById('jornadaDashboardFilter');
    const jornada = filter ? filter.value : 'Todas';
    const params = new URLSearchParams();
    if (jornada !== 'Todas') params.append('jornada', jornada);
    const qs = params.toString() ? `?${params.toString()}` : '';

    try {
        const res = await fetch(`${API_URL}/exportar/${endpoint}${qs}`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (!res.ok) throw new Error("Error en descarga");
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        console.error(err);
        showToast("Error descargando el archivo", 'error');
    }
}

document.getElementById('btnExportExcel')?.addEventListener('click', (e) => {
    e.preventDefault();
    descargarExport('excel', 'Resultados_VotaSena.xlsx');
});

document.getElementById('btnExportPdf')?.addEventListener('click', (e) => {
    e.preventDefault();
    descargarExport('pdf', 'Resultados_VotaSena.pdf');
});

/* --- Cierre de Sesiones --- */
function cerrarSesion(tipo) {
    if (tipo === 'urna' || tipo === 'all') {
        localStorage.removeItem('votoToken');
    }
    if (tipo === 'admin' || tipo === 'all') {
        localStorage.removeItem('adminToken');
        adminAcceso = false;
        adminToken  = '';
        if (countdownInterval) clearInterval(countdownInterval);
    }

    const mensajes = {
        urna:  'Sesion de urna cerrada.',
        admin: 'Sesion de administrador cerrada.',
        all:   'Todas las sesiones cerradas.'
    };
    showToast(mensajes[tipo], 'info');

    if (tipo === 'admin' || tipo === 'all') {
        setTimeout(() => location.reload(), 1200);
    }
}

// Logica del dropdown de logout
function setupLogoutDropdown(triggerId, menuId) {
    const trigger = document.getElementById(triggerId);
    const menu    = document.getElementById(menuId);
    if (!trigger || !menu) return;

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('open');
    });

    menu.querySelectorAll('.logout-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.remove('open');
            mostrarConfirmLogout(btn.dataset.action);
        });
    });
}

setupLogoutDropdown('btnLogoutTriggerSidebar', 'logoutMenuSidebar');
setupLogoutDropdown('btnLogoutTriggerHeader',  'logoutMenuHeader');

document.addEventListener('click', () => {
    document.querySelectorAll('.logout-menu.open')
        .forEach(m => m.classList.remove('open'));
});

// Dialogo de confirmacion
const confirmOverlay = document.getElementById('confirmLogoutOverlay');
const confirmTitle   = document.getElementById('confirmLogoutTitle');
const confirmDesc    = document.getElementById('confirmLogoutDesc');
const confirmOk      = document.getElementById('confirmLogoutOk');
const confirmCancel  = document.getElementById('confirmLogoutCancel');
let pendingLogoutAction = null;

const textos = {
    urna:  { title: 'Cerrar sesion de urna',  desc: 'Los votantes actuales tendran que autenticarse de nuevo. El dashboard seguira activo.' },
    admin: { title: 'Cerrar sesion de admin', desc: 'Seras redirigido al inicio de sesion. La urna seguira activa.' },
    all:   { title: 'Cerrar todas las sesiones', desc: 'Tanto la urna como el dashboard cerraran sesion al instante.' }
};

function mostrarConfirmLogout(tipo) {
    pendingLogoutAction = tipo;
    confirmTitle.textContent = textos[tipo].title;
    confirmDesc.textContent  = textos[tipo].desc;
    confirmOverlay.classList.add('open');
}

function cerrarConfirmLogout() {
    confirmOverlay.classList.remove('open');
    pendingLogoutAction = null;
}

confirmCancel.addEventListener('click', cerrarConfirmLogout);
confirmOverlay.addEventListener('click', (e) => {
    if (e.target === confirmOverlay) cerrarConfirmLogout();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarConfirmLogout();
});

confirmOk.addEventListener('click', () => {
    const tipo = pendingLogoutAction;
    cerrarConfirmLogout();
    if (tipo) cerrarSesion(tipo);
});
