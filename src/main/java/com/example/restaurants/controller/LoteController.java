package com.example.restaurants.controller;

import com.example.restaurants.model.entity.lote;
import com.example.restaurants.services.LoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/lote")
public class LoteController {
    private final LoteService loteService;

    @GetMapping
    public List<lote> listar() {
        return loteService.listar();
    }

    @GetMapping("/{id}")
    public lote obtener(@PathVariable Long id) {
        return loteService.obtenerPorId(id);
    }

    @PostMapping
    public lote guardar(@RequestBody lote lote) {
        return loteService.guardar(lote);
    }

    @PutMapping("/{id}")
    public lote actualizar(
            @PathVariable Long id,
            @RequestBody lote lote) {

        return loteService.actualizar(id, lote);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        loteService.eliminar(id);
    }
}
