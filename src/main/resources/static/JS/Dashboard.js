// =========================================================================
// CONFIGURACIÓN DE RUTAS API
// =========================================================================
const API_PEDIDOS_URL = `/pedido`;
const API_DETALLES_URL = `/detalle`;

let donutChartInstance = null;
let barChartInstance = null;

function getHeaders() {
  const headers = { "Content-Type": "application/json" };
  const token =
    localStorage.getItem("token") || localStorage.getItem("tu_token_jwt");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

// =========================================================================
// CAPA DE SERVICIOS API (LÓGICA DE NEGOCIO ENFOCADA)
// =========================================================================
const DashboardService = {
  async fetchDatosDashboard() {
    const res = await fetch(API_PEDIDOS_URL, { headers: getHeaders() });
    if (!res.ok) throw new Error("No se pudieron cargar los pedidos");

    const todosLosPedidos = await res.json();

    // 1. Obtener fecha actual en formato local de la PC (YYYY-MM-DD)
    const localDate = new Date();
    const añoLocal = localDate.getFullYear();
    const mesLocal = String(localDate.getMonth() + 1).padStart(2, "0");
    const diaLocal = String(localDate.getDate()).padStart(2, "0");
    const hoyStr = `${añoLocal}-${mesLocal}-${diaLocal}`;
    const mesActualStr = `${añoLocal}-${mesLocal}`;

    // 2. Filtrar "Hoy" usando la propiedad real: fechacreacion o fechaCreacion
    const pedidosHoy = todosLosPedidos.filter((p) => {
      const fechaPedido = p.fechacreacion || p.fechaCreacion || p.fecha;
      return fechaPedido && fechaPedido.startsWith(hoyStr);
    });

    const totalOrdenesHoy = pedidosHoy.length;
    const ingresosHoy = pedidosHoy.reduce(
      (acc, p) => acc + (p.total || p.precioTotal || 0),
      0,
    );
    const gastoPromedio =
      totalOrdenesHoy > 0 ? ingresosHoy / totalOrdenesHoy : 0;

    // 3. Ingreso Mensual usando las propiedades reales
    const pedidosMensualesValidos = todosLosPedidos.filter((p) => {
      const fechaPedido = p.fechacreacion || p.fechaCreacion || p.fecha;
      if (!fechaPedido || !fechaPedido.startsWith(mesActualStr)) return false;

      // Evaluar variantes de estadopedido
      const estado = String(
        p.estadopedido || p.estadoPedido || p.estado || "",
      ).toUpperCase();
      return (
        estado === "PAGADO" || estado === "ENTREGADO" || estado === "FINALIZADO"
      );
    });
    const ingresosMensuales = pedidosMensualesValidos.reduce(
      (acc, p) => acc + (p.total || p.precioTotal || 0),
      0,
    );

    return {
      todosLosPedidos,
      ingresosHoy,
      totalOrdenesHoy,
      gastoPromedio,
      ingresosMensuales,
    };
  },

  async fetchPlatosTendencia() {
    const response = await fetch(API_DETALLES_URL, { headers: getHeaders() });
    if (!response.ok) throw new Error("No se pudieron cargar los detalles");

    const detalles = await response.json();
    const conteoPlatos = {};

    detalles.forEach((d) => {
      // Ofrecemos soporte para relaciones perezosas o mapeos directos idproducto/producto
      const producto = d.producto || d.idproducto;
      const pedido = d.pedido || d.idpedido;

      if (producto) {
        // Buscamos todas las variantes de estado del pedido para no perder registros por nulos
        const estadoPedido = pedido
          ? String(
              pedido.estadopedido || pedido.estadoPedido || pedido.estado || "",
            ).toUpperCase()
          : "";

        // Agrupamos por id del producto
        const id = producto.id;
        if (!conteoPlatos[id]) {
          conteoPlatos[id] = {
            nombre:
              producto.nombreproducto ||
              producto.nombreProducto ||
              producto.nombre ||
              "Plato Desconocido",
            precio: producto.precio || 0,
            cantidad: 0,
          };
        }
        // Sumamos la cantidad vendida
        conteoPlatos[id].cantidad += d.cantidad || 1;
      }
    });

    return Object.values(conteoPlatos)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 3);
  },
};

// =========================================================================
// CONTROLADORES DE RENDERIZADO DOM
// =========================================================================

function inicializarNavegacion() {
  document.getElementById("navBtnLogout")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "Index.html";
  });
}

async function cargarMetricasDashboard() {
  try {
    const data = await DashboardService.fetchDatosDashboard();

    const h3Elements = document.querySelectorAll("h3");
    h3Elements.forEach((h3) => {
      const p = h3.previousElementSibling;
      if (!p) return;

      const textoTarjeta = p.textContent.trim().toUpperCase();
      if (textoTarjeta.includes("INGRESOS HOY")) {
        h3.textContent = `S/. ${data.ingresosHoy.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      } else if (textoTarjeta.includes("ÓRDENES HOY")) {
        h3.textContent = data.totalOrdenesHoy;
      } else if (textoTarjeta.includes("GASTO PROMEDIO")) {
        h3.textContent = `S/. ${data.gastoPromedio.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      } else if (textoTarjeta.includes("INGRESO MENSUAL")) {
        h3.textContent = `S/. ${data.ingresosMensuales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    });

    actualizarGraficos(data.todosLosPedidos);
  } catch (error) {
    console.error("Error al cargar componentes del dashboard:", error);
  }
}

async function cargarPlatosTendencia() {
  try {
    const topPlatos = await DashboardService.fetchPlatosTendencia();
    const emojis = ["🍛", "🍚", "🍗"];

    // Hacemos el selector tolerante tanto a la sintaxis rota del HTML antiguo como a IDs limpios
    const gridPlatos =
      document.getElementById("contenedor-platos-tendencia") ||
      document.querySelector(".grid-cols-1.md-grid-cols-3.gap-5") ||
      document.querySelector(".bg-\\[\\#1c0e0a\\]\\/80 .grid");

    if (gridPlatos) {
      if (topPlatos.length === 0) {
        gridPlatos.innerHTML = `<p class="text-xs text-stone-500 col-span-3 p-4">No hay datos de platos procesados en los detalles.</p>`;
        return;
      }
      gridPlatos.innerHTML = topPlatos
        .map(
          (plato, index) => `
                <div class="bg-[#0c0402] border border-stone-800 rounded-xl overflow-hidden group">
                    <div class="h-32 bg-[#2a1a14] relative overflow-hidden flex items-center justify-center text-5xl">
                        <span class="group-hover:scale-110 transition-transform duration-300">${emojis[index] || "🍽️"}</span>
                    </div>
                    <div class="p-4 flex justify-between items-end">
                        <div>
                            <h4 class="text-sm font-bold text-white">${plato.nombre}</h4>
                            <p class="text-[10px] text-stone-500 mt-1">${plato.cantidad} uds. vendidas</p>
                        </div>
                        <span class="text-xs font-mono font-bold text-[#f5be38]">S/. ${parseFloat(plato.precio).toFixed(2)}</span>
                    </div>
                </div>
            `,
        )
        .join("");
    }
  } catch (error) {
    console.error("Error al renderizar platos en tendencia:", error);
  }
}

function actualizarGraficos(pedidos) {
  // A. Distribución de estados corregido
  const mapeoEstados = {};
  pedidos.forEach((p) => {
    const campoEstado =
      p.estadopedido || p.estadoPedido || p.estado || "INDEFINIDO";
    const estado = String(campoEstado).toUpperCase();
    mapeoEstados[estado] = (mapeoEstados[estado] || 0) + 1;
  });

  const etiquetas = Object.keys(mapeoEstados);
  const valores = Object.values(mapeoEstados);

  if (donutChartInstance && etiquetas.length > 0) {
    donutChartInstance.data.labels = etiquetas;
    donutChartInstance.data.datasets[0].data = valores;

    const paletaColores = [
      "#f5be38",
      "#34d399",
      "#60a5fa",
      "#c084fc",
      "#f87171",
      "#a8a29e",
    ];
    donutChartInstance.data.datasets[0].backgroundColor = etiquetas.map(
      (_, i) => paletaColores[i % paletaColores.length],
    );
    donutChartInstance.update();

    const leyenda = document.querySelector(".mt-4.space-y-2.text-xs");
    if (leyenda) {
      leyenda.innerHTML = etiquetas
        .map((est, i) => {
          const totalPedidos = valores[i];
          const color = paletaColores[i % paletaColores.length];
          return `
                    <div class="flex justify-between items-center text-stone-300">
                        <span class="flex items-center gap-2">
                            <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${color}"></span> ${est}
                        </span>
                        <span class="font-bold">${totalPedidos} ped.</span>
                    </div>`;
        })
        .join("");
    }
  }

  // B. Gráfico de Flujo Semanal corregido
  const conteoSemanal = [0, 0, 0, 0, 0, 0, 0];
  pedidos.forEach((p) => {
    const fechaPedido = p.fechacreacion || p.fechaCreacion || p.fecha;
    if (fechaPedido) {
      const fechaLimpia = fechaPedido.split("T")[0].replace(/-/g, "\/");
      const dia = new Date(fechaLimpia).getDay();
      if (!isNaN(dia)) {
        conteoSemanal[dia]++;
      }
    }
  });

  if (barChartInstance) {
    barChartInstance.data.datasets[0].data = conteoSemanal;
    barChartInstance.update();
  }
}

// =========================================================================
// INICIALIZACIÓN DE GRÁFICOS VACÍOS Y LLAMADO DE COMPONENTES
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
  Chart.defaults.color = "#78716c";
  Chart.defaults.font.family = "ui-sans-serif, system-ui, sans-serif";

  const ctxDonut = document.getElementById("salesDonutChart")?.getContext("2d");
  if (ctxDonut) {
    donutChartInstance = new Chart(ctxDonut, {
      type: "doughnut",
      data: {
        labels: [],
        datasets: [
          { data: [], backgroundColor: [], borderWidth: 0, hoverOffset: 4 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "75%",
        plugins: { legend: { display: false } },
      },
    });
  }

  const ctxBar = document.getElementById("orderBarChart")?.getContext("2d");
  if (ctxBar) {
    barChartInstance = new Chart(ctxBar, {
      type: "bar",
      data: {
        labels: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
        datasets: [
          {
            label: "Órdenes",
            data: [0, 0, 0, 0, 0, 0, 0],
            backgroundColor: "rgba(245, 190, 56, 0.85)",
            borderColor: "#f5be38",
            borderWidth: 1,
            borderRadius: 6,
            barThickness: 16,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: "#1c0e0a", drawBorder: false },
            ticks: { precision: 0 },
          },
          x: { grid: { display: false, drawBorder: false } },
        },
      },
    });
  }

  inicializarNavegacion();
  cargarMetricasDashboard();
  cargarPlatosTendencia();
});
