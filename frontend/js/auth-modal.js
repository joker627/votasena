/* ==========================================================================
   COMPONENTE: Modal de Autenticación Reutilizable
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
                    <p class="auth-error" id="authError">Código incorrecto. Inténtalo de nuevo.</p>
                </div>
            </div>
        `;

        const input = this.querySelector('#authInput');
        const btn   = this.querySelector('#authSubmitBtn');

        const dispatch = () => {
            this.dispatchEvent(new CustomEvent('auth-submit', {
                bubbles: true,
                detail: { code: input.value.trim() }
            }));
        };

        btn.addEventListener('click', dispatch);
        input.addEventListener('keypress', (e) => { if (e.key === 'Enter') dispatch(); });
    }
}

customElements.define('auth-modal', AuthModal);
