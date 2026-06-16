package com.example.restaurants.repository;

import com.example.restaurants.model.entity.rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IRol extends JpaRepository<rol, Long> {

    // 1. El que ya tienes (Perfecto para buscar ROLE_ADMIN, ROLE_USER, etc.)
    Optional<rol> findByNombre(String nombre);

    // 2. Comprobar si un rol ya existe antes de intentar crearlo (Evita excepciones 500)
    boolean existsByNombre(String nombre);

    // 3. Buscar múltiples roles por sus nombres de golpe
    List<rol> findByNombreIn(List<String> nombres);
}
