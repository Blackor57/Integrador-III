package com.example.restaurants.repository;

import com.example.restaurants.model.entity.producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IProducto extends JpaRepository<producto, Integer> {
    List<producto> findBySubacategoria(Long subacategoria);
}
