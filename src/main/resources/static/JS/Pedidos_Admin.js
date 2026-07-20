 (function () {
        // =====================================================================
        // CONFIGURACIÓN BASE
        // =====================================================================
        const API_BASE_URL = "/pedido";
        const itemsModal = document.getElementById("itemsModal");
        const tableBodyPedidos = document.getElementById("tableBodyPedidos");
        const tableItemsBody = document.getElementById("tableItemsBody");

        // Variable global para almacenar los pedidos y no volver a consultar la BD al abrir el detalle
        let pedidosData = [];

        // Utilidad para Headers y JWT
        function getHeaders() {
          const headers = { "Content-Type": "application/json" };
          const token = localStorage.getItem("tu_token_jwt");
          if (token) headers["Authorization"] = `Bearer ${token}`;
          return headers;
        }

        // Cierre de Modal
        document.querySelectorAll(".close-modal-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            itemsModal.classList.add("hidden");
          });
        });

        // =====================================================================
        // 1. LISTAR PEDIDOS (GET)
        // =====================================================================
        async function cargarPedidos() {
          try {
            const response = await fetch(API_BASE_URL, {
              headers: getHeaders(),
            });
            if (!response.ok) throw new Error("Error al obtener pedidos");

            pedidosData = await response.json();
            renderizarTabla(pedidosData);
          } catch (error) {
            console.error("Error:", error);
            tableBodyPedidos.innerHTML = `<tr><td colspan="9" class="p-4 text-center text-red-400">Error al cargar la base de datos de pedidos</td></tr>`;
          }
        }

        // =====================================================================
        // 2. RENDERIZAR TABLA PRINCIPAL
        // =====================================================================
        function renderizarTabla(pedidos) {
          tableBodyPedidos.innerHTML = "";

          // Invertimos el arreglo para que los pedidos más nuevos salgan arriba (opcional)
          const pedidosOrdenados = pedidos.slice().reverse();

          pedidosOrdenados.forEach((ped) => {
            // Manejo de valores nulos (Mesa o Usuario pueden ser nulos según tu BD)
            const nombreUsuario = ped.usuario ? ped.usuario.username : "N/A";
            const numMesa = ped.mesa
              ? `Mesa ${ped.mesa.id}`
              : "Delivery/Llevar";
            const fecha = ped.fechacreacion
              ? new Date(ped.fechacreacion).toLocaleString()
              : "-";
            const tipoRecibo = ped.tiporecibo || "PENDIENTE";
            const totalFormat =
              ped.total != null ? parseFloat(ped.total).toFixed(2) : "0.00";
            const estado = ped.estadopedido || "DESCONOCIDO";

            // Colores de estado
            let colorEstado =
              "bg-stone-500/10 text-stone-400 border-stone-500/20";
            if (estado === "EN ESPERA" || estado === "EN_ESPERA")
              colorEstado = "bg-blue-500/10 text-blue-400 border-blue-500/20";
            if (estado === "PREPARANDO")
              colorEstado =
                "bg-amber-500/10 text-amber-400 border-amber-500/20";
            if (estado === "LISTO")
              colorEstado =
                "bg-green-500/10 text-green-400 border-green-500/20";
            if (estado === "ENTREGADO")
              colorEstado =
                "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            if (estado === "CANCELADO" || estado === "ANULADO")
              colorEstado = "bg-red-500/10 text-red-400 border-red-500/20";

            const tr = document.createElement("tr");
            tr.className = "hover:bg-[#2a1a14]/30 transition-colors";
            tr.innerHTML = `
                        <td class="p-4 font-mono text-stone-500">${ped.id}</td>
                        <td class="p-4 font-mono text-stone-300">${nombreUsuario}</td>
                        <td class="p-4 font-mono text-white">${numMesa}</td>
                        <td class="p-4 font-mono text-stone-400 text-[10px]">${fecha}</td>
                        <td class="p-4 text-stone-300 text-[10px] uppercase">${ped.tiposervicio || "-"}</td>
                        <td class="p-4 font-bold text-stone-400 text-[10px]">${tipoRecibo}</td>
                        <td class="p-4 font-mono font-bold text-[#f5be38]">S/. ${totalFormat}</td>
                        <td class="p-4">
                            <span class="${colorEstado} border text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">${estado}</span>
                        </td>
                        <td class="p-4 text-center">
                            <button class="bg-[#f5be38]/10 hover:bg-[#f5be38] text-[#f5be38] hover:text-stone-900 text-[10px] px-3 py-1.5 rounded-md transition-all font-bold uppercase cursor-pointer btn-view-items" data-id="${ped.id}">
                                <i class="fa-solid fa-list-ul"></i> Detalle
                            </button>
                        </td>
                    `;
            tableBodyPedidos.appendChild(tr);
          });
        }

        // =====================================================================
        // 3. VER DETALLE (MODAL)
        // =====================================================================
        tableBodyPedidos.addEventListener("click", (e) => {
          const btnViewItems = e.target.closest(".btn-view-items");
          if (!btnViewItems) return;

          const orderId = parseInt(btnViewItems.getAttribute("data-id"));

          // Buscamos el pedido completo en nuestra variable global
          const pedidoEncontrado = pedidosData.find((p) => p.id === orderId);
          if (!pedidoEncontrado) return;

          // Actualizamos cabecera del modal
          document.getElementById("displayMasterId").textContent = orderId;

          // Lógica de Notas Especiales y Anulación
          const containerInfo = document.getElementById("infoAdicional");
          const displayNotas = document.getElementById("displayNotas");
          const containerAnul = document.getElementById("containerAnulacion");
          const displayAnul = document.getElementById("displayAnulacion");

          if (
            pedidoEncontrado.notasespeciales ||
            pedidoEncontrado.motivoAnulacion
          ) {
            containerInfo.classList.remove("hidden");
            displayNotas.textContent =
              pedidoEncontrado.notasespeciales || "Ninguna";

            if (pedidoEncontrado.motivoAnulacion) {
              containerAnul.classList.remove("hidden");
              displayAnul.textContent = pedidoEncontrado.motivoAnulacion;
            } else {
              containerAnul.classList.add("hidden");
            }
          } else {
            containerInfo.classList.add("hidden");
          }

          // Renderizamos la subtabla leyendo "pedidoEncontrado.detalles"
          tableItemsBody.innerHTML = "";
          const detalles = pedidoEncontrado.detalles || [];

          if (detalles.length === 0) {
            tableItemsBody.innerHTML = `<tr><td colspan="6" class="p-3 text-center text-stone-500">No hay productos en este pedido</td></tr>`;
          } else {
            detalles.forEach((det) => {
              // Asumiendo que tu detalle tiene el objeto "producto", si no, ajusta a det.idproducto
              const nombreProducto = det.producto
                ? det.producto.nombreproducto
                : `Prod ID: ${det.producto_id || "N/A"}`;
              const precioU = det.precioUnitario || det.preciounitario || 0;
              const subT = det.subtotal || det.cantidad * precioU || 0;
              const estadoItem =
                det.estadoItem || det.estadoitem || "EN_ESPERA";

              let clrItem = "text-stone-400";
              if (estadoItem === "PREPARANDO") clrItem = "text-amber-400";
              if (estadoItem === "LISTO" || estadoItem === "ENTREGADO")
                clrItem = "text-green-400";

              const tr = document.createElement("tr");
              tr.className = "hover:bg-[#2a1a14]/40 transition-colors";
              tr.innerHTML = `
                            <td class="p-3 font-mono text-stone-500">${det.id || "-"}</td>
                            <td class="p-3 font-medium text-white">${nombreProducto}</td>
                            <td class="p-3 font-mono text-center">${det.cantidad || 0}</td>
                            <td class="p-3 font-mono text-stone-400">S/ ${parseFloat(precioU).toFixed(2)}</td>
                            <td class="p-3 font-mono text-[#f5be38] font-bold">S/ ${parseFloat(subT).toFixed(2)}</td>
                            <td class="p-3 font-bold text-[9px] tracking-wide ${clrItem}">${estadoItem.replace("_", " ")}</td>
                        `;
              tableItemsBody.appendChild(tr);
            });
          }

          itemsModal.classList.remove("hidden");
        });

        // =====================================================================
        // MANEJO DE LOGOUT
        // =====================================================================
        document
          .getElementById("navBtnLogout")
          ?.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "Index.html";
          });

        // Arranque
        cargarPedidos();
      })();