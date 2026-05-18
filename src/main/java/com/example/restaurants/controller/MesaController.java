package com.example.restaurants.controller;

import com.example.restaurants.model.entity.mesa;
import com.example.restaurants.services.MesaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/mesa")
@RequiredArgsConstructor
public class MesaController {
    private final MesaService mesaService;

    // 1. CREAR UNA NUEVA MESA
    // POST http://localhost:8080/api/mesas
    // Body JSON: { "nombre": 5 } -> El servicio le asignará el estado "LIBRE" automáticamente.
    @PostMapping(value = "crear")
    public ResponseEntity<?> crearMesa(@RequestBody mesa nuevaMesa) {
        try {
            mesa mesaCreada = mesaService.crearMesa(nuevaMesa);
            return ResponseEntity.status(HttpStatus.CREATED).body(mesaCreada);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 2. LISTAR TODAS LAS MESAS (O FILTRAR POR ESTADO)
    // GET http://localhost:8080/api/mesas
    // GET http://localhost:8080/api/mesas?estado=LIBRE
    @GetMapping
    public ResponseEntity<List<mesa>> listarMesas(@RequestParam(required = false) String estado) {
        if (estado != null && !estado.isEmpty()) {
            return ResponseEntity.ok(mesaService.obtenerMesaporEstado(estado.toUpperCase()));
        }
        return ResponseEntity.ok(mesaService.listarTodas());
    }

    // 3. OBTENER UNA MESA POR SU ID
    // GET http://localhost:8080/api/mesas/1
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            mesa m = mesaService.obtenerPorId(id);
            return ResponseEntity.ok(m);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // 4. OBTENER UNA MESA POR SU NÚMERO
    // GET http://localhost:8080/api/mesas/numero/10
    @GetMapping("/numero/{numero}")
    public ResponseEntity<?> obtenerPorNumero(@PathVariable Integer numero) {
        try {
            mesa m = mesaService.obtenerMesaporNumero(numero);
            return ResponseEntity.ok(m);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // 5. ELIMINAR UNA MESA
    // DELETE http://localhost:8080/api/mesas/1
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarMesa(@PathVariable Long id) {
        try {
            mesaService.eliminarMesa(id);
            return ResponseEntity.ok(Map.of("mensaje", "Mesa eliminada correctamente de forma lógica/física."));
        } catch (RuntimeException e) {
            // Captura el error si la mesa está "OCUPADA"
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
