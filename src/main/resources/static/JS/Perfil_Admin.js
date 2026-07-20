// Constante para la ruta del perfil
const API_PERFIL_URL = "/usuario/mi-perfil";

// Función para obtener el token (si no la tienes ya creada)
function getHeaders() {
  const headers = { "Content-Type": "application/json" };
  const token =
    localStorage.getItem("token") || localStorage.getItem("tu_token_jwt");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

// 0. OBTENER DATOS DEL USUARIO LOGUEADO
async function obtenerDatosUsuario() {
  try {
    const response = await fetch(API_PERFIL_URL, {
      method: "GET",
      headers: getHeaders(),
    });

    if (response.ok) {
      const usuario = await response.json();

      // Extraer el primer nombre y ponerlo en mayúsculas
      let primerNombre = "ADMIN";
      if (usuario.nombreCompleto) {
        primerNombre = usuario.nombreCompleto.split(" ")[0].toUpperCase();
      }

      // Inyectar en el span del HTML (asegúrate de que tenga id="nombreAdmin")
      const spanNombre = document.getElementById("nombreAdmin");
      if (spanNombre) spanNombre.textContent = primerNombre;
    } else {
      document.getElementById("nombreAdmin").textContent = "ADMIN";
    }
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    document.getElementById("nombreAdmin").textContent = "ADMIN";
  }
}

obtenerDatosUsuario();
