/**
 * ============================================
 * LA ESTACIÓN HUARAL - PERFIL JS
 * Edición inline, persistencia, estadísticas
 * ============================================
 */

(function() {
    'use strict';

    // ========== DATOS DEL USUARIO ==========
    const userData = {
        nombre: 'Edu Luis Perez',
        email: 'eduben10@estacionhuaral.com',
        telefono: '951654321',
        direccion: 'Av. Timoteo y Barney',
        avatar: '/static/img/avatar-default.png'
    };

    // ========== EDITAR NOMBRE INLINE ==========
    function initNombreEditable() {
        const nombreDisplay = document.getElementById('perfilNombre');
        const editBtn = document.getElementById('editNombreBtn');
        const nombreInput = document.getElementById('nombreCompleto');

        if (!nombreDisplay || !editBtn) return;

        editBtn.addEventListener('click', () => {
            const currentName = nombreDisplay.textContent.trim();
            
            // Crear input temporal
            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentName;
            input.className = 'form-input';
            input.style.cssText = `
                font-family: var(--font-display);
                font-size: 2rem;
                font-weight: 700;
                text-align: center;
                width: 100%;
                max-width: 400px;
                border: 2px solid var(--color-primary);
                border-radius: 12px;
                padding: 8px 16px;
            `;

            nombreDisplay.replaceWith(input);
            input.focus();
            input.select();

            function guardarNombre() {
                const nuevoNombre = input.value.trim();
                if (nuevoNombre.length >= 3) {
                    nombreDisplay.textContent = nuevoNombre;
                    if (nombreInput) nombreInput.value = nuevoNombre;
                    userData.nombre = nuevoNombre;
                    window.AppUtils?.showToast('Nombre actualizado ✓', 'success');
                } else {
                    window.AppUtils?.showToast('El nombre debe tener al menos 3 caracteres', 'warning');
                }
                input.replaceWith(nombreDisplay);
            }

            input.addEventListener('blur', guardarNombre);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    input.blur();
                }
                if (e.key === 'Escape') {
                    input.value = currentName;
                    input.blur();
                }
            });
        });
    }

    // ========== EDITAR AVATAR ==========
    function initAvatarEditable() {
        const avatarEditBtn = document.getElementById('avatarEditBtn');
        const perfilAvatar = document.getElementById('perfilAvatar');

        if (!avatarEditBtn || !perfilAvatar) return;

        avatarEditBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        perfilAvatar.src = event.target.result;
                        perfilAvatar.style.display = 'block';
                        const fallback = perfilAvatar.parentElement.querySelector('.avatar-fallback');
                        if (fallback) fallback.style.display = 'none';
                        window.AppUtils?.showToast('Avatar actualizado ✓', 'success');
                    };
                    reader.readAsDataURL(file);
                }
            });

            input.click();
        });
    }

    // ========== GUARDAR CAMBIOS ==========
    function initGuardarCambios() {
        const perfilForm = document.getElementById('perfilForm');
        if (!perfilForm) return;

        perfilForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nombre = document.getElementById('nombreCompleto')?.value.trim();
            const telefono = document.getElementById('telefonoPerfil')?.value.trim();
            const direccion = document.getElementById('direccionPerfil')?.value.trim();

            if (!nombre || nombre.length < 3) {
                window.AppUtils?.showToast('Nombre inválido', 'error');
                return;
            }

            // Actualizar datos
            userData.nombre = nombre;
            userData.telefono = telefono;
            userData.direccion = direccion;

            // Actualizar display
            const nombreDisplay = document.getElementById('perfilNombre');
            if (nombreDisplay) nombreDisplay.textContent = nombre;

            // Guardar en localStorage
            const storedUser = JSON.parse(localStorage.getItem('estacion-huaral-user') || '{}');
            storedUser.nombre = nombre;
            storedUser.telefono = telefono;
            storedUser.direccion = direccion;
            localStorage.setItem('estacion-huaral-user', JSON.stringify(storedUser));

            window.AppUtils?.showToast('Cambios guardados exitosamente ✓', 'success');
        });
    }

    // ========== CAMBIAR CONTRASEÑA ==========
    function initCambiarPassword() {
        const cambiarBtn = document.getElementById('cambiarPasswordBtn');
        if (!cambiarBtn) return;

        cambiarBtn.addEventListener('click', () => {
            // Crear modal simple
            const modal = document.createElement('div');
            modal.className = 'password-modal-overlay';
            modal.innerHTML = `
                <div class="password-modal">
                    <h3>🔒 Cambiar Contraseña</h3>
                    <div class="form-group">
                        <label>Contraseña actual</label>
                        <input type="password" id="currentPassword" class="form-input" placeholder="••••••">
                    </div>
                    <div class="form-group">
                        <label>Nueva contraseña</label>
                        <input type="password" id="newPassword" class="form-input" placeholder="Mínimo 6 caracteres">
                    </div>
                    <div class="form-group">
                        <label>Confirmar nueva contraseña</label>
                        <input type="password" id="confirmNewPassword" class="form-input" placeholder="Repite la contraseña">
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-secondary" id="cancelPassword">Cancelar</button>
                        <button class="btn btn-primary" id="savePassword">Guardar</button>
                    </div>
                </div>
            `;
            
            // Estilos del modal
            modal.style.cssText = `
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.6);
                z-index: 5000;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(4px);
            `;
            
            const modalCard = modal.querySelector('.password-modal');
            modalCard.style.cssText = `
                background: var(--color-surface);
                border-radius: 24px;
                padding: 32px;
                max-width: 440px;
                width: 90%;
                box-shadow: var(--shadow-4);
                animation: fadeInUp 0.3s ease;
            `;

            document.body.appendChild(modal);

            // Eventos
            modal.querySelector('#cancelPassword').addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });

            modal.querySelector('#savePassword').addEventListener('click', () => {
                const current = modal.querySelector('#currentPassword').value;
                const newPass = modal.querySelector('#newPassword').value;
                const confirm = modal.querySelector('#confirmNewPassword').value;

                if (!current || !newPass || !confirm) {
                    window.AppUtils?.showToast('Completa todos los campos', 'warning');
                    return;
                }

                if (newPass.length < 6) {
                    window.AppUtils?.showToast('La contraseña debe tener al menos 6 caracteres', 'warning');
                    return;
                }

                if (newPass !== confirm) {
                    window.AppUtils?.showToast('Las contraseñas no coinciden', 'error');
                    return;
                }

                window.AppUtils?.showToast('Contraseña actualizada ✓', 'success');
                modal.remove();
            });

            // Cerrar con ESC
            document.addEventListener('keydown', function closeModal(e) {
                if (e.key === 'Escape') {
                    modal.remove();
                    document.removeEventListener('keydown', closeModal);
                }
            });
        });
    }

    // ========== CERRAR SESIÓN ==========
    function initCerrarSesion() {
        const cerrarBtn = document.getElementById('cerrarSesionBtn');
        if (!cerrarBtn) return;

        cerrarBtn.addEventListener('click', () => {
            if (confirm('¿Estás seguro de cerrar sesión?')) {
                localStorage.removeItem('estacion-huaral-user');
                window.AppUtils?.showToast('Sesión cerrada', 'info');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 500);
            }
        });
    }

    // ========== PROGRESS RING VIP ==========
    function initVIPProgress() {
        const vipCircle = document.getElementById('vipCircle');
        if (!vipCircle) return;

        const radius = 26;
        const circumference = 2 * Math.PI * radius;
        const progress = 5 / 7; // 5 de 7 días

        vipCircle.style.strokeDasharray = circumference;
        vipCircle.style.strokeDashoffset = circumference * (1 - progress);
    }

    // ========== ESTADÍSTICAS ANIMADAS ==========
    function animateStats() {
        const statValues = document.querySelectorAll('.stat-value');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'countUp 0.8s ease forwards';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statValues.forEach(value => observer.observe(value));
    }

    // Agregar animación countUp
    const countUpStyle = document.createElement('style');
    countUpStyle.textContent = `
        @keyframes countUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(countUpStyle);

    // ========== INICIALIZACIÓN ==========
    document.addEventListener('DOMContentLoaded', () => {
        // Cargar datos del usuario
        const storedUser = JSON.parse(localStorage.getItem('estacion-huaral-user') || '{}');
        if (storedUser.nombre) {
            userData.nombre = storedUser.nombre;
            userData.email = storedUser.email || userData.email;
            userData.telefono = storedUser.telefono || userData.telefono;
            userData.direccion = storedUser.direccion || userData.direccion;
        }

        // Actualizar UI
        const nombreDisplay = document.getElementById('perfilNombre');
        const emailDisplay = document.getElementById('perfilEmail');
        const nombreInput = document.getElementById('nombreCompleto');
        const correoInput = document.getElementById('correoPerfil');
        const telefonoInput = document.getElementById('telefonoPerfil');
        const direccionInput = document.getElementById('direccionPerfil');

        if (nombreDisplay) nombreDisplay.textContent = userData.nombre;
        if (emailDisplay) emailDisplay.textContent = userData.email;
        if (nombreInput) nombreInput.value = userData.nombre;
        if (correoInput) correoInput.value = userData.email;
        if (telefonoInput) telefonoInput.value = userData.telefono;
        if (direccionInput) direccionInput.value = userData.direccion;

        // Inicializar funcionalidades
        initNombreEditable();
        initAvatarEditable();
        initGuardarCambios();
        initCambiarPassword();
        initCerrarSesion();
        initVIPProgress();
        animateStats();

        console.log('👤 Perfil cargado:', userData.nombre);
    });

})();