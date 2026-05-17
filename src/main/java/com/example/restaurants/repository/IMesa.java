package com.example.restaurants.repository;

import com.example.restaurants.model.entity.mesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IMesa extends JpaRepository<mesa,Long> {
    Optional<mesa> findByNumeroMesa(Integer numeroMesa);
    List<mesa>  findByEstado (String estado);
    long countByEstado(String estado);
}
