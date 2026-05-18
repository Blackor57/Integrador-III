package com.example.restaurants.services;

import com.example.restaurants.model.entity.categoria;
import com.example.restaurants.repository.ICategoria;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final ICategoria categoriaRepository;

    @Transactional
    public categoria crearCategoria(categoria nuevaCategoria) {
        if (nuevaCategoria.getNombre() == null || nuevaCategoria.getNombre().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la categoría no puede estar vacío.");
        }
        return categoriaRepository.save(nuevaCategoria);
    }

    @Transactional(readOnly = true)
    public List<categoria> listarTodas() {
        return categoriaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public categoria obtenerPorId(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con el ID: " + id));
    }

    @Transactional
    public categoria actualizarCategoria(Long id, categoria categoriaActualizada) {
        categoria categoriaExistente = obtenerPorId(id);

        categoriaExistente.setNombre(categoriaActualizada.getNombre());

        if (categoriaActualizada.getRol() != null) {
            categoriaExistente.setRol(categoriaActualizada.getRol());
        }

        return categoriaRepository.save(categoriaExistente);
    }

    @Transactional
    public void eliminarCategoria(Long id) {
        categoria categoria = obtenerPorId(id);
        categoriaRepository.delete(categoria);
    }
}