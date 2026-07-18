(function () {
  // =====================================================================
  // CONFIGURACIÓN Y ESTADO
  // =====================================================================
  const API_PRODUCTOS = "http://localhost:8080/producto";
  const API_PEDIDOS = "http://localhost:8080/pedido";
  const API_PERFIL = "http://localhost:8080/usuario/mi-perfil";

  let usuarioGlobalId = null;
  let pedidoActivoExistente = null; // Guardará el pedido si la mesa está ocupada
  let carrito = {};

  // 1. EXTRAER ID DE LA MESA
  const urlParams = new URLSearchParams(window.location.search);
  const idMesa = urlParams.get("mesa");

  const displayMesa = document.getElementById("displayMesaId");
  if (displayMesa) {
    displayMesa.textContent = idMesa ? `MESA ${idMesa}` : "NO ESPECIFICADA";
  }

  function getHeaders() {
    const token =
      localStorage.getItem("token") || localStorage.getItem("tu_token_jwt");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  }

  // 2. OBTENER ID DEL USUARIO
  async function cargarUsuario() {
    try {
      const res = await fetch(API_PERFIL, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        usuarioGlobalId = data.id;
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error);
    }
  }

  // 3. VERIFICAR SI LA MESA YA TIENE UN PEDIDO ACTIVO
  async function verificarPedidoExistente() {
    if (!idMesa) return;
    try {
      const res = await fetch(`http://localhost:8080/pedido/mesa/${idMesa}`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        pedidoActivoExistente = await res.json();
        console.log(
          "Agregando productos al pedido existente:",
          pedidoActivoExistente.id,
        );

        // Opcional: Cambiar el título visual para que el mozo sepa que está añadiendo
        if (displayMesa) {
          displayMesa.innerHTML = `MESA ${idMesa} <span class="text-xs bg-amber-500 text-white px-2 py-1 rounded ml-2">AÑADIENDO A PEDIDO #${pedidoActivoExistente.id}</span>`;
        }
      }
    } catch (error) {
      console.log("Mesa libre. Se creará un pedido nuevo.");
    }
  }

  // =====================================================================
  // 4. CARGAR MENÚ DE PRODUCTOS
  // =====================================================================
  async function cargarProductos() {
    try {
      const response = await fetch(API_PRODUCTOS, { headers: getHeaders() });
      if (!response.ok) throw new Error("Fallo al obtener productos");

      const productos = await response.json();
      const grid = document.getElementById("gridProductos");
      grid.innerHTML = "";

      const productosActivos = productos.filter((p) => p.disponible !== false);

      productosActivos.forEach((prod) => {
        const precioF = parseFloat(prod.precio).toFixed(2);
        const article = document.createElement("article");
        article.className =
          "bg-[#3d2a21]/60 border border-[#543d32] rounded-2xl p-4 flex flex-col justify-between shadow-md hover:border-[#f5be38]/50 hover:bg-[#3d2a21]/80 transition-all cursor-pointer group";
        article.onclick = () => agregarAlCarrito(prod);

        article.innerHTML = `
                    <div>
                        <div class="text-[9px] font-mono text-stone-500 mb-1">${prod.codproducto || ""}</div>
                        <h3 class="font-bold text-stone-200 text-sm leading-tight group-hover:text-white">${prod.nombreproducto}</h3>
                        <p class="text-[10px] text-stone-400 mt-1.5 line-clamp-2 leading-snug">${prod.descripcion || ""}</p>
                    </div>
                    <div class="mt-4 flex justify-between items-center border-t border-stone-800 pt-2">
                        <span class="font-mono font-bold text-[#f5be38] text-sm">S/. ${precioF}</span>
                        <div class="w-6 h-6 rounded-full bg-[#2a1a14] border border-stone-700 flex items-center justify-center text-stone-400 group-hover:bg-[#f5be38] group-hover:text-stone-900 group-hover:border-[#f5be38] transition-colors">
                            <i class="fa-solid fa-plus text-[10px]"></i>
                        </div>
                    </div>
                `;
        grid.appendChild(article);
      });
    } catch (error) {
      document.getElementById("gridProductos").innerHTML =
        `<p class="text-red-400 col-span-full">Error al cargar el menú.</p>`;
    }
  }

  // =====================================================================
  // 5. LÓGICA DEL CARRITO
  // =====================================================================
  function agregarAlCarrito(producto) {
    const id = producto.id;
    const precio = parseFloat(producto.precio);
    if (carrito[id]) {
      carrito[id].cantidad += 1;
      carrito[id].subtotal = carrito[id].cantidad * precio;
    } else {
      carrito[id] = {
        producto: producto,
        cantidad: 1,
        precioUnitario: precio,
        subtotal: precio,
      };
    }
    renderizarCarrito();
  }

  function modificarCantidad(id, delta) {
    if (!carrito[id]) return;
    carrito[id].cantidad += delta;
    if (carrito[id].cantidad <= 0) {
      delete carrito[id];
    } else {
      carrito[id].subtotal = carrito[id].cantidad * carrito[id].precioUnitario;
    }
    renderizarCarrito();
  }
  window.modificarCantidad = modificarCantidad;

  function renderizarCarrito() {
    const container = document.getElementById("cartItemsContainer");
    const btnEnviar = document.getElementById("btnEnviarPedido");
    const emptyMsg = document.getElementById("emptyCartMsg");
    const items = Object.values(carrito);
    let totalSuma = 0;

    if (items.length === 0) {
      container.innerHTML = "";
      container.appendChild(emptyMsg);
      emptyMsg.style.display = "block";
      btnEnviar.disabled = true;
    } else {
      container.innerHTML = "";
      emptyMsg.style.display = "none";
      btnEnviar.disabled = false;

      items.forEach((item) => {
        totalSuma += item.subtotal;
        const div = document.createElement("div");
        div.className =
          "bg-[#2a1a14]/60 border border-stone-800 rounded-xl p-3 flex justify-between items-center";
        div.innerHTML = `
                    <div class="flex-grow pr-2">
                        <h4 class="font-bold text-stone-200 text-xs truncate max-w-[150px]">${item.producto.nombreproducto}</h4>
                        <div class="font-mono text-[#f5be38] text-[11px] font-bold mt-0.5">S/. ${item.subtotal.toFixed(2)}</div>
                    </div>
                    <div class="flex items-center gap-2 bg-[#1c0e0a] rounded-lg border border-stone-700 px-1 py-1 shrink-0">
                        <button class="w-6 h-6 text-stone-400 hover:text-white cursor-pointer" onclick="modificarCantidad(${item.producto.id}, -1)"><i class="fa-solid fa-minus text-[10px]"></i></button>
                        <span class="font-mono text-xs font-bold text-white w-4 text-center">${item.cantidad}</span>
                        <button class="w-6 h-6 text-stone-400 hover:text-white cursor-pointer" onclick="modificarCantidad(${item.producto.id}, 1)"><i class="fa-solid fa-plus text-[10px]"></i></button>
                    </div>
                `;
        container.appendChild(div);
      });
    }
    document.getElementById("lblSubtotal").textContent = totalSuma.toFixed(2);
    document.getElementById("lblTotal").textContent = totalSuma.toFixed(2);
  }

  // =====================================================================
  // 6. ENVIAR EL PEDIDO AL BACKEND (NUEVO vs ACTUALIZACIÓN)
  // =====================================================================
  document
    .getElementById("btnEnviarPedido")
    .addEventListener("click", async () => {
      const items = Object.values(carrito);
      if (items.length === 0) return;
      if (!usuarioGlobalId) {
        alert("Error de sesión: No se pudo identificar al usuario.");
        return;
      }

      const btn = document.getElementById("btnEnviarPedido");
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> PROCESANDO...`;

      const totalCarritoNuevo = items.reduce(
        (sum, item) => sum + item.subtotal,
        0,
      );
      const tiposervicio =
        document.getElementById("inputTipoServicio")?.value || "SALON";
      const notas = document.getElementById("inputNotas")?.value || "";

      // Transformamos los items del carrito al formato DetallePedido
      const nuevosDetalles = items.map((item) => ({
        producto: { id: item.producto.id },
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.subtotal,
        estadoItem: "EN_PREPARACION",
      }));

      let payload;
      let metodoHTTP;
      let endpointAPI;

      // LÓGICA BIFURCADA: ¿Añadir a pedido existente o Crear nuevo?
      if (pedidoActivoExistente) {
        // ---> MODO ACTUALIZACIÓN (Mesa Ocupada)

        // Juntamos los detalles viejos con los nuevos para que la Base de Datos no borre los anteriores
        const detallesAntiguos = pedidoActivoExistente.detalles.map((d) => ({
          id: d.id,
          producto: { id: d.producto.id },
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
          subtotal: d.subtotal,
          estadoItem: d.estadoItem,
        }));

        payload = {
          id: pedidoActivoExistente.id,
          mesa: { id: parseInt(idMesa) },
          usuario: { id: usuarioGlobalId },
          estadopedido: pedidoActivoExistente.estadopedido,
          tiposervicio: pedidoActivoExistente.tiposervicio, // Mantener el original
          notasespeciales: notas
            ? pedidoActivoExistente.notasespeciales + " | " + notas
            : pedidoActivoExistente.notasespeciales,
          subtotal: pedidoActivoExistente.subtotal + totalCarritoNuevo,
          total: pedidoActivoExistente.total + totalCarritoNuevo,
          detalles: [...detallesAntiguos, ...nuevosDetalles], // Viejos + Nuevos
        };

        // Para actualizar en Spring Boot se usa PUT hacia la URL base, o POST dependiendo de tu configuración.
        // Lo estándar en REST es usar PUT pasando el ID en la URL.
        metodoHTTP = "PUT";
        endpointAPI = `${API_PEDIDOS}/${pedidoActivoExistente.id}`;

        // *NOTA: Si tu backend no tiene PUT configurado, prueba cambiando el metodoHTTP a "POST" y endpointAPI a API_PEDIDOS.
      } else {
        // ---> MODO CREACIÓN (Mesa Libre)
        payload = {
          mesa:
            idMesa && !isNaN(parseInt(idMesa))
              ? { id: parseInt(idMesa) }
              : null,
          usuario: { id: usuarioGlobalId },
          estadopedido: "PENDIENTE",
          tiposervicio: tiposervicio,
          notasespeciales: notas,
          subtotal: totalCarritoNuevo,
          total: totalCarritoNuevo,
          detalles: nuevosDetalles,
        };

        metodoHTTP = "POST";
        endpointAPI = API_PEDIDOS;
      }

      try {
        const response = await fetch(endpointAPI, {
          method: metodoHTTP,
          headers: getHeaders(),
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Fallo al procesar el pedido");
        }

        alert(
          pedidoActivoExistente
            ? "¡Productos añadidos a la orden con éxito!"
            : "¡Pedido nuevo creado exitosamente!",
        );
        window.location.href = "Emp_pedidos.html";
      } catch (error) {
        alert("Error al procesar: " + error.message);
        console.error(error);
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> PROCESAR PEDIDO`;
      }
    });

  // =====================================================================
  // 7. ARRANQUE SECUENCIAL
  // =====================================================================
  async function inicializarPantalla() {
    await cargarUsuario();
    await verificarPedidoExistente(); // Chequea la mesa antes de empezar
    await cargarProductos();
  }

  inicializarPantalla();
})();
