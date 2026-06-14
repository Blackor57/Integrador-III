package com.example.restaurants.controller;
import com.example.restaurants.model.entity.EstadoItem;
import com.example.restaurants.model.entity.pedido; // Tu entidad en minúsculas
import com.example.restaurants.services.PedidoService; // Tu clase de servicio
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pedido")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @GetMapping
    public ResponseEntity<List<pedido>> obtenerTodos() {

        return ResponseEntity.ok(pedidoService.listarTodos()
        );
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

    @PutMapping("/{idPedido}/cancelar")
    public ResponseEntity<?> cancelarPedido(
            @PathVariable Long idPedido,
            @RequestBody Map<String, String> payload) {

        try {
            // Extraemos el motivo del JSON que envía el cliente/Postman
            String motivo = payload.get("motivo");

            // Ejecutamos la regla de negocio que armaste en el Service
            pedido pedidoCancelado = pedidoService.cancelarPedido(idPedido, motivo);

            return ResponseEntity.ok(pedidoCancelado);

        } catch (RuntimeException e) {
            // Si falta el motivo o el pedido no existe, devolvemos un error 400 amigable
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{idPedido}/entregar/{idDetalle}")
    public ResponseEntity<?> entregarItemDePedido(
            @PathVariable Long idPedido,
            @PathVariable Long idDetalle) {

        try {
            // Ejecutamos la lógica operativa
            pedido pedidoActualizado = pedidoService.entregarItem(idPedido, idDetalle);

            return ResponseEntity.ok(pedidoActualizado);

        } catch (RuntimeException e) {
            // Manejo de errores seguro para el cliente HTTP
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/mesa/{idMesa}")
    public ResponseEntity<?> obtenerPedidoPorMesa(@PathVariable Long idMesa) {
        try {
            // Llamamos al servicio que ya tiene el filtro inteligente
            pedido pedidoActivo = pedidoService.obtenerPorMesa(idMesa);
            return ResponseEntity.ok(pedidoActivo);
        } catch (RuntimeException e) {
            // Si la mesa no tiene pedidos activos, devolvemos un JSON con el error limpio
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
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