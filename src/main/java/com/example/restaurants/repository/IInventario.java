package com.example.restaurants.repository;

import com.example.restaurants.model.entity.factura;
import com.example.restaurants.model.entity.inventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface IInventario extends JpaRepository<inventario, Integer> {
    List<inventario> findbyFechaRegistro(Date fecha);
}
