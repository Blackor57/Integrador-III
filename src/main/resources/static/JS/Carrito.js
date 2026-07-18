(function () {
    // Leemos el carrito de la memoria
    let carrito = JSON.parse(localStorage.getItem("miCarritoGlobal")) || {};

    const modalCarrito = document.getElementById("modalCarrito");
    const containerCarritoItems = document.getElementById("cartItemsContainer");
    const lblTotalCarrito = document.getElementById("lblTotalCarrito");
    const badgeCarritoTop = document.getElementById("badgeCarritoTop");
    
    // Función para abrir/cerrar
    const toggleCarrito = (show) => modalCarrito?.classList.toggle("hidden", !show);
    document.getElementById("btnOpenCarrito")?.addEventListener("click", () => toggleCarrito(true));
    document.getElementById("btnCloseCarrito")?.addEventListener("click", () => toggleCarrito(false));

    // Exponer la función de modificar cantidad a nivel global
    window.modificarCantidadGlobal = function (idPlato, delta) {
        if (!carrito[idPlato]) return;
        carrito[idPlato].cantidad += delta;

        if (carrito[idPlato].cantidad <= 0) {
            delete carrito[idPlato];
        } else {
            carrito[idPlato].subtotal = carrito[idPlato].cantidad * carrito[idPlato].precioUnitario;
        }

        // Guardamos y repintamos
        localStorage.setItem("miCarritoGlobal", JSON.stringify(carrito));
        pintarCarritoGlobal();
    };

    function pintarCarritoGlobal() {
        const items = Object.values(carrito);
        let total = 0;
        let cantidadTotal = 0;

        if(containerCarritoItems) containerCarritoItems.innerHTML = "";

        if (items.length === 0) {
            if(containerCarritoItems) {
                containerCarritoItems.innerHTML = `
                    <div class="text-center text-stone-500 py-10 flex flex-col items-center">
                        <i class="fa-solid fa-cart-arrow-down text-4xl mb-3 text-stone-700"></i>
                        <p>Tu carrito está vacío.</p>
                    </div>`;
            }
        } else {
            items.forEach((item) => {
                total += item.subtotal;
                cantidadTotal += item.cantidad;
                const nombreMostrar = item.producto.nombreproducto || item.producto.nombre;

                // Nota que aquí llama a modificarCantidadGlobal en vez de modificarCantidad
                const HTML = `
                    <div class="bg-[#2a1a14]/60 border border-stone-800 rounded-xl p-3 flex justify-between items-center mt-2">
                        <div class="flex-grow pr-2">
                            <h4 class="font-bold text-stone-200 text-xs truncate w-[160px]">${nombreMostrar}</h4>
                            <div class="font-mono text-[#f5be38] text-[11px] font-bold mt-0.5">S/. ${item.subtotal.toFixed(2)}</div>
                        </div>
                        <div class="flex items-center gap-2 bg-[#1c0e0a] rounded-lg border border-stone-700 px-1 py-1 shrink-0">
                            <button class="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-white rounded" onclick="modificarCantidadGlobal(${item.producto.id}, -1)">
                                <i class="fa-solid fa-minus text-[10px]"></i>
                            </button>
                            <span class="font-mono text-xs font-bold text-white w-4 text-center">${item.cantidad}</span>
                            <button class="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-white rounded" onclick="modificarCantidadGlobal(${item.producto.id}, 1)">
                                <i class="fa-solid fa-plus text-[10px]"></i>
                            </button>
                        </div>
                    </div>
                `;
                if(containerCarritoItems) containerCarritoItems.insertAdjacentHTML("beforeend", HTML);
            });
        }

        if(lblTotalCarrito) lblTotalCarrito.textContent = total.toFixed(2);
        if (badgeCarritoTop) badgeCarritoTop.textContent = cantidadTotal;
        
        // Manejar botón de confirmar pedido
        const btnProcesarPedido = document.getElementById("btnProcesarPedido");
        if(btnProcesarPedido) {
            btnProcesarPedido.disabled = (items.length === 0);
            
            // Si quieres que el botón funcione desde CUALQUIER PÁGINA, 
            // la mejor opción es que si lo tocan aquí, los mande a Carta.html para finalizarlo
            btnProcesarPedido.onclick = () => {
                if (window.location.pathname.includes("carta.html")) return;
                window.location.href = "carta.html"; 
            };
        }
    }

    // Arranque inicial en las otras páginas
    pintarCarritoGlobal();
})();