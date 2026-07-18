document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const btnText = document.getElementById("btnText");
    const spinner = document.getElementById("spinner");
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirmPassword").value;

    // Validación simple de contraseñas
    if (password !== confirm) {
      alert("Las contraseñas no coinciden");
      return;
    }

    // Preparar datos para el Backend
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // UI Feedback (Loading)
    btnText.textContent = "PROCESANDO...";
    spinner.classList.remove("hidden");
    e.target
      .querySelectorAll("input, button")
      .forEach((el) => (el.disabled = true));

    try {
      // Mapeamos los datos para que coincidan exactamente con RegisterRequest.java
      const response = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
          nombreCompleto: data.fullName, // Traducción al backend
          email: data.email,
          telefono: data.phone, // Traducción al backend
          direccion: "", // Lo mandamos vacío porque no está en el form
        }),
      });

      if (!response.ok) {
        throw new Error(
          "No se pudo registrar la cuenta. Es posible que el usuario o correo ya existan.",
        );
      }

      // Si todo sale bien
      alert("¡Cuenta creada con éxito! Bienvenido a La Estación.");

      // Redirigimos al usuario al login para que inicie sesión con su nueva cuenta
      window.location.href = "Index.html";
    } catch (error) {
      console.error(error);
      alert(error.message || "Error de red al conectar con el servidor.");
    } finally {
      btnText.textContent = "CREAR MI CUENTA";
      spinner.classList.add("hidden");
      e.target
        .querySelectorAll("input, button")
        .forEach((el) => (el.disabled = false));
    }
  });
