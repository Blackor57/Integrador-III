(function () {
  // --- 1. GLOBALES Y CONFIGURACIÓN ---
  const API_PRODUCTOS = "/producto";
  const API_PEDIDOS = "/pedido";
  const API_PERFIL = "/usuario/mi-perfil";

  const token =
    localStorage.getItem("token") || localStorage.getItem("tu_token_jwt");

  if (!token) {
    window.location.href = "Index.html";
    return;
  }

  function getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  // --- 2. LEER URL PARA SABER QUÉ HACER ---
  const urlParams = new URLSearchParams(window.location.search);
  const idMesaParam = urlParams.get("mesa"); // Ej: ?mesa=5
  const actionParam = urlParams.get("action"); // Ej: ?action=add

  let pedidoActivoFondo = null; // Guardará el pedido viejo si estamos agregando
  let carrito = {}; // { idPlato: { producto, cantidad, subtotal } }
  let todosLosPlatos = [];
  let rutaVolver = "Emp_pedidos.html"; // Por defecto mozo

  // Inicializar UI superior
  document.getElementById("displayMesaId").textContent = idMesaParam
    ? `MESA ${idMesaParam}`
    : "PARA LLEVAR";
  if (actionParam === "add") {
    document.getElementById("textoAccion").textContent =
      "Agregando productos a:";
    document.getElementById("btnProcesarPedido").innerHTML =
      `<i class="fa-solid fa-plus"></i> AGREGAR A LA CUENTA`;
  }

  // --- 3. CARGAR PERFIL (Para saber a dónde vuelve) ---
  async function configurarBotonVolver() {
    try {
      const res = await fetch(API_PERFIL, { headers: getHeaders() });
      if (res.ok) {
        const usuario = await res.json();
        let rolStr = JSON.stringify(
          usuario.roles || usuario.authorities || [],
        ).toUpperCase();

        // Si es caja o admin, regresa a la vista de caja
        if (rolStr.includes("CAJA") || rolStr.includes("ADMIN")) {
          rutaVolver = "Caja_Pedidos.html";
        }
      }
    } catch (e) {
      console.warn("Error cargando perfil");
    }

    document.getElementById("btnVolver").addEventListener("click", () => {
      window.location.href = rutaVolver;
    });
  }

  // --- 4. SI ES "ADD", OBTENER EL PEDIDO ACTIVO DE ESA MESA ---
  async function cargarPedidoExistenteSiAplica() {
    if (actionParam === "add" && idMesaParam) {
      try {
        const res = await fetch(`${API_PEDIDOS}/mesa/${idMesaParam}/activo`, {
          headers: getHeaders(),
        });
        if (res.ok) {
          pedidoActivoFondo = await res.json();
          console.log("Se agregarán items al pedido:", pedidoActivoFondo.id);
        } else {
          alert(
            "No se encontró un pedido activo en esta mesa. Se creará uno nuevo.",
          );
        }
      } catch (error) {
        console.error("Error buscando pedido activo:", error);
      }
    }
  }

  // --- 5. CARGAR PLATOS Y CARRITO ---
  async function cargarPlatos() {
    const contenedor = document.getElementById("gridProductos");
    try {
      contenedor.innerHTML = `<div class="col-span-full text-center text-stone-400 py-10">Cargando la carta...</div>`;
      const response = await fetch(API_PRODUCTOS, { headers: getHeaders() });
      if (!response.ok) throw new Error("Fallo");
      todosLosPlatos = await response.json();
      renderizarPlatos(todosLosPlatos);
    } catch (error) {
      contenedor.innerHTML = `<div class="col-span-full text-center text-red-400 py-10">Error al cargar el menú.</div>`;
    }
  }

  function renderizarPlatos(platos) {
    const contenedor = document.getElementById("gridProductos");
    contenedor.innerHTML = "";

    platos.forEach((plato) => {
      const precioFormateado = Number(plato.precio).toFixed(2);
      const nombreCat = (
        plato.subcategoria?.categoria?.nombre ||
        plato.categoria ||
        ""
      ).toLowerCase();
      let emoji = nombreCat.includes("bebida") ? "🥤" : "🍲";

      contenedor.insertAdjacentHTML(
        "beforeend",
        `
        <article class="bg-[#3d2a21]/60 border border-[#543d32] rounded-2xl overflow-hidden shadow-lg flex flex-col group hover:border-[#f5be38]/50 transition-all">
          <div class="bg-[#2a1a14]/60 aspect-video w-full flex items-center justify-center relative overflow-hidden text-4xl border-b border-[#543d32]/40">
            <span class="group-hover:scale-110 transition-transform duration-300">${emoji}</span>
            <span class="absolute top-3 right-3 bg-[#e07a48] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">S/. ${precioFormateado}</span>
          </div>
          <div class="p-4 flex-grow flex flex-col justify-between space-y-3">
            <div>
              <h3 class="font-serif font-bold text-stone-100 text-sm tracking-wide uppercase">${plato.nombreproducto || plato.nombre}</h3>
            </div>
            <button onclick="agregarAlCarrito(${plato.id})" class="w-full bg-[#e07a48]/20 hover:bg-[#e07a48] text-[#f5be38] hover:text-white font-medium text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5">
              <i class="fa-solid fa-plus text-[10px]"></i> Agregar
            </button>
          </div>
        </article>
      `,
      );
    });
  }

  // --- 6. GESTIÓN DEL CARRITO INTERNO ---
  window.agregarAlCarrito = function (idPlato) {
    const plato = todosLosPlatos.find((p) => p.id === idPlato);
    if (!plato) return;

    if (carrito[idPlato]) {
      carrito[idPlato].cantidad += 1;
      carrito[idPlato].subtotal = carrito[idPlato].cantidad * plato.precio;
    } else {
      carrito[idPlato] = {
        producto: plato,
        cantidad: 1,
        precioUnitario: plato.precio,
        subtotal: plato.precio,
      };
    }
    actualizarUI();
  };

  window.modificarCantidad = function (idPlato, delta) {
    if (!carrito[idPlato]) return;
    carrito[idPlato].cantidad += delta;
    if (carrito[idPlato].cantidad <= 0) delete carrito[idPlato];
    else
      carrito[idPlato].subtotal =
        carrito[idPlato].cantidad * carrito[idPlato].precioUnitario;
    actualizarUI();
  };

  function actualizarUI() {
    const container = document.getElementById("cartItemsContainer");
    const lblSubtotal = document.getElementById("lblSubtotal");
    const lblTotal = document.getElementById("lblTotal");
    const btnProcesar = document.getElementById("btnProcesarPedido");

    container.innerHTML = "";
    const items = Object.values(carrito);
    let total = 0;

    if (items.length === 0) {
      container.innerHTML = `<div class="text-center text-stone-500 text-sm mt-10 italic"><i class="fa-solid fa-basket-shopping text-3xl mb-3 opacity-50"></i><br />La comanda está vacía.</div>`;
      btnProcesar.disabled = true;
    } else {
      btnProcesar.disabled = false;
      items.forEach((item) => {
        total += item.subtotal;
        container.insertAdjacentHTML(
          "beforeend",
          `
          <div class="bg-[#2a1a14]/60 border border-stone-800 rounded-xl p-3 flex justify-between items-center cart-item-enter">
            <div class="flex-grow pr-2">
              <h4 class="font-bold text-stone-200 text-xs truncate w-[140px]">${item.producto.nombreproducto}</h4>
              <div class="font-mono text-[#f5be38] text-[11px] font-bold mt-0.5">S/. ${item.subtotal.toFixed(2)}</div>
            </div>
            <div class="flex items-center gap-2 bg-[#1c0e0a] rounded-lg border border-stone-700 px-1 py-1 shrink-0">
              <button class="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-white cursor-pointer" onclick="modificarCantidad(${item.producto.id}, -1)"><i class="fa-solid fa-minus text-[10px]"></i></button>
              <span class="font-mono text-xs font-bold text-white w-4 text-center">${item.cantidad}</span>
              <button class="w-6 h-6 flex items-center justify-center text-stone-400 hover:text-white cursor-pointer" onclick="modificarCantidad(${item.producto.id}, 1)"><i class="fa-solid fa-plus text-[10px]"></i></button>
            </div>
          </div>
        `,
        );
      });
    }
    lblSubtotal.textContent = total.toFixed(2);
    lblTotal.textContent = total.toFixed(2);
  }

  // --- 7. PROCESAR PEDIDO (NUEVO O ACTUALIZAR EXISTENTE) ---
  document
    .getElementById("btnProcesarPedido")
    .addEventListener("click", async (e) => {
      const items = Object.values(carrito);
      if (items.length === 0) return;

      const btn = e.target;
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> PROCESANDO...`;

      const totalNuevosItems = items.reduce(
        (sum, item) => sum + item.subtotal,
        0,
      );
      const userId = localStorage.getItem("userId");

      // LEEMOS LOS INPUTS DE LA INTERFAZ
      const inputServicio = document.getElementById("inputTipoServicio");
      const tipoServicioSelec = inputServicio
        ? inputServicio.value
        : idMesaParam
          ? "MESA"
          : "RECOJO";

      const inputNotas = document.getElementById("inputNotas");
      const notasTexto = inputNotas ? inputNotas.value : "";

      const nuevosDetalles = items.map((item) => ({
        producto: { id: item.producto.id },
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.subtotal,
        estadoItem: "EN_PREPARACION",
      }));

      let payload;
      let endpoint = API_PEDIDOS;
      let metodoHTTP = "POST";

      if (pedidoActivoFondo) {
        payload = {
          ...pedidoActivoFondo,
          notasespeciales: notasTexto || pedidoActivoFondo.notasespeciales, // Actualiza notas si escribes algo
          total: pedidoActivoFondo.total + totalNuevosItems,
          subtotal: pedidoActivoFondo.subtotal + totalNuevosItems,
          detalles: [...pedidoActivoFondo.detalles, ...nuevosDetalles],
        };
        endpoint = `${API_PEDIDOS}/${pedidoActivoFondo.id}`;
        metodoHTTP = "PUT";
      } else {
        payload = {
          tiposervicio: tipoServicioSelec, // <--- Aquí inyectamos el valor "MESA" o "RECOJO"
          estadopedido: "PENDIENTE",
          notasespeciales: notasTexto,
          subtotal: totalNuevosItems,
          total: totalNuevosItems,
          usuario: userId ? { id: parseInt(userId) } : null,
          mesa: idMesaParam ? { id: parseInt(idMesaParam) } : null,
          detalles: nuevosDetalles,
        };
      }

      try {
        const response = await fetch(endpoint, {
          method: metodoHTTP,
          headers: getHeaders(),
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Fallo al registrar el pedido");
        }

        alert(
          pedidoActivoFondo
            ? "¡Productos agregados a la cuenta!"
            : "¡Pedido creado exitosamente!",
        );
        carrito = {};
        window.location.href = rutaVolver;
      } catch (error) {
        if (
          error.message.includes("AGOTADO") ||
          error.message.includes("Stock insuficiente")
        ) {
          const msgTexto = document.getElementById("msgAgotadoTexto");
          if (msgTexto) msgTexto.textContent = error.message;
          document.getElementById("modalAgotado")?.classList.remove("hidden");
        } else {
          alert("Error: " + error.message);
        }
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> PROCESAR PEDIDO`;
      }
    });
  // Arrancar
  configurarBotonVolver();
  cargarPedidoExistenteSiAplica();
  cargarPlatos();
  actualizarUI();
})();
