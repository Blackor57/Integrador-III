/* ═══════════════════════════════════════════════
   ESTACION HUARAL — static.js
   Handles: particles, login validation, register stepper,
            password strength, chip selection, form UX
   ═══════════════════════════════════════════════ */

'use strict';

/* ══════════════════════
   1. PARTICLES CANVAS
   ══════════════════════ */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); build(); });

  // Warm skin-tone palette for particles
  const COLORS = [
    'rgba(212,168,83,',
    'rgba(200,149,108,',
    'rgba(232,201,160,',
  ];

  function Particle() {
    this.reset();
  }
  Particle.prototype.reset = function() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.r  = Math.random() * 3 + 1;
    this.vx = (Math.random() - .5) * .4;
    this.vy = (Math.random() - .5) * .4;
    this.alpha = Math.random() * .35 + .05;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
  };
  Particle.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color + this.alpha + ')';
    ctx.fill();
  };
  Particle.prototype.update = function() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < -10 || this.x > W + 10 || this.y < -10 || this.y > H + 10) {
      this.reset();
    }
  };

  function build() {
    const count = Math.min(60, Math.floor(W * H / 14000));
    particles = [];
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }
  build();

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ══════════════════════
   2. UTILS
   ══════════════════════ */
const $ = id => document.getElementById(id);
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function setError(fieldGroupId, errorId, msg) {
  const g = $(fieldGroupId);
  const e = $(errorId);
  if (!g) return;
  g.classList.toggle('has-error', !!msg);
  g.classList.remove('is-valid');
  if (e) e.textContent = msg || '';
}

function setValid(fieldGroupId, errorId) {
  const g = $(fieldGroupId);
  const e = $(errorId);
  if (!g) return;
  g.classList.remove('has-error');
  g.classList.add('is-valid');
  if (e) e.textContent = '';
}

function clearState(fieldGroupId, errorId) {
  const g = $(fieldGroupId);
  const e = $(errorId);
  if (!g) return;
  g.classList.remove('has-error', 'is-valid');
  if (e) e.textContent = '';
}

const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const validPass  = v => v.length >= 8;

/* ══════════════════════
   3. LOGIN PAGE
   ══════════════════════ */
(function initLogin() {
  if (!document.querySelector('.login-page')) return;

  const emailEl    = $('email');
  const passEl     = $('password');
  const togglePass = $('togglePass');
  const eyeOpen    = $('eyeOpen');
  const eyeClosed  = $('eyeClosed');
  const btnLogin   = $('btnLogin');
  const btnText    = btnLogin.querySelector('.btn-text');
  const btnLoader  = btnLogin.querySelector('.btn-loader');
  const alertBox   = $('alertError');
  const alertMsg   = $('alertMsg');

  // ── Real-time validation on blur ──
  emailEl.addEventListener('blur', () => {
    const v = emailEl.value.trim();
    if (!v) return clearState('fieldEmail', 'emailError');
    if (!validEmail(v)) setError('fieldEmail', 'emailError', 'Ingresa un correo válido.');
    else setValid('fieldEmail', 'emailError');
  });
  emailEl.addEventListener('input', () => {
    if ($('fieldEmail').classList.contains('has-error')) {
      if (validEmail(emailEl.value.trim())) setValid('fieldEmail', 'emailError');
    }
  });

  passEl.addEventListener('blur', () => {
    const v = passEl.value;
    if (!v) return clearState('fieldPassword', 'passError');
    if (!validPass(v)) setError('fieldPassword', 'passError', 'La contraseña debe tener al menos 8 caracteres.');
    else setValid('fieldPassword', 'passError');
  });
  passEl.addEventListener('input', () => {
    if ($('fieldPassword').classList.contains('has-error')) {
      if (validPass(passEl.value)) setValid('fieldPassword', 'passError');
    }
  });

  // ── Toggle password visibility ──
  togglePass.addEventListener('click', () => {
    const show = passEl.type === 'password';
    passEl.type = show ? 'text' : 'password';
    eyeOpen.style.display   = show ? 'none'  : '';
    eyeClosed.style.display = show ? ''      : 'none';
  });

  // ── Login button ──
  btnLogin.addEventListener('click', () => {
    const email = emailEl.value.trim();
    const pass  = passEl.value;
    let valid = true;

    alertBox.hidden = true;

    if (!email || !validEmail(email)) {
      setError('fieldEmail', 'emailError', 'Por favor ingresa un correo válido.');
      valid = false;
    }
    if (!pass || !validPass(pass)) {
      setError('fieldPassword', 'passError', 'La contraseña debe tener al menos 8 caracteres.');
      valid = false;
    }
    if (!valid) return;

    // Simulate async login
    btnText.hidden   = true;
    btnLoader.hidden = false;
    btnLogin.disabled = true;

    setTimeout(() => {
      btnText.hidden   = false;
      btnLoader.hidden = true;
      btnLogin.disabled = false;

      // Demo: simulate failure for non-demo credentials
      if (email === 'demo@huaral.com' && pass === 'demo1234') {
        window.location.href = 'Dashboard.html';
      } else {
        alertMsg.textContent = 'Correo electrónico o contraseña inválidos.';
        alertBox.hidden = false;
        setError('fieldEmail',    'emailError', '');
        setError('fieldPassword', 'passError',  '');
        $('fieldEmail').classList.add('has-error');
        $('fieldPassword').classList.add('has-error');
      }
    }, 1600);
  });

  // ── Enter key submit ──
  [emailEl, passEl].forEach(el => {
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter') btnLogin.click();
    });
  });

  // ── Guest button ──
  const btnGuest = $('btnGuest');
  if (btnGuest) {
    btnGuest.addEventListener('click', () => {
      window.location.href = 'Dashboard.html';
    });
  }

  // ── Page entrance animation: stagger fields ──
  qsa('.field-group').forEach((el, i) => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(14px)';
    el.style.transition = `opacity .4s ${.1 + i * .07}s ease, transform .4s ${.1 + i * .07}s ease`;
    requestAnimationFrame(() => {
      el.style.opacity   = '1';
      el.style.transform = 'translateY(0)';
    });
  });
})();

/* ══════════════════════
   4. REGISTER PAGE
   ══════════════════════ */
(function initRegister() {
  if (!document.querySelector('.register-page')) return;

  const TOTAL_STEPS = 3;
  let currentStep = 1;

  const btnNext  = $('btnNext');
  const btnBack  = $('btnBack');
  const progFill = $('progressFill');

  // ── Navigation helpers ──
  function showStep(n) {
    for (let i = 1; i <= TOTAL_STEPS; i++) {
      const el = $('step' + i);
      if (el) el.classList.toggle('hidden', i !== n);
    }
    // Update sidebar steps
    qsa('.reg-step-item').forEach(item => {
      const s = parseInt(item.dataset.step, 10);
      item.classList.toggle('active', s === n);
      item.classList.toggle('done',   s < n);
      const circ = item.querySelector('.step-circle');
      if (s < n) circ.innerHTML = '✓';
      else circ.textContent = s;
    });
    // Update mobile progress
    if (progFill) progFill.style.width = (n / TOTAL_STEPS * 100) + '%';
    qsa('.ps').forEach(ps => {
      const s = parseInt(ps.dataset.s, 10);
      ps.classList.toggle('active', s === n);
      ps.classList.toggle('done',   s < n);
    });
    // Titles
    const titles = [
      { t: 'Crear tu cuenta',        s: 'Cuéntanos un poco sobre ti' },
      { t: 'Acceso & seguridad',     s: 'Protege tu cuenta' },
      { t: 'Tus preferencias',       s: 'Personaliza tu experiencia' },
    ];
    const regTitle    = $('regTitle');
    const regSubtitle = $('regSubtitle');
    if (regTitle && titles[n - 1]) {
      regTitle.textContent    = titles[n - 1].t;
      regSubtitle.textContent = titles[n - 1].s;
    }
    // Buttons
    if (btnBack)  btnBack.disabled  = n <= 1;
    if (btnNext) {
      if (n === TOTAL_STEPS) {
        btnNext.querySelector('span').textContent = 'Crear cuenta';
      } else {
        btnNext.querySelector('span').textContent = 'Siguiente';
      }
    }
    currentStep = n;
  }

  // ── Validation per step ──
  function validateStep(n) {
    if (n === 1) {
      const nombre   = $('nombre')?.value.trim();
      const apellido = $('apellido')?.value.trim();
      let ok = true;
      if (!nombre) {
        setError('fieldNombre', 'nombreError', 'El nombre es requerido.');
        ok = false;
      } else clearState('fieldNombre', 'nombreError');
      if (!apellido) {
        setError('fieldApellido', 'apellidoError', 'El apellido es requerido.');
        ok = false;
      } else clearState('fieldApellido', 'apellidoError');
      return ok;
    }
    if (n === 2) {
      const email = $('regEmail')?.value.trim();
      const pass  = $('regPass')?.value;
      const conf  = $('confirmPass')?.value;
      let ok = true;
      if (!email || !validEmail(email)) {
        setError('fieldRegEmail', 'regEmailError', 'Ingresa un correo válido.');
        ok = false;
      } else setValid('fieldRegEmail', 'regEmailError');
      if (!pass || !validPass(pass)) {
        setError('fieldRegPass', 'regPassError', 'Mínimo 8 caracteres.');
        ok = false;
      }
      if (!conf || conf !== pass) {
        setError('fieldConfirm', 'confirmError', 'Las contraseñas no coinciden.');
        ok = false;
      } else if (pass && conf === pass) clearState('fieldConfirm', 'confirmError');
      return ok;
    }
    if (n === 3) {
      const terms = $('terms');
      if (!terms?.checked) {
        $('termsError').textContent = 'Debes aceptar los términos para continuar.';
        return false;
      }
      $('termsError').textContent = '';
      return true;
    }
    return true;
  }

  // ── Next / Submit ──
  btnNext?.addEventListener('click', () => {
    if (!validateStep(currentStep)) return;

    if (currentStep === TOTAL_STEPS) {
      // Submit
      btnNext.disabled = true;
      const span = btnNext.querySelector('span');
      span.textContent = 'Registrando…';

      setTimeout(() => {
        $('stepNav').style.display = 'none';
        qs('.form-footer-links').style.display = 'none';
        for (let i = 1; i <= TOTAL_STEPS; i++) {
          const el = $('step' + i);
          if (el) el.classList.add('hidden');
        }
        $('stepSuccess').classList.remove('hidden');
      }, 1500);
    } else {
      showStep(currentStep + 1);
    }
  });

  // ── Back ──
  btnBack?.addEventListener('click', () => {
    if (currentStep > 1) showStep(currentStep - 1);
  });

  // ── Password strength ──
  $('regPass')?.addEventListener('input', function() {
    const v = this.value;
    let score = 0;
    if (v.length >= 8)  score++;
    if (/[A-Z]/.test(v))  score++;
    if (/[0-9]/.test(v))  score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;

    const labels  = ['–', 'Débil', 'Regular', 'Buena', 'Fuerte'];
    const classes = ['', 'weak', 'fair', 'good', 'strong'];
    const colors  = ['', '#C94040', '#D4853A', '#D4A853', '#3A9A6A'];

    for (let i = 1; i <= 4; i++) {
      const bar = $('sb' + i);
      bar.className = 'sbar' + (i <= score ? ' ' + classes[score] : '');
    }
    const lbl = $('strengthLabel');
    if (lbl) {
      lbl.textContent = labels[score];
      lbl.style.color = colors[score];
    }

    // Clear error if valid
    if (score > 0 && $('fieldRegPass')?.classList.contains('has-error') && validPass(v)) {
      clearState('fieldRegPass', 'regPassError');
    }
    // Cross-check confirm
    const conf = $('confirmPass')?.value;
    if (conf && conf === v) clearState('fieldConfirm', 'confirmError');
  });

  // ── Confirm password live check ──
  $('confirmPass')?.addEventListener('input', function() {
    const pass = $('regPass')?.value;
    if (this.value && this.value === pass) clearState('fieldConfirm', 'confirmError');
  });

  // ── Toggle register password ──
  $('toggleRegPass')?.addEventListener('click', function() {
    const inp = $('regPass');
    const isPass = inp.type === 'password';
    inp.type = isPass ? 'text' : 'password';
  });

  // ── Chips (multi-select) ──
  qsa('.chip-grid').forEach(grid => {
    grid.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      chip.classList.toggle('selected');
    });
  });

  // ── Init ──
  showStep(1);

  // Stagger entrance
  qsa('.field-group').forEach((el, i) => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(10px)';
    el.style.transition = `opacity .35s ${.05 + i * .06}s ease, transform .35s ${.05 + i * .06}s ease`;
    requestAnimationFrame(() => {
      el.style.opacity   = '1';
      el.style.transform = 'translateY(0)';
    });
  });
})();

/* ══════════════════════
   5. GLOBAL: email live validation on any page
   ══════════════════════ */
document.querySelectorAll('input[type="email"]').forEach(el => {
  el.addEventListener('input', function() {
    if (this.value && validEmail(this.value)) {
      const wrap = this.closest('.field-wrap');
      const status = wrap?.querySelector('.field-status');
      if (status) {
        const group = wrap.closest('.field-group');
        group?.classList.remove('has-error');
        group?.classList.add('is-valid');
      }
    }
  });
});