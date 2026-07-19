package com.example.restaurants.services;

import com.example.restaurants.model.entity.inventario;
import com.example.restaurants.model.entity.lote;
import com.example.restaurants.repository.IInventario;
import com.example.restaurants.repository.ILote;
import com.example.restaurants.repository.ILote;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LoteService {

    private final ILote repository;
    private final IInventario inventarioRepository;

    @Transactional
    public List<lote> listar() {
        return repository.findAll();
    }

    @Transactional
    public lote obtenerPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lote no encontrado"));
    }

    @Transactional
    public lote guardar(lote nuevoLote) {
        // 1. Guardamos el lote base
        nuevoLote.setCantidadactual(nuevoLote.getCantidadrecibido()); // Al inicio, lo actual es igual a lo recibido
        lote loteGuardado = repository.save(nuevoLote);

        // 2. Registramos el movimiento automáticamente en el HISTORIAL (Inventario)
        inventario movimiento = new inventario();
        movimiento.setLote(loteGuardado);
        movimiento.setTipo_movimiento("INGRESO");
        movimiento.setCantidad_movimiento(loteGuardado.getCantidadrecibido());
        movimiento.setFecha_registro(new Date());

        inventarioRepository.save(movimiento);

        return loteGuardado;
    }

    @Transactional
    public lote actualizar(Long id, lote nuevo) {

        lote actual = obtenerPorId(id);

        actual.setCodLote(nuevo.getCodLote());
        actual.setInsumo(nuevo.getInsumo());
        actual.setFechafabricacion(nuevo.getFechafabricacion());
        actual.setFechaVencimiento(nuevo.getFechaVencimiento());
        actual.setCantidadrecibido(nuevo.getCantidadrecibido());
        actual.setCantidadactual(nuevo.getCantidadactual());

        return repository.save(actual);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}