package com.example.restaurants.services;

import com.example.restaurants.model.entity.subcategoria;
import com.example.restaurants.repository.ISubCategoria;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubcategoriaService {

    private final ISubCategoria subCategoriaRepository;

    @Transactional
    public subcategoria crearSubcategoria(subcategoria nuevaSubcategoria) {
        // Validación básica: que el nombre no vaya vacío
        if (nuevaSubcategoria.getNombre() == null || nuevaSubcategoria.getNombre().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la subcategoría no puede estar vacío.");
        }
        return subCategoriaRepository.save(nuevaSubcategoria);
    }

    @Transactional(readOnly = true)
    public List<subcategoria> listarTodas() {
        return subCategoriaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public subcategoria obtenerPorId(Long id) {
        return subCategoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subcategoría no encontrada con el ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<subcategoria> listarPorCategoria(Long idCategoria) {
        return subCategoriaRepository.findByCategoriaId(idCategoria);
    }

    @Transactional
    public subcategoria actualizarSubcategoria(Long id, subcategoria subcategoriaActualizada) {
        subcategoria subcategoriaExistente = obtenerPorId(id);

        subcategoriaExistente.setNombre(subcategoriaActualizada.getNombre());

        if (subcategoriaActualizada.getCategoria() != null) {
            subcategoriaExistente.setCategoria(subcategoriaActualizada.getCategoria());
        }

        return subCategoriaRepository.save(subcategoriaExistente);
    }

    @Transactional
    public void eliminarSubcategoria(Long id) {
        subcategoria subcategoria = obtenerPorId(id);
        subCategoriaRepository.delete(subcategoria);
    }
}