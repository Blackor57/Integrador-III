package com.example.restaurants.repository;

import com.example.restaurants.model.entity.subcategoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ISubCategoria extends JpaRepository<subcategoria,Long> {
    List<subcategoria> findByCategoriaId(Long id_categoria);
}
