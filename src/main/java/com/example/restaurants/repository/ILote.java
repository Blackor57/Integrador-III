package com.example.restaurants.repository;


import com.example.restaurants.model.entity.lote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface ILote extends JpaRepository<lote, Integer> {
    List<lote> findByFechaVencimiento(Date fecha);
}
