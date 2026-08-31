const API_URL = 'http://localhost:8000/api/v1';

async function cargarResultados() {
    try {
        const filterElement = document.getElementById('jornadaDashboardFilter');
        const jornada = filterElement ? filterElement.value : 'Todas';
        const queryParams = jornada !== 'Todas' ? `?jornada=${encodeURIComponent(jornada)}` : '';
        
        const response = await fetch(`${API_URL}/resultados${queryParams}`);
        if (!response.ok) throw new Error('Error al cargar resultados');
        
        const data = await response.json();
        
        const btnExcel = document.getElementById('btnExportExcel');
        const btnPdf = document.getElementById('btnExportPdf');
        if (btnExcel) btnExcel.href = `${API_URL}/exportar/excel${queryParams}`;
        if (btnPdf) btnPdf.href = `${API_URL}/exportar/pdf${queryParams}`;
        
        document.getElementById('totalVotos').textContent = data.total_votos;
        
        const wTotalVotos = document.getElementById('widgetTotalVotos');
        if (wTotalVotos) wTotalVotos.textContent = data.total_votos;
        
        const wTotalCandidatos = document.getElementById('widgetTotalCandidatos');
        if (wTotalCandidatos) wTotalCandidatos.textContent = data.resultados.length;
        
        const tbody = document.getElementById('tablaResultados');
        tbody.style.display = 'flex';
        tbody.innerHTML = '';
        
        data.resultados.forEach((c, index) => {
            const rank = index + 1;
            const item = document.createElement('div');
            item.className = `leaderboard-item rank-${rank}`;
            
            const porcentaje = data.total_votos > 0 ? ((c.votos / data.total_votos) * 100).toFixed(1) : 0;
            
            item.innerHTML = `
                <div class="lb-left">
                    <div class="lb-rank">#${rank}</div>
                    <img src="${c.imagen_url}" class="lb-avatar" alt="${c.nombre}" onerror="this.onerror=null; this.src='assets/icons/user.svg';">
                    <div class="lb-details">
                        <div class="lb-name">${c.nombre}</div>
                        <div class="lb-meta">
                            <span>Tarjetón #${c.id.toString().padStart(2, '0')}</span>
                            <span class="lb-badge">${c.jornada}</span>
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
                            <span style="color: var(--text-muted)">Fuerza Electoral</span>
                            <span style="color: var(--text-main); font-weight: 800;">${porcentaje}%</span>
                        </div>
                        <div class="lb-progress-bg">
                            <div class="lb-progress-fill" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
            `;
            
            tbody.appendChild(item);
            
            setTimeout(() => {
                const bar = item.querySelector('.lb-progress-fill');
                if(bar) bar.style.width = `${porcentaje}%`;
            }, 100);
        });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('tablaResultados').style.display = 'flex';
    }
}

// Init
cargarResultados();

// Filtro
const filterElement = document.getElementById('jornadaDashboardFilter');
if (filterElement) {
    filterElement.addEventListener('change', () => {
        document.getElementById('loader').style.display = 'block';
        document.getElementById('tablaResultados').style.display = 'none';
        cargarResultados();
    });
}

// Polling 10s o tiempo de carga 
setInterval(cargarResultados, 10000);
