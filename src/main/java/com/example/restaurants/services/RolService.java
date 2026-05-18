package com.example.restaurants.services;

import com.example.restaurants.model.entity.rol;
import com.example.restaurants.repository.IRol;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RolService {

    private final IRol rolRepository;

    @Transactional
    public rol crearRol(rol nuevoRol) {
        if (nuevoRol.getNombre() == null || nuevoRol.getNombre().isEmpty()) {
            throw new IllegalArgumentException("El nombre del rol no puede estar vacío.");
        }

        // Validación opcional: Evitar roles duplicados con el mismo nombre
        if (rolRepository.findByNombre(nuevoRol.getNombre()).isPresent()) {
            throw new RuntimeException("El rol '" + nuevoRol.getNombre() + "' ya existe.");
        }

        return rolRepository.save(nuevoRol);
    }

    @Transactional(readOnly = true)
    public List<rol> listarTodos() {
        return rolRepository.findAll();
    }

    @Transactional(readOnly = true)
    public rol obtenerPorId(Long id) {
        return rolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado con el ID: " + id));
    }

    @Transactional(readOnly = true)
    public rol obtenerPorNombre(String nombre) {
        return rolRepository.findByNombre(nombre)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado con el nombre: " + nombre));
    }

    @Transactional
    public rol actualizarRol(Long id, rol rolActualizado) {
        rol rolExistente = obtenerPorId(id);
        rolExistente.setNombre(rolActualizado.getNombre());
        return rolRepository.save(rolExistente);
    }

    @Transactional
    public void eliminarRol(Long id) {
        rol rol = obtenerPorId(id);
        rolRepository.delete(rol);
    }
}