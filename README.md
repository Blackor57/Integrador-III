<div align="center">

# 🍽️ Sistema de Gestión: La Estación SAC
**Implementación de un Aplicativo Web para la Gestión Interna y Externa**

[![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=java&logoColor=white)](#)
[![Maven](https://img.shields.io/badge/Maven-C71A22?style=for-the-badge&logo=apachemaven&logoColor=white)](#)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](#)
[![Scrum](https://img.shields.io/badge/Agile-Scrum-2C8EBB?style=for-the-badge&logo=jira&logoColor=white)](#)

*Proyecto integrador enfocado en la modernización tecnológica y eficiencia operativa gastronómica.*

</div>

---

## 📖 Índice
- [Acerca del Proyecto](#-acerca-del-proyecto)
- [Módulos del Sistema](#-módulos-del-sistema)
- [Arquitectura y Tecnologías](#-arquitectura-y-tecnologías)
- [Instalación y Despliegue](#-instalación-y-despliegue)
- [Equipo de Desarrollo](#-equipo-de-desarrollo)

---

## 🚀 Acerca del Proyecto

El restaurante **La Estación SAC**, ubicado en la provincia de Huaral, enfrentaba desafíos operativos debido a un modelo de gestión reactivo y un ERP aislado. Este aplicativo web resuelve los cuellos de botella logísticos y la latencia entre la cocina y la entrega, integrando tanto al personal administrativo interno como al cliente final en un flujo digital unificado.

**Misión del negocio:** Ofrecer una experiencia gastronómica de alta calidad resaltando los sabores de Huaral, con un servicio eficiente y cálido.

---

## 🧩 Módulos del Sistema

El sistema fue levantado en base a Requerimientos e Historias de Usuario (Metodología Scrum), dividiéndose en los siguientes módulos clave:

- 👤 **Gestión de Usuarios y Clientes:** Control de roles, accesos y perfiles.
- 📝 **Gestión de Pedidos y Mesas:** Trazabilidad en tiempo real de las órdenes.
- 🍳 **Gestión de Preparación y Logística:** Optimización del flujo en cocina y tiempos de entrega (SLA).
- 💳 **Gestión de Caja y Facturación:** Control de pagos, emisiones de comprobantes y cuadres de caja.
- 📊 **Gestión de Reportes y Análisis:** Dashboards de KPIs para la toma de decisiones.

---

## 🛠️ Arquitectura y Tecnologías

El proyecto sigue una arquitectura robusta, preparada para escalar y de fácil despliegue gracias a la contenerización.

* **Lenguaje / Framework:** Java (Spring Boot)
* **Gestor de Dependencias:** Apache Maven (`pom.xml`)
* **Infraestructura:** Docker & Docker Compose (`compose.yaml`)
* **Gestión del Proyecto:** Scrum (Sprints, Lean Canvas, Project Charter)

---

## ⚙️ Instalación y Despliegue

Sigue estos pasos para levantar el entorno de desarrollo localmente:

### Prerrequisitos
- Tener instalado [Java JDK 17+](https://www.oracle.com/java/technologies/javase-downloads.html).
- Tener instalado [Docker](https://www.docker.com/) y Docker Compose.

### Pasos
1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/TU_USUARIO/Integrador-III.git](https://github.com/TU_USUARIO/Integrador-III.git)
   cd Integrador-III
