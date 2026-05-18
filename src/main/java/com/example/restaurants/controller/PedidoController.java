package com.example.restaurants.controller;

import com.example.restaurants.model.entity.pedido;
import com.example.restaurants.services.PedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<?> crearPedido(@RequestBody pedido nuevoPedido) {
        try {
            pedido pedidoCreado = pedidoService.crearPedido(nuevoPedido);
            return ResponseEntity.status(HttpStatus.CREATED).body(pedidoCreado);
        } catch (RuntimeException e) {
            // Captura errores de negocio (Ej: "Mesa no encontrada" o "La mesa no está libre")
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 2. OBTENER UN PEDIDO POR ID
    // GET http://localhost:8080/api/pedidos/1
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            pedido p = pedidoService.obtenerPorId(id);
            return ResponseEntity.ok(p);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // 3. LISTAR TODOS LOS PEDIDOS (O FILTRAR POR ESTADO)
    // GET http://localhost:8080/api/pedidos
    // GET http://localhost:8080/api/pedidos?estado=PENDIENTE
    @GetMapping
    public ResponseEntity<List<pedido>> listarPedidos(@RequestParam(required = false) String estado) {
        if (estado != null && !estado.isEmpty()) {
            return ResponseEntity.ok(pedidoService.listarPorEstado(estado.toUpperCase()));
        }
        return ResponseEntity.ok(pedidoService.listarTodos());
    }

    // 4. OBTENER PEDIDO ACTIVO DE UNA MESA
    // GET http://localhost:8080/api/pedidos/mesa/5
    @GetMapping("/mesa/{idMesa}")
    public ResponseEntity<?> obtenerPorMesa(@PathVariable Long idMesa) {
        try {
            pedido p = pedidoService.obtenerPorMesa(idMesa);
            return ResponseEntity.ok(p);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // 5. CAMBIAR ESTADO DE UN PEDIDO (Ej: De PENDIENTE a PAGADO)
    // PATCH http://localhost:8080/api/pedidos/1/estado?nuevoEstado=PAGADO
    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestParam String nuevoEstado) {
        try {
            pedido p = pedidoService.cambiarEstadoPedido(id, nuevoEstado.toUpperCase());
            return ResponseEntity.ok(p);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 6. CANCELAR UN PEDIDO
    // PUT o POST http://localhost:8080/api/pedidos/1/cancelar
    @PutMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelarPedido(@PathVariable Long id) {
        try {
            pedido p = pedidoService.cancelarPedido(id);
            return ResponseEntity.ok(p);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==========================================
    // SECCIÓN DE REPORTES Y ESTADÍSTICAS
    // ==========================================

    // 7. PRODUCTOS MÁS VENDIDOS
    // GET http://localhost:8080/api/pedidos/reportes/mas-vendidos
    @GetMapping("/reportes/mas-vendidos")
    public ResponseEntity<List<Object[]>> obtenerProductosMasVendidos() {
        return ResponseEntity.ok(pedidoService.obtenerProductosMasVendidos());
    }

    // 8. VENTAS TOTALES (INGRESOS)
    // GET http://localhost:8080/api/pedidos/reportes/ventas-totales
    @GetMapping("/reportes/ventas-totales")
    public ResponseEntity<Map<String, Double>> obtenerVentasTotales() {
        Double totales = pedidoService.obtenerVentasTotales();
        return ResponseEntity.ok(Map.of("ventasTotales", totales));
    }

    // 9. REPORTE ESPECÍFICO DE UN PRODUCTO
    // GET http://localhost:8080/api/pedidos/reportes/producto/3
    @GetMapping("/reportes/producto/{idProducto}")
    public ResponseEntity<Map<String, String>> obtenerReporteProducto(@PathVariable Long idProducto) {
        String reporte = pedidoService.obtenerReporteProducto(idProducto);
        return ResponseEntity.ok(Map.of("reporte", reporte));
    }

}
