(function () {
  // 1. CONFIGURACIÓN: Apuntamos al endpoint /bar que ya tienes en el controller
  const API_BAR_DETALLES = "/detalle/bar";
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

  // 2. CARGAR DATOS
  async function cargarTablero() {
    try {
      const res = await fetch(API_BAR_DETALLES, { headers: getHeaders() });
      if (!res.ok) throw new Error("Fallo al obtener datos de barra");
      const detalles = await res.json();
      procesarYRenderizar(detalles);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  function procesarYRenderizar(detalles) {
    colEspera.innerHTML = "";
    colListo.innerHTML = "";

    // Elementos de estado vacío (con verificación de seguridad)
    const esperaEmpty = document.getElementById("esperaEmptyState");
    const readyEmpty = document.getElementById("readyEmptyState");

    let countListo = 0;
    let countEspera = 0;

    const pedidosAgrupados = {};

    detalles.forEach((det) => {
      if (det.estadoItem === "ENTREGADO" || det.estadoItem === "CANCELADO")
        return;

      const idPedido = det.pedido.id;
      if (!pedidosAgrupados[idPedido]) {
        pedidosAgrupados[idPedido] = {
          id: idPedido,
          mesa: det.pedido.mesa
            ? `Mesa: ${det.pedido.mesa.nombre}`
            : "Tipo: RECOJO",
          items: [],
          estadoGlobal: "LISTO",
        };
      }
      pedidosAgrupados[idPedido].items.push(det);
      if (det.estadoItem === "EN_PREPARACION")
        pedidosAgrupados[idPedido].estadoGlobal = "EN_PREPARACION";
    });

    Object.values(pedidosAgrupados).forEach((p) => {
      const html = crearTarjeta(p);
      if (p.estadoGlobal === "EN_PREPARACION") {
        colEspera.insertAdjacentHTML("beforeend", html);
        countEspera++;
      } else {
        colListo.insertAdjacentHTML("beforeend", html);
        countListo++;
      }
    });

    // Toggle visibilidad estados vacíos con protección de null (?)
    esperaEmpty?.classList.toggle("hidden", countEspera > 0);
    readyEmpty?.classList.toggle("hidden", countListo > 0);

    // Actualizar contadores con protección de null
    const queueCount = document.getElementById("globalQueueCount");
    const readyBadge = document.getElementById("readyCountBadge");

    if (queueCount)
      queueCount.textContent = Object.keys(pedidosAgrupados).length;
    if (readyBadge) readyBadge.textContent = countListo;
  }
  // 3. TARJETA VISUAL
  function crearTarjeta(p) {
    const items = p.items
      .map(
        (i) => `
            <div class="flex justify-between font-medium text-xs">
                <span>🍸 ${i.cantidad}x ${i.producto.nombreproducto}</span>
                <span class="text-stone-500 font-mono">${i.estadoItem.replace("_", " ")}</span>
            </div>`,
      )
      .join("");

    const btn =
      p.estadoGlobal === "EN_PREPARACION"
        ? `<button class="btn-action bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all" data-id="${p.id}" data-next="LISTO">Preparado <i class="fa-solid fa-check"></i></button>`
        : `<button class="btn-action bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all" data-id="${p.id}" data-next="ENTREGADO">Entregar <i class="fa-solid fa-truck"></i></button>`;

    return `
        <article class="bg-[#2a1a14]/60 border border-stone-800 rounded-2xl p-4 space-y-3">
            <div class="flex justify-between border-b border-stone-800 pb-2">
                <h3 class="font-bold text-white text-sm">TICKET #${p.id}</h3>
                <span class="text-[10px] text-blue-400">${p.mesa}</span>
            </div>
            <div class="space-y-2">${items}</div>
            <div class="pt-2 border-t border-stone-800 flex justify-end" data-detalles="${p.items.map((i) => i.id).join(",")}">${btn}</div>
        </article>`;
  }

  // 4. ACTUALIZACIÓN (PATCH)
  document.querySelector("main").addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-action");
    if (!btn) return;
    const nuevoEstado = btn.getAttribute("data-next");
    const ids = btn.parentElement.getAttribute("data-detalles").split(",");

    try {
      await Promise.all(
        ids.map((id) =>
          fetch(`${API_CAMBIAR_ESTADO}/${id}/estado`, {
            method: "PATCH",
            headers: getHeaders(),
            body: JSON.stringify({ estado: nuevoEstado }),
          }),
        ),
      );
      cargarTablero();
    } catch (e) {
      alert("Error al actualizar");
    }
  });

  cargarTablero();
})();
