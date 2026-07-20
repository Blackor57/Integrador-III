(function () {
  // =====================================================================
  // CONFIGURACIÓN BASE
  // =====================================================================
  const API_BASE_URL = "/producto";
  const addModal = document.getElementById("addModal");
  const editModal = document.getElementById("editModal");
  const tableBodyProductos = document.getElementById("tableBodyProductos");

  function getHeaders() {
    const headers = { "Content-Type": "application/json" };
    const token = localStorage.getItem("tu_token_jwt");
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  }

  document.querySelectorAll(".close-modal-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      addModal.classList.add("hidden");
      editModal.classList.add("hidden");
    });
  });

  // =====================================================================
  // 1. LISTAR PRODUCTOS (GET)
  // =====================================================================
  async function cargarProductos() {
    try {
      const response = await fetch(API_BASE_URL, { headers: getHeaders() });
      if (!response.ok) throw new Error("Error al obtener productos");

      const productos = await response.json();
      renderizarTabla(productos);
    } catch (error) {
      console.error("Error:", error);
      tableBodyProductos.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-red-400">Error al cargar la base de datos</td></tr>`;
    }
  }

  function renderizarTabla(productos) {
    tableBodyProductos.innerHTML = "";

    productos.forEach((prod) => {
      // Ahora extraemos el ID y el NOMBRE de la subcategoría
      const idSub = prod.subcategoria ? prod.subcategoria.id : "";
      // Si el backend envía el nombre de la subcategoría, lo usamos. Si no, mostramos el ID como respaldo.
      const nombreSub =
        prod.subcategoria && prod.subcategoria.nombre
          ? prod.subcategoria.nombre
          : idSub
            ? `Subcategoría ${idSub}`
            : "N/A";

      const precioFormat =
        prod.precio != null ? parseFloat(prod.precio).toFixed(2) : "0.00";
      const esActivo = prod.disponible !== false;
      const estadoClases = esActivo ? "" : "opacity-40 grayscale";
      const btnIcono = esActivo ? "fa-ban" : "fa-check";
      const btnColor = esActivo ? "hover:text-red-400" : "hover:text-green-400";
      const titleAccion = esActivo ? "Desactivar Producto" : "Activar Producto";

      const tr = document.createElement("tr");
      tr.className = `hover:bg-[#2a1a14]/30 transition-all duration-300 ${estadoClases}`;
      tr.setAttribute("data-id", prod.id);
      tr.setAttribute("data-estado", esActivo ? "activo" : "inactivo");

      tr.innerHTML = `
                        <td class="p-4 font-mono text-stone-500">${prod.id}</td>
                        <td class="p-4 font-mono font-semibold text-stone-300" data-field="codproducto">${prod.codproducto || ""}</td>
                        <td class="p-4 font-medium text-white" data-field="nombreproducto">${prod.nombreproducto || ""}</td>
                        <td class="p-4 text-stone-400 truncate max-w-xs md:max-w-none" data-field="descripcion">${prod.descripcion || ""}</td>
                        <td class="p-4 font-mono font-bold text-[#f5be38]" data-field="precio">S/. ${precioFormat}</td>
                        <!-- Aquí mostramos el nombre extraído, pero guardamos el ID oculto en data-id-sub para poder editar después -->
                        <td class="p-4 text-stone-300 font-semibold" data-field="subcategoria" data-id-sub="${idSub}">${nombreSub}</td>
                        <td class="p-4 text-center space-x-3 flex justify-center">
                            <button class="text-stone-400 hover:text-[#f5be38] transition-colors cursor-pointer btn-edit" title="Modificar Producto">
                                <i class="fa-regular fa-pen-to-square text-sm"></i>
                            </button>
                            <button class="text-stone-400 ${btnColor} transition-colors cursor-pointer btn-toggle-status" title="${titleAccion}">
                                <i class="fa-solid ${btnIcono} icono-estado text-sm"></i>
                            </button>
                            <button onclick="abrirModalReceta(${prod.id}, '${prod.nombreproducto}')" title="Configurar Receta" class="w-8 h-8 rounded-lg bg-stone-800 border border-stone-700 text-green-400 hover:bg-green-500/20 hover:border-green-500 transition-colors cursor-pointer flex items-center justify-center">
    <i class="fa-solid fa-kitchen-set"></i>
</button>
                        </td>
                    `;
      tableBodyProductos.appendChild(tr);
    });
  }

  cargarProductos();

  // =====================================================================
  // 2. CREAR PRODUCTO (POST)
  // =====================================================================
  document.getElementById("btnOpenAddModal").addEventListener("click", () => {
    document.getElementById("formAddProducto").reset();
    addModal.classList.remove("hidden");
  });

  document
    .getElementById("formAddProducto")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);

      const payload = {
        codproducto: formData.get("codproducto"),
        nombreproducto: formData.get("nombreproducto"),
        descripcion: formData.get("descripcion"),
        precio: parseFloat(formData.get("precio")),
        subcategoria: {
          id: parseInt(formData.get("id_subcategoria")),
        },
      };

      try {
        const response = await fetch(API_BASE_URL, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Fallo al crear producto");

        await cargarProductos();
        addModal.classList.add("hidden");
      } catch (error) {
        alert("No se pudo crear el producto.");
        console.error(error);
      }
    });

  // =====================================================================
  // 3. EVENTOS DE TABLA (EDITAR, ACTIVAR/DESACTIVAR)
  // =====================================================================
  tableBodyProductos.addEventListener("click", async (e) => {
    const btnEdit = e.target.closest(".btn-edit");
    const btnToggleStatus = e.target.closest(".btn-toggle-status");
    const row = e.target.closest("tr");
    if (!row) return;

    const productId = row.getAttribute("data-id");

    // --- ACCIÓN MODIFICAR (Abrir Modal) ---
    if (btnEdit) {
      document.getElementById("editInputId").value = productId;
      document.getElementById("editDisplayId").textContent = productId;

      document.getElementById("editCodProducto").value = row
        .querySelector('[data-field="codproducto"]')
        .textContent.trim();
      document.getElementById("editNombreProducto").value = row
        .querySelector('[data-field="nombreproducto"]')
        .textContent.trim();

      // Limpiamos el texto del precio (quitamos el "S/. ")
      const precioTexto = row
        .querySelector('[data-field="precio"]')
        .textContent.trim()
        .replace("S/. ", "");
      document.getElementById("editPrecio").value = precioTexto;

      document.getElementById("editDescripcion").value = row
        .querySelector('[data-field="descripcion"]')
        .textContent.trim();

      // En el modal seleccionamos automáticamente la subcategoría correcta usando el ID oculto
      const tdSub = row.querySelector('[data-field="subcategoria"]');
      document.getElementById("editSubcategoria").value =
        tdSub.getAttribute("data-id-sub");

      editModal.classList.remove("hidden");
    }

    // --- ACCIÓN ACTIVAR / DESACTIVAR ---
    if (btnToggleStatus) {
      const estadoActual = row.getAttribute("data-estado");
      const esActivo = estadoActual === "activo";
      const accionTexto = esActivo ? "desactivar" : "activar";

      if (
        confirm(
          `¿Seguro que deseas ${accionTexto} el producto con id: ${productId}?`,
        )
      ) {
        const endpoint = esActivo
          ? `${API_BASE_URL}/${productId}/desactivar`
          : `${API_BASE_URL}/${productId}/activar`;

        try {
          const response = await fetch(endpoint, {
            method: "PUT",
            headers: getHeaders(),
          });

          if (!response.ok) throw new Error("Error en el servidor");

          const icono = btnToggleStatus.querySelector(".icono-estado");

          if (esActivo) {
            row.setAttribute("data-estado", "inactivo");
            row.classList.add("opacity-40", "grayscale");
            btnToggleStatus.classList.replace(
              "hover:text-red-400",
              "hover:text-green-400",
            );
            btnToggleStatus.setAttribute("title", "Activar Producto");
            icono.classList.replace("fa-ban", "fa-check");
          } else {
            row.setAttribute("data-estado", "activo");
            row.classList.remove("opacity-40", "grayscale");
            btnToggleStatus.classList.replace(
              "hover:text-green-400",
              "hover:text-red-400",
            );
            btnToggleStatus.setAttribute("title", "Desactivar Producto");
            icono.classList.replace("fa-check", "fa-ban");
          }
        } catch (error) {
          alert("Ocurrió un error al intentar cambiar el estado del producto.");
          console.error(error);
        }
      }
    }
  });

  // =====================================================================
  // 4. GUARDAR EDICIÓN (PUT)
  // =====================================================================
  document
    .getElementById("formEditProducto")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const productId = formData.get("id");

      const payload = {
        codproducto: formData.get("codproducto"),
        nombreproducto: formData.get("nombreproducto"),
        descripcion: formData.get("descripcion"),
        precio: parseFloat(formData.get("precio")),
        subcategoria: {
          id: parseInt(formData.get("id_subcategoria")),
        },
      };

      try {
        const response = await fetch(`${API_BASE_URL}/${productId}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Error al actualizar");

        await cargarProductos();
        editModal.classList.add("hidden");
      } catch (error) {
        alert("No se pudieron guardar los cambios.");
        console.error(error);
      }
    });

  // =====================================================================
  // CARGAR SUBCATEGORÍAS DINÁMICAMENTE
  // =====================================================================
  async function cargarSubcategorias() {
    try {
      // Llamamos a tu nuevo controlador
      const response = await fetch("http://localhost:8080/subcategoria", {
        headers: getHeaders(),
      });
      if (!response.ok)
        throw new Error("Fallo al cargar subcategorías de la BD");

      const subcategorias = await response.json();

      const addSelect = document.getElementById("addSubcategoria");
      const editSelect = document.getElementById("editSubcategoria");

      // Armamos el HTML con un bucle
      let opcionesHTML =
        '<option value="" disabled selected>Seleccione una subcategoría...</option>';

      subcategorias.forEach((sub) => {
        // Usamos el ID como value y mostramos el ID + Nombre al usuario
        opcionesHTML += `<option value="${sub.id}">${sub.id} - ${sub.nombre}</option>`;
      });

      // Inyectamos las opciones en ambos modales
      addSelect.innerHTML = opcionesHTML;
      editSelect.innerHTML = opcionesHTML;
    } catch (error) {
      console.error(error);
      document.getElementById("addSubcategoria").innerHTML =
        '<option value="" disabled>Error al cargar BD</option>';
    }
  }

  // =====================================================================
  // ARRANQUE DE LA PÁGINA (Ejecutamos ambas funciones)
  // =====================================================================
  cargarSubcategorias();
  cargarProductos();

  // MANEJO DE LOGOUT
  document.getElementById("navBtnLogout")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "Index.html";
  });
})();
