package com.example.restaurants.controller;

import com.example.restaurants.model.entity.inventario;
import com.example.restaurants.services.InventarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventario")
@RequiredArgsConstructor
public class InventarioController {
    private final InventarioService inventarioService;
    @GetMapping
    public List<inventario> listar() {
        return inventarioService.listar();
    }

    @GetMapping("/{id}")
    public inventario obtener(@PathVariable Long id) {
        return inventarioService.obtenerPorId(id);
    }

    @PostMapping
    public inventario guardar(@RequestBody inventario inventario) {
        return inventarioService.guardar(inventario);
    }

    @PutMapping("/{id}")
    public inventario actualizar(
            @PathVariable Long id,
            @RequestBody inventario inventario) {

        return inventarioService.actualizar(id, inventario);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        inventarioService.eliminar(id);
    }
}
