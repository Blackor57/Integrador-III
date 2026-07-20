(function () {
    const API_INSUMO = "/insumo";
    const API_RECETA = "/receta";

    let insumosGlobales = []; // Para llenar el selector
    let itemsRecetaTemporal = []; // Lista temporal de la receta que se está armando
    let productoActualId = null;
  
    function getHeaders() {
      const token = localStorage.getItem("token") || localStorage.getItem("tu_token_jwt");
      return {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      };
    }
  
    // 1. Cargar todos los insumos al iniciar para llenar el `<select>`
    async function cargarInsumosParaSelector() {
      try {
        const response = await fetch(API_INSUMO, { headers: getHeaders() });
        if (response.ok) {
          insumosGlobales = await response.json();
          const select = document.getElementById("recetaSelectInsumo");
          select.innerHTML = `<option value="" disabled selected>Selecciona un insumo...</option>`;
          
          insumosGlobales.forEach(insumo => {
            // Mostrar nombre y unidad de medida (ej: Tomate (KG))
            select.innerHTML += `<option value="${insumo.id}" data-unidad="${insumo.unidadMedida || 'UN'}">${insumo.nombre} (${insumo.unidadMedida || 'UN'})</option>`;
          });
        }
      } catch (error) {
        console.error("Error al cargar insumos para la receta:", error);
      }
    }
  
    // 2. Abrir el modal desde el botón de la tabla
    window.abrirModalReceta = async function (idProducto, nombreProducto) {
      productoActualId = idProducto;
      itemsRecetaTemporal = []; // Limpiamos la lista temporal
      
      document.getElementById("recetaNombreProducto").textContent = `Plato: ${nombreProducto}`;
      document.getElementById("recetaCantidadInsumo").value = "";
      document.getElementById("recetaSelectInsumo").value = "";
      
      // Opcional: Si quieres que al abrir ya traiga la receta actual desde la BD, harías un fetch aquí.
      // fetch(`${API_RECETA}/producto/${idProducto}`)... y llenar itemsRecetaTemporal.
      
      renderizarListaReceta();
      document.getElementById("recetaModal").classList.remove("hidden");
    };
  
    // Cerrar Modal
    document.querySelectorAll(".close-modal-receta").forEach(btn => {
      btn.addEventListener("click", () => {
        document.getElementById("recetaModal").classList.add("hidden");
      });
    });
  
    // 3. Agregar insumo a la lista temporal (FRONTEND)
    document.getElementById("btnAgregarInsumoLista").addEventListener("click", () => {
      const select = document.getElementById("recetaSelectInsumo");
      const cantidadInput = document.getElementById("recetaCantidadInsumo");
      
      const insumoId = parseInt(select.value);
      const cantidad = parseFloat(cantidadInput.value);
      
      if (!insumoId || isNaN(cantidad) || cantidad <= 0) {
        return alert("Seleccione un insumo e ingrese una cantidad válida mayor a 0.");
      }
  
      const insumoNombre = select.options[select.selectedIndex].text;
  
      // Evitar duplicados (si ya existe, le sumamos la cantidad)
      const existente = itemsRecetaTemporal.find(i => i.insumo.id === insumoId);
      if (existente) {
        existente.cantidad += cantidad;
      } else {
        itemsRecetaTemporal.push({
          insumo: { id: insumoId, nombre: insumoNombre },
          cantidad: cantidad
        });
      }
  
      // Limpiar inputs y refrescar tablita
      cantidadInput.value = "";
      select.value = "";
      renderizarListaReceta();
    });
  
    // Quitar de la lista temporal
    window.quitarInsumoReceta = function(index) {
        itemsRecetaTemporal.splice(index, 1);
        renderizarListaReceta();
    }
  
    // 4. Dibujar la tablita dentro del modal
    function renderizarListaReceta() {
      const tbody = document.getElementById("tbodyRecetaList");
      tbody.innerHTML = "";
  
      if (itemsRecetaTemporal.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center p-4 text-stone-600 italic text-[10px]">Sin insumos asignados.</td></tr>`;
        return;
      }
  
      itemsRecetaTemporal.forEach((item, index) => {
        tbody.innerHTML += `
          <tr class="hover:bg-stone-800/30">
            <td class="p-3 font-bold">${item.insumo.nombre}</td>
            <td class="p-3 text-center font-mono text-[#f5be38]">${item.cantidad.toFixed(3)}</td>
            <td class="p-3 text-center">
              <button onclick="quitarInsumoReceta(${index})" class="text-red-500 hover:text-red-400 cursor-pointer"><i class="fa-solid fa-trash-can"></i></button>
            </td>
          </tr>
        `;
      });
    }
  
    // 5. Guardar la receta final en el backend (JAVA)
    document.getElementById("btnGuardarRecetaFinal").addEventListener("click", async (e) => {
      if (itemsRecetaTemporal.length === 0) {
        return alert("La receta debe tener al menos un insumo.");
      }
  
      const btn = e.target;
      btn.innerHTML = "GUARDANDO...";
      btn.disabled = true;
  
      // Transformamos el array para que empate exacto con tu Entidad Receta en Java
      const payload = itemsRecetaTemporal.map(item => ({
        producto: { id: productoActualId },
        insumo: { id: item.insumo.id },
        cantidad: item.cantidad
      }));
  
      try {
        // Asumiendo que tu backend tiene un endpoint que recibe una Lista de Recetas 
        // @PostMapping("/receta/guardar-lote")
        const response = await fetch(`${API_RECETA}/guardar-lote`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(payload)
        });
  
        if (!response.ok) throw new Error("Fallo al guardar la receta en la base de datos.");
        
        alert("¡Receta configurada exitosamente!");
        document.getElementById("recetaModal").classList.add("hidden");
  
      } catch (error) {
        alert(error.message);
      } finally {
        btn.innerHTML = "GUARDAR RECETA";
        btn.disabled = false;
      }
    });
  
    // Arrancar
    cargarInsumosParaSelector();
  })();