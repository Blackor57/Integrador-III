(function () {
        // 1. Manejo del Estado Activo Dinámico del Navbar (Línea Naranja)
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

        // 2. Control Visual de Cambio de Categorías de la Carta
        document.querySelectorAll(".category-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const currentActive = btn.parentElement.querySelector(
              ".bg-\\[\\#e07a48\\]",
            );
            if (currentActive) {
              currentActive.classList.remove(
                "bg-[#e07a48]",
                "text-white",
                "font-semibold",
                "shadow-sm",
              );
              currentActive.classList.add(
                "bg-white",
                "text-stone-700",
                "border",
                "border-stone-200",
                "font-medium",
              );
            }

            btn.classList.remove(
              "bg-white",
              "text-stone-700",
              "border",
              "border-stone-200",
              "font-medium",
            );
            btn.classList.add(
              "bg-[#e07a48]",
              "text-white",
              "font-semibold",
              "shadow-sm",
            );

            console.log(
              "Filtrando backend por categoría:",
              btn.textContent.trim(),
            );
          });
        });

        // 3. Evento para Cerrar Sesión
        document
          .getElementById("navBtnLogout")
          ?.addEventListener("click", () => {
            console.log("Navbar: Limpiando sesión del usuario...");
            localStorage.removeItem("token");
            sessionStorage.clear();
            window.location.href = "Index.html";
          });

        // 4. Evento Alternar Tema (Opcional)
        document
          .getElementById("navBtnThemeToggle")
          ?.addEventListener("click", () => {
            console.log("Navbar: Alternando modo de color...");
          });
      })();