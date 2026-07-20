(function () {
        // --- 1. CONFIGURACIÓN Y GLOBALES ---
        // AHORA LLAMAMOS DIRECTO A PEDIDOS (No a detalles)
        const API_PEDIDOS = "/pedido";
        const API_CAMBIAR_ESTADO = "/pedido/detalle";
        const token = localStorage.getItem("token");

        if (!token) {
          window.location.href = "Index.html";
          return;
        }

        const getHeaders = () => ({
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        });

        const colEspera = document.getElementById("columnEnEspera");
        const colListo = document.getElementById("columnListo");
        const readyEmptyState = document.getElementById("readyEmptyState");

        // --- 2. CARGAR DATOS ---
        async function cargarTablero() {
          try {
            const res = await fetch(API_PEDIDOS, { headers: getHeaders() });
            if (!res.ok)
              throw new Error("Fallo al obtener datos de los pedidos");

            const pedidos = await res.json();
            procesarYRenderizar(pedidos);
          } catch (error) {
            console.error("Error cargando tablero:", error);
          }
        }

        function procesarYRenderizar(pedidos) {
          // 1. Limpiar columnas
          colEspera.innerHTML = "";
          if (document.getElementById("columnPreparando")) {
            document.getElementById("columnPreparando").innerHTML = "";
          }
          colListo.innerHTML = "";
          let countListo = 0;
          let countEspera = 0;

          // 2. Iterar los pedidos reales de Java
          pedidos.forEach((pedido) => {
            // Ignoramos pedidos ya finalizados
            if (
              pedido.estadopedido === "ENTREGADO" ||
              pedido.estadopedido === "CANCELADO" ||
              pedido.estadopedido === "PAGADO"
            )
              return;

            // Filtramos SOLO los detalles que pertenecen a la COCINA y que no estén entregados
            const itemsCocina = (pedido.detalles || []).filter(
              (det) =>
                det.area === "COCINA" &&
                det.estadoItem !== "ENTREGADO" &&
                det.estadoItem !== "CANCELADO",
            );

            // Si el pedido solo era de bebidas (no hay items de cocina), lo ignoramos
            if (itemsCocina.length === 0) return;

            // Determinar si el ticket está EN_PREPARACION o LISTO
            let estadoGlobal = "LISTO";
            itemsCocina.forEach((det) => {
              // Si hay al menos 1 plato pendiente o en preparación, todo se queda en preparación
              if (
                det.estadoItem === "EN_PREPARACION" ||
                det.estadoItem === "PENDIENTE"
              ) {
                estadoGlobal = "EN_PREPARACION";
              }
            });

            // Construimos la tarjeta
            const datosTarjeta = {
              id: pedido.id,
              mesa: pedido.mesa
                ? `Mesa: ${pedido.mesa.nombre || pedido.mesa.id}`
                : "Tipo: RECOJO",
              tipo: pedido.tiposervicio || "PARA LLEVAR",
              notas: pedido.notasespeciales || "",
              tiempo: pedido.fechacreacion,
              items: itemsCocina,
              estadoGlobal: estadoGlobal,
            };

            const tarjetaHTML = crearTarjeta(datosTarjeta);

            if (estadoGlobal === "EN_PREPARACION") {
              colEspera.insertAdjacentHTML("beforeend", tarjetaHTML);
              countEspera++;
            } else if (estadoGlobal === "LISTO") {
              colListo.insertAdjacentHTML("beforeend", tarjetaHTML);
              countListo++;
            }
          });

          // Actualizar contadores
          document.getElementById("globalQueueCount").textContent =
            `${countEspera + countListo} Órdenes`;
          document.getElementById("readyCountBadge").textContent = countListo;

          if (countListo > 0 && readyEmptyState)
            readyEmptyState.classList.add("hidden");
          else if (countListo === 0 && readyEmptyState)
            readyEmptyState.classList.remove("hidden");
        }

        // --- 3. CONSTRUCTOR DE HTML (TARJETAS) ---
        function crearTarjeta(pedido) {
          const minutos = Math.floor(
            (new Date() - new Date(pedido.tiempo)) / 60000,
          );
          const tiempoStr = isNaN(minutos) ? "Reciente" : `Hace ${minutos} min`;

          const itemsHTML = pedido.items
            .map(
              (item) => `
                    <div class="flex justify-between font-medium">
                        <span>🍛 ${item.cantidad}x ${item.producto.nombreproducto || item.producto.nombre}</span>
                        <span class="text-stone-500 font-mono text-[11px]">${item.estadoItem.replace("_", " ")}</span>
                    </div>
                `,
            )
            .join("");

          const notasHTML = pedido.notas
            ? `<p class="text-[11px] text-amber-500/80 bg-[#1c0e0a] p-2 rounded-lg border border-stone-800 font-light mt-2"><i class="fa-solid fa-comment-dots"></i> Nota: ${pedido.notas}</p>`
            : "";

          let btnHTML = "";
          let bordeColor = "";

          if (pedido.estadoGlobal === "EN_PREPARACION") {
            bordeColor = "border-[#543d32]/40 hover:border-[#e07a48]/40";
            btnHTML = `<button type="button" class="btn-action bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer" data-id="${pedido.id}" data-next="LISTO">
                                  Terminar Plato(s) <i class="fa-solid fa-circle-check text-[10px]"></i>
                               </button>`;
          } else if (pedido.estadoGlobal === "LISTO") {
            bordeColor = "border-emerald-500/20";
            btnHTML = `<button type="button" class="btn-action bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer" data-id="${pedido.id}" data-next="ENTREGADO">
                                  Despachar / Entregar <i class="fa-solid fa-truck-ramp-box text-[10px]"></i>
                               </button>`;
          }

          const idsDetalles = pedido.items.map((i) => i.id).join(",");

          return `
                <article class="bg-[#2a1a14]/60 border ${bordeColor} rounded-2xl p-4 space-y-3 transition-all">
                    <div class="flex justify-between items-start border-b border-stone-800 pb-1.5">
                        <div>
                            <h3 class="font-serif font-bold text-white text-sm">TICKET #${pedido.id}</h3>
                            <p class="text-[10px] font-mono text-stone-500 mt-0.5">${pedido.mesa} | ${pedido.tipo}</p>
                        </div>
                        <span class="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md font-bold">${tiempoStr}</span>
                    </div>

                    <div class="text-xs text-stone-300">
                        ${itemsHTML}
                        ${notasHTML}
                    </div>

                    <div class="pt-2 border-t border-stone-800 flex justify-end">
                        <div data-detalles="${idsDetalles}">
                            ${btnHTML}
                        </div>
                    </div>
                </article>`;
        }

        // --- 4. EVENTOS DE ACTUALIZACIÓN (MUTACIÓN EN BD) ---
        document.querySelector("main").addEventListener("click", async (e) => {
          const btn = e.target.closest(".btn-action");
          if (!btn) return;

          const idPedido = btn.getAttribute("data-id");
          const nuevoEstado = btn.getAttribute("data-next");
          const contenedorIds = btn.parentElement;
          const arrayIds = contenedorIds
            .getAttribute("data-detalles")
            .split(",");

          const textoOriginal = btn.innerHTML;
          btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;
          btn.disabled = true;

          try {
            // Procesar todos los ítems en paralelo
            const peticiones = arrayIds.map((idDetalle) => {
              // 🌟 MAGIA AQUÍ: Usamos tu lógica del backend dependiendo de la acción
              if (nuevoEstado === "ENTREGADO") {
                // Llama a entregarItemDePedido() en Java
                return fetch(
                  `http://localhost:8080/pedido/${idPedido}/entregar/${idDetalle}`,
                  {
                    method: "PUT",
                    headers: getHeaders(),
                  },
                );
              } else {
                // Llama a cambiarEstadoDetalle() en Java
                return fetch(`${API_CAMBIAR_ESTADO}/${idDetalle}/estado`, {
                  method: "PATCH",
                  headers: getHeaders(),
                  body: JSON.stringify({ estado: nuevoEstado }),
                });
              }
            });

            const respuestas = await Promise.all(peticiones);
            const todasOk = respuestas.every((r) => r.ok);

            if (!todasOk)
              throw new Error("Algunos detalles fallaron al actualizarse");

            // Refrescamos el tablero
            cargarTablero();
          } catch (error) {
            console.error(error);
            alert("Error al actualizar el estado de los platos.");
            btn.innerHTML = textoOriginal;
            btn.disabled = false;
          }
        });


        // --- 6. ARRANQUE ---
        cargarTablero();
        // setInterval(cargarTablero, 10000); // Activa esto si quieres que los pedidos entren solos cada 10 seg.
      })();