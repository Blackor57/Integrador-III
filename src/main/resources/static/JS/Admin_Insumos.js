(function () {
  const API_INSUMO = "http://localhost:8080/insumo";
  const API_LOTE = "http://localhost:8080/lote";
  const API_PERFIL = "http://localhost:8080/usuario/mi-perfil";

  let insumosGlobales = [];
  let lotesGlobales = [];

  function getHeaders() {
    const token =
      localStorage.getItem("token") || localStorage.getItem("tu_token_jwt");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  }

  // ==========================================
  // 1. CARGAR DATOS
  // ==========================================
  async function cargarUsuario() {
    try {
      const res = await fetch(API_PERFIL, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        document.getElementById("nombreAdmin").textContent =
          data.nombreCompleto || data.username || "Admin";
      }
    } catch (error) {
      console.error("Error perfil:", error);
    }
  }

  async function cargarDatosMaestros() {
    try {
      // Pedimos insumos y lotes al mismo tiempo para mayor velocidad
      const [resInsumos, resLotes] = await Promise.all([
        fetch(API_INSUMO, { headers: getHeaders() }),
        fetch(API_LOTE, { headers: getHeaders() }),
      ]);

      if (!resInsumos.ok || !resLotes.ok)
        throw new Error("Error al obtener datos");

      insumosGlobales = await resInsumos.json();
      lotesGlobales = await resLotes.json();

      renderizarTabla();
    } catch (error) {
      document.getElementById("tableBodyInsumos").innerHTML =
        `<tr><td colspan="6" class="text-center p-4 text-red-500">Error cargando insumos.</td></tr>`;
    }
  }

  // ==========================================
  // 2. RENDERIZAR TABLA (Cálculo de Stock)
  // ==========================================
  function renderizarTabla() {
    const tbody = document.getElementById("tableBodyInsumos");
    tbody.innerHTML = "";

    if (insumosGlobales.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center p-8 text-stone-500">No hay insumos registrados.</td></tr>`;
      return;
    }

    insumosGlobales.forEach((insumo) => {
      // Calculamos el stock actual sumando todos los lotes de este insumo
      const lotesDelInsumo = lotesGlobales.filter(
        (lote) => lote.insumo && lote.insumo.id === insumo.id,
      );
      const stockTotal = lotesDelInsumo.reduce(
        (suma, lote) => suma + (lote.cantidadactual || 0),
        0,
      );

      const stockMinimo = insumo.stockMinimo || 0;
      const esCritico = stockTotal <= stockMinimo;
      const unidad = insumo.unidadMedida || "UN";

      // Formateo visual del stock
      const stockHtml = esCritico
        ? `<span class="text-red-400 font-bold">${stockTotal.toFixed(2)} <i class="fa-solid fa-triangle-exclamation ml-1" title="Stock Crítico"></i></span>`
        : `<span class="text-green-400 font-bold">${stockTotal.toFixed(2)}</span>`;

      const tr = document.createElement("tr");
      tr.className =
        "hover:bg-stone-800/30 transition-colors border-b border-stone-800/40 last:border-0";
      tr.innerHTML = `
        <td class="p-4 font-mono text-stone-500 text-[10px]">${insumo.id}</td>
        <td class="p-4 font-bold text-white">${insumo.nombre}</td>
        <td class="p-4 font-mono text-stone-400">${unidad}</td>
        <td class="p-4 text-center font-mono text-stone-500">${stockMinimo.toFixed(2)}</td>
        <td class="p-4 text-center font-mono border-x border-stone-800/50">${stockHtml}</td>
        <td class="p-4 flex items-center justify-center gap-2">
          <button onclick="abrirModalLote(${insumo.id}, '${insumo.nombre}', '${unidad}')" title="Registrar Ingreso (Lote)" class="px-3 py-1.5 h-8 rounded-lg bg-[#e07a48]/10 border border-[#e07a48]/30 text-[#e07a48] hover:bg-[#e07a48] hover:text-white font-bold transition-all text-[10px] flex items-center gap-1 cursor-pointer">
            <i class="fa-solid fa-truck-ramp-box"></i> LOTE
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ==========================================
  // 3. CONTROL DE MODALES
  // ==========================================
  const modalInsumo = document.getElementById("modalInsumo");
  const modalLote = document.getElementById("modalLote");

  // Abrir Modal Crear Insumo
  document.getElementById("btnOpenAddInsumo").addEventListener("click", () => {
    document.getElementById("formInsumo").reset();
    modalInsumo.classList.remove("hidden");
  });

  // Cerrar Modales
  document
    .querySelectorAll(".close-modal-insumo")
    .forEach((btn) =>
      btn.addEventListener("click", () => modalInsumo.classList.add("hidden")),
    );
  document
    .querySelectorAll(".close-modal-lote")
    .forEach((btn) =>
      btn.addEventListener("click", () => modalLote.classList.add("hidden")),
    );

  // Abrir Modal de Lote
  window.abrirModalLote = function (idInsumo, nombre, unidad) {
    document.getElementById("formLote").reset();
    document.getElementById("loteIdInsumo").value = idInsumo;
    document.getElementById("loteInsumoName").textContent = nombre;
    document.getElementById("loteUmedida").textContent = unidad;
    modalLote.classList.remove("hidden");
  };

  // ==========================================
  // 4. GUARDAR NUEVO INSUMO
  // ==========================================
  document
    .getElementById("formInsumo")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector("button[type='submit']");
      btn.innerHTML = "GUARDANDO...";
      btn.disabled = true;

      const inputs = e.target.elements;
      const payload = {
        nombre: inputs[0].value,
        unidadMedida: inputs[1].value, // Si agregaste el campo a Java
        stockMinimo: parseFloat(inputs[2].value),
      };

      try {
        const res = await fetch(API_INSUMO, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Error al guardar el insumo");

        alert("Insumo creado correctamente");
        modalInsumo.classList.add("hidden");
        cargarDatosMaestros(); // Recargar tabla
      } catch (error) {
        alert(error.message);
      } finally {
        btn.innerHTML = "GUARDAR";
        btn.disabled = false;
      }
    });

  // ==========================================
  // 5. REGISTRAR LOTE (COMPRA)
  // ==========================================
  document.getElementById("formLote").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("button[type='submit']");
    btn.innerHTML = "PROCESANDO...";
    btn.disabled = true;

    const inputs = e.target.elements;
    // Formato de fecha para Spring Boot: yyyy-MM-dd
    const fechavencimiento = inputs[3].value;

    const payload = {
      insumo: { id: parseInt(inputs[0].value) }, // ID oculto
      codLote: inputs[1].value,
      cantidadrecibido: parseFloat(inputs[2].value),
      cantidadactual: parseFloat(inputs[2].value), // Inicialmente es lo mismo
      fechafabricacion: new Date().toISOString().split("T")[0], // Hoy
      FechaVencimiento: fechavencimiento,
    };

    try {
      const res = await fetch(API_LOTE, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Error al registrar el lote");

      alert("¡Lote registrado y agregado al inventario exitosamente!");
      modalLote.classList.add("hidden");
      cargarDatosMaestros(); // Refresca la tabla y veremos el stock sumado
    } catch (error) {
      alert(error.message);
    } finally {
      btn.innerHTML = "INGRESAR AL STOCK";
      btn.disabled = false;
    }
  });

  // ==========================================
  // INICIALIZAR
  // ==========================================
  cargarUsuario();
  cargarDatosMaestros();
})();
