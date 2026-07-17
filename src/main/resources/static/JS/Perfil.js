(function () {
  // Manejo Automático de la Pestaña Activa en el Navbar basándose en el nombre de archivo
  const currentPath = window.location.pathname.split("/").pop();
  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    const indicator = link.querySelector(".active-indicator");
    const icon = link.querySelector("i");

    if (
      currentPath === href ||
      (currentPath === "" && href === "perfil.html")
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

  document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    // Si no hay token, lo pateamos de vuelta al login
    if (!token) {
      window.location.href = "Index.html";
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/usuario/mi-perfil", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Si el servidor rechaza la petición, capturamos el mensaje exacto
      if (!response.ok) {
        const errorBackend = await response.text();
        throw new Error(
          `Rechazo del servidor (Código ${response.status}): ${errorBackend}`,
        );
      }

      const usuario = await response.json();
      localStorage.setItem("userId", usuario.id);

      // 2. FUNCIÓN ANTI-ERRORES: Solo pone el texto si el ID realmente existe
      const inyectarTexto = (id, texto) => {
        const elemento = document.getElementById(id);
        if (elemento) {
          elemento.textContent = texto;
        } else {
          console.warn(`Aviso: Falta poner el id="${id}" en tu HTML.`);
        }
      };

      // 3. Calculamos el primer nombre de forma segura (por si acaso no tiene nombre registrado)
      let primerNombre = "USUARIO";
      if (usuario.nombreCompleto) {
        primerNombre = usuario.nombreCompleto.split(" ")[0].toUpperCase();
      }

      // Imprimimos los datos en consola por si queremos ver cómo los envía Java
      console.log("Datos completos que llegan del Backend:", usuario);

      // 1. Declaramos la variable AFUERA para que nunca salga "not defined"
      let rolBD = "";

      // 2. Buscamos el rol (Spring Boot a veces usa 'roles' y a veces 'authorities')
      if (usuario.roles && usuario.roles.length > 0) {
        rolBD = usuario.roles[0].nombre || usuario.roles[0].authority || "";
      } else if (usuario.authorities && usuario.authorities.length > 0) {
        rolBD = usuario.authorities[0].authority || "";
      }

      // 3. Hacemos la traducción amigable
      if (rolBD) {
        if (rolBD === "ROLE_USER" || rolBD === "USER") {
          nombreRol = "Cliente";
        } else if (rolBD === "ROLE_ADMIN" || rolBD === "ADMIN") {
          nombreRol = "Administrador";
        } else {
          nombreRol = rolBD.replace("ROLE_", "");
        }
      }

      // 4. Inyectamos los datos usando nuestra nueva función segura
      inyectarTexto("cardNombre", primerNombre);
      inyectarTexto("cardEmail", usuario.email);
      inyectarTexto("cardRol", nombreRol);
      inyectarTexto("infoNombre", usuario.nombreCompleto || "No registrado");
      inyectarTexto("infoEmail", usuario.email);
      inyectarTexto("infoTelefono", usuario.telefono || "No registrado");
      inyectarTexto("infoDireccion", usuario.direccion || "No registrada");
      inyectarTexto(
        "statPedidos",
        usuario.totalPedidos !== undefined ? usuario.totalPedidos : "0",
      );
      inyectarTexto(
        "statPedidosActivos",
        usuario.pedidosActivos !== undefined ? usuario.pedidosActivos : "0",
      );
      inyectarTexto(
        "statCalificacion",
        usuario.calificacion !== undefined ? usuario.calificacion : "0.0",
      );
    } catch (error) {
      // AQUÍ PAUSAMOS LA EXPULSIÓN Y MOSTRAMOS EL ERROR
      console.error("Error detallado:", error);
      alert(
        "ALERTA DE DEBUG: " +
          error.message +
          "\n\nPresiona F12 para ver la consola.",
      );

      // Comentamos la expulsión temporalmente
      // localStorage.clear();
      // window.location.href = "login.html";
    }
  });
  // Evento Salir
  document.getElementById("navBtnLogout")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "Index.html";
  });
})();
