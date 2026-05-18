package com.example.restaurants.controller;
import com.example.restaurants.model.entity.pedido; // Tu entidad en minúsculas
import com.example.restaurants.services.PedidoService; // Tu clase de servicio
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<pedido> crearPedido(@RequestBody pedido pedido) {
        // Tu servicio ya maneja la lógica transaccional, cálculo de totales y actualización de mesas
        return ResponseEntity.ok(pedidoService.crearPedido(pedido));
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<pedido> cancelarPedido(@PathVariable Long id) {
        return ResponseEntity.ok(pedidoService.cancelarPedido(id));
    }
}
