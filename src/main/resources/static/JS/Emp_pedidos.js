(function () {
  const token =
    localStorage.getItem("token") || localStorage.getItem("tu_token_jwt");
  const contenedorPedidos = document.getElementById("contenedorPedidos");

  // Elementos de las pestañas
  const btnTabActivos = document.getElementById("tabActivos");
  const btnTabHistorial = document.getElementById("tabHistorial");

  // Variables de estado
  let todosLosPedidos = [];
  let vistaActual = "ACTIVOS"; // Puede ser 'ACTIVOS' o 'HISTORIAL'

  if (!token) {
    window.location.href = "Index.html";
    return;
  }

  // --- 1. LÓGICA DE TABS ---
  function cambiarTab(nuevaVista) {
    vistaActual = nuevaVista;

    if (vistaActual === "ACTIVOS") {
      // Estilos Activo
      btnTabActivos.className =
        "tab-btn flex items-center gap-2 font-bold text-[#e07a48] border-b-2 border-[#e07a48] pb-3 -mb-[14px] cursor-pointer";
      // Estilos Inactivo
      btnTabHistorial.className =
        "tab-btn flex items-center gap-2 font-medium text-stone-500 hover:text-stone-300 pb-3 -mb-[14px] transition-colors cursor-pointer";
    } else {
      // Estilos Inactivo
      btnTabActivos.className =
        "tab-btn flex items-center gap-2 font-medium text-stone-500 hover:text-stone-300 pb-3 -mb-[14px] transition-colors cursor-pointer";
      // Estilos Activo
      btnTabHistorial.className =
        "tab-btn flex items-center gap-2 font-bold text-[#e07a48] border-b-2 border-[#e07a48] pb-3 -mb-[14px] cursor-pointer";
    }

    renderizarPedidos();
  }

  btnTabActivos.addEventListener("click", () => cambiarTab("ACTIVOS"));
  btnTabHistorial.addEventListener("click", () => cambiarTab("HISTORIAL"));

  // --- 2. OBTENER PEDIDOS DESDE EL API ---
  async function cargarMisPedidos() {
    try {
      contenedorPedidos.innerHTML = `<div class="col-span-full text-center text-stone-400 py-10"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><p>Cargando tus pedidos...</p></div>`;

      const urlBackend = `http://localhost:8080/pedido/usuario/mis-pedidos`;
      const response = await fetch(urlBackend, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("No se pudieron cargar los pedidos.");

      todosLosPedidos = await response.json();

      // Ordenar por ID descendente (los más nuevos primero)
      todosLosPedidos.sort((a, b) => b.id - a.id);

      renderizarPedidos();
    } catch (error) {
      console.error("Error cargando pedidos:", error);
      contenedorPedidos.innerHTML = `<div class="col-span-full text-center text-red-400 py-10">Hubo un error al cargar tus pedidos.</div>`;
    }
  }

  // --- 3. RENDERIZAR PEDIDOS SEGÚN EL TAB ---
  function renderizarPedidos() {
    contenedorPedidos.innerHTML = "";

    // Filtrar según la pestaña activa
    const pedidosFiltrados = todosLosPedidos.filter((pedido) => {
      const estado = pedido.estadopedido || "PENDIENTE"; // Usamos estadopedido que es el nombre de tu BD
      const esFinalizado = estado === "PAGADO" || estado === "CANCELADO";

      if (vistaActual === "ACTIVOS") return !esFinalizado;
      if (vistaActual === "HISTORIAL") return esFinalizado;
    });

    if (pedidosFiltrados.length === 0) {
      contenedorPedidos.innerHTML = `<div class="col-span-full text-center text-stone-400 py-10">No hay pedidos en esta sección.</div>`;
      return;
    }

    pedidosFiltrados.forEach((pedido) => {
      const totalFormateado = Number(pedido.total || 0).toFixed(2);
      const estado = pedido.estadopedido || "PENDIENTE";
      const fecha = pedido.fechacreacion
        ? new Date(pedido.fechacreacion).toLocaleDateString()
        : "Reciente";
      const mesaStr = pedido.mesa
        ? `Mesa ${pedido.mesa.nombre}`
        : "Para llevar";
      const tipoRecibo = pedido.tiporecibo || "BOLETA";

      // Colores dinámicos del estado
      let colorEstado = "text-amber-500 border-amber-500/30";
      if (estado === "ENTREGADO")
        colorEstado = "text-green-400 border-green-500/30";
      if (estado === "PAGADO") colorEstado = "text-blue-400 border-blue-500/30";
      if (estado === "CANCELADO")
        colorEstado = "text-red-400 border-red-500/30";

      // Botón de Añadir Productos (Solo aparece en ACTIVOS)
      let btnAccion = "";
      if (vistaActual === "ACTIVOS") {
        // LA MAGIA DE LA URL:
        // Le enviamos a NuevaOrden el parámetro &action=add para decirle:
        // "Oye, no crees un pedido nuevo, búscalo y añádele cosas".
        const urlRedireccion = pedido.mesa
          ? `NuevaOrden.html?mesa=${pedido.mesa.id}&action=add`
          : `NuevaOrden.html?pedido=${pedido.id}&action=add`; // (Por si en el futuro tienes para llevar)

        btnAccion = `
          <div class="pt-3 border-t border-stone-800">
              <button onclick="window.location.href='${urlRedireccion}'" class="w-full bg-[#3d2a21] hover:bg-stone-700 text-[#f5be38] border border-[#f5be38]/30 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
                  <i class="fa-solid fa-cart-plus"></i> AÑADIR PRODUCTOS
              </button>
          </div>
        `;
      }

      const tarjetaHTML = `
                <article class="bg-[#3d2a21]/60 border border-[#543d32] rounded-[1.8rem] p-5 shadow-xl flex flex-col justify-between hover:border-[#f5be38]/30 transition-all" data-id-pedido="${pedido.id}">
                    <div>
                        <div class="flex justify-between items-start border-b border-stone-800 pb-2 mb-3">
                            <div>
                                <h2 class="font-serif font-bold text-white tracking-wide text-sm uppercase">Pedido #${pedido.id}</h2>
                                <p class="text-[9px] text-stone-500 font-mono mt-0.5">${mesaStr} | ${fecha}</p>
                            </div>
                            <div class="relative">
                                <span class="bg-[#2a1a14] ${colorEstado} font-bold text-[10px] tracking-wider px-2 py-1 rounded-md border uppercase">
                                    ${estado.replace("_", " ")}
                                </span>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-2 bg-[#2a1a14]/40 p-2.5 rounded-xl text-xs mb-3 border border-stone-800/40">
                            <div><span class="text-[9px] font-bold text-stone-500 block uppercase">Servicio</span><span class="font-medium text-stone-300">${tipoRecibo}</span></div>
                            <div class="text-right"><span class="text-[9px] font-bold text-stone-500 block uppercase">Total</span><span class="font-mono text-[#f5be38] font-bold">S/. ${totalFormateado}</span></div>
                        </div>
                    </div>
                    ${btnAccion}
                </article>
            `;
      contenedorPedidos.insertAdjacentHTML("beforeend", tarjetaHTML);
    });
  }

  // --- 4. LOGOUT ---
  document.getElementById("navBtnLogout")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "Index.html";
  });

  // Iniciar
  cargarMisPedidos();
})();
