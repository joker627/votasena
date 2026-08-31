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
        
        const tbody = document.getElementById('cuerpoTabla');
        tbody.innerHTML = '';
        
        data.resultados.forEach(resultado => {
            const porcentaje = data.total_votos > 0 ? ((resultado.votos / data.total_votos) * 100).toFixed(1) : 0;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="dash-avatar-wrapper">
                        <img src="${resultado.imagen_url}" class="dash-avatar" style="border-color: ${resultado.color};" onerror="this.onerror=null; this.src='assets/icons/user.svg';">
                        <span class="dash-candidate-name">${resultado.nombre}</span>
                    </div>
                </td>
                <td>
                    <span class="dash-candidate-num">#${resultado.numero_tarjeton}</span>
                </td>
                <td>
                    <div class="dash-progress-header">
                        <span class="dash-progress-text">${porcentaje}%</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${porcentaje}%; background-color: ${resultado.color}"></div>
                    </div>
                </td>
                <td class="dash-td-center">
                    <div class="dash-jornada-stats">
                        <span class="dash-jornada-badge" title="Jornada ${resultado.jornada}">
                            <img src="assets/icons/${resultado.jornada === 'Mañana' ? 'sun' : 'moon'}.svg" class="dash-jornada-icon"> ${resultado.jornada}
                        </span>
                    </div>
                </td>
                <td class="dash-total-votes">
                    ${resultado.votos}
                </td>
            `;
            tbody.appendChild(tr);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('tablaResultados').style.display = 'table';
    }
}

// Cargar inicialmente
cargarResultados();

// Evento para el filtro
const filterElement = document.getElementById('jornadaDashboardFilter');
if (filterElement) {
    filterElement.addEventListener('change', () => {
        document.getElementById('loader').style.display = 'block';
        document.getElementById('tablaResultados').style.display = 'none';
        cargarResultados();
    });
}

// Actualizar cada 5 segundos
setInterval(cargarResultados, 5000);
