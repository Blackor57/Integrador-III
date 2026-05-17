package com.example.restaurants.repository;

import com.example.restaurants.model.entity.usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface IUsuario extends JpaRepository <usuario,Long> {

    Optional<usuario> findByUsername(String username);

    List<usuario> findByRoles_Nombre(String rol);

    List<usuario> findByFecRegistro(Date fecha);
}
