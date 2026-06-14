package com.example.restaurants.controller;

import com.example.restaurants.model.entity.usuario;
import com.example.restaurants.services.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuario")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

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

    // 5. ELIMINAR USUARIO
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id) {
        usuarioService.EliminarUsuario(id);
        return ResponseEntity.noContent().build(); // Retorna un 204 No Content (éxito sin cuerpo)
    }
}
