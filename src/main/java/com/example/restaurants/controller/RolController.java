package com.example.restaurants.controller;

import com.example.restaurants.model.entity.rol;
import com.example.restaurants.services.RolService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rol") // Tus rutas directas y estándar
@RequiredArgsConstructor
public class RolController {

    private final RolService rolService;

    @GetMapping
    public ResponseEntity<List<rol>> listarTodos() {
        return ResponseEntity.ok(rolService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<rol> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(rolService.obtenerPorId(id));
    }

    @GetMapping("/nombre/{nombre}")
    public ResponseEntity<rol> obtenerPorNombre(@PathVariable String nombre) {
        return ResponseEntity.ok(rolService.obtenerPorNombre(nombre));
    }

    @PostMapping
    public ResponseEntity<rol> crearRol(@RequestBody rol nuevoRol) {
        return ResponseEntity.ok(rolService.crearRol(nuevoRol));
    }

    @PutMapping("/{id}")
    public ResponseEntity<rol> actualizarRol(@PathVariable Long id, @RequestBody rol rolActualizado) {
        return ResponseEntity.ok(rolService.actualizarRol(id, rolActualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarRol(@PathVariable Long id) {
        rolService.eliminarRol(id);
        return ResponseEntity.noContent().build();
    }
}