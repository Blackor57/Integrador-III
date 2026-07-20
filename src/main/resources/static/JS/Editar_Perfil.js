(function () {
  const API_PERFIL = "/usuario/mi-perfil";
  const API_USUARIOS = "/usuario";

  let usuarioId = null;
  let rolGlobal = "ROLE_USER"; // Guardaremos el rol aquí

  function getHeaders() {
    const token =
      localStorage.getItem("token") || localStorage.getItem("tu_token_jwt");
    if (!token) {
      window.location.href = "Index.html";
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  // --- NUEVA FUNCIÓN DE REDIRECCIÓN INTELIGENTE ---
  window.regresarAlPerfil = function () {
    // Si es un cliente normal, va a su perfil
    if (rolGlobal === "ROLE_USER") {
      window.location.href = "perfil.html";
    }
    // Si es Administrador, Mozo, Caja, Barman, Cocina, va al perfil de empleado
    else {
      window.location.href = "Emp_Perfil.html";
      // Nota: Si el administrador tiene su propio perfil aparte (ej. Admin_Perfil.html),
      // puedes agregar un 'else if (rolGlobal === "ROLE_ADMIN")' aquí.
    }
  };

  // 1. Cargar los datos actuales en el formulario
  async function cargarDatosPerfil() {
    try {
      const response = await fetch(API_PERFIL, { headers: getHeaders() });
      if (!response.ok) throw new Error("No se pudo cargar el perfil");

      const usuario = await response.json();
      usuarioId = usuario.id;

      // Capturamos el rol principal del usuario
      if (usuario.roles && usuario.roles.length > 0) {
        rolGlobal = usuario.roles[0].nombre;
      }

      // Llenamos los inputs con los datos
      document.getElementById("inputNombre").value =
        usuario.nombreCompleto || "";
      document.getElementById("inputEmail").value = usuario.email || "";
      document.getElementById("inputTelefono").value = usuario.telefono || "";
      document.getElementById("inputDireccion").value = usuario.direccion || "";
    } catch (error) {
      alert("Error al cargar tus datos. Intenta iniciar sesión nuevamente.");
      console.error(error);
    }
  }

  // 2. Guardar Cambios
  document
    .getElementById("formEditarPerfil")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!usuarioId) {
        alert("Error de sesión: No se identificó tu usuario.");
        return;
      }

      const btnGuardar = document.getElementById("btnGuardar");
      btnGuardar.disabled = true;
      btnGuardar.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> GUARDANDO...`;

      const payload = {
        id: usuarioId,
        nombreCompleto: document.getElementById("inputNombre").value.trim(),
        email: document.getElementById("inputEmail").value.trim(),
        telefono: document.getElementById("inputTelefono").value.trim(),
        direccion: document.getElementById("inputDireccion").value.trim(),
      };

      const passwordNueva = document
        .getElementById("inputPassword")
        .value.trim();
      if (passwordNueva) {
        payload.password = passwordNueva;
      }

      try {
        const response = await fetch(`${API_USUARIOS}/${usuarioId}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "No se pudo actualizar el perfil");
        }

        alert("¡Perfil actualizado con éxito!");

        // 🚀 Usamos la redirección inteligente en lugar de history.back()
        window.regresarAlPerfil();
      } catch (error) {
        alert("Hubo un error al actualizar tus datos: " + error.message);
        console.error(error);
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = `<i class="fa-solid fa-save"></i> GUARDAR CAMBIOS`;
      }
    });

  // Iniciar
  cargarDatosPerfil();
})();
