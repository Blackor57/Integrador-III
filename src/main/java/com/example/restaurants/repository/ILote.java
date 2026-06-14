package com.example.restaurants.repository;


import com.example.restaurants.model.entity.lote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface ILote extends JpaRepository<lote, Long> {

    List<lote> findByFechaVencimiento(Date fecha);

    @Query("SELECT COALESCE(SUM(l.cantidadactual), 0) FROM lote l WHERE l.insumo.id = :idInsumo")
    Integer obtenerStockTotalInsumo(@Param("idInsumo") Long idInsumo);

    // Añade esto debajo de tus otros métodos en ILote.java
    @Query("SELECT l FROM lote l WHERE l.insumo.id = :idInsumo AND l.cantidadactual > 0 ORDER BY l.FechaVencimiento ASC")
    List<lote> obtenerLotesDisponibles(@Param("idInsumo") Long idInsumo);

}
