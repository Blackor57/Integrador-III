package com.example.restaurants.controller;
import com.example.restaurants.model.entity.EstadoItem;
import com.example.restaurants.model.entity.pedido; // Tu entidad en minúsculas
import com.example.restaurants.services.PedidoService; // Tu clase de servicio
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pedido") // Ruta limpia y directa según tu estándar
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @GetMapping
    public ResponseEntity<List<pedido>> obtenerTodos() {
        return ResponseEntity.ok(pedidoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<pedido> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<?> crearPedido(@RequestBody pedido pedido) {
        // Tu servicio ya maneja la lógica transaccional, cálculo de totales y actualización de mesas
        try {
            pedido nuevo = pedidoService.crearPedido(pedido);
            return ResponseEntity.ok(nuevo);
        } catch (RuntimeException e) {
            Map<String,String> error= new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<pedido> cancelarPedido(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.cancelarPedido(id));
    }

    @PatchMapping("/detalle/{id}/estado")
    public ResponseEntity<?> cambiarEstadoDetalle(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        EstadoItem estado =
                EstadoItem.valueOf(body.get("estado"));

        return ResponseEntity.ok(
                pedidoService.cambiarEstadoDetalle(id, estado)
        );
    }
}
