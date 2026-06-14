package com.example.restaurants.services;

import com.example.restaurants.model.entity.lote;
import com.example.restaurants.repository.ILote;
import com.example.restaurants.repository.ILote;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LoteService {

    private final ILote repository;

    public List<lote> listar() {
        return repository.findAll();
    }

    public lote obtenerPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lote no encontrado"));
    }

    public lote guardar(lote lote) {
        return repository.save(lote);
    }

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