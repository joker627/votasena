/* ==========================================================================
   MÓDULO: Control de Barra Lateral
   ========================================================================== */

(function () {
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const mobileToggleBtn  = document.getElementById('mobileToggleBtn');
    const sidebar          = document.querySelector('.sidebar');

    if (!sidebar) return;

    if (localStorage.getItem('sidebarCollapsed') === 'true') {
        sidebar.classList.add('collapsed');
    }

    function toggleSidebar() {
        if (window.innerWidth <= 1024) {
            sidebar.classList.toggle('active');
            document.body.classList.toggle('sidebar-open', sidebar.classList.contains('active'));
        } else {
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        }
    }

    if (sidebarToggleBtn) sidebarToggleBtn.addEventListener('click', toggleSidebar);
    if (mobileToggleBtn)  mobileToggleBtn.addEventListener('click', toggleSidebar);
}());
