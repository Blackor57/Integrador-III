package com.example.restaurants.controller;

import com.example.restaurants.model.entity.recibo;
import com.example.restaurants.services.ReciboService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/recibo") // Ruta limpia centralizada para comprobantes
@RequiredArgsConstructor
public class ReciboController {

    private final ReciboService reciboService;

    @PostMapping("/pedido/{idPedido}")
    public ResponseEntity<?> generarComprobante(
            @PathVariable Long idPedido,
            @RequestBody recibo datosRecibo) {
        try {
            // Ejecutamos la regla de negocio que liquida la cuenta y libera la mesa
            recibo nuevoRecibo = reciboService.generarRecibo(idPedido, datosRecibo);
            return ResponseEntity.ok(nuevoRecibo);

        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

}