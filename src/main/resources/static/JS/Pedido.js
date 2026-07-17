(function () {
  // 1. UTILIDADES Y GLOBALES
  const token = localStorage.getItem("token");
  // Almacenamos los pedidos aquí para ver los detalles sin consultar a la BD nuevamente
  let misPedidosGlobal = [];

  // Redirigir si no hay token
  if (!token) {
    window.location.href = "Index.html";
    return;
  }

  // 2. ELEMENTOS DEL DOM
  const contenedorPedidos = document.getElementById("contenedorPedidos");

  // Elementos del Modal - Nuevo Pedido (Existente)
  const modal = document.getElementById("modalContainer");
  const btnOpen = document.getElementById("btnOpenModal");
  const btnClose = document.getElementById("btnCloseModal");
  const btnCancel = document.getElementById("btnCancelModal");

  // Elementos del Modal - Detalles (NUEVO)
  const modalDetalles = document.getElementById("modalDetalles");
  const btnCloseDetalles = document.getElementById("btnCloseDetalles");

  // 3. LÓGICA DE MODALES
  const toggleModal = (show) => modal.classList.toggle("hidden", !show);
  btnOpen?.addEventListener("click", () => toggleModal(true));
  btnClose?.addEventListener("click", () => toggleModal(false));
  btnCancel?.addEventListener("click", () => toggleModal(false));

  const toggleModalDetalles = (show) =>
    modalDetalles.classList.toggle("hidden", !show);
  btnCloseDetalles?.addEventListener("click", () => toggleModalDetalles(false));

  // Cerrar el modal si haces clic fuera de la caja
  modalDetalles?.addEventListener("click", (e) => {
    if (e.target === modalDetalles) toggleModalDetalles(false);
  });

  // 4. CARGAR Y RENDERIZAR PEDIDOS
  async function cargarMisPedidos() {
    try {
      contenedorPedidos.innerHTML = `<div class="col-span-full text-center text-stone-400 py-10"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><p>Cargando tus pedidos...</p></div>`;

      const response = await fetch(
        `http://localhost:8080/pedido/usuario/mis-pedidos`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error("No se pudieron cargar los pedidos.");

      // Guardamos la respuesta en la variable global
      misPedidosGlobal = await response.json();
      contenedorPedidos.innerHTML = "";

      if (!misPedidosGlobal || misPedidosGlobal.length === 0) {
        contenedorPedidos.innerHTML = `<div class="col-span-full text-center text-stone-400 py-10">Aún no has realizado ningún pedido.</div>`;
        return;
      }

      // Inyectamos las tarjetas
      misPedidosGlobal.forEach((pedido) => {
        const totalFormateado = Number(pedido.total || 0).toFixed(2);
        const estado = pedido.estadopedido || "PENDIENTE";
        const fecha = pedido.fechacreacion
          ? new Date(pedido.fechacreacion).toLocaleDateString()
          : "Reciente";
        const mesaStr = pedido.mesa
          ? `Mesa ${pedido.mesa.nombre}`
          : "Para llevar";

        const tarjetaHTML = `
            <article class="bg-[#3d2a21]/60 border border-[#543d32] rounded-[1.8rem] p-5 shadow-xl flex flex-col justify-between hover:border-[#f5be38]/30 transition-all">
                <div>
                    <div class="flex justify-between items-start border-b border-stone-800 pb-2 mb-3">
                        <div>
                            <h2 class="font-serif font-bold text-white tracking-wide text-sm uppercase">Pedido #${pedido.id}</h2>
                            <p class="text-[9px] text-stone-500 font-mono mt-0.5">${mesaStr} | ${fecha}</p>
                        </div>
                        <div class="relative">
                            <span class="bg-[#2a1a14] ${estado === "ENTREGADO" ? "text-green-400 border-green-500/30" : "text-amber-500 border-amber-500/30"} font-bold text-[10px] tracking-wider px-2 py-1 rounded-md border uppercase">
                                ${estado.replace("_", " ")}
                            </span>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2 bg-[#2a1a14]/40 p-2.5 rounded-xl text-xs mb-4 border border-stone-800/40">
                        <div><span class="text-[9px] font-bold text-stone-500 block uppercase">Servicio</span><span class="font-medium text-stone-300">${pedido.tiposervicio || "BOLETA"}</span></div>
                        <div class="text-right"><span class="text-[9px] font-bold text-stone-500 block uppercase">Total</span><span class="font-mono text-[#f5be38] font-bold">S/. ${totalFormateado}</span></div>
                    </div>
                </div>
                <!-- NUEVO BOTÓN PARA VER DETALLES -->
                <div class="mt-1 pt-3 border-t border-stone-800/60">
                    <button class="btn-ver-detalles w-full py-2 bg-[#2a1a14] hover:bg-[#e07a48] text-stone-400 hover:text-white border border-stone-700 hover:border-[#e07a48] transition-colors rounded-xl text-xs font-bold uppercase cursor-pointer" data-id="${pedido.id}">
                        <i class="fa-solid fa-eye mr-1"></i> Ver Detalles
                    </button>
                </div>
            </article>
          `;
        contenedorPedidos.insertAdjacentHTML("beforeend", tarjetaHTML);
      });
    } catch (error) {
      console.error(error);
      contenedorPedidos.innerHTML = `<div class="col-span-full text-center text-red-400 py-10">Hubo un error al cargar tus pedidos.</div>`;
    }
  }

  // 5. DELEGACIÓN DE EVENTOS: CLIC EN "VER DETALLES"
  // Usamos el contenedor padre para escuchar todos los botones a la vez
  contenedorPedidos.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-ver-detalles");
    if (btn) {
      const idPedido = parseInt(btn.getAttribute("data-id"));
      pintarDetalles(idPedido);
    }
  });

  // 6. FUNCIÓN QUE CONSTRUYE EL TICKET DENTRO DEL MODAL
  function pintarDetalles(id) {
    // 6.1 Buscar el pedido específico en nuestra memoria
    const pedido = misPedidosGlobal.find((p) => p.id === id);
    if (!pedido) return;

    // 6.2 Llenar cabecera y total
    document.getElementById("detPedidoId").textContent = pedido.id;
    document.getElementById("detPedidoTotal").textContent = Number(
      pedido.total || 0,
    ).toFixed(2);

    // 6.3 Llenar la lista de productos
    const lista = document.getElementById("listaDetalles");
    lista.innerHTML = "";

    if (pedido.detalles && pedido.detalles.length > 0) {
      pedido.detalles.forEach((det) => {
        const nombreProducto = det.producto
          ? det.producto.nombreproducto
          : "Producto sin identificar";
        const precio = Number(det.precioUnitario || 0).toFixed(2);
        const subtotal = Number(det.subtotal || 0).toFixed(2);
        const estadoItem = det.estadoItem || "EN_PREPARACION";

        // Lógica de colores según el estado que envía Java
        let colorEstado = "text-amber-500";
        if (estadoItem === "LISTO") colorEstado = "text-lime-400";
        if (estadoItem === "ENTREGADO") colorEstado = "text-green-400";
        if (estadoItem === "CANCELADO") colorEstado = "text-red-500";

        lista.innerHTML += `
                  <div class="flex justify-between items-center bg-[#2a1a14]/60 border border-stone-800 p-3 rounded-xl mb-2 hover:border-[#f5be38]/30 transition-colors">
                      <div>
                          <h4 class="text-stone-200 font-bold text-sm">${nombreProducto}</h4>
                          <div class="text-[10px] font-mono text-stone-500 mt-1">
                              Cant: ${det.cantidad} <span class="mx-1 text-stone-700">x</span> S/. ${precio}
                          </div>
                      </div>
                      <div class="text-right">
                          <span class="block font-mono font-bold text-[#f5be38] text-sm mb-0.5">S/. ${subtotal}</span>
                          <span class="text-[9px] font-bold tracking-wider ${colorEstado}">${estadoItem.replace("_", " ")}</span>
                      </div>
                  </div>
              `;
      });
    } else {
      lista.innerHTML =
        '<p class="text-center text-stone-500 text-xs py-4">No hay productos registrados en este pedido.</p>';
    }

    // 6.4 Abrir Modal
    toggleModalDetalles(true);
  }

  

  // ARRANQUE INICIAL
  cargarMisPedidos();
})();
