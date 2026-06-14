package com.example.restaurants.services;

import com.example.restaurants.model.entity.receta;
import com.example.restaurants.repository.IReceta;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecetaService {

    private final IReceta recetaRepository;

    @Transactional(readOnly = true)
    public List<receta> listarTodas() {
        return recetaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public receta obtenerPorId(Long id) {
        return recetaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ingrediente de receta no encontrado con ID: " + id));
    }

    // Método clave para ver qué lleva un plato específico
    @Transactional(readOnly = true)
    public List<receta> listarPorProducto(Long idProducto) {
        return recetaRepository.findByProductoId(idProducto);
    }

    @Transactional
    public receta crearReceta(receta nuevaReceta) {
        if (nuevaReceta.getCantidad() <= 0) {
            throw new RuntimeException("La cantidad del insumo debe ser mayor a 0");
        }
        return recetaRepository.save(nuevaReceta);
    }

    @Transactional
    public receta actualizarReceta(Long id, receta recetaActualizada) {
        receta existente = obtenerPorId(id);

        if (recetaActualizada.getCantidad() > 0) {
            existente.setCantidad(recetaActualizada.getCantidad());
        }
        if (recetaActualizada.getInsumo() != null) {
            existente.setInsumo(recetaActualizada.getInsumo());
        }
        if (recetaActualizada.getProducto() != null) {
            existente.setProducto(recetaActualizada.getProducto());
        }

        return recetaRepository.save(existente);
    }

    @Transactional
    public void eliminarReceta(Long id) {
        receta existente = obtenerPorId(id);
        recetaRepository.delete(existente);
    }
}