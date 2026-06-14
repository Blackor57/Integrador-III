package com.example.restaurants.controller;

import com.example.restaurants.model.entity.receta;
import com.example.restaurants.services.RecetaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/receta")
@RequiredArgsConstructor
public class RecetaController {

    private final RecetaService recetaService;

    @GetMapping
    public ResponseEntity<List<receta>> listarTodas() {
        return ResponseEntity.ok(recetaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<receta> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(recetaService.obtenerPorId(id));
    }

    // Ruta súper útil para ver todos los ingredientes de un plato
    @GetMapping("/producto/{idProducto}")
    public ResponseEntity<List<receta>> listarPorProducto(@PathVariable Long idProducto) {
        return ResponseEntity.ok(recetaService.listarPorProducto(idProducto));
    }

    @PostMapping
    public ResponseEntity<receta> crearReceta(@RequestBody receta nuevaReceta) {
        return ResponseEntity.ok(recetaService.crearReceta(nuevaReceta));
    }

    @PutMapping("/{id}")
    public ResponseEntity<receta> actualizarReceta(@PathVariable Long id, @RequestBody receta recetaActualizada) {
        return ResponseEntity.ok(recetaService.actualizarReceta(id, recetaActualizada));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarReceta(@PathVariable Long id) {
        recetaService.eliminarReceta(id);
        return ResponseEntity.noContent().build();
    }
}