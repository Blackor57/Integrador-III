/**
 * ============================================
 * LA ESTACIÓN HUARAL - INICIO / CARTA JS
 * Render dinámico, filtros, carrito
 * ============================================
 */

(function() {
    'use strict';

    // ========== DATOS DE PLATOS ==========
    const PLATOS = [
        {
            id: 'plato-1',
            nombre: 'Lomo Saltado',
            descripcion: 'Jugoso lomo salteado con cebolla, tomate y papas doradas',
            precio: 38.90,
            categoria: 'carnes',
            imagen: '/static/img/platos/lomo-saltado.jpg',
            badges: ['popular'],
            popular: true
        },
        {
            id: 'plato-2',
            nombre: 'Ají de Gallina',
            descripcion: 'Clásico peruano, cremoso con pecanas y huevo',
            precio: 32.90,
            categoria: 'aves',
            imagen: '/static/img/platos/aji-de-gallina.jpg',
            badges: [],
            popular: false
        },
        {
            id: 'plato-3',
            nombre: 'Tallarines Verdes',
            descripcion: 'Espaguetis con albahaca, espinaca y pecanas',
            precio: 28.90,
            categoria: 'pastas',
            imagen: '/static/img/platos/tallarines-verdes.jpg',
            badges: ['promo'],
            popular: false
        },
        {
            id: 'plato-4',
            nombre: 'Pollo a la Brasa',
            descripcion: 'Nuestro pollo marinado 12 horas, papas y salsas',
            precio: 42.90,
            categoria: 'aves',
            imagen: '/static/img/platos/pollo-brasa.jpg',
            badges: ['popular'],
            popular: true
        },
        {
            id: 'plato-5',
            nombre: 'Arroz Choclo',
            descripcion: 'Arroz perfumado con choclo morado y cancha crocante',
            precio: 24.90,
            categoria: 'arroz',
            imagen: '/static/img/platos/arroz-choclo.jpg',
            badges: [],
            popular: false
        },
        {
            id: 'plato-6',
            nombre: 'Tablas Verdes',
            descripcion: 'Mix de vegetales orgánicos de temporada',
            precio: 26.90,
            categoria: 'vegetariano',
            imagen: '/static/img/platos/tablas-verdes.jpg',
            badges: [],
            popular: false
        },
        {
            id: 'plato-7',
            nombre: 'Seco de Cordero',
            descripcion: 'Tradicional seco norteño con frejoles y arroz',
            precio: 45.90,
            categoria: 'carnes',
            imagen: '/static/img/platos/seco-cordero.jpg',
            badges: ['promo'],
            popular: false
        },
        {
            id: 'plato-8',
            nombre: 'Ceviche Mixto',
            descripcion: 'Fresco ceviche con pescado, mariscos y camote',
            precio: 48.90,
            categoria: 'carnes',
            imagen: '/static/img/platos/ceviche.jpg',
            badges: ['popular'],
            popular: true
        },
        {
            id: 'plato-9',
            nombre: 'Suspiro a la Limeña',
            descripcion: 'Dulce tradicional con merengue y manjarblanco',
            precio: 18.90,
            categoria: 'pastas',
            imagen: '/static/img/platos/suspiro.jpg',
            badges: [],
            popular: false
        }
    ];

    // ========== ESTADO ==========
    let categoriaActual = 'todos';
    let busquedaActual = '';

    // ========== RENDERIZAR PLATOS ==========
    function renderPlatos(platos) {
        const grid = document.getElementById('platosGrid');
        const emptyState = document.getElementById('emptyState');
        if (!grid) return;

        if (platos.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        grid.innerHTML = platos.map(plato => crearCardPlato(plato)).join('');

        // Agregar event listeners a los botones
        grid.querySelectorAll('.btn-agregar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const platoId = btn.dataset.platoId;
                const plato = PLATOS.find(p => p.id === platoId);
                if (plato) {
                    window.AppCart?.addItem(plato, 1);
                    updateContadorDisplay(platoId, 1);
                }
            });
        });

        grid.querySelectorAll('.btn-contador').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const platoId = btn.dataset.platoId;
                const action = btn.dataset.action;
                const cartItems = window.AppCart?.getItems() || [];
                const cartItem = cartItems.find(item => item.id === platoId);
                const currentQty = cartItem ? cartItem.cantidad : 0;

                if (action === 'plus') {
                    const plato = PLATOS.find(p => p.id === platoId);
                    if (plato) {
                        window.AppCart?.addItem(plato, 1);
                        updateContadorDisplay(platoId, currentQty + 1);
                    }
                } else if (action === 'minus') {
                    if (currentQty <= 1) {
                        window.AppCart?.removeItem(platoId);
                        updateContadorDisplay(platoId, 0);
                    } else {
                        window.AppCart?.updateQuantity(platoId, currentQty - 1);
                        updateContadorDisplay(platoId, currentQty - 1);
                    }
                }
            });
        });
    }

    function crearCardPlato(plato) {
        const cartItems = window.AppCart?.getItems() || [];
        const cartItem = cartItems.find(item => item.id === plato.id);
        const cantidad = cartItem ? cartItem.cantidad : 0;

        const badgesHTML = plato.badges.map(badge => {
            if (badge === 'promo') return '<span class="badge badge-promo">Promo</span>';
            if (badge === 'popular') return '<span class="badge badge-popular">Más pedido</span>';
            return '';
        }).join('');

        return `
            <div class="card-plato" data-categoria="${plato.categoria}" data-id="${plato.id}">
                <div class="card-img-container">
                    <img 
                        src="${plato.imagen}" 
                        alt="${plato.nombre}" 
                        class="card-img" 
                        loading="lazy"
                        onerror="this.src='/static/img/platos/lomo-saltado.jpg'; this.onerror=null;"
                    >
                    ${badgesHTML ? `<div class="card-badges">${badgesHTML}</div>` : ''}
                </div>
                <div class="card-content">
                    <div>
                        <div class="card-header">
                            <h3 class="card-titulo">${plato.nombre}</h3>
                            <span class="card-categoria-tag">${formatearCategoria(plato.categoria)}</span>
                        </div>
                        <p class="card-descripcion">${plato.descripcion}</p>
                    </div>
                    <div class="card-footer">
                        <span class="card-precio">${window.AppUtils?.formatPrice(plato.precio) || 'S/ ' + plato.precio.toFixed(2)}</span>
                        <div class="card-actions">
                            ${cantidad === 0 ? `
                                <button class="btn-agregar" data-plato-id="${plato.id}" aria-label="Agregar ${plato.nombre}">+</button>
                            ` : `
                                <div class="card-contador">
                                    <button class="btn-contador" data-plato-id="${plato.id}" data-action="minus" aria-label="Quitar">−</button>
                                    <span class="contador-valor">${cantidad}</span>
                                    <button class="btn-contador" data-plato-id="${plato.id}" data-action="plus" aria-label="Agregar">+</button>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function updateContadorDisplay(platoId, cantidad) {
        const card = document.querySelector(`.card-plato[data-id="${platoId}"]`);
        if (!card) return;

        const actionsContainer = card.querySelector('.card-actions');
        if (!actionsContainer) return;

        if (cantidad <= 0) {
            const plato = PLATOS.find(p => p.id === platoId);
            actionsContainer.innerHTML = `
                <button class="btn-agregar" data-plato-id="${platoId}" aria-label="Agregar ${plato?.nombre || ''}">+</button>
            `;
            const newBtn = actionsContainer.querySelector('.btn-agregar');
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const p = PLATOS.find(pl => pl.id === platoId);
                if (p) {
                    window.AppCart?.addItem(p, 1);
                    updateContadorDisplay(platoId, 1);
                }
            });
        } else {
            actionsContainer.innerHTML = `
                <div class="card-contador">
                    <button class="btn-contador" data-plato-id="${platoId}" data-action="minus" aria-label="Quitar">−</button>
                    <span class="contador-valor">${cantidad}</span>
                    <button class="btn-contador" data-plato-id="${platoId}" data-action="plus" aria-label="Agregar">+</button>
                </div>
            `;
            
            actionsContainer.querySelectorAll('.btn-contador').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const action = btn.dataset.action;
                    const currentCart = window.AppCart?.getItems() || [];
                    const cartItem = currentCart.find(item => item.id === platoId);
                    const currentQty = cartItem ? cartItem.cantidad : 0;

                    if (action === 'plus') {
                        const plato = PLATOS.find(p => p.id === platoId);
                        if (plato) {
                            window.AppCart?.addItem(plato, 1);
                            updateContadorDisplay(platoId, currentQty + 1);
                        }
                    } else if (action === 'minus') {
                        if (currentQty <= 1) {
                            window.AppCart?.removeItem(platoId);
                            updateContadorDisplay(platoId, 0);
                        } else {
                            window.AppCart?.updateQuantity(platoId, currentQty - 1);
                            updateContadorDisplay(platoId, currentQty - 1);
                        }
                    }
                });
            });
        }
    }

    function formatearCategoria(categoria) {
        const categorias = {
            'carnes': '🥩 Carnes',
            'aves': '🍗 Aves',
            'vegetariano': '🥗 Vegetariano',
            'pastas': '🍝 Pastas',
            'arroz': '🍚 Arroces',
            'bebidas': '🥤 Bebidas'
        };
        return categorias[categoria] || categoria;
    }

    // ========== FILTROS ==========
    function filtrarPlatos() {
        let filtrados = PLATOS;

        if (categoriaActual !== 'todos') {
            filtrados = filtrados.filter(p => p.categoria === categoriaActual);
        }

        if (busquedaActual) {
            const busqueda = busquedaActual.toLowerCase();
            filtrados = filtrados.filter(p => 
                p.nombre.toLowerCase().includes(busqueda) ||
                p.descripcion.toLowerCase().includes(busqueda) ||
                p.categoria.toLowerCase().includes(busqueda)
            );
        }

        renderPlatos(filtrados);
    }

    function initFiltros() {
        const categoriaChips = document.querySelectorAll('.categoria-chip');
        categoriaChips.forEach(chip => {
            chip.addEventListener('click', () => {
                categoriaChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                categoriaActual = chip.dataset.categoria;
                filtrarPlatos();
            });
        });

        // Búsqueda
        const searchInput = document.getElementById('searchInput');
        const searchClear = document.getElementById('searchClear');
        
        if (searchInput) {
            searchInput.addEventListener('input', window.AppUtils?.debounce(() => {
                busquedaActual = searchInput.value.trim();
                if (searchClear) {
                    searchClear.style.display = busquedaActual ? 'block' : 'none';
                }
                filtrarPlatos();
            }, 300));
        }

        if (searchClear) {
            searchClear.addEventListener('click', () => {
                if (searchInput) {
                    searchInput.value = '';
                    busquedaActual = '';
                    searchClear.style.display = 'none';
                    filtrarPlatos();
                    searchInput.focus();
                }
            });
        }
    }

    // ========== CARRITO DRAWER ==========
    function initCartDrawer() {
        const cartButton = document.getElementById('cartButton');
        const cartDrawer = document.getElementById('cartDrawer');
        const cartOverlay = document.getElementById('cartOverlay');
        const cartClose = document.getElementById('cartClose');
        const fabCart = document.getElementById('fabCart');

        function openCart() {
            if (cartDrawer) cartDrawer.classList.add('open');
            if (cartOverlay) cartOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        function closeCart() {
            if (cartDrawer) cartDrawer.classList.remove('open');
            if (cartOverlay) cartOverlay.classList.remove('open');
            document.body.style.overflow = '';
        }

        if (cartButton) cartButton.addEventListener('click', openCart);
        if (fabCart) fabCart.addEventListener('click', openCart);
        if (cartClose) cartClose.addEventListener('click', closeCart);
        if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && cartDrawer?.classList.contains('open')) {
                closeCart();
            }
        });
    }

    // ========== HERO PARTICLES ==========
    function initHeroParticles() {
        const container = document.getElementById('heroParticles');
        if (!container) return;

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 6 + 2}px;
                height: ${Math.random() * 6 + 2}px;
                background: rgba(255,255,255,${Math.random() * 0.4 + 0.1});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${Math.random() * 6 + 4}s ease-in-out infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            container.appendChild(particle);
        }

        const floatKeyframes = `
            @keyframes float {
                0%, 100% { transform: translateY(0) translateX(0); opacity: 0.5; }
                25% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
                50% { transform: translateY(-10px) translateX(-10px); opacity: 0.3; }
                75% { transform: translateY(-30px) translateX(5px); opacity: 0.6; }
            }
        `;
        const styleSheet = document.createElement('style');
        styleSheet.textContent = floatKeyframes;
        document.head.appendChild(styleSheet);
    }

    // ========== INICIALIZACIÓN ==========
    document.addEventListener('DOMContentLoaded', () => {
        initFiltros();
        initCartDrawer();
        initHeroParticles();
        
        // Renderizar todos los platos inicialmente
        renderPlatos(PLATOS);

        // Scroll suave para "Ver promociones"
        document.querySelector('.btn-hero')?.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('promosSection')?.scrollIntoView({ behavior: 'smooth' });
        });
    });

})();