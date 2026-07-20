console.log("¡El JS cargó correctamente!");

// 1. Funciones Auxiliares
function showError(elementId, message) {
  const errorSpan = document.getElementById(elementId);
  if (errorSpan) {
    errorSpan.textContent = message;
    errorSpan.classList.remove("hidden");
  }
}

function resetErrors() {
  document.getElementById("emailError")?.classList.add("hidden");
  document.getElementById("passwordError")?.classList.add("hidden");
}

function setLoading(isLoading, loginForm, submitText, loadingSpinner) {
  const elements = loginForm.querySelectorAll("input, button");
  if (isLoading) {
    submitText.textContent = "Verificando...";
    loadingSpinner?.classList.remove("hidden");
    elements.forEach((el) => (el.disabled = true));
  } else {
    submitText.textContent = "Iniciar Sesión";
    loadingSpinner?.classList.add("hidden");
    elements.forEach((el) => (el.disabled = false));
  }
}

// Función para determinar la página de destino según el rol
function redirigirSegunRol(rol) {
  const r = rol.toUpperCase();
  if (r.includes("ADMIN")) return "./Admin_inicio.html";
  if (r.includes("MOZO")) return "./Emp_Mesas.html";
  if (r.includes("COCINA")) return "./Cocina.html";
  if (r.includes("BARMAN")) return "./Bar.html";
  if (r.includes("CAJA")) return "./Caja_pedidos.html";
  return "./Home.html";
}

// 2. Ejecución Principal
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const submitText = document.getElementById("submitText");
  const loadingSpinner = document.getElementById("loadingSpinner");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    resetErrors();

    const formData = new FormData(loginForm);
    const data = Object.fromEntries(formData.entries());

    if (!data.email || !data.password) {
      if (!data.email) showError("emailError", "El correo es requerido.");
      if (!data.password)
        showError("passwordError", "La contraseña es requerida.");
      return;
    }

    setLoading(true, loginForm, submitText, loadingSpinner);

    try {
      // A. Login para obtener el token
      const resLogin = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: data.email, password: data.password }),
      });

      const result = await resLogin.json();
      if (!resLogin.ok)
        throw new Error(result.message || "Credenciales incorrectas");

      localStorage.setItem("token", result.token);

      // B. Obtener datos del perfil para extraer el rol real
      const resPerfil = await fetch("/usuario/mi-perfil", {
        method: "GET",
        headers: { Authorization: `Bearer ${result.token}` },
      });

      if (!resPerfil.ok)
        throw new Error("No se pudo obtener el perfil del usuario");

      const usuario = await resPerfil.json();

      // Extraemos el rol desde el objeto usuario
      const rolBD =
        usuario.roles && usuario.roles.length > 0
          ? usuario.roles[0].nombre || usuario.roles[0].authority
          : "";

      localStorage.setItem("userRole", rolBD.toUpperCase());

      // C. Redirigir
      window.location.href = redirigirSegunRol(rolBD);
    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false, loginForm, submitText, loadingSpinner);
    }
  });
});
