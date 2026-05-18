package com.example.restaurants.controller;

import com.example.restaurants.model.entity.subcategoria;
import com.example.restaurants.services.SubcategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/subcategoria") // Tu ruta limpia y directa
@RequiredArgsConstructor
public class SubcategoriaController {

    private final SubcategoriaService subcategoriaService;

    @GetMapping
    public ResponseEntity<List<subcategoria>> listarTodas() {
        return ResponseEntity.ok(subcategoriaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<subcategoria> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(subcategoriaService.obtenerPorId(id));
    }

    @GetMapping("/categoria/{idCategoria}")
    public ResponseEntity<List<subcategoria>> listarPorCategoria(@PathVariable Long idCategoria) {
        return ResponseEntity.ok(subcategoriaService.listarPorCategoria(idCategoria));
    }

    @PostMapping
    public ResponseEntity<subcategoria> crearSubcategoria(@RequestBody subcategoria nuevaSubcategoria) {
        return ResponseEntity.ok(subcategoriaService.crearSubcategoria(nuevaSubcategoria));
    }

    @PutMapping("/{id}")
    public ResponseEntity<subcategoria> actualizarSubcategoria(@PathVariable Long id, @RequestBody subcategoria subcategoriaActualizada) {
        return ResponseEntity.ok(subcategoriaService.actualizarSubcategoria(id, subcategoriaActualizada));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarSubcategoria(@PathVariable Long id) {
        subcategoriaService.eliminarSubcategoria(id);
        return ResponseEntity.noContent().build();
    }
}