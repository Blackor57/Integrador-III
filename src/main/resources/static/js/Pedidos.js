/**
 * ============================================
 * LA ESTACIÓN HUARAL - PEDIDOS JS
 * Timers, steppers, confirmación de pedido
 * ============================================
 */

(function() {
    'use strict';

    // ========== ESTADO DE PEDIDOS ==========
    const pedidosActivos = [
        {
            id: 'ORD-001',
            nombre: 'LOMO SALTADO',
            estado: 'preparando',
            tiempoInicial: 600, // 10 minutos en segundos
            tiempoRestante: 600,
            paso: 1
        },
        {
            id: 'ORD-002',
            nombre: 'LIMONADA',
            estado: 'espera',
            tiempoInicial: 900, // 15 minutos
            tiempoRestante: 900,
            paso: 0
        },
        {
            id: 'ORD-003',
            nombre: 'TALLARINES VERDES',
            estado: 'listo',
            tiempoInicial: 60, // 1 minuto
            tiempoRestante: 60,
            paso: 2
        }
    ];

    let timerIntervals = {};

    // ========== TIMERS ==========
    function iniciarTimer(pedidoId, elementoId, tiempoInicial) {
        if (timerIntervals[pedidoId]) {
            clearInterval(timerIntervals[pedidoId]);
        }

        let tiempo = tiempoInicial;
        const timerElement = document.getElementById(elementoId);
        if (!timerElement) return;

        function actualizarDisplay() {
            const minutos = Math.floor(tiempo / 60);
            const segundos = tiempo % 60;
            timerElement.textContent = `${minutos}:${segundos.toString().padStart(2, '0')}`;

            if (tiempo <= 60) {
                timerElement.parentElement?.classList.add('pedido-timer-urgent');
            }
        }

        actualizarDisplay();

        timerIntervals[pedidoId] = setInterval(() => {
            tiempo--;
            if (tiempo <= 0) {
                clearInterval(timerIntervals[pedidoId]);
                timerElement.textContent = '0:00';
                timerElement.parentElement?.classList.add('pedido-timer-urgent');
                // Avanzar automáticamente el pedido
                avanzarPedido(pedidoId);
            } else {
                actualizarDisplay();
            }
        }, 1000);
    }

    function avanzarPedido(pedidoId) {
        const pedido = pedidosActivos.find(p => p.id === pedidoId);
        if (!pedido) return;

        if (pedido.paso < 3) {
            pedido.paso++;
            actualizarStepper(pedidoId, pedido.paso);
            
            if (pedido.paso === 3) {
                window.AppUtils?.showToast(`${pedido.nombre}: ¡Tu pedido está listo! 🎉`, 'success');
            }
        }
    }

    function actualizarStepper(pedidoId, paso) {
        const card = document.getElementById(`pedido${pedidosActivos.findIndex(p => p.id === pedidoId) + 1}`);
        if (!card) return;

        const steps = card.querySelectorAll('.stepper-step');
        const lines = card.querySelectorAll('.stepper-line');

        steps.forEach((step, index) => {
            step.classList.remove('completed', 'active');
            if (index < paso) step.classList.add('completed');
            if (index === paso) step.classList.add('active');
        });

        lines.forEach((line, index) => {
            line.classList.remove('completed');
            if (index < paso) line.classList.add('completed');
        });
    }

    // ========== TABS ==========
    function initTabs() {
        const tabs = document.querySelectorAll('#pedidosTabs .tab');
        const tabActivos = document.getElementById('tabActivos');
        const tabHistorial = document.getElementById('tabHistorial');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const target = tab.dataset.tab;
                if (target === 'activos') {
                    if (tabActivos) tabActivos.style.display = 'block';
                    if (tabHistorial) tabHistorial.style.display = 'none';
                } else {
                    if (tabActivos) tabActivos.style.display = 'none';
                    if (tabHistorial) tabHistorial.style.display = 'block';
                }
            });
        });
    }

    // ========== CONFIRMAR PEDIDO ==========
    function initConfirmarPedido() {
        const confirmarBtn = document.getElementById('confirmarPedido');
        if (!confirmarBtn) return;

        confirmarBtn.addEventListener('click', () => {
            const cartItems = window.AppCart?.getItems() || [];
            
            if (cartItems.length === 0) {
                window.AppUtils?.showToast('No tienes items en tu pedido', 'warning');
                return;
            }

            // Simular procesamiento
            confirmarBtn.disabled = true;
            confirmarBtn.innerHTML = '<span>⏳ Procesando...</span>';

            setTimeout(() => {
                window.AppUtils?.showToast('¡Pedido confirmado! 🎉 Te notificaremos cuando esté listo', 'success');
                window.AppCart?.clear();
                
                // Actualizar vista del carto
                actualizarCartoView();
                
                confirmarBtn.disabled = false;
                confirmarBtn.innerHTML = '<span>✅ CONFIRMAR PEDIDO</span>';

                // Recargar después de un momento
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }, 1500);
        });
    }

    function actualizarCartoView() {
        const cartoItems = document.getElementById('cartoItems');
        const cartoSubtotal = document.getElementById('cartoSubtotal');
        const cartoIGV = document.getElementById('cartoIGV');
        const cartoTotal = document.getElementById('cartoTotal');
        
        const cartItems = window.AppCart?.getItems() || [];
        
        if (cartoItems) {
            if (cartItems.length === 0) {
                cartoItems.innerHTML = '<p style="text-align:center;color:var(--color-text-tertiary);padding:20px;">No hay items en tu pedido</p>';
            } else {
                cartoItems.innerHTML = cartItems.map(item => `
                    <div class="carto-item">
                        <div class="carto-item-info">
                            <span class="carto-item-nombre">${item.nombre}</span>
                            <span class="carto-item-cantidad">x${item.cantidad}</span>
                        </div>
                        <span class="carto-item-precio">S/ ${(item.precio * item.cantidad).toFixed(2)}</span>
                    </div>
                `).join('');
            }
        }

        const subtotal = cartItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        const igv = subtotal * 0.18;
        const total = subtotal + igv;

        if (cartoSubtotal) cartoSubtotal.textContent = `S/ ${subtotal.toFixed(2)}`;
        if (cartoIGV) cartoIGV.textContent = `S/ ${igv.toFixed(2)}`;
        if (cartoTotal) cartoTotal.textContent = `S/ ${total.toFixed(2)}`;
    }

    // ========== CANCELAR PEDIDO ==========
    function initCancelarPedido() {
        document.querySelectorAll('.btn-danger-outline').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('¿Estás seguro de cancelar este pedido?')) {
                    const card = btn.closest('.pedido-card');
                    if (card) {
                        card.style.opacity = '0.5';
                        card.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            card.style.transition = 'all 0.5s ease';
                            card.style.maxHeight = '0';
                            card.style.opacity = '0';
                            card.style.padding = '0';
                            card.style.margin = '0';
                            card.style.overflow = 'hidden';
                        }, 300);
                        
                        window.AppUtils?.showToast('Pedido cancelado', 'info');
                    }
                }
            });
        });
    }

    // ========== INICIALIZACIÓN ==========
    document.addEventListener('DOMContentLoaded', () => {
        initTabs();
        initConfirmarPedido();
        initCancelarPedido();
        actualizarCartoView();

        // Iniciar timers
        iniciarTimer('ORD-001', 'timer1', pedidosActivos[0].tiempoRestante);
        iniciarTimer('ORD-002', 'timer2', pedidosActivos[1].tiempoRestante);
        iniciarTimer('ORD-003', 'timer3', pedidosActivos[2].tiempoRestante);

        // Inicializar steppers
        actualizarStepper('ORD-001', pedidosActivos[0].paso);
        actualizarStepper('ORD-002', pedidosActivos[1].paso);
        actualizarStepper('ORD-003', pedidosActivos[2].paso);

        console.log('📋 Pedidos: Timers iniciados');
    });

})();