(function () {
  // =====================================================================
  // CONFIGURACIÓN Y ESTADO GLOBAL
  // =====================================================================
  const API_MESAS = "/mesa";
  const API_PEDIDOS = "/pedido";
  const API_PERFIL = "/usuario/mi-perfil";

  let mesasGlobales = [];

  function getHeaders() {
    const token =
      localStorage.getItem("token") || localStorage.getItem("tu_token_jwt");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  }

  // =====================================================================
  // 1. CARGAR DATOS DEL USUARIO (NAVBAR)
  // =====================================================================
  async function cargarUsuario() {
    try {
      const res = await fetch(API_PERFIL, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        document.getElementById("nombreAdmin").textContent =
          data.nombreCompleto || data.username || "Mozo";
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error);
    }
  }

  // =====================================================================
  // 2. OBTENER Y RENDERIZAR MESAS
  // =====================================================================
  async function cargarMesas() {
    try {
      const response = await fetch(API_MESAS, { headers: getHeaders() });
      if (!response.ok) throw new Error("Fallo al obtener las mesas");
      mesasGlobales = await response.json();

      const libres = mesasGlobales.filter(
        (m) => m.estado && m.estado.toUpperCase() === "LIBRE",
      ).length;
      const ocupadas = mesasGlobales.filter(
        (m) =>
          m.estado &&
          (m.estado.toUpperCase() === "OCUPADO" ||
            m.estado.toUpperCase() === "OCUPADA"),
      ).length;

      document.getElementById("countLibres").textContent = libres;
      document.getElementById("countOcupadas").textContent = ocupadas;

      // =====================================================================
      // 🚀 NUEVO: OBTENER EL USUARIO DEL PEDIDO ACTIVO PARA CADA MESA OCUPADA
      // =====================================================================
      const promesasPedidos = mesasGlobales.map(async (mesa) => {
        const estadoUpper = mesa.estado ? mesa.estado.toUpperCase() : "LIBRE";
        if (estadoUpper === "OCUPADO" || estadoUpper === "OCUPADA") {
          try {
            const resPedido = await fetch(
              `${API_PEDIDOS}/mesa/${mesa.id}/activo`,
              {
                headers: getHeaders(),
              },
            );
            if (resPedido.ok) {
              const pedidoActivo = await resPedido.json();
              // Extraemos el nombre del usuario que registró el pedido
              if (pedidoActivo.usuario) {
                mesa.nombreCliente =
                  pedidoActivo.usuario.nombreCompleto ||
                  pedidoActivo.usuario.username;
              }
            }
          } catch (e) {
            console.log(`No se pudo obtener el pedido de la mesa ${mesa.id}`);
          }
        }
      });

      // Esperamos a que todas las consultas terminen antes de dibujar las tarjetas
      await Promise.all(promesasPedidos);

      renderizarMesas();
    } catch (error) {
      document.getElementById("gridMesas").innerHTML =
        `<p class="text-red-400 col-span-full text-center">Error al cargar las mesas.</p>`;
      console.error(error);
    }
  }

  function renderizarMesas() {
    const contenedor = document.getElementById("gridMesas");
    contenedor.innerHTML = "";

    if (mesasGlobales.length === 0) {
      contenedor.innerHTML = `<p class="text-stone-500 col-span-full text-center py-10">No hay mesas configuradas en el sistema.</p>`;
      return;
    }

    mesasGlobales.forEach((mesa) => {
      const estadoUpper = mesa.estado ? mesa.estado.toUpperCase() : "LIBRE";
      const esOcupada = estadoUpper === "OCUPADO" || estadoUpper === "OCUPADA";

      const colorEstado = esOcupada
        ? "text-red-400 bg-red-400/10 border-red-400/20"
        : "text-green-400 bg-green-400/10 border-green-400/20";

      let subtextoMesa = "";
      if (esOcupada) {
        // Ahora sí tomará el nombre que acabamos de inyectar en la función de arriba
        const nombreCliente = mesa.nombreCliente || "Orden en curso";
        subtextoMesa = `<i class="fa-solid fa-user text-stone-500 mr-1"></i> ${nombreCliente}`;
      } else {
        subtextoMesa = `<span class="text-stone-500">Disponible</span>`;
      }

      let actionButtons = "";

      if (esOcupada) {
        actionButtons = `
                    <div class="flex gap-2 justify-end w-full">
                        <button onclick="verDetallesMesa(${mesa.id})" title="Ver Detalles" class="flex-1 sm:flex-none w-9 h-9 rounded-xl bg-[#1c0e0a] border border-stone-700 text-stone-400 hover:text-white hover:border-stone-500 flex items-center justify-center transition-colors cursor-pointer">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button onclick="abrirModalTransferencia(${mesa.id})" title="Transferir Mesa" class="flex-1 sm:flex-none w-9 h-9 rounded-xl bg-[#1c0e0a] border border-stone-700 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500 flex items-center justify-center transition-colors cursor-pointer">
                            <i class="fa-solid fa-right-left"></i>
                        </button>
                        <button onclick="cancelarPedidoMesa(${mesa.id})" title="Cancelar Pedido" class="flex-1 sm:flex-none w-9 h-9 rounded-xl bg-[#1c0e0a] border border-stone-700 text-red-500 hover:bg-red-500/10 hover:border-red-500 flex items-center justify-center transition-colors cursor-pointer">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                        <button onclick="agregarProductos(${mesa.id})" title="Agregar al Pedido" class="flex-1 sm:flex-none w-10 h-10 -mt-0.5 rounded-xl bg-[#e07a48] shadow-md hover:bg-[#cf6937] text-white flex items-center justify-center transition-colors cursor-pointer">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                `;
      } else {
        actionButtons = `
                    <button onclick="abrirNuevaMesa(${mesa.id})" class="w-full bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold py-2 rounded-xl border border-stone-700 transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs">
                        <i class="fa-solid fa-utensils"></i> ABRIR MESA
                    </button>
                `;
      }

      const card = document.createElement("article");
      card.className =
        "bg-[#2a1a14]/60 border border-stone-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-[#543d32] transition-colors h-full";

      card.innerHTML = `
                <div class="mb-4">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <h3 class="font-bold text-white text-lg">Mesa ${mesa.id}</h3>
                            <p class="text-xs text-stone-400 mt-0.5">${subtextoMesa}</p>
                        </div>
                        <span class="border px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${colorEstado}">
                            ${estadoUpper}
                        </span>
                    </div>
                </div>

                <div class="border-t border-stone-800 pt-4 mt-auto">
                    ${actionButtons}
                </div>
            `;

      contenedor.appendChild(card);
    });
  }

  // =====================================================================
  // 3. ACCIONES DE LAS MESAS (Navegación y Vistas)
  // =====================================================================
  window.abrirNuevaMesa = function (idMesa) {
    window.location.href = `NuevaOrden.html?mesa=${idMesa}`;
  };

  window.agregarProductos = function (idMesa) {
    window.location.href = `NuevaOrden.html?mesa=${idMesa}&action=add`;
  };

  window.verDetallesMesa = async function (idMesa) {
    try {
      const response = await fetch(`${API_PEDIDOS}/mesa/${idMesa}/activo`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error("No se pudo cargar el pedido");

      const pedido = await response.json();
      const modalContent = document.getElementById("modalContent");
      document.getElementById("modalTitle").textContent =
        `Detalles - Mesa ${idMesa}`;

      let htmlProductos = `<ul class="space-y-2 mb-4">`;
      pedido.detalles.forEach((d) => {
        htmlProductos += `
                    <li class="flex justify-between border-b border-stone-700/50 pb-1">
                        <span>${d.cantidad}x ${d.producto.nombreproducto}</span>
                        <span class="text-[#f5be38]">S/ ${d.subtotal.toFixed(2)}</span>
                    </li>
                `;
      });
      htmlProductos += `</ul>`;
      htmlProductos += `<div class="text-right text-lg font-bold text-white">Total: S/ ${pedido.total.toFixed(2)}</div>`;

      modalContent.innerHTML = htmlProductos;
      document.getElementById("detalleModal").classList.remove("hidden");
    } catch (error) {
      alert("No se pudieron cargar los detalles: " + error.message);
    }
  };

  // =====================================================================
  // 4. ACCIONES AVANZADAS: CANCELAR Y TRANSFERIR
  // =====================================================================
  window.cancelarPedidoMesa = async function (idMesa) {
    const motivo = prompt(
      `⚠️ Estás a punto de cancelar la orden de la Mesa ${idMesa}.\n\nPara cumplir con la auditoría, por favor ingresa el motivo de la anulación:`,
    );

    if (motivo === null) return;
    if (motivo.trim() === "") {
      return alert("Error: El motivo de anulación es obligatorio.");
    }

    try {
      const resPedido = await fetch(`${API_PEDIDOS}/mesa/${idMesa}/activo`, {
        headers: getHeaders(),
      });
      if (!resPedido.ok)
        throw new Error("No se pudo encontrar una orden activa en esta mesa.");
      const pedidoActivo = await resPedido.json();

      const resCancelar = await fetch(
        `${API_PEDIDOS}/${pedidoActivo.id}/cancelar`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({ motivo: motivo }),
        },
      );

      if (!resCancelar.ok) {
        const errorData = await resCancelar.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            errorData["Debe insertar un motivo"] ||
            "No se pudo cancelar el pedido.",
        );
      }

      alert(`El pedido #${pedidoActivo.id} ha sido cancelado exitosamente.`);
      cargarMesas();
    } catch (error) {
      alert(error.message);
    }
  };

  window.abrirModalTransferencia = function (idMesaOrigen) {
    document.getElementById("lblMesaOrigen").textContent =
      `Mesa ${idMesaOrigen}`;
    const selectDestino = document.getElementById("selectMesaDestino");

    const mesasLibres = mesasGlobales.filter(
      (m) => m.estado && m.estado.toUpperCase() === "LIBRE",
    );

    selectDestino.innerHTML =
      mesasLibres.length > 0
        ? mesasLibres
            .map((m) => `<option value="${m.id}">Mesa ${m.id}</option>`)
            .join("")
        : `<option value="">No hay mesas libres disponibles</option>`;

    document.getElementById("transferModal").classList.remove("hidden");

    document.getElementById("btnConfirmarTransferencia").onclick = function () {
      ejecutarTransferencia(idMesaOrigen, selectDestino.value);
    };
  };

  async function ejecutarTransferencia(idOrigen, idDestino) {
    if (!idDestino)
      return alert("Por favor, selecciona una mesa de destino válida.");

    const btnConfirmar = document.getElementById("btnConfirmarTransferencia");
    btnConfirmar.innerHTML = "Procesando...";
    btnConfirmar.disabled = true;

    try {
      const res = await fetch(
        `${API_PEDIDOS}/transferir/${idOrigen}/${idDestino}`,
        {
          method: "PUT",
          headers: getHeaders(),
        },
      );

      if (!res.ok)
        throw new Error("Error al procesar la transferencia en el servidor.");

      alert(`Pedido transferido con éxito a la Mesa ${idDestino}`);
      document.getElementById("transferModal").classList.add("hidden");
      cargarMesas();
    } catch (error) {
      alert("Error al transferir: " + error.message);
    } finally {
      btnConfirmar.innerHTML = "CONFIRMAR";
      btnConfirmar.disabled = false;
    }
  }

  // =====================================================================
  // INICIALIZADOR
  // =====================================================================
  async function inicializar() {
    await cargarUsuario();
    await cargarMesas();
    setInterval(cargarMesas, 15000);
  }

  inicializar();
})();
