 function decodificarJwt(token) {
        try {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map(function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join(""),
          );
          return JSON.parse(jsonPayload);
        } catch (error) {
          return null;
        }
      }
      (function () {
        // A. Manejo de Apertura y Cierre del Modal
        const modal = document.getElementById("modalContainer");
        const btnOpen = document.getElementById("btnOpenModal");
        const btnClose = document.getElementById("btnCloseModal");
        const btnCancel = document.getElementById("btnCancelModal");
        const orderForm = document.getElementById("apiOrderForm");

        const toggleModal = (show) => modal.classList.toggle("hidden", !show);

        btnOpen.addEventListener("click", () => toggleModal(true));
        btnClose.addEventListener("click", () => toggleModal(false));
        btnCancel.addEventListener("click", () => toggleModal(false));

        (function () {
          // ... (Manten tu código del Navbar y Modal aquí) ...

          const contenedorPedidos =
            document.getElementById("contenedorPedidos");
          const token = localStorage.getItem("token");

          async function cargarMisPedidos() {
            if (!token) {
              window.location.href = "login.html";
              return;
            }

            try {
              contenedorPedidos.innerHTML = `<div class="col-span-full text-center text-stone-400 py-10"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><p>Cargando tus pedidos...</p></div>`;

              // ¡Esta es la URL limpia! El backend leerá el "Authorization" y sabrá quién es.
              const urlBackend = `http://localhost:8080/pedido/usuario/mis-pedidos`;

              const response = await fetch(urlBackend, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              });
              try {
                contenedorPedidos.innerHTML = `<div class="col-span-full text-center text-stone-400 py-10"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><p>Cargando tus pedidos...</p></div>`;

                const urlBackend = `http://localhost:8080/pedido/usuario/mis-pedidos`;

                const response = await fetch(urlBackend, {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                });

                if (!response.ok) {
                  throw new Error("No se pudieron cargar los pedidos.");
                }

                // 🚨 ESTA ES LA LÍNEA CLAVE QUE FALTABA O ESTABA MAL ESCRITA
                const pedidos = await response.json();

                contenedorPedidos.innerHTML = "";

                // Validación de seguridad por si el backend devuelve un objeto vacío en lugar de un arreglo
                if (!pedidos || pedidos.length === 0) {
                  contenedorPedidos.innerHTML = `<div class="col-span-full text-center text-stone-400 py-10">Aún no has realizado ningún pedido.</div>`;
                  return;
                }

                // Renderizado iterativo
                pedidos.forEach((pedido) => {
                  const totalFormateado = Number(pedido.total || 0).toFixed(2);
                  const estado = pedido.estado || "EN_ESPERA";
                  const fecha = pedido.fecha
                    ? new Date(pedido.fecha).toLocaleDateString()
                    : "Reciente";
                  const mesaStr = pedido.mesa
                    ? `Mesa ${pedido.mesa.nombre}`
                    : "Para llevar";

                  const tarjetaHTML = `
                            <article class="bg-[#3d2a21]/60 border border-[#543d32] rounded-[1.8rem] p-5 shadow-xl flex flex-col justify-between hover:border-[#f5be38]/30 transition-all" data-id-pedido="${pedido.id}">
                                <div>
                                    <div class="flex justify-between items-start border-b border-stone-800 pb-2 mb-3">
                                        <div>
                                            <h2 class="font-serif font-bold text-white tracking-wide text-sm uppercase">Pedido #${pedido.id}</h2>
                                            <p class="text-[9px] text-stone-500 font-mono mt-0.5">${mesaStr} | ${fecha}</p>
                                        </div>
                                        <div class="relative">
                                            <span class="bg-[#2a1a14] ${estado === "ENTREGADO" ? "text-green-400 border-green-500/30" : "text-amber-500 border-amber-500/30"} font-bold text-[10px] tracking-wider px-2 py-1 rounded-md border uppercase">
                                                ${estado.replace("_", " ")}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-2 gap-2 bg-[#2a1a14]/40 p-2.5 rounded-xl text-xs mb-4 border border-stone-800/40">
                                        <div><span class="text-[9px] font-bold text-stone-500 block uppercase">Servicio</span><span class="font-medium text-stone-300">BOLETA</span></div>
                                        <div class="text-right"><span class="text-[9px] font-bold text-stone-500 block uppercase">Total</span><span class="font-mono text-[#f5be38] font-bold">S/. ${totalFormateado}</span></div>
                                    </div>
                                </div>
                            </article>
                        `;
                  contenedorPedidos.insertAdjacentHTML(
                    "beforeend",
                    tarjetaHTML,
                  );
                });
              } catch (error) {
                console.error("Error cargando pedidos:", error);
                contenedorPedidos.innerHTML = `<div class="col-span-full text-center text-red-400 py-10">Hubo un error al cargar tus pedidos.</div>`;
              }

              // ... (El resto del código de renderizado queda exactamente igual) ...

              // 3. Renderizar (Dibuja el HTML como lo hicimos antes)
              pedidos.forEach((pedido) => {
                const totalFormateado = Number(pedido.total || 0).toFixed(2);
                const estado = pedido.estado || "EN_ESPERA";
                const fecha = pedido.fecha
                  ? new Date(pedido.fecha).toLocaleDateString()
                  : "Reciente";
                const mesaStr = pedido.mesa
                  ? `Mesa ${pedido.mesa.nombre}`
                  : "Para llevar";

                const tarjetaHTML = `
                            <article class="bg-[#3d2a21]/60 border border-[#543d32] rounded-[1.8rem] p-5 shadow-xl flex flex-col justify-between hover:border-[#f5be38]/30 transition-all" data-id-pedido="${pedido.id}">
                                <div>
                                    <div class="flex justify-between items-start border-b border-stone-800 pb-2 mb-3">
                                        <div>
                                            <h2 class="font-serif font-bold text-white tracking-wide text-sm uppercase">Pedido #${pedido.id}</h2>
                                            <p class="text-[9px] text-stone-500 font-mono mt-0.5">${mesaStr} | ${fecha}</p>
                                        </div>
                                        <div class="relative">
                                            <span class="bg-[#2a1a14] ${estado === "ENTREGADO" ? "text-green-400 border-green-500/30" : "text-amber-500 border-amber-500/30"} font-bold text-[10px] tracking-wider px-2 py-1 rounded-md border uppercase">
                                                ${estado.replace("_", " ")}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-2 gap-2 bg-[#2a1a14]/40 p-2.5 rounded-xl text-xs mb-4 border border-stone-800/40">
                                        <div><span class="text-[9px] font-bold text-stone-500 block uppercase">Servicio</span><span class="font-medium text-stone-300">BOLETA</span></div>
                                        <div class="text-right"><span class="text-[9px] font-bold text-stone-500 block uppercase">Total</span><span class="font-mono text-[#f5be38] font-bold">S/. ${totalFormateado}</span></div>
                                    </div>
                                </div>
                            </article>
                        `;
                contenedorPedidos.insertAdjacentHTML("beforeend", tarjetaHTML);
              });
            } catch (error) {
              console.error("Error cargando pedidos:", error);
              contenedorPedidos.innerHTML = `<div class="col-span-full text-center text-red-400 py-10">Hubo un error al cargar tus pedidos.</div>`;
            }
          }

          cargarMisPedidos();
        })();

        // D. Logout
        document
          .getElementById("navBtnLogout")
          ?.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "login.html";
          });
      })();