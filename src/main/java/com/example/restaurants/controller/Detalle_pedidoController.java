package com.example.restaurants.controller;

import com.example.restaurants.model.entity.detalle_pedido;
import com.example.restaurants.model.entity.pedido;
import com.example.restaurants.services.Detalle_PedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/detalle")
@RequiredArgsConstructor
public class Detalle_pedidoController {
    private final Detalle_PedidoService detallePedidoService;

    @GetMapping
    public ResponseEntity<List<detalle_pedido>> obtenerTodos() {
        return ResponseEntity.ok(detallePedidoService.listarTodos()
        );
    }

    @GetMapping("/bar")
    public ResponseEntity<List<detalle_pedido>> pedidosBar() {
        return ResponseEntity.ok(
                detallePedidoService.obtenerPorArea("BAR")
        );
    }

    @GetMapping("/cocina")
    public ResponseEntity<List<detalle_pedido>> pedidosCocina() {
        return ResponseEntity.ok(
                detallePedidoService.obtenerPorArea("COCINA")
        );
    }
}
