(function () {
        // =====================================================================
        // CONFIGURACIÓN Y REFERENCIAS
        // =====================================================================
        const API_BASE_URL = "http://localhost:8080/usuario"; // Asegúrate de que el puerto sea el correcto

        const addModal = document.getElementById("addModal");
        const editModal = document.getElementById("editModal");
        const tableBody = document.getElementById("tableBodyUsuarios");

        // Cerrar modales
        document.querySelectorAll(".close-modal-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            addModal.classList.add("hidden");
            editModal.classList.add("hidden");
          });
        });

        // =====================================================================
        // 1. LISTAR USUARIOS (GET)
        // =====================================================================
        async function cargarUsuarios() {
          try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) throw new Error("Error al obtener usuarios");

            const usuarios = await response.json();
            renderizarTabla(usuarios);
          } catch (error) {
            console.error("Error:", error);
            tableBody.innerHTML = `<tr><td colspan="9" class="p-4 text-center text-red-400">Error al cargar la base de datos</td></tr>`;
          }
        }

        function renderizarTabla(usuarios) {
          tableBody.innerHTML = ""; // Limpiamos la tabla estática del HTML

          usuarios.forEach((user) => {
            // Asumimos que tu backend devuelve algún campo de estado (ej. estado: 'ACTIVO' o 'SUSPENDED')
            // Si no lo tienes, asume que todos están activos por defecto
            const esActivo = user.activo === true; // Mapeado directo al Boolean de tu entidad
            const estadoClases = esActivo ? "" : "opacity-40 grayscale";
            const btnIcono = esActivo ? "fa-ban" : "fa-check";
            const btnColor = esActivo
              ? "hover:text-red-400"
              : "hover:text-green-400";
            const titleAccion = esActivo
              ? "Desactivar usuario"
              : "Activar usuario";

            // Extraer el nombre del rol principal (Ej: "ROLE_ADMIN")
            let rolMostrar = "ROLE_USER";
            if (user.roles && user.roles.length > 0) {
              rolMostrar = user.roles[0].nombre;
            }

            // Para que se vea bonito en pantalla (Opcional, quitando el "ROLE_")
            const rolLimpio = rolMostrar.replace("ROLE_", "");

            const tr = document.createElement("tr");
            tr.className = `hover:bg-[#2a1a14]/30 transition-all duration-300 ${estadoClases}`;
            tr.setAttribute("data-id", user.id);
            tr.setAttribute("data-estado", esActivo ? "activo" : "inactivo");

            tr.innerHTML = `
              <td class="p-4 font-mono text-stone-500">${user.id}</td>
              <td class="p-4 font-bold text-white font-mono" data-field="usuario">${user.username || ""}</td>
              <td class="p-4 font-medium text-stone-200" data-field="nombre_completo">${user.nombreCompleto || ""}</td>
              <td class="p-4 font-mono text-stone-300" data-field="email">${user.email || ""}</td>
              <td class="p-4 font-mono text-stone-400" data-field="telefono">${user.telefono || ""}</td>
              <td class="p-4 text-stone-400 max-w-xs truncate" data-field="direccion">${user.direccion || ""}</td>
              <td class="p-4 font-bold text-[#e07a48]" data-field="rol" data-raw-rol="${rolMostrar}">${rolLimpio}</td>
              <td class="p-4 font-mono text-stone-500">${user.fecRegistro ? new Date(user.fecRegistro).toLocaleString() : "-"}</td>
              <td class="p-4 text-center space-x-3">
                <button class="text-stone-400 hover:text-[#f5be38] transition-colors cursor-pointer btn-edit" title="Modificar datos">
                  <i class="fa-regular fa-pen-to-square"></i>
                </button>
                <button class="text-stone-400 ${btnColor} transition-colors cursor-pointer btn-toggle-status" title="${titleAccion}">
                  <i class="fa-solid ${btnIcono} icono-estado"></i>
                </button>
              </td>
            `;
            tableBody.appendChild(tr);
          });
        }

        // Cargar usuarios al iniciar la página
        cargarUsuarios();

        // =====================================================================
        // 2. AGREGAR USUARIO (POST)
        // =====================================================================
        document
          .getElementById("btnOpenAddModal")
          .addEventListener("click", () => {
            document.getElementById("formAddUsuario").reset();
            addModal.classList.remove("hidden");
          });

        document
          .getElementById("formAddUsuario")
          .addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);

            // 1. Mapeo exacto a las variables de tu Entidad Java
            const payload = {
              username: formData.get("usuario"), // En Java: username
              password: formData.get("contraseña"), // En Java: password
              nombreCompleto: formData.get("nombre_completo"),
              email: formData.get("email"),
              telefono: formData.get("telefono"),
              direccion: formData.get("direccion"),
            };

            try {
              // 2. Petición POST para crear el usuario base
              const response = await fetch(API_BASE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });

              if (!response.ok)
                throw new Error(
                  "Fallo al crear el usuario. Verifica tu backend.",
                );

              // 3. Capturamos el usuario creado (necesitamos su nuevo ID)
              const nuevoUsuario = await response.json();
              const rolSeleccionado = formData.get("rol");

              // 4. Si el usuario se creó bien y elegimos un rol, se lo asignamos
              if (rolSeleccionado && nuevoUsuario.id) {
                const mapaRoles = {
                  ROLE_USER: 1,
                  ROLE_ADMIN: 2,
                  ROLE_MOZO: 3,
                  ROLE_BARMAN: 4,
                  ROLE_COCINA: 5,
                  ROLE_CAJA: 6,
                };
                const idRol = mapaRoles[rolSeleccionado];

                // Usamos tu endpoint existente para asignarle el rol
                await fetch(
                  `${API_BASE_URL}/${nuevoUsuario.id}/roles/${idRol}`,
                  {
                    method: "POST",
                  },
                );
              }

              // 5. Refrescamos la tabla y cerramos el modal
              console.log("¡Usuario creado y rol asignado con éxito!");
              await cargarUsuarios();
              addModal.classList.add("hidden");
            } catch (error) {
              alert("No se pudo crear el usuario. " + error.message);
              console.error(error);
            }
          });
        // =====================================================================
        // 3. EVENTOS DE LA TABLA (EDITAR Y DESACTIVAR/ACTIVAR)
        // =====================================================================
        tableBody.addEventListener("click", async (e) => {
          const btnEdit = e.target.closest(".btn-edit");
          const btnToggleStatus = e.target.closest(".btn-toggle-status");
          const row = e.target.closest("tr");

          if (!row) return;
          const userId = row.getAttribute("data-id");

          // --- LÓGICA DE EDICIÓN ---
          if (btnEdit) {
            if (row.getAttribute("data-estado") === "inactivo") {
              alert(
                "No puedes editar un usuario desactivado. Actívalo primero.",
              );
              return;
            }

            document.getElementById("editInputId").value = userId;
            document.getElementById("editDisplayId").textContent = userId;

            // Rellenar formulario (mapeando de la tabla al modal)
            document.getElementById("editUsuario").value = row
              .querySelector('[data-field="usuario"]')
              .textContent.trim();
            document.getElementById("editNombre").value = row
              .querySelector('[data-field="nombre_completo"]')
              .textContent.trim();
            document.getElementById("editEmail").value = row
              .querySelector('[data-field="email"]')
              .textContent.trim();
            document.getElementById("editTelefono").value = row
              .querySelector('[data-field="telefono"]')
              .textContent.trim();
            document.getElementById("editDireccion").value = row
              .querySelector('[data-field="direccion"]')
              .textContent.trim();

            // Seleccionar el rol en el <select>
            const rolActual = row
              .querySelector('[data-field="rol"]')
              .getAttribute("data-raw-rol");
            const selectRol = document.getElementById("editRol");
            for (let i = 0; i < selectRol.options.length; i++) {
              if (selectRol.options[i].value === rolActual) {
                selectRol.selectedIndex = i;
                break;
              }
            }

            editModal.classList.remove("hidden");
          }

          // --- LÓGICA DE ACTIVAR / DESACTIVAR ---
          if (btnToggleStatus) {
            const estadoActual = row.getAttribute("data-estado");
            const esActivo = estadoActual === "activo";
            const accionTexto = esActivo ? "desactivar" : "activar";

            if (
              confirm(
                `¿Seguro que deseas ${accionTexto} el registro con ID: ${userId}?`,
              )
            ) {
              // Construimos la URL en base a tus endpoints del controlador
              const endpoint = esActivo
                ? `${API_BASE_URL}/${userId}/desactivar`
                : `${API_BASE_URL}/${userId}/activar`;

              try {
                const response = await fetch(endpoint, { method: "PUT" });
                if (!response.ok) throw new Error("Error en el servidor");

                const data = await response.json(); // Map<String, String> del backend
                console.log(data.mensaje); // "Usuario desactivado con éxito."

                // Actualizar el DOM visualmente
                const icono = btnToggleStatus.querySelector(".icono-estado");

                if (esActivo) {
                  // Pasó a Inactivo
                  row.setAttribute("data-estado", "inactivo");
                  row.classList.add("opacity-40", "grayscale");
                  btnToggleStatus.classList.replace(
                    "hover:text-red-400",
                    "hover:text-green-400",
                  );
                  btnToggleStatus.setAttribute("title", "Activar usuario");
                  icono.classList.replace("fa-ban", "fa-check");
                } else {
                  // Pasó a Activo
                  row.setAttribute("data-estado", "activo");
                  row.classList.remove("opacity-40", "grayscale");
                  btnToggleStatus.classList.replace(
                    "hover:text-green-400",
                    "hover:text-red-400",
                  );
                  btnToggleStatus.setAttribute("title", "Desactivar usuario");
                  icono.classList.replace("fa-check", "fa-ban");
                }
              } catch (error) {
                alert("Ocurrió un error al intentar cambiar el estado.");
                console.error(error);
              }
            }
          }
        });
        // =====================================================================
        // 4. GUARDAR EDICIÓN (PUT) - CON CAMBIO DE ROL INCLUIDO
        // =====================================================================
        document
          .getElementById("formEditUsuario")
          .addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const userId = formData.get("id");

            // 1. Datos básicos del usuario a actualizar
            const payload = {
              username: formData.get("usuario"),
              nombreCompleto: formData.get("nombre_completo"),
              email: formData.get("email"),
              telefono: formData.get("telefono"),
              direccion: formData.get("direccion"),
            };

            const contrasenia = formData.get("contraseña");
            if (contrasenia && contrasenia.trim() !== "") {
              payload.password = contrasenia;
            }

            try {
              // 2. Actualizar los datos básicos (PUT)
              const response = await fetch(`${API_BASE_URL}/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });

              if (!response.ok)
                throw new Error("Error al actualizar datos básicos");

              // ==========================================
              // 3. LÓGICA PARA ACTUALIZAR EL ROL
              // ==========================================
              // Obtenemos la fila para saber qué rol tenía ANTES de guardar
              const row = document.querySelector(`tr[data-id="${userId}"]`);
              const rolAntiguo = row
                .querySelector('[data-field="rol"]')
                .getAttribute("data-raw-rol");
              const nuevoRol = formData.get("rol"); // El que se seleccionó en el <select>

              // Mapa para convertir el texto (ROLE_ADMIN) en su ID numérico (2)
              const mapaRoles = {
                ROLE_USER: 1,
                ROLE_ADMIN: 2,
                ROLE_MOZO: 3,
                ROLE_BARMAN: 4,
                ROLE_COCINA: 5,
                ROLE_CAJA: 6,
              };

              // Solo hacemos cambios de rol si el usuario seleccionó uno distinto al que ya tenía
              if (nuevoRol && nuevoRol !== rolAntiguo) {
                // Paso A: Eliminar el rol antiguo
                if (rolAntiguo && mapaRoles[rolAntiguo]) {
                  const idRolAntiguo = mapaRoles[rolAntiguo];
                  await fetch(
                    `${API_BASE_URL}/${userId}/roles/${idRolAntiguo}`,
                    {
                      method: "DELETE",
                    },
                  );
                }

                // Paso B: Asignar el nuevo rol
                const idNuevoRol = mapaRoles[nuevoRol];
                await fetch(`${API_BASE_URL}/${userId}/roles/${idNuevoRol}`, {
                  method: "POST",
                });
              }

              // 4. Refrescamos la tabla y cerramos el modal
              console.log("¡Usuario y rol actualizados con éxito!");
              await cargarUsuarios();
              editModal.classList.add("hidden");
            } catch (error) {
              alert(
                "No se pudieron guardar los cambios de forma completa. " +
                  error.message,
              );
              console.error(error);
            }
          });
      })();