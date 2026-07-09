package com.example.restaurants.controller;
import com.example.restaurants.model.entity.EstadoItem;
import com.example.restaurants.model.entity.pedido; // Tu entidad en minúsculas
import com.example.restaurants.model.entity.usuario;
import com.example.restaurants.services.PedidoService; // Tu clase de servicio
import com.example.restaurants.services.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pedido")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;
    private final UsuarioService usuarioService;

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
            errorResponse.put("Debe insertar un motivo", e.getMessage());
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
    @PatchMapping("/{idPedido}/tiporecibo")
    public ResponseEntity<?> cambiarTipoRecibo(
            @PathVariable Long idPedido,
            @RequestBody Map<String, String> payload) {

        try {
            String tipo = payload.get("tipo");

            if (tipo == null || tipo.trim().isEmpty()) {
                throw new RuntimeException("El campo 'tipo' es obligatorio en el JSON.");
            }

            pedido pedidoActualizado = pedidoService.cambiarTipoRecibo(idPedido, tipo);
            return ResponseEntity.ok(pedidoActualizado);

        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<?> obtenerPedidosPorEstado(@PathVariable String estado) {
        try {
            List<pedido> pedidos = pedidoService.listarPorEstado(estado);

            if (pedidos.isEmpty()) {
                // Devuelve un 204 No Content si la lista está vacía pero no hubo error
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(pedidos);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/reporte/fechas")
    public ResponseEntity<?> obtenerVentasPorRango(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date inicio,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date fin) {

        try {
            List<pedido> pedidos = pedidoService.listarPedidosPorRango(inicio, fin);
            return ResponseEntity.ok(pedidos);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al filtrar fechas: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/usuario/mis-pedidos")
    public ResponseEntity<List<pedido>> obtenerMisPedidos() {

        // 1. Obtenemos quién está logueado leyendo el token que interceptó Spring Security
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        // 2. Buscamos el ID real de ese usuario en la BD usando su correo/username
        usuario usuarioLogueado = usuarioService.buscarPorNombreUsuario(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 3. Traemos sus pedidos
        List<pedido> historialPedidos = pedidoService.obtenerPedidosPorUsuario(usuarioLogueado.getId());

        return ResponseEntity.ok(historialPedidos);
    }
}