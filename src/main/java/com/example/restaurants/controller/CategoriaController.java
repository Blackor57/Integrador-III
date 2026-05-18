package com.example.restaurants.controller;

import com.example.restaurants.model.entity.categoria;
import com.example.restaurants.services.CategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categoria") // Siguiendo tus rutas limpias
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    @GetMapping
    public ResponseEntity<List<categoria>> listarTodas() {
        return ResponseEntity.ok(categoriaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<categoria> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(categoriaService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<categoria> crearCategoria(@RequestBody categoria nuevaCategoria) {
        return ResponseEntity.ok(categoriaService.crearCategoria(nuevaCategoria));
    }

    @PutMapping("/{id}")
    public ResponseEntity<categoria> actualizarCategoria(@PathVariable Long id, @RequestBody categoria categoriaActualizada) {
        return ResponseEntity.ok(categoriaService.actualizarCategoria(id, categoriaActualizada));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCategoria(@PathVariable Long id) {
        categoriaService.eliminarCategoria(id);
        return ResponseEntity.noContent().build();
    }
}