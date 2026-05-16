package com.example.restaurants.repository;

import com.example.restaurants.model.entity.usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IUsuario extends JpaRepository <usuario,Integer> {

    public usuario findByUsername(String username);

}
