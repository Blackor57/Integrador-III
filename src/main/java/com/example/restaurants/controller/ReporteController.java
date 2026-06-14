package com.example.restaurants.controller;

import com.example.restaurants.services.PedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/reporte") // Ruta exclusiva para Inteligencia de Negocios
@RequiredArgsConstructor
public class ReporteController {

    private final PedidoService pedidoService;

    /**
     * Endpoint general para el panel de administración.
     * Devuelve métricas financieras globales de manera automática.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> obtenerDashboardVentas() {
        // Armamos un JSON estructurado con múltiples métricas
        Map<String, Object> dashboard = new HashMap<>();

        try {
            // 1. Ingresos Totales (Suma absoluta del sistema, sin signos manuales)
            Double ventasTotales = pedidoService.obtenerVentasTotales();
            dashboard.put("ingresosTotales", ventasTotales);

            // Aquí puedes agregar en el futuro: "pedidosCancelados", "ticketPromedio", etc.
            dashboard.put("estado", "OK");

            return ResponseEntity.ok(dashboard);
        } catch (RuntimeException e) {
            dashboard.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(dashboard);
        }
    }

    /**
     * Endpoint granular para analizar el rendimiento de un plato o bebida específica.
     */
    @GetMapping("/producto/{idProducto}")
    public ResponseEntity<?> obtenerEstadisticasProducto(@PathVariable Long idProducto) {
        try {
            // Llama a tu método que calcula cantidad y montos generados por un ID
            String reporte = pedidoService.obtenerReporteProducto(idProducto);

            Map<String, String> response = new HashMap<>();
            response.put("analisis", reporte);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "No se pudo generar el reporte del producto. " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}