package com.example.restaurants.repository;

import com.example.restaurants.model.entity.factura;
import com.example.restaurants.model.entity.inventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface IInventario extends JpaRepository<inventario, Long> {
    @Query("SELECT i FROM inventario i WHERE i.fecha_registro = :fecha")
    List<inventario> buscarPorFechaDeRegistro(@Param("fecha") Date fecha);
}
