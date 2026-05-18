package com.example.restaurants.controller;

import com.example.restaurants.model.entity.producto; // Tu entidad en minúsculas
import com.example.restaurants.services.ProductoService; // Tu clase de servicio
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/producto") // Ruta limpia y directa según tu estándar
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    public ResponseEntity<List<producto>> listarTodos() {
        return ResponseEntity.ok(productoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<producto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.obtenerPorId(id));
    }

    @GetMapping("/subcategoria/{idSubcategoria}")
    public ResponseEntity<List<producto>> listarPorSubcategoria(@PathVariable Long idSubcategoria) {
        return ResponseEntity.ok(productoService.listarPorSubcategoria(idSubcategoria));
    }

    @PostMapping
    public ResponseEntity<producto> crearProducto(@RequestBody producto nuevoProducto) {
        return ResponseEntity.ok(productoService.crearProducto(nuevoProducto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<producto> actualizarProducto(@PathVariable Long id, @RequestBody producto productoActualizado) {
        return ResponseEntity.ok(productoService.actualizarProducto(id, productoActualizado));
    }
}