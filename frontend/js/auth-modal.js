/* ==========================================================================
   COMPONENTE: Modal de Autenticacion Reutilizable
   ========================================================================== */

class AuthModal extends HTMLElement {
    connectedCallback() {
        const title       = this.getAttribute('modal-title') || 'Acceso';
        const desc        = this.getAttribute('modal-desc')  || 'Ingresa el código.';
        const placeholder = this.getAttribute('placeholder') || 'Código';

        this.innerHTML = `
            <div class="auth-overlay hidden" id="authScreen">
                <div class="auth-modal">
                    <h2 class="auth-title">${title}</h2>
                    <p class="auth-desc">${desc}</p>
                    <input type="password" id="authInput" class="auth-input" placeholder="${placeholder}">
                    <button class="auth-btn" id="authSubmitBtn">Ingresar</button>
                </div>
            </div>
        `;

        const input = this.querySelector('#authInput');
        const btn   = this.querySelector('#authSubmitBtn');

        const setLoading = (loading) => {
            btn.disabled = loading;
            btn.innerHTML = loading
                ? `<span class="auth-btn-spinner"></span> Verificando...`
                : 'Ingresar';
        };

        const dispatch = () => {
            if (!input.value.trim()) return;
            setLoading(true);
            this.dispatchEvent(new CustomEvent('auth-submit', {
                bubbles: true,
                detail: { code: input.value.trim() }
            }));
        };

        // Resetear boton cuando la autenticacion termina 
        document.addEventListener('auth-done', () => setLoading(false), { once: false });

        // Limpiar el campo de entrada
        document.addEventListener('auth-clear', () => { input.value = ''; });

        btn.addEventListener('click', dispatch);
        input.addEventListener('keypress', (e) => { if (e.key === 'Enter') dispatch(); });
    }
}

customElements.define('auth-modal', AuthModal);
