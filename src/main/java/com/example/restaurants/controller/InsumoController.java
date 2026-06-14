package com.example.restaurants.controller;

import com.example.restaurants.model.entity.insumo;
import com.example.restaurants.services.InsumoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RequestMapping("/insumo")
@RestController
public class InsumoController {
    private final InsumoService service;

    @GetMapping
    public List<insumo> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public insumo obtener(@PathVariable Long id) {
        return service.obtenerPorId(id);
    }

    @PostMapping
    public insumo guardar(@RequestBody insumo insumo) {
        return service.guardar(insumo);
    }

    @PutMapping("/{id}")
    public insumo actualizar(
            @PathVariable Long id,
            @RequestBody insumo insumo) {

        return service.actualizar(id, insumo);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}
