package com.example.restaurants.controller;

import com.example.restaurants.model.entity.feedback;
import com.example.restaurants.services.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping("/{idPedido}")
    public ResponseEntity<feedback> crearFeedback(
            @PathVariable Long idPedido,
            @RequestBody feedback request
    ) {
        // Mapeamos los datos que vienen del cliente
        feedback data = new feedback();
        data.setComentario(request.getComentario());
        data.setPuntuacion(request.getPuntuacion());
        data.setNombre(request.getNombre()); // Extraemos el nombre por si el cliente lo envió

        feedback nuevo = feedbackService.crearFeedback(idPedido, data);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    @GetMapping("/pedido/{idPedido}")
    public ResponseEntity<feedback> obtenerPorPedido(@PathVariable Long idPedido){
        feedback fb = feedbackService.obtenerPorPedido(idPedido);
        return ResponseEntity.ok(fb);
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<feedback>> obtenerPorUsuario(@PathVariable Long idUsuario){
        List<feedback> lista = feedbackService.obtenerPorUsuario(idUsuario);
        return ResponseEntity.ok(lista);
    }
}