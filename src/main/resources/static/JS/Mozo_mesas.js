(function () {
  const API_BASE_URL = "/mesa";
  const API_PEDIDOS = "/pedido";
  const API_PERFIL_URL = "/usuario/mi-perfil";
  const gridMesas = document.getElementById("gridMesas");

  function getHeaders() {
    const headers = { "Content-Type": "application/json" };
    const token =
      localStorage.getItem("token") || localStorage.getItem("tu_token_jwt");
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  }

  async function obtenerDatosUsuario() {
    try {
      const response = await fetch(API_PERFIL_URL, { headers: getHeaders() });
      if (response.ok) {
        const usuario = await response.json();
        const nombre =
          usuario.nombreCompleto?.split(" ")[0].toUpperCase() || "USUARIO";
        document.getElementById("nombreAdmin").textContent = nombre;
      }
    } catch (error) {
      console.error("Error perfil:", error);
    }
  }

  async function cargarMesas() {
    try {
      const response = await fetch(API_BASE_URL, { headers: getHeaders() });
      if (!response.ok) throw new Error();
      let mesas = await response.json();
      mesas.sort((a, b) => a.nombre - b.nombre);

      gridMesas.innerHTML = "";
      let libres = 0;
      let ocupadas = 0;

      // Usamos Promise.all para cargar la info de usuario de todas las mesas ocupadas en paralelo
      const promesas = mesas.map(async (mesa) => {
        const esLibre = mesa.estado === "LIBRE";
        if (esLibre) {
          libres++;
          return { ...mesa, esLibre, usuarioNombre: null };
        } else {
          ocupadas++;
          let nombreMozo = "Ocupado";
          try {
            // Buscamos el pedido activo para obtener el usuario
            const resPedido = await fetch(
              `/pedido/mesa/${mesa.id}/activo`,
              { headers: getHeaders() },
            );
            if (resPedido.ok) {
              const pedido = await resPedido.json();
              if (pedido.usuario) {
                nombreMozo =
                  pedido.usuario.nombreCompleto || pedido.usuario.username;
              }
            }
          } catch (e) {
            console.warn("No se pudo obtener el usuario de la mesa", mesa.id);
          }
          return { ...mesa, esLibre, usuarioNombre: nombreMozo };
        }
      });

      const mesasConInfo = await Promise.all(promesas);

      mesasConInfo.forEach((mesa) => {
        const article = document.createElement("article");
        article.className = `bg-[#3d2a21]/60 border border-[#543d32] rounded-2xl p-5 shadow-lg flex flex-col justify-between`;

        article.innerHTML = `
          <div class="flex justify-between items-start mb-4">
            <h2 class="font-serif font-bold text-white text-lg uppercase">Mesa ${mesa.nombre}</h2>
            <span class="text-[10px] font-mono text-stone-500">ID: ${mesa.id}</span>
          </div>
          
          <div class="flex flex-col gap-2 bg-stone-900/50 p-3 rounded-lg text-sm font-bold">
            <div class="flex items-center gap-2 ${mesa.esLibre ? "text-green-400" : "text-red-400"}">
              <i class="fa-solid ${mesa.esLibre ? "fa-circle" : "fa-circle-dot animate-pulse"}"></i>
              <span>${mesa.estado}</span>
            </div>
            ${!mesa.esLibre ? `<div class="text-[10px] text-stone-300 font-normal"><i class="fa-solid fa-user mr-1 text-[#f5be38]"></i>${mesa.usuarioNombre}</div>` : ""}
          </div>

          ${
            mesa.esLibre
              ? `<button onclick="window.location.href='NuevaOrden.html?mesa=${mesa.id}'" class="mt-4 w-full bg-[#e07a48] hover:bg-[#cf6937] text-white py-2 rounded-xl text-xs font-bold transition-all">AGREGAR PEDIDO</button>`
              : `<button onclick="verDetalles(${mesa.id})" class="mt-4 w-full bg-[#3d2a21] hover:bg-stone-700 text-[#f5be38] border border-[#f5be38]/30 py-2 rounded-xl text-xs font-bold transition-all">VER DETALLES</button>`
          }
        `;
        gridMesas.appendChild(article);
      });

      document.getElementById("countLibres").textContent = libres;
      document.getElementById("countOcupadas").textContent = ocupadas;
    } catch (error) {
      gridMesas.innerHTML = `<p class="text-red-400 col-span-full text-center py-8">Error de conexión.</p>`;
    }
  }

  window.verDetalles = async function (idMesa) {
    // ... (Tu función verDetalles se mantiene igual, ya tiene el "/activo")
    const modal = document.getElementById("detalleModal");
    const content = document.getElementById("modalContent");
    const title = document.getElementById("modalTitle");

    try {
      const response = await fetch(
        `/pedido/mesa/${idMesa}/activo`,
        { headers: getHeaders() },
      );
      if (!response.ok) throw new Error("No hay pedido activo");
      const pedido = await response.json();
      title.textContent = `Detalle Mesa ${idMesa}`;

      content.innerHTML = `
        <div class="space-y-2">
            <p class="text-xs text-stone-500 uppercase font-bold">Resumen de productos:</p>
            <div class="bg-[#2a1a14] p-3 rounded-xl border border-stone-700">
                ${pedido.detalles
                  .map(
                    (d) => `
                    <div class="flex justify-between py-1 border-b border-stone-800 last:border-0 text-xs">
                        <span>${d.cantidad}x ${d.producto.nombreproducto}</span>
                        <span class="font-mono font-bold text-[#f5be38]">S/. ${d.subtotal.toFixed(2)}</span>
                    </div>
                `,
                  )
                  .join("")}
            </div>
            <div class="flex justify-between text-base font-bold pt-2">
                <span>Total:</span>
                <span class="text-white">S/. ${pedido.total.toFixed(2)}</span>
            </div>
        </div>
      `;
      modal.classList.remove("hidden");
    } catch (error) {
      alert("Esta mesa no tiene un pedido activo.");
    }
  };

  document.getElementById("navBtnLogout")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "Index.html";
  });

  obtenerDatosUsuario();
  cargarMesas();
})();
