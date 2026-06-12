/**
 * ============================================
 * LA ESTACIÓN HUARAL - LOGIN JS
 * Validación, autenticación simulada
 * ============================================
 */

(function() {
    'use strict';

    // ========== ELEMENTOS DOM ==========
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordValidation = document.getElementById('passwordValidation');
    const emailValidation = document.getElementById('emailValidation');
    const loginButton = document.getElementById('loginButton');
    const guestButton = document.getElementById('guestButton');
    const parallaxBg = document.getElementById('parallaxBg');

    // ========== EFECTO PARALLAX ==========
    if (parallaxBg) {
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 20;
            const y = (e.clientY / window.innerHeight - 0.5) * 20;
            parallaxBg.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
        });
    }

    // ========== TOGGLE CONTRASEÑA ==========
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            
            const eyeOpen = togglePasswordBtn.querySelector('.eye-open');
            const eyeClosed = togglePasswordBtn.querySelector('.eye-closed');
            
            if (eyeOpen && eyeClosed) {
                eyeOpen.style.display = isPassword ? 'none' : 'block';
                eyeClosed.style.display = isPassword ? 'block' : 'none';
            }
        });
    }

    // ========== VALIDACIÓN EN TIEMPO REAL ==========
    
    // Validación de email
    if (emailInput) {
        emailInput.addEventListener('input', validateEmail);
        emailInput.addEventListener('blur', validateEmail);
    }

    function validateEmail() {
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email.length === 0) {
            emailValidation.textContent = '';
            emailInput.style.borderColor = '';
            return false;
        }
        
        if (!emailRegex.test(email)) {
            emailValidation.textContent = 'Ingresa un correo electrónico válido';
            emailValidation.style.color = '#EF5350';
            emailInput.style.borderColor = '#EF5350';
            return false;
        }
        
        emailValidation.textContent = '✓ Correo válido';
        emailValidation.style.color = '#4CAF50';
        emailInput.style.borderColor = '#4CAF50';
        return true;
    }

    // Validación de contraseña
    if (passwordInput) {
        passwordInput.addEventListener('input', validatePassword);
    }

    function validatePassword() {
        const password = passwordInput.value;
        
        if (password.length === 0) {
            passwordValidation.style.display = 'none';
            passwordInput.style.borderColor = '';
            return false;
        }
        
        if (password.length >= 6) {
            // Verificar requisitos adicionales
            const hasUpperCase = /[A-Z]/.test(password);
            const hasNumber = /[0-9]/.test(password);
            const hasMinLength = password.length >= 6;
            
            if (hasMinLength && (hasUpperCase || hasNumber)) {
                passwordValidation.style.display = 'flex';
                passwordValidation.querySelector('span').textContent = 'Contraseña válida.';
                passwordValidation.style.borderColor = 'rgba(46, 125, 50, 0.3)';
                passwordValidation.style.background = 'rgba(46, 125, 50, 0.15)';
                passwordInput.style.borderColor = '#4CAF50';
                return true;
            } else {
                passwordValidation.style.display = 'flex';
                passwordValidation.querySelector('span').textContent = 'La contraseña debe tener al menos 6 caracteres';
                passwordValidation.style.borderColor = 'rgba(245, 166, 35, 0.3)';
                passwordValidation.style.background = 'rgba(245, 166, 35, 0.1)';
                passwordValidation.querySelector('svg').style.stroke = '#F5A623';
                passwordInput.style.borderColor = '#F5A623';
                return false;
            }
        } else {
            passwordValidation.style.display = 'flex';
            passwordValidation.querySelector('span').textContent = 'Mínimo 6 caracteres';
            passwordValidation.style.borderColor = 'rgba(211, 47, 47, 0.3)';
            passwordValidation.style.background = 'rgba(211, 47, 47, 0.1)';
            passwordValidation.querySelector('svg').style.stroke = '#D32F2F';
            passwordInput.style.borderColor = '#EF5350';
            return false;
        }
    }

    // ========== RECORDARME ==========
    function loadRememberedUser() {
        const remembered = localStorage.getItem('estacion-huaral-remember');
        if (remembered) {
            const userData = JSON.parse(remembered);
            if (emailInput) emailInput.value = userData.email || '';
            const rememberCheckbox = document.getElementById('rememberMe');
            if (rememberCheckbox) rememberCheckbox.checked = true;
        }
    }

    // ========== SUBMIT DEL FORMULARIO ==========
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    function handleLogin(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = document.getElementById('rememberMe')?.checked;

        // Validar campos
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();

        if (!isEmailValid || !isPasswordValid) {
            window.AppUtils?.showToast('Por favor, completa todos los campos correctamente', 'warning');
            return;
        }

        // Simular carga
        const btnText = loginButton.querySelector('.btn-text');
        const btnLoader = loginButton.querySelector('.btn-loader');
        if (btnText) btnText.style.display = 'none';
        if (btnLoader) btnLoader.style.display = 'block';
        loginButton.disabled = true;

        // Simular autenticación (2 segundos)
        setTimeout(() => {
            // Credenciales de prueba
            if (email === 'admin@estacionhuaral.com' && password === 'Admin123') {
                // Login exitoso
                const userData = {
                    email: email,
                    nombre: 'Administrador',
                    role: 'admin',
                    loginTime: new Date().toISOString()
                };

                // Guardar en localStorage
                localStorage.setItem('estacion-huaral-user', JSON.stringify(userData));
                
                // Recordarme
                if (rememberMe) {
                    localStorage.setItem('estacion-huaral-remember', JSON.stringify({ email }));
                } else {
                    localStorage.removeItem('estacion-huaral-remember');
                }

                window.AppUtils?.showToast('¡Bienvenido de vuelta! 🎉', 'success');
                
                setTimeout(() => {
                    window.location.href = '/inicio';
                }, 500);

            } else {
                // Login fallido
                if (btnText) btnText.style.display = 'block';
                if (btnLoader) btnLoader.style.display = 'none';
                loginButton.disabled = false;

                // Mostrar error
                passwordInput.style.borderColor = '#EF5350';
                emailInput.style.borderColor = '#EF5350';
                
                window.AppUtils?.showToast('Credenciales incorrectas. Intenta con: admin@estacionhuaral.com / Admin123', 'error', 5000);
                
                // Agitar el formulario
                const card = document.getElementById('loginCard');
                if (card) {
                    card.style.animation = 'none';
                    card.offsetHeight;
                    card.style.animation = 'shake 0.5s ease';
                }
            }
        }, 1500);
    }

    // ========== INVITADO ==========
    if (guestButton) {
        guestButton.addEventListener('click', () => {
            const guestUser = {
                email: 'invitado@estacionhuaral.com',
                nombre: 'Invitado',
                role: 'guest',
                loginTime: new Date().toISOString()
            };
            localStorage.setItem('estacion-huaral-user', JSON.stringify(guestUser));
            window.AppUtils?.showToast('Ingresando como invitado...', 'info');
            setTimeout(() => {
                window.location.href = '/inicio';
            }, 500);
        });
    }

    // ========== OLVIDÉ CONTRASEÑA ==========
    const forgotPassword = document.getElementById('forgotPassword');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', (e) => {
            e.preventDefault();
            const email = emailInput.value.trim();
            if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                window.AppUtils?.showToast('Se ha enviado un enlace de recuperación a tu correo', 'success');
            } else {
                window.AppUtils?.showToast('Ingresa tu correo primero para recuperar la contraseña', 'warning');
                emailInput.focus();
            }
        });
    }

    // ========== ANIMACIÓN SHAKE ==========
    const shakeKeyframes = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
            20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
    `;
    const styleSheet = document.createElement('style');
    styleSheet.textContent = shakeKeyframes;
    document.head.appendChild(styleSheet);

    // ========== INICIALIZACIÓN ==========
    document.addEventListener('DOMContentLoaded', () => {
        loadRememberedUser();
        
        // Auto-focus en email
        if (emailInput && !emailInput.value) {
            setTimeout(() => emailInput.focus(), 800);
        }
    });

})();