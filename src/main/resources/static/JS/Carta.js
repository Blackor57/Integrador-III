 (function () {
        // --- 1. LÓGICA DE NAVEGACIÓN Y VISUAL ---
        const currentPath = window.location.pathname.split("/").pop();
        document.querySelectorAll(".nav-link").forEach((link) => {
          const href = link.getAttribute("href");
          const indicator = link.querySelector(".active-indicator");
          const icon = link.querySelector("i");

          if (
            currentPath === href ||
            (currentPath === "" && href === "index.html")
          ) {
            link.classList.remove("text-stone-600", "hover:text-[#cf6937]");
            link.classList.add("text-[#cf6937]");
            if (icon) {
              icon.classList.remove("text-stone-400");
              icon.classList.add("text-[#cf6937]");
            }
            if (indicator) {
              indicator.classList.remove("hidden");
            }
          }
        });

        // Logout
        document
          .getElementById("navBtnLogout")
          ?.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "login.html";
          });

        // --- 2. LÓGICA DEL BACKEND Y FILTRADO DE LA CARTA ---
        const contenedorPlatos = document.getElementById("contenedorPlatos");
        let todosLosPlatos = []; // Aquí guardaremos la lista maestra

        // Función para descargar los datos UNA sola vez
        async function cargarPlatos() {
          try {
            contenedorPlatos.innerHTML = `<div class="col-span-full text-center text-stone-400 py-10"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><p>Cargando la carta...</p></div>`;

            const response = await fetch("http://localhost:8080/producto");
            if (!response.ok) throw new Error("No se pudo cargar la carta.");

            todosLosPlatos = await response.json();

            // Al iniciar, renderizamos TODOS los platos
            renderizarPlatos(todosLosPlatos);
          } catch (error) {
            console.error("Error cargando platos:", error);
            contenedorPlatos.innerHTML = `<div class="col-span-full text-center text-red-400 py-10">Hubo un error al cargar los platos. Verifique el servidor.</div>`;
          }
        }

        // Función para dibujar las tarjetas en el HTML
        function renderizarPlatos(platosAMostrar) {
          contenedorPlatos.innerHTML = "";

          if (platosAMostrar.length === 0) {
            contenedorPlatos.innerHTML = `<div class="col-span-full text-center text-stone-400 py-10">No hay productos en esta categoría.</div>`;
            return;
          }

          platosAMostrar.forEach((plato) => {
            const precioFormateado = Number(plato.precio).toFixed(2);
            const descripcion =
              plato.descripcion || "Delicioso platillo tradicional.";

            // Asignar un emoji según la categoría (Opcional, para darle vida)
            let emoji = "🍽️";
            const nombreCat = (
              plato.categoria?.nombre ||
              plato.categoria ||
              ""
            ).toLowerCase();
            if (nombreCat.includes("Bebidas")) emoji = "🥤";
            else if (nombreCat.includes("Platos a la carta")) emoji = "🍲";

            const tarjetaHTML = `
                        <article class="bg-[#3d2a21]/60 border border-[#543d32] rounded-2xl overflow-hidden shadow-lg flex flex-col group hover:border-[#f5be38]/50 transition-all">
                            <div class="bg-[#2a1a14]/60 aspect-video w-full flex items-center justify-center relative overflow-hidden text-4xl border-b border-[#543d32]/40">
                                <span class="group-hover:scale-110 transition-transform duration-300">${emoji}</span>
                                <span class="absolute top-3 right-3 bg-[#e07a48] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">S/. ${precioFormateado}</span>
                            </div>
                            <div class="p-4 flex-grow flex flex-col justify-between space-y-3">
                                <div>
                                    <h3 class="font-serif font-bold text-stone-100 text-base tracking-wide uppercase">${plato.nombreproducto}</h3>
                                    <p class="text-xs text-stone-400 font-light mt-1 line-clamp-2">${descripcion}</p>
                                </div>
                                <button onclick="agregarAlCarrito(${plato.id})" class="w-full bg-[#e07a48]/20 hover:bg-[#e07a48] text-[#f5be38] hover:text-white font-medium text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5">
                                    <i class="fa-solid fa-plus text-[10px]"></i> Agregar al pedido
                                </button>
                            </div>
                        </article>
                    `;
            contenedorPlatos.insertAdjacentHTML("beforeend", tarjetaHTML);
          });
        }

        // --- 3. EVENTOS DE LOS BOTONES DE FILTRO ---
        document.querySelectorAll(".category-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            // 3.1. Cambio visual estético del botón activo
            const currentActive = btn.parentElement.querySelector(
              ".bg-\\[\\#e07a48\\]",
            );
            if (currentActive) {
              currentActive.classList.remove(
                "bg-[#e07a48]",
                "text-white",
                "font-semibold",
                "shadow-md",
              );
              currentActive.classList.add(
                "bg-[#3d2a21]/40",
                "text-stone-400",
                "border",
                "border-stone-800",
                "font-medium",
                "hover:text-white",
                "hover:border-stone-600",
              );
            }

            btn.classList.remove(
              "bg-[#3d2a21]/40",
              "text-stone-400",
              "border",
              "border-stone-800",
              "font-medium",
              "hover:text-white",
              "hover:border-stone-600",
            );
            btn.classList.add(
              "bg-[#e07a48]",
              "text-white",
              "font-semibold",
              "shadow-md",
            );

            // 3.2. Lógica de filtrado explícita (Corregida para Producto -> Subcategoria -> Categoria)
            const categoriaSeleccionada = btn.textContent.trim().toLowerCase();

            if (categoriaSeleccionada === "todos") {
              renderizarPlatos(todosLosPlatos);
            } else {
              const platosFiltrados = todosLosPlatos.filter((plato) => {
                // EXTRAEMOS PASANDO POR LA SUBCATEGORÍA
                const nombreCategoriaBD = (
                  plato.subcategoria?.categoria?.nombre || ""
                ).toLowerCase();

                // Opcional: También podemos buscar en la subcategoría por si acaso (ej. "Gaseosas")
                const nombreSubcategoriaBD = (
                  plato.subcategoria?.nombre || ""
                ).toLowerCase();

                // Si el botón es Bebidas
                if (categoriaSeleccionada === "bebidas") {
                  return (
                    nombreCategoriaBD.includes("bebida") ||
                    nombreSubcategoriaBD.includes("bebida")
                  );
                }

                // Si el botón es Platos a la Carta
                if (categoriaSeleccionada === "platos a la carta") {
                  return (
                    nombreCategoriaBD.includes("plato") ||
                    nombreCategoriaBD.includes("carta")
                  );
                }

                return false;
              });

              renderizarPlatos(platosFiltrados);
            }
          });
        });

        // --- 4. BUSCADOR EN TIEMPO REAL ---
        const searchInput = document.getElementById("searchFood");
        searchInput.addEventListener("input", (e) => {
          const textoBusqueda = e.target.value.toLowerCase();

          const platosFiltrados = todosLosPlatos.filter((plato) => {
            return plato.nombre.toLowerCase().includes(textoBusqueda);
          });

          renderizarPlatos(platosFiltrados);
        });

        // Acción vacía para el carrito
        window.agregarAlCarrito = function (idPlato) {
          console.log("Añadiendo plato con ID al carrito:", idPlato);
        };

        // INICIAR SISTEMA
        cargarPlatos();
      })();