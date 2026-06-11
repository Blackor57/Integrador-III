package com.example.restaurants.controller;

import com.example.restaurants.model.entity.mesa;
import com.example.restaurants.services.MesaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/mesa") // Ruta limpia y directa según tu estándar
@RequiredArgsConstructor
public class MesaController {

    private final MesaService mesaService;

    @GetMapping
    public ResponseEntity<List<mesa>> obtenerTodas() {
        return ResponseEntity.ok(mesaService.listarTodas()); // O el método de tu servicio que liste todo
    }

    @GetMapping("/{id}")
    public ResponseEntity<mesa> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(mesaService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<mesa> crearMesa(@RequestBody mesa mesa) {
        return ResponseEntity.ok(mesaService.crearMesa(mesa));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarMesa(@PathVariable Long id) {
        mesaService.eliminarMesa(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> actualizarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        try {
            mesa mesaActualizada = mesaService.actualizarEstadoMesa(
                    id,
                    body.get("estado")
            );

            return ResponseEntity.ok(mesaActualizada);

        } catch (RuntimeException e) {

            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());

            return ResponseEntity.badRequest().body(error);
        }
    }
}
