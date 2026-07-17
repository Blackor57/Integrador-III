package com.example.restaurants.controller;

import com.example.restaurants.model.entity.usuario;
import com.example.restaurants.repository.IFeedback;
import com.example.restaurants.repository.IPedido;
import com.example.restaurants.services.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/usuario")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final IPedido pedidoRepository;
    private final IFeedback feedbackRepository;


    // 1. LISTAR TODOS LOS USUARIOS
    @GetMapping
    public ResponseEntity<List<usuario>> listarUsuarios() {
        return ResponseEntity.ok(usuarioService.listarUsuarios());
    }

    // 2. OBTENER UN USUARIO POR ID
    @GetMapping("/{id}")
    public ResponseEntity<usuario> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.obtenerPorId(id));
    }

    // 3. ACTUALIZAR PERFIL / DATOS DEL USUARIO
    @PutMapping("/{id}")
    public ResponseEntity<usuario> actualizarPerfil(@PathVariable Long id, @RequestBody usuario datosActualizados) {
        return ResponseEntity.ok(usuarioService.actualizarPerfil(id, datosActualizados));
    }

    // 4. ASIGNAR UN ROL A UN USUARIO
    @PostMapping("/{idUsuario}/roles/{idRol}")
    public ResponseEntity<usuario> asignarRol(@PathVariable Long idUsuario, @PathVariable Long idRol) {
        return ResponseEntity.ok(usuarioService.asignarRol(idUsuario, idRol));
    }

    // 5. QUITAR UN ROL A UN USUARIO
    @DeleteMapping("/{idUsuario}/roles/{idRol}")
    public ResponseEntity<usuario> quitarRol(@PathVariable Long idUsuario, @PathVariable Long idRol) {
        return ResponseEntity.ok(usuarioService.quitarRol(idUsuario, idRol));
    }

    // 6. ELIMINAR USUARIO
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id) {
        usuarioService.EliminarUsuario(id);
        return ResponseEntity.noContent().build(); // Retorna un 204 No Content (éxito sin cuerpo)
    }

    // 7. DESACTIVAR USUARIO
    @PutMapping("/{id}/desactivar")
    public ResponseEntity<Map<String, String>> desactivarUsuario(@PathVariable Long id) {
        usuarioService.desactivarUsuario(id);
        Map<String, String> response = new HashMap<>();
        response.put("mensaje", "Usuario desactivado con éxito.");
        response.put("status", "SUSPENDED");
        return ResponseEntity.ok(response);
    }

    // 8. ACTIVAR USUARIO (¡El que te faltaba!)
    @PutMapping("/{id}/activar")
    public ResponseEntity<Map<String, String>> activarUsuario(@PathVariable Long id) {
        usuarioService.activarUsuario(id);
        Map<String, String> response = new HashMap<>();
        response.put("mensaje", "Usuario reactivado con éxito. Roles originales restaurados.");
        response.put("status", "ACTIVE");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/mi-perfil")
    public ResponseEntity<Map<String, Object>> obtenerMiPerfil(Principal principal) {
        usuario usuarioLogueado = usuarioService.buscarPorNombreUsuario(principal.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        long totalPedidos = pedidoRepository.countByUsuarioId(usuarioLogueado.getId());
        long pedidosActivos = pedidoRepository.countPedidosActivos(usuarioLogueado.getId());

        // --- NUEVA LÓGICA DE FEEDBACK ---
        Double promedioEstrellas = feedbackRepository.obtenerPromedioCalificacion(usuarioLogueado.getId());
        // Redondeamos a 1 decimal para que se vea elegante en el frontend (ej: 4.87 -> 4.9)
        double calificacionRedondeada = Math.round(promedioEstrellas * 10.0) / 10.0;

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("id", usuarioLogueado.getId());
        respuesta.put("nombreCompleto", usuarioLogueado.getNombreCompleto());
        respuesta.put("email", usuarioLogueado.getEmail());
        respuesta.put("telefono", usuarioLogueado.getTelefono());
        respuesta.put("direccion", usuarioLogueado.getDireccion());
        respuesta.put("roles", usuarioLogueado.getRoles());

        respuesta.put("totalPedidos", totalPedidos);
        respuesta.put("pedidosActivos", pedidosActivos);
        respuesta.put("calificacion", calificacionRedondeada); // <-- ¡Dato 100% real!

        return ResponseEntity.ok(respuesta);
    }

    // 9. CREAR UN NUEVO USUARIO
    @PostMapping
    public ResponseEntity<usuario> crearUsuario(@RequestBody usuario nuevoUsuario) {
        usuario usuarioCreado = usuarioService.guardarUsuario(nuevoUsuario);
        return ResponseEntity.ok(usuarioCreado);
    }
}
