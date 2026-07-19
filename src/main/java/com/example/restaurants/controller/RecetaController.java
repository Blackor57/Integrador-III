package com.example.restaurants.controller;

import com.example.restaurants.model.entity.receta;
import com.example.restaurants.services.RecetaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    @PostMapping("/guardar-lote")
    public ResponseEntity<?> guardarLote(@RequestBody List<receta> recetas) {
        try {
            List<receta> recetaGuardada = recetaService.guardarRecetaLote(recetas);
            return ResponseEntity.ok(recetaGuardada);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al guardar la receta: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
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