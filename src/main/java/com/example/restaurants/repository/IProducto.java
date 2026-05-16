package com.example.restaurants.repository;

import com.example.restaurants.model.entity.producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IProducto extends JpaRepository<producto, Integer> {
}
