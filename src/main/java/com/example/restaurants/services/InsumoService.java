package com.example.restaurants.services;
import com.example.restaurants.model.entity.insumo;
import com.example.restaurants.repository.IInsumo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InsumoService {

    private final IInsumo repository;

    public List<insumo> listar() {
        return repository.findAll();
    }

    public insumo obtenerPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Insumo no encontrado"));
    }

    public insumo guardar(insumo insumo) {
        return repository.save(insumo);
    }

    public insumo actualizar(Long id, insumo nuevo) {

        insumo actual = obtenerPorId(id);

        actual.setNombre(nuevo.getNombre());
        actual.setStockMinimo(nuevo.getStockMinimo());

        return repository.save(actual);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}
