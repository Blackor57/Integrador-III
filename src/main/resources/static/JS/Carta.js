(function () {
  // --- 1. LÓGICA DE NAVEGACIÓN Y VISUAL ---
  const currentPath = window.location.pathname.split("/").pop();
  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    const indicator = link.querySelector(".active-indicator");
    const icon = link.querySelector("i");

    if (currentPath === href || (currentPath === "" && href === "Home.html")) {
      link.classList.remove("text-stone-600", "hover:text-[#cf6937]");
      link.classList.add("text-[#cf6937]");
      if (icon) {
        icon.classList.remove("text-stone-400");
        icon.classList.add("text-[#cf6937]");
      }
      if (indicator) {
        indicator.classList.remove("hidden");
      }
    }
  });

  document.getElementById("navBtnLogout")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });

  // --- 2. VARIABLES GLOBALES ---
  const contenedorPlatos = document.getElementById("contenedorPlatos");
  let todosLosPlatos = [];
  let carrito = JSON.parse(localStorage.getItem("miCarritoGlobal")) || {}; // Objeto para almacenar el carrito: { idPlato: { producto, cantidad, subtotal } }

  // Elementos del Modal del Carrito
  const modalCarrito = document.getElementById("modalCarrito");
  const btnCloseCarrito = document.getElementById("btnCloseCarrito");
  const containerCarritoItems = document.getElementById("cartItemsContainer");
  const lblTotalCarrito = document.getElementById("lblTotalCarrito");
  const badgeCarritoTop = document.getElementById("badgeCarritoTop");
  const btnProcesarPedido = document.getElementById("btnProcesarPedido");

  // --- 3. ABRIR Y CERRAR CARRITO ---
  const toggleCarrito = (show) =>
    modalCarrito.classList.toggle("hidden", !show);

  document
    .getElementById("btnOpenCarrito")
    ?.addEventListener("click", () => toggleCarrito(true));
  document
    .getElementById("btnOpenCarrito2")
    ?.addEventListener("click", () => toggleCarrito(true));
  btnCloseCarrito?.addEventListener("click", () => toggleCarrito(false));

  // Cerrar al hacer clic fuera del panel
  modalCarrito?.addEventListener("click", (e) => {
    if (e.target === modalCarrito) toggleCarrito(false);
  });

  // --- 4. CARGAR PLATOS DESDE LA BD ---
  async function cargarPlatos() {
    try {
      contenedorPlatos.innerHTML = `<div class="col-span-full text-center text-stone-400 py-10"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><p>Cargando la carta...</p></div>`;
      const response = await fetch("http://localhost:8080/producto");
      if (!response.ok) throw new Error("No se pudo cargar la carta.");

      todosLosPlatos = await response.json();
      renderizarPlatos(todosLosPlatos);
    } catch (error) {
      contenedorPlatos.innerHTML = `<div class="col-span-full text-center text-red-400 py-10">Hubo un error al cargar los platos.</div>`;
    }
  }

  function renderizarPlatos(platosAMostrar) {
    contenedorPlatos.innerHTML = "";
    if (platosAMostrar.length === 0) {
      contenedorPlatos.innerHTML = `<div class="col-span-full text-center text-stone-400 py-10">No hay productos disponibles para esta búsqueda.</div>`;
      return;
    }

    platosAMostrar.forEach((plato) => {
      const precioFormateado = Number(plato.precio).toFixed(2);
      const descripcion =
        plato.descripcion || "Delicioso platillo tradicional.";

      let emoji = "🍽️";
      const nombreCat = (
        plato.subcategoria?.categoria?.nombre ||
        plato.categoria ||
        ""
      ).toLowerCase();

      if (nombreCat.includes("bebida")) emoji = "🥤";
      else if (nombreCat.includes("plato")) emoji = "🍲";

      const tarjetaHTML = `
                <article class="bg-[#3d2a21]/60 border border-[#543d32] rounded-2xl overflow-hidden shadow-lg flex flex-col group hover:border-[#f5be38]/50 transition-all">
                    <div class="bg-[#2a1a14]/60 aspect-video w-full flex items-center justify-center relative overflow-hidden text-4xl border-b border-[#543d32]/40">
                        <span class="group-hover:scale-110 transition-transform duration-300">${emoji}</span>
                        <span class="absolute top-3 right-3 bg-[#e07a48] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">S/. ${precioFormateado}</span>
                    </div>
                    <div class="p-4 flex-grow flex flex-col justify-between space-y-3">
                        <div>
                            <h3 class="font-serif font-bold text-stone-100 text-base tracking-wide uppercase">${plato.nombreproducto || plato.nombre}</h3>
                            <p class="text-xs text-stone-400 font-light mt-1 line-clamp-2">${descripcion}</p>
                        </div>
                        <button onclick="agregarAlCarrito(${plato.id})" class="w-full bg-[#e07a48]/20 hover:bg-[#e07a48] text-[#f5be38] hover:text-white font-medium text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95">
                            <i class="fa-solid fa-plus text-[10px]"></i> Agregar al pedido
                        </button>
                    </div>
                </article>
            `;
      contenedorPlatos.insertAdjacentHTML("beforeend", tarjetaHTML);
    });
  }

  // --- 5. LÓGICA DEL CARRITO DE COMPRAS ---
  window.agregarAlCarrito = function (idPlato) {
    const plato = todosLosPlatos.find((p) => p.id === idPlato);
    if (!plato) return;

    const precio = parseFloat(plato.precio);

    if (carrito[idPlato]) {
      carrito[idPlato].cantidad += 1;
      carrito[idPlato].subtotal = carrito[idPlato].cantidad * precio;
    } else {
      carrito[idPlato] = {
        producto: plato,
        cantidad: 1,
        precioUnitario: precio,
        subtotal: precio,
      };
    }

    actualizarUI();
    toggleCarrito(true); // Abre el carrito visualmente
  };

  window.modificarCantidad = function (idPlato, delta) {
    if (!carrito[idPlato]) return;

    carrito[idPlato].cantidad += delta;

    if (carrito[idPlato].cantidad <= 0) {
      delete carrito[idPlato];
    } else {
      carrito[idPlato].subtotal =
        carrito[idPlato].cantidad * carrito[idPlato].precioUnitario;
    }

    actualizarUI();
  };

  function actualizarUI() {
    const items = Object.values(carrito);
    let total = 0;
    let cantidadTotal = 0;

    containerCarritoItems.innerHTML = "";

    if (items.length === 0) {
      containerCarritoItems.innerHTML = `
                <div class="text-center text-stone-500 py-10 flex flex-col items-center">
                    <i class="fa-solid fa-cart-arrow-down text-4xl mb-3 text-stone-700"></i>
                    <p>Tu carrito está vacío.</p>
                </div>
            `;
      btnProcesarPedido.disabled = true;
    } else {
      btnProcesarPedido.disabled = false;

      items.forEach((item) => {
        total += item.subtotal;
        cantidadTotal += item.cantidad;

        const nombreMostrar =
          item.producto.nombreproducto || item.producto.nombre;

        const HTML = `
                    <div class="bg-[#2a1a14]/60 border border-stone-800 rounded-xl p-3 flex justify-between items-center">
                        <div class="flex-grow pr-2">
                            <h4 class="font-bold text-stone-200 text-xs truncate w-[160px]">${nombreMostrar}</h4>
                            <div class="font-mono text-[#f5be38] text-[11px] font-bold mt-0.5">S/. ${item.subtotal.toFixed(2)}</div>
                        </div>
                        <div class="flex items-center gap-2 bg-[#1c0e0a] rounded-lg border border-stone-700 px-1 py-1 shrink-0">
                            <button class="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-white rounded transition-colors cursor-pointer" onclick="modificarCantidad(${item.producto.id}, -1)">
                                <i class="fa-solid fa-minus text-[10px]"></i>
                            </button>
                            <span class="font-mono text-xs font-bold text-white w-4 text-center">${item.cantidad}</span>
                            <button class="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-white rounded transition-colors cursor-pointer" onclick="modificarCantidad(${item.producto.id}, 1)">
                                <i class="fa-solid fa-plus text-[10px]"></i>
                            </button>
                        </div>
                    </div>
                `;
        containerCarritoItems.insertAdjacentHTML("beforeend", HTML);
      });
    }

    lblTotalCarrito.textContent = total.toFixed(2);
    if (badgeCarritoTop) badgeCarritoTop.textContent = cantidadTotal;
    localStorage.setItem("miCarritoGlobal", JSON.stringify(carrito));
  }

  // --- 6. REGISTRAR PEDIDO ---
  btnProcesarPedido.addEventListener("click", async () => {
    const items = Object.values(carrito);
    if (items.length === 0) return;

    btnProcesarPedido.disabled = true;
    btnProcesarPedido.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ENVIANDO...`;

    const totalCalculado = items.reduce((sum, item) => sum + item.subtotal, 0);
    const tipoRecibo = document.getElementById("cartTipoRecibo")
      ? document.getElementById("cartTipoRecibo").value
      : "BOLETA";
    const notas = document.getElementById("cartNotas")
      ? document.getElementById("cartNotas").value
      : "";
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    const payload = {
      tiposervicio: "PARA LLEVAR",
      estadopedido: "PENDIENTE",
      tiporecibo: tipoRecibo,
      notasespeciales: notas,
      subtotal: totalCalculado,
      total: totalCalculado,
      usuario: userId ? { id: parseInt(userId) } : null,
      mesa: null,
      detalles: items.map((item) => ({
        producto: { id: item.producto.id },
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.subtotal,
        estadoItem: "EN_PREPARACION",
      })),
    };

    try {
      const response = await fetch("http://localhost:8080/pedido", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg || "Fallo al registrar el pedido");
      }

      carrito = {};
      actualizarUI();
      window.location.href = "pedido.html";
    } catch (error) {
      console.error("Error enviando pedido:", error);
      alert("No se pudo procesar el pedido. Revisa tu conexión al servidor.");
      btnProcesarPedido.disabled = false;
      btnProcesarPedido.innerHTML = `CONFIRMAR PEDIDO <i class="fa-solid fa-arrow-right"></i>`;
    }
  });

  // --- 7. BUSCADOR EN TIEMPO REAL ---
  const searchInput = document.getElementById("searchFood");
  searchInput?.addEventListener("input", (e) => {
    const textoBusqueda = e.target.value.toLowerCase().trim();

    const platosFiltrados = todosLosPlatos.filter((plato) => {
      // Soporta que el backend lo envíe como nombreproducto o como nombre
      const nombrePlato = (
        plato.nombreproducto ||
        plato.nombre ||
        ""
      ).toLowerCase();
      return nombrePlato.includes(textoBusqueda);
    });

    renderizarPlatos(platosFiltrados);
  });

  // --- 8. FILTROS POR CATEGORÍA ---
  const botonesCategoria = document.querySelectorAll(".category-btn");

  botonesCategoria.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Apagar todos los botones
      botonesCategoria.forEach((b) => {
        b.className =
          "category-btn bg-[#3d2a21]/40 text-stone-400 border border-stone-800 text-xs font-medium px-5 py-2.5 rounded-full hover:text-white hover:border-stone-600 transition-all cursor-pointer";
      });

      // Encender el botón clickeado
      btn.className =
        "category-btn bg-[#e07a48] text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-md transition-all cursor-pointer";

      const categoriaSeleccionada = btn.textContent.trim().toLowerCase();

      if (categoriaSeleccionada === "todos") {
        renderizarPlatos(todosLosPlatos);
      } else {
        const platosFiltrados = todosLosPlatos.filter((plato) => {
          const nombreCat = (
            plato.categoria?.nombre ||
            plato.subcategoria?.categoria?.nombre ||
            plato.categoria ||
            ""
          ).toLowerCase();
          const nombreSub = (
            plato.subcategoria?.nombre ||
            plato.subcategoria ||
            ""
          ).toLowerCase();

          if (categoriaSeleccionada === "bebidas") {
            return nombreCat.includes("bebida") || nombreSub.includes("bebida");
          }
          if (categoriaSeleccionada === "platos a la carta") {
            return nombreCat.includes("plato") || nombreCat.includes("carta");
          }
          if (categoriaSeleccionada === "pastas") {
            return nombreCat.includes("pasta") || nombreSub.includes("pasta");
          }
          return false;
        });

        renderizarPlatos(platosFiltrados);
      }
    });
  });

  // INICIAR
  actualizarUI();
  cargarPlatos();
})();
