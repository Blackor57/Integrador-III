(function () {
  // =====================================================================
  // CONFIGURACIÓN Y ESTADO GLOBAL
  // =====================================================================
  const API_PEDIDOS = "/pedido";
  const API_RECIBO = "/recibo/pedido"; // Tu nueva ruta
  const API_PERFIL = "/usuario/mi-perfil";

  let pedidosGlobales = [];
  let pestanaActual = "ACTIVOS"; // Puede ser: ACTIVOS, POR_PAGAR, HISTORIAL

  function getHeaders() {
    const token =
      localStorage.getItem("token") || localStorage.getItem("tu_token_jwt");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  }

  // =====================================================================
  // 1. CARGAR DATOS DEL USUARIO (CAJERO)
  // =====================================================================
  async function cargarUsuario() {
    try {
      const res = await fetch(API_PERFIL, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        document.getElementById("nombreAdmin").textContent =
          data.nombreCompleto || data.username || "Cajero";
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error);
    }
  }

  // =====================================================================
  // 2. GESTIÓN DE PESTAÑAS (TABS)
  // =====================================================================
  const btnActivos = document.getElementById("tabActivos");
  const btnPorPagar = document.getElementById("tabPorPagar");
  const btnHistorial = document.getElementById("tabHistorial");

  function activarTab(tabSeleccionado, nombreTab) {
    pestanaActual = nombreTab;

    // Resetear estilos de todos los botones
    [btnActivos, btnPorPagar, btnHistorial].forEach((btn) => {
      btn.className =
        "tab-btn flex items-center gap-2 font-medium text-stone-500 hover:text-stone-300 pb-3 -mb-[14px] transition-colors cursor-pointer whitespace-nowrap";
    });

    // Aplicar estilo activo al seleccionado
    tabSeleccionado.className =
      "tab-btn flex items-center gap-2 font-bold text-[#e07a48] border-b-2 border-[#e07a48] pb-3 -mb-[14px] cursor-pointer whitespace-nowrap";

    renderizarPedidos();
  }

  btnActivos.addEventListener("click", () => activarTab(btnActivos, "ACTIVOS"));
  btnPorPagar.addEventListener("click", () =>
    activarTab(btnPorPagar, "POR_PAGAR"),
  );
  btnHistorial.addEventListener("click", () =>
    activarTab(btnHistorial, "HISTORIAL"),
  );

  // =====================================================================
  // 3. OBTENER Y RENDERIZAR PEDIDOS
  // =====================================================================
  async function cargarPedidos() {
    try {
      const response = await fetch(API_PEDIDOS, { headers: getHeaders() });
      if (!response.ok) throw new Error("Fallo al obtener pedidos");
      pedidosGlobales = await response.json();

      // Ordenar por fecha (los más nuevos primero)
      pedidosGlobales.sort((a, b) => b.id - a.id);

      renderizarPedidos();
    } catch (error) {
      document.getElementById("contenedorPedidos").innerHTML =
        `<p class="text-red-400 col-span-full text-center">Error al cargar las órdenes.</p>`;
    }
  }

  function renderizarPedidos() {
    const contenedor = document.getElementById("contenedorPedidos");
    contenedor.innerHTML = "";

    // FILTRAMOS SEGÚN LA PESTAÑA SELECCIONADA
    const pedidosFiltrados = pedidosGlobales.filter((pedido) => {
      if (pestanaActual === "ACTIVOS") {
        return ["PENDIENTE", "EN_PREPARACION", "LISTO"].includes(
          pedido.estadopedido,
        );
      } else if (pestanaActual === "POR_PAGAR") {
        return pedido.estadopedido === "ENTREGADO"; // Lo que el cajero debe cobrar
      } else if (pestanaActual === "HISTORIAL") {
        return ["PAGADO", "CANCELADO"].includes(pedido.estadopedido);
      }
    });

    if (pedidosFiltrados.length === 0) {
      contenedor.innerHTML = `
                <div class="col-span-full flex flex-col items-center justify-center py-12 text-stone-500">
                    <i class="fa-solid fa-receipt text-4xl mb-3 opacity-50"></i>
                    <p>No hay pedidos en esta sección.</p>
                </div>`;
      return;
    }

    // DIBUJAR TARJETAS
    pedidosFiltrados.forEach((pedido) => {
      const esMesa =
        pedido.mesa && pedido.mesa.id
          ? `Mesa ${pedido.mesa.id}`
          : "Para Llevar";

      // 🚀 NUEVO: Extraemos el nombre del usuario que registró el pedido
      const nombreMozo = pedido.usuario
        ? pedido.usuario.nombreCompleto || pedido.usuario.username
        : "Sistema";

      // Colores por estado
      let colorEstado = "text-stone-400 bg-stone-800";
      if (pedido.estadopedido === "PENDIENTE")
        colorEstado = "text-amber-400 bg-amber-400/10 border-amber-400/20";
      else if (pedido.estadopedido === "ENTREGADO")
        colorEstado = "text-blue-400 bg-blue-400/10 border-blue-400/20";
      else if (pedido.estadopedido === "PAGADO")
        colorEstado = "text-green-400 bg-green-400/10 border-green-400/20";
      else if (pedido.estadopedido === "CANCELADO")
        colorEstado = "text-red-400 bg-red-400/10 border-red-400/20"; // Agregado para historial

      // Renderizar la lista de platos
      const listaPlatos = pedido.detalles
        .map(
          (d) =>
            `<li class="flex justify-between text-xs text-stone-400 font-mono">
                    <span class="truncate pr-2">${d.cantidad}x ${d.producto.nombreproducto}</span>
                    <span class="shrink-0 text-stone-300">S/. ${(d.subtotal || 0).toFixed(2)}</span>
                </li>`,
        )
        .join("");

      // BOTÓN DE COBRO (Solo aparece si estamos en la pestaña Por Pagar)
      let botonCobro = "";
      if (pestanaActual === "POR_PAGAR") {
        botonCobro = `
                    <button onclick="procesarPago(${pedido.id}, ${pedido.total})" class="w-full mt-4 bg-[#e07a48] hover:bg-[#cf6937] text-white text-xs font-bold py-3 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer">
                        <i class="fa-solid fa-money-bill-wave"></i> COBRAR S/. ${(pedido.total || 0).toFixed(2)}
                    </button>
                `;
      }

      const card = document.createElement("article");
      card.className =
        "bg-[#2a1a14]/60 border border-stone-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-[#543d32] transition-colors";

      card.innerHTML = `
                <div>
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <h3 class="font-bold text-white text-lg">Orden #${pedido.id}</h3>
                            <p class="text-xs text-stone-400 mt-0.5"><i class="fa-solid fa-location-dot mr-1 text-stone-500"></i> ${esMesa}</p>
                            <p class="text-[10px] text-stone-500 font-mono mt-0.5"><i class="fa-solid fa-user-pen mr-1 text-stone-600"></i> ${nombreMozo}</p>
                        </div>
                        <span class="border px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${colorEstado}">
                            ${pedido.estadopedido}
                        </span>
                    </div>

                    <div class="border-y border-stone-800/80 py-3 my-3">
                        <ul class="space-y-1.5 mb-2">${listaPlatos}</ul>
                        ${pedido.notasespeciales ? `<p class="text-[10px] text-amber-500/80 bg-amber-500/10 p-1.5 rounded mt-2"><i class="fa-solid fa-triangle-exclamation mr-1"></i>${pedido.notasespeciales}</p>` : ""}
                    </div>
                </div>

                <div>
                    <div class="flex justify-between items-end">
                        <span class="text-xs text-stone-500 uppercase font-bold tracking-wider">Total</span>
                        <span class="text-xl font-black font-mono text-[#f5be38]">S/. ${(pedido.total || 0).toFixed(2)}</span>
                    </div>
                    ${botonCobro}
                </div>
            `;
      contenedor.appendChild(card);
    });
  }

  /// =====================================================================
  // 4. LÓGICA DEL MODAL Y PROCESAR EL PAGO
  // =====================================================================

  let pedidoIdPendiente = null;
  let totalPedidoPendiente = 0;

  // A. Mostrar el modal (esta función la llama el botón en el HTML dinámico)
  window.procesarPago = (id, total) => {
    pedidoIdPendiente = id;
    totalPedidoPendiente = total;

    // Limpiamos los inputs por si había algo escrito antes
    document.getElementById("dniCliente").value = "";
    document.getElementById("nombreCliente").value = "";
    document.getElementById("rucCliente").value = "";
    document.getElementById("razonSocial").value = "";
    document.getElementById("direccionCliente").value = "";

    // Mostramos el modal
    document.getElementById("modalPago").classList.remove("hidden");
  };

  // B. Cambiar entre Boleta y Factura
  const selectTipo = document.getElementById("selectTipoRecibo");
  selectTipo.addEventListener("change", (e) => {
    document
      .getElementById("camposBoleta")
      .classList.toggle("hidden", e.target.value === "FACTURA");
    document
      .getElementById("camposFactura")
      .classList.toggle("hidden", e.target.value === "BOLETA");
  });

  // C. Botón Cancelar
  document.getElementById("btnCancelarModal").addEventListener("click", () => {
    document.getElementById("modalPago").classList.add("hidden");
  });

  // D. Botón Confirmar Pago (El Fetch a tu Backend)
  document
    .getElementById("btnConfirmarPago")
    .addEventListener("click", async () => {
      const tipo = document.getElementById("selectTipoRecibo").value; // 'BOLETA' o 'FACTURA'

      // Cambiamos el texto del botón para que el usuario sepa que está cargando
      const btnConfirmar = document.getElementById("btnConfirmarPago");
      btnConfirmar.innerHTML = "Procesando...";
      btnConfirmar.disabled = true;

      // 1. Preparar el payload con los datos financieros
      const payload = {
        subtotal: totalPedidoPendiente / 1.18,
        IGV: totalPedidoPendiente - totalPedidoPendiente / 1.18,
        Total: totalPedidoPendiente,
      };

      // 2. Agregar los datos del cliente según el tipo
      if (tipo === "BOLETA") {
        payload.dni = document.getElementById("dniCliente").value;
        payload.nombre = document.getElementById("nombreCliente").value;
      } else {
        payload.RUC = document.getElementById("rucCliente").value;
        payload.razonsocial = document.getElementById("razonSocial").value;
        payload.direccion = document.getElementById("direccionCliente").value;
      }

      try {
        const res = await fetch(`${API_RECIBO}/${pedidoIdPendiente}`, {
          method: "POST",
          headers: getHeaders(), // Tus headers ya incluyen application/json
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Error al generar el comprobante");
        }

        alert("¡Pago registrado con éxito!");
        document.getElementById("modalPago").classList.add("hidden"); // Cierra el modal
        cargarPedidos(); // Refresca la tabla
      } catch (e) {
        alert("Error: " + e.message);
      } finally {
        // Devolver el botón a la normalidad
        btnConfirmar.innerHTML = "PAGAR AHORA";
        btnConfirmar.disabled = false;
      }
    });

  // =====================================================================
  // INICIALIZADOR
  // =====================================================================
  async function inicializar() {
    await cargarUsuario();
    await cargarPedidos();
    // Refresco automático cada 15 segundos:
    setInterval(cargarPedidos, 15000);
  }

  inicializar();
})();
