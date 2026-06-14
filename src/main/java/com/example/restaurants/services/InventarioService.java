package com.example.restaurants.services;

import com.example.restaurants.model.entity.inventario;
import com.example.restaurants.repository.IInventario;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventarioService {

    private final IInventario repository;

    public List<inventario> listar() {
        return repository.findAll();
    }

    public inventario obtenerPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movimiento no encontrado"));
    }

    public inventario guardar(inventario inventario) {

        inventario.setFecha_registro(new Date());

        return repository.save(inventario);
    }

    public inventario actualizar(Long id, inventario nuevo) {

        inventario actual = obtenerPorId(id);

        actual.setLote(nuevo.getLote());
        actual.setTipo_movimiento(nuevo.getTipo_movimiento());
        actual.setCantidad_movimiento(nuevo.getCantidad_movimiento());

        return repository.save(actual);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}