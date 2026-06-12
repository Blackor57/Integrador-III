/**
 * ============================================
 * LA ESTACIÓN HUARAL - REGISTRO JS
 * Validación completa, fortaleza contraseña
 * ============================================
 */

(function() {
    'use strict';

    // ========== ELEMENTOS DOM ==========
    const registroForm = document.getElementById('registroForm');
    const passwordInput = document.getElementById('passwordRegistro');
    const confirmarPasswordInput = document.getElementById('confirmarPassword');
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    const matchIndicator = document.getElementById('matchIndicator');
    const avatarGrid = document.getElementById('avatarGrid');
    const avatarInput = document.getElementById('avatarInput');
    const registroButton = document.getElementById('registroButton');
    const parallaxBg = document.getElementById('parallaxBgRegistro');

    let selectedAvatar = 'avatar1';

    // ========== PARALLAX ==========
    if (parallaxBg) {
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 15;
            const y = (e.clientY / window.innerHeight - 0.5) * 15;
            parallaxBg.style.transform = `translate(${x}px, ${y}px) scale(1.03)`;
        });
    }

    // ========== MEDIDOR DE FORTALEZA ==========
    if (passwordInput) {
        passwordInput.addEventListener('input', checkPasswordStrength);
    }

    function checkPasswordStrength() {
        const password = passwordInput.value;
        let strength = 0;
        let feedback = '';

        if (password.length === 0) {
            strengthFill.className = 'strength-fill';
            strengthFill.style.width = '0%';
            strengthText.textContent = 'Esperando...';
            strengthText.className = 'strength-text';
            return;
        }

        // Criterios
        const hasLength = password.length >= 6;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const isLongEnough = password.length >= 10;

        if (hasLength) strength++;
        if (hasUpperCase) strength++;
        if (hasLowerCase) strength++;
        if (hasNumber) strength++;
        if (hasSpecial) strength++;
        if (isLongEnough) strength++;

        // Determinar nivel
        if (strength <= 2) {
            strengthFill.className = 'strength-fill debil';
            strengthText.textContent = 'Débil';
            strengthText.className = 'strength-text debil';
            feedback = 'Añade mayúsculas, números o símbolos';
        } else if (strength <= 4) {
            strengthFill.className = 'strength-fill media';
            strengthText.textContent = 'Media';
            strengthText.className = 'strength-text media';
            feedback = 'Casi allí, añade más variedad';
        } else {
            strengthFill.className = 'strength-fill fuerte';
            strengthText.textContent = 'Fuerte 💪';
            strengthText.className = 'strength-text fuerte';
            feedback = '¡Excelente contraseña!';
        }

        strengthText.textContent += ` - ${feedback}`;
    }

    // ========== CONFIRMAR CONTRASEÑA ==========
    if (confirmarPasswordInput) {
        confirmarPasswordInput.addEventListener('input', checkPasswordMatch);
    }

    function checkPasswordMatch() {
        const password = passwordInput.value;
        const confirm = confirmarPasswordInput.value;

        if (confirm.length === 0) {
            matchIndicator.style.display = 'none';
            confirmarPasswordInput.style.borderColor = '';
            return;
        }

        if (password === confirm) {
            matchIndicator.style.display = 'flex';
            matchIndicator.querySelector('span').textContent = 'Las contraseñas coinciden';
            matchIndicator.style.color = '#4CAF50';
            confirmarPasswordInput.style.borderColor = '#4CAF50';
        } else {
            matchIndicator.style.display = 'flex';
            matchIndicator.querySelector('span').textContent = 'Las contraseñas no coinciden';
            matchIndicator.style.color = '#EF5350';
            confirmarPasswordInput.style.borderColor = '#EF5350';
        }
    }

    // ========== SELECTOR DE AVATAR ==========
    if (avatarGrid) {
        const avatarOptions = avatarGrid.querySelectorAll('.avatar-option:not(.avatar-upload)');
        
        avatarOptions.forEach(option => {
            option.addEventListener('click', () => {
                avatarOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                selectedAvatar = option.dataset.avatar;
            });
        });

        // Upload avatar
        const avatarUpload = document.getElementById('avatarUpload');
        if (avatarUpload && avatarInput) {
            avatarUpload.addEventListener('click', () => {
                avatarInput.click();
            });

            avatarInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        avatarUpload.innerHTML = `<img src="${event.target.result}" alt="Avatar personalizado" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
                        avatarOptions.forEach(opt => opt.classList.remove('selected'));
                        avatarUpload.classList.add('selected');
                        selectedAvatar = 'custom';
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    // ========== VALIDACIÓN GENERAL ==========
    function validateForm() {
        const nombre = document.getElementById('nombreCompleto')?.value.trim();
        const email = document.getElementById('emailRegistro')?.value.trim();
        const telefono = document.getElementById('telefono')?.value.trim();
        const direccion = document.getElementById('direccion')?.value.trim();
        const password = passwordInput?.value;
        const confirmPassword = confirmarPasswordInput?.value;
        const terminos = document.getElementById('terminos')?.checked;

        const errors = [];

        if (!nombre || nombre.length < 3) {
            errors.push('Nombre completo requerido (mínimo 3 caracteres)');
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Correo electrónico válido requerido');
        }

        if (!telefono || !/^[0-9]{9}$/.test(telefono)) {
            errors.push('Teléfono debe tener 9 dígitos');
        }

        if (!direccion) {
            errors.push('Dirección requerida');
        }

        if (!password || password.length < 6) {
            errors.push('Contraseña debe tener al menos 6 caracteres');
        }

        if (password !== confirmPassword) {
            errors.push('Las contraseñas no coinciden');
        }

        if (!terminos) {
            errors.push('Debes aceptar los términos y condiciones');
        }

        return errors;
    }

    // ========== SUBMIT ==========
    if (registroForm) {
        registroForm.addEventListener('submit', handleRegistro);
    }

    function handleRegistro(e) {
        e.preventDefault();

        const errors = validateForm();

        if (errors.length > 0) {
            window.AppUtils?.showToast(errors[0], 'error');
            return;
        }

        // Simular carga
        const btnText = registroButton.querySelector('.btn-text');
        const btnLoader = registroButton.querySelector('.btn-loader');
        if (btnText) btnText.style.display = 'none';
        if (btnLoader) btnLoader.style.display = 'block';
        registroButton.disabled = true;

        setTimeout(() => {
            const userData = {
                nombre: document.getElementById('nombreCompleto').value.trim(),
                email: document.getElementById('emailRegistro').value.trim(),
                telefono: document.getElementById('telefono').value.trim(),
                direccion: document.getElementById('direccion').value.trim(),
                avatar: selectedAvatar,
                role: 'user',
                registroTime: new Date().toISOString()
            };

            localStorage.setItem('estacion-huaral-user', JSON.stringify(userData));
            
            window.AppUtils?.showToast('¡Cuenta creada exitosamente! 🎉 Redirigiendo...', 'success');
            
            setTimeout(() => {
                window.location.href = '/inicio';
            }, 1000);
        }, 1500);
    }

    // ========== TOOLTIPS ==========
    document.querySelectorAll('.tooltip-trigger').forEach(trigger => {
        trigger.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'custom-tooltip';
            tooltip.textContent = trigger.dataset.tooltip;
            tooltip.style.cssText = `
                position: absolute;
                background: #1C1815;
                color: white;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 0.75rem;
                z-index: 100;
                white-space: nowrap;
                pointer-events: none;
                top: -40px;
                left: 50%;
                transform: translateX(-50%);
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;
            trigger.parentElement.style.position = 'relative';
            trigger.parentElement.appendChild(tooltip);
            
            trigger.addEventListener('mouseleave', () => {
                tooltip.remove();
            }, { once: true });
        });
    });

})();