function showToast(message, type = 'error') {
    const existing = document.getElementById('custom-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'custom-toast';
    toast.className = `custom-toast toast-${type}`;

    const dot = document.createElement('div');
    dot.className = 'toast-icon';

    const text = document.createElement('div');
    text.className = 'toast-message';
    text.textContent = message;

    const close = document.createElement('button');
    close.className = 'toast-close';
    close.innerHTML = '&times;';
    close.setAttribute('aria-label', 'Cerrar');
    close.onclick = () => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    };

    toast.append(dot, text, close);
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 4500);
}
