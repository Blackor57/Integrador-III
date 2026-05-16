package com.example.restaurants.repository;

import com.example.restaurants.model.entity.factura;
import com.example.restaurants.model.entity.inventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IInventario extends JpaRepository<inventario, Integer> {
}
