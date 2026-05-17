package com.example.restaurants.repository;

import com.example.restaurants.model.entity.usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface IUsuario extends JpaRepository <usuario,Long> {

    public usuario findByUsername(String username);
    List<usuario> findByRoles(String rol);
    List<usuario> findbyFechaRegistro(Date fecha);
}
