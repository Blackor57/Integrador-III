(function () {
  // 1. UTILIDADES Y GLOBALES
  const token = localStorage.getItem("token");
  let misPedidosGlobal = [];

  // Redirigir si no hay token
  if (!token) {
    window.location.href = "Index.html";
    return;
  }

  // 2. ELEMENTOS DEL DOM
  const contenedorPedidos = document.getElementById("contenedorPedidos");

  // Modal de Detalles
  const modalDetalles = document.getElementById("modalDetalles");
  const btnCloseDetalles = document.getElementById("btnCloseDetalles");

  // Pestañas
  const btnTabActivos = document.getElementById("btnTabActivos");
  const btnTabHistorial = document.getElementById("btnTabHistorial");
  let tabActual = "ACTIVOS";

  // 3. LÓGICA DEL MODAL DE DETALLES
  const toggleModalDetalles = (show) =>
    modalDetalles?.classList.toggle("hidden", !show);
  btnCloseDetalles?.addEventListener("click", () => toggleModalDetalles(false));

  modalDetalles?.addEventListener("click", (e) => {
    if (e.target === modalDetalles) toggleModalDetalles(false);
  });

  // 4. CARGAR PEDIDOS (Petición al Backend)
  async function cargarMisPedidos() {
    try {
      contenedorPedidos.innerHTML = `<div class="col-span-full text-center text-stone-400 py-10"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><p>Cargando tus pedidos...</p></div>`;

      const response = await fetch(
        `/pedido/usuario/mis-pedidos`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error("No se pudieron cargar los pedidos.");

      misPedidosGlobal = await response.json();
      console.log("👉 DATOS RECIBIDOS DEL BACKEND:", misPedidosGlobal);

      if (
        !misPedidosGlobal ||
        !Array.isArray(misPedidosGlobal) ||
        misPedidosGlobal.length === 0
      ) {
        contenedorPedidos.innerHTML = `<div class="col-span-full text-center text-stone-400 py-10">Aún no has realizado ningún pedido.</div>`;
        return;
      }

      renderizarPedidos();
    } catch (error) {
      console.error("Error en cargarMisPedidos:", error);
      contenedorPedidos.innerHTML = `<div class="col-span-full text-center text-red-400 py-10">Hubo un error al cargar tus pedidos. Revisa la consola (F12).</div>`;
    }
  }

  // 5. FUNCIÓN QUE DIBUJA SEGÚN LA PESTAÑA
  function renderizarPedidos() {
    contenedorPedidos.innerHTML = "";

    const pedidosFiltrados = misPedidosGlobal.filter((pedido) => {
      const estadoReal =
        pedido.estadopedido ||
        pedido.estadoPedido ||
        pedido.estado ||
        "PENDIENTE";
      const estadoEnMayusculas = estadoReal.toUpperCase();
      const esCerrado =
        estadoEnMayusculas === "PAGADO" || estadoEnMayusculas === "CANCELADO";

      return tabActual === "ACTIVOS" ? !esCerrado : esCerrado;
    });

    if (pedidosFiltrados.length === 0) {
      const mensaje =
        tabActual === "ACTIVOS"
          ? "No tienes pedidos activos en este momento."
          : "No hay registros en tu historial de pedidos.";
      contenedorPedidos.innerHTML = `<div class="col-span-full text-center text-stone-500 font-medium py-10">${mensaje}</div>`;
      return;
    }

    pedidosFiltrados.forEach((pedido) => {
      const totalFormateado = Number(pedido.total || 0).toFixed(2);
      const estado = (
        pedido.estadopedido ||
        pedido.estadoPedido ||
        pedido.estado ||
        "PENDIENTE"
      ).toUpperCase();
      const fecha = pedido.fechacreacion
        ? new Date(pedido.fechacreacion).toLocaleDateString()
        : "Reciente";
      const mesaStr = pedido.mesa
        ? `Mesa ${pedido.mesa.nombre || pedido.mesa.id}`
        : "Para llevar";

      let colorEstado = "text-amber-500 border-amber-500/30";
      if (estado === "ENTREGADO" || estado === "PAGADO")
        colorEstado = "text-green-400 border-green-500/30";
      if (estado === "CANCELADO")
        colorEstado = "text-red-500 border-red-500/30";

      const tarjetaHTML = `
            <article class="bg-[#3d2a21]/60 border border-[#543d32] rounded-[1.8rem] p-5 shadow-xl flex flex-col justify-between hover:border-[#f5be38]/30 transition-all">
                <div>
                    <div class="flex justify-between items-start border-b border-stone-800 pb-2 mb-3">
                        <div>
                            <h2 class="font-serif font-bold text-white tracking-wide text-sm uppercase">Pedido #${pedido.id}</h2>
                            <p class="text-[9px] text-stone-500 font-mono mt-0.5">${mesaStr} | ${fecha}</p>
                        </div>
                        <div class="relative">
                            <span class="bg-[#2a1a14] ${colorEstado} font-bold text-[10px] tracking-wider px-2 py-1 rounded-md border uppercase">
                                ${estado.replace(/_/g, " ")}
                            </span>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2 bg-[#2a1a14]/40 p-2.5 rounded-xl text-xs mb-4 border border-stone-800/40">
                        <div><span class="text-[9px] font-bold text-stone-500 block uppercase">Servicio</span><span class="font-medium text-stone-300">${pedido.tiposervicio || "BOLETA"}</span></div>
                        <div class="text-right"><span class="text-[9px] font-bold text-stone-500 block uppercase">Total</span><span class="font-mono text-[#f5be38] font-bold">S/. ${totalFormateado}</span></div>
                    </div>
                </div>
                <div class="mt-1 pt-3 border-t border-stone-800/60">
                    <button class="btn-ver-detalles w-full py-2 bg-[#2a1a14] hover:bg-[#e07a48] text-stone-400 hover:text-white border border-stone-700 hover:border-[#e07a48] transition-colors rounded-xl text-xs font-bold uppercase cursor-pointer" data-id="${pedido.id}">
                        <i class="fa-solid fa-eye mr-1"></i> Ver Detalles
                    </button>
                </div>
            </article>
          `;
      contenedorPedidos.insertAdjacentHTML("beforeend", tarjetaHTML);
    });
  }

  // 6. EVENTOS DE PESTAÑAS
  btnTabActivos?.addEventListener("click", () => {
    tabActual = "ACTIVOS";
    if (btnTabActivos && btnTabHistorial) {
      btnTabActivos.className =
        "flex items-center gap-2 font-bold text-[#e07a48] border-b-2 border-[#e07a48] pb-3 -mb-[14px] cursor-pointer transition-all";
      btnTabHistorial.className =
        "flex items-center gap-2 font-medium text-stone-500 hover:text-stone-300 border-b-2 border-transparent pb-3 -mb-[14px] transition-all cursor-pointer";
    }
    renderizarPedidos();
  });

  btnTabHistorial?.addEventListener("click", () => {
    tabActual = "HISTORIAL";
    if (btnTabActivos && btnTabHistorial) {
      btnTabHistorial.className =
        "flex items-center gap-2 font-bold text-[#e07a48] border-b-2 border-[#e07a48] pb-3 -mb-[14px] cursor-pointer transition-all";
      btnTabActivos.className =
        "flex items-center gap-2 font-medium text-stone-500 hover:text-stone-300 border-b-2 border-transparent pb-3 -mb-[14px] transition-all cursor-pointer";
    }
    renderizarPedidos();
  });

  // 7. EVENTO BOTÓN "VER DETALLES"
  contenedorPedidos.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-ver-detalles");
    if (btn) {
      const idPedido = parseInt(btn.getAttribute("data-id"));
      pintarDetalles(idPedido);
    }
  });

  function pintarDetalles(id) {
    const pedido = misPedidosGlobal.find((p) => p.id === id);
    if (!pedido) return;

    document.getElementById("detPedidoId").textContent = pedido.id;
    document.getElementById("detPedidoTotal").textContent = Number(
      pedido.total || 0,
    ).toFixed(2);

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
                          <span class="text-[9px] font-bold tracking-wider ${colorEstado}">${estadoItem.replace(/_/g, " ")}</span>
                      </div>
                  </div>
              `;
      });
    } else {
      lista.innerHTML =
        '<p class="text-center text-stone-500 text-xs py-4">No hay productos registrados en este pedido.</p>';
    }

    toggleModalDetalles(true);
  }

  // 8. LOGOUT (Comentado si usas LogOut.js externo, pero útil por si acaso)
  document.getElementById("navBtnLogout")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "Index.html"; // Asegúrate que esta ruta es tu login real (Index.html / login.html)
  });

  // ARRANQUE INICIAL
  cargarMisPedidos();
})();
