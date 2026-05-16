package com.example.restaurants.repository;


import com.example.restaurants.model.entity.receta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IReceta extends JpaRepository<receta, Integer> {
    receta findByProducto(Long idProducto);
    List<receta> findByInsumo(Long idinsumo);
}
