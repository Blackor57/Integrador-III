document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const passwordInput = document.getElementById("password");
  const togglePasswordBtn = document.getElementById("togglePassword");
  const eyeIcon = document.getElementById("eyeIcon");
  const submitText = document.getElementById("submitText");
  const loadingSpinner = document.getElementById("loadingSpinner");

  // 1. Mostrar/Ocultar Contraseña
  togglePasswordBtn.addEventListener("click", () => {
    const isPassword = passwordInput.getAttribute("type") === "password";
    passwordInput.setAttribute("type", isPassword ? "text" : "password");

    // Cambia el icono de ojo abierto a cerrado
    eyeIcon.classList.toggle("fa-eye");
    eyeIcon.classList.toggle("fa-eye-slash");
  });

  // 2. Manejo del Submit e Integración con Backend
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Resetear errores anteriores
    resetErrors();

    // Capturar datos del formulario estructurados
    const formData = new FormData(loginForm);
    const data = Object.fromEntries(formData.entries());

    // Validación básica del lado del cliente antes de enviar
    let hasErrors = false;
    if (!data.email) {
      showError("emailError", "El correo electrónico es requerido.");
      hasErrors = true;
    }
    if (!data.password) {
      showError("passwordError", "La contraseña es requerida.");
      hasErrors = true;
    }

    if (hasErrors) return;

    // Estado de Carga (UI Feedback)
    setLoading(true);

    try {
      const response = await fetch("auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        // Leemos el mensaje de error del backend en lugar de colapsar
        throw new Error("Credenciales incorrectas o usuario no encontrado.");
      }

      const result = await response.json();

      // 1. Guardamos el token
      localStorage.setItem("token", result.token);

      // 2. Abrimos el token para ver qué hay dentro
      const payload = decodificarJwt(result.token);
      console.log("Información oculta en tu Token:", payload);

      // 3. Extraemos el rol (Spring Security suele guardarlo en un arreglo 'roles' o 'authorities')
      let rolUsuario = "";
      if (payload && payload.roles) {
        // Toma el primer rol de la lista
        rolUsuario = payload.roles[0].authority || payload.roles[0] || "";
      } else if (payload && payload.authorities) {
        rolUsuario =
          payload.authorities[0].authority || payload.authorities[0] || "";
      }

      // 4. LÓGICA DE EJECUCIÓN (El semáforo)
      if (rolUsuario === "ROLE_ADMIN" || rolUsuario === "ADMIN") {
        // Si es administrador, al panel de control
        window.location.href = "./Admin_Usuario.html"; // <-- Cambia esto si tu archivo se llama diferente
      } else if (rolUsuario === "ROLE_MOZO") {
        // Si tienes otros roles, puedes agregarlos aquí
        window.location.href = "./pedidos-mozo.html";
      } else {
        // Si es Cliente (ROLE_USER) o cualquier otro, a la página principal
        window.location.href = "./Home.html";
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert(error.message || "Hubo un problema al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  });

  // Funciones Auxiliares para UI
  function showError(elementId, message) {
    const errorSpan = document.getElementById(elementId);
    errorSpan.textContent = message;
    errorSpan.classList.remove("hidden");
  }

  function resetErrors() {
    document.getElementById("emailError").classList.add("hidden");
    document.getElementById("passwordError").classList.add("hidden");
  }

  function setLoading(isLoading) {
    if (isLoading) {
      submitText.textContent = "Verificando...";
      loadingSpinner.classList.remove("hidden");
      loginForm
        .querySelectorAll("input, button")
        .forEach((el) => (el.disabled = true));
    } else {
      submitText.textContent = "Iniciar Sesión";
      loadingSpinner.classList.add("hidden");
      loginForm
        .querySelectorAll("input, button")
        .forEach((el) => (el.disabled = false));
    }
  }

  // Manejadores básicos para el resto de botones de interacción
  document.getElementById("btnGuest").addEventListener("click", () => {
    console.log("Navegando como invitado...");
  });
  document.getElementById("btnGoogle").addEventListener("click", () => {
    console.log("Iniciando OAuth Google...");
  });
  document.getElementById("btnFacebook").addEventListener("click", () => {
    console.log("Iniciando OAuth Facebook...");
  });
});
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
