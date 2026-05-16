package com.example.restaurants.repository;

import com.example.restaurants.model.entity.rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IRol extends JpaRepository<rol,Integer> {

    Optional<rol> findByUsername(String username);

}
