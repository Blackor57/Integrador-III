(function () {
  const API_BASE_URL = "http://localhost:8080/mesa";
  const API_PERFIL_URL = "http://localhost:8080/usuario/mi-perfil";

  const gridMesas = document.getElementById("gridMesas");
  const addModal = document.getElementById("addModal");

  function getHeaders() {
    const headers = { "Content-Type": "application/json" };
    const token =
      localStorage.getItem("token") || localStorage.getItem("tu_token_jwt");
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  }

  // Manejo de modal
  document.querySelectorAll(".close-modal-btn").forEach((btn) => {
    btn.addEventListener("click", () => addModal.classList.add("hidden"));
  });

  // 0. OBTENER DATOS DEL USUARIO LOGUEADO
  async function obtenerDatosUsuario() {
    try {
      const response = await fetch(API_PERFIL_URL, { headers: getHeaders() });
      if (response.ok) {
        const usuario = await response.json();
        const primerNombre =
          usuario.nombreCompleto?.split(" ")[0].toUpperCase() || "ADMIN";
        const spanNombre = document.getElementById("nombreAdmin");
        if (spanNombre) spanNombre.textContent = primerNombre;
      }
    } catch (error) {
      console.error("Error al obtener perfil:", error);
    }
  }

  // 1. OBTENER Y RENDERIZAR MESAS
  async function cargarMesas() {
    try {
      const response = await fetch(API_BASE_URL, { headers: getHeaders() });
      if (!response.ok) throw new Error("Fallo al obtener las mesas");
      const mesas = await response.json();
      mesas.sort((a, b) => a.nombre - b.nombre);
      renderizarMesas(mesas);
    } catch (error) {
      gridMesas.innerHTML = `<p class="text-red-400 col-span-full text-center py-8">Error al conectar con el servidor.</p>`;
    }
  }

  function renderizarMesas(mesas) {
    gridMesas.innerHTML = "";
    let libres = 0;
    let ocupadas = 0;

    mesas.forEach((mesa) => {
      const esLibre = mesa.estado === "LIBRE";
      if (esLibre) libres++;
      else ocupadas++;

      const colorEstado = esLibre ? "text-green-400" : "text-red-400";
      const bgEstado = esLibre
        ? "bg-green-500/10 border-green-500/20"
        : "bg-red-500/10 border-red-500/20";
      const iconoEstado = esLibre ? "fa-circle" : "fa-circle-dot animate-pulse";

      const article = document.createElement("article");
      article.className = `bg-[#3d2a21]/60 border border-[#543d32] rounded-2xl p-4 shadow-lg transition-all relative`;

      article.innerHTML = `
          <button class="absolute top-3 right-3 text-stone-500 hover:text-red-400 transition-colors btn-delete" data-id="${mesa.id}" title="Eliminar Mesa">
              <i class="fa-solid fa-trash-can text-xs"></i>
          </button>
          <div class="space-y-3">
              <div class="border-b border-stone-800 pb-2">
                  <h2 class="font-serif font-bold text-white text-base uppercase">Mesa ${mesa.nombre}</h2>
                  <span class="text-[9px] font-mono text-stone-500">ID: ${mesa.id}</span>
              </div>
              <div class="flex justify-between items-center ${bgEstado} border p-2.5 rounded-lg text-xs">
                  <span class="${colorEstado} font-bold flex items-center gap-1.5 uppercase">
                      <i class="fa-solid ${iconoEstado} text-[9px]"></i> ${mesa.estado}
                  </span>
              </div>
          </div>
      `;
      gridMesas.appendChild(article);
    });

    document.getElementById("countLibres").textContent = libres;
    document.getElementById("countOcupadas").textContent = ocupadas;
    agregarTarjetaNuevaMesa();
  }

  function agregarTarjetaNuevaMesa() {
    const btnAgregar = document.createElement("div");
    btnAgregar.className =
      "bg-[#3d2a21]/40 border-2 border-dashed border-[#543d32] rounded-2xl min-h-[120px] flex flex-col items-center justify-center p-6 cursor-pointer hover:border-[#f5be38]/40";
    btnAgregar.innerHTML = `
        <i class="fa-solid fa-plus text-stone-400 mb-2"></i>
        <p class="text-xs text-stone-400 font-bold uppercase">Registrar Mesa</p>
    `;
    btnAgregar.addEventListener("click", () => {
      document.getElementById("formAddMesa").reset();
      addModal.classList.remove("hidden");
    });
    gridMesas.appendChild(btnAgregar);
  }

  // 2. CREAR MESA (POST)
  document
    .getElementById("formAddMesa")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        nombre: parseInt(new FormData(e.target).get("nombre")),
        estado: "LIBRE",
      };
      try {
        const response = await fetch(API_BASE_URL, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error();
        await cargarMesas();
        addModal.classList.add("hidden");
      } catch (error) {
        alert("Error al registrar mesa.");
      }
    });

  // 3. ELIMINAR MESA (DELETE)
  gridMesas.addEventListener("click", async (e) => {
    const btnDelete = e.target.closest(".btn-delete");
    if (btnDelete) {
      if (confirm("¿Eliminar esta mesa?")) {
        const id = btnDelete.getAttribute("data-id");
        await fetch(`${API_BASE_URL}/${id}`, {
          method: "DELETE",
          headers: getHeaders(),
        });
        cargarMesas();
      }
    }
  });

  document.getElementById("navBtnLogout")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "Index.html";
  });

  obtenerDatosUsuario();
  cargarMesas();
})();
