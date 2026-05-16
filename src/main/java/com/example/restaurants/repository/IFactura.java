package com.example.restaurants.repository;

import com.example.restaurants.model.entity.factura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IFactura extends JpaRepository<factura, Integer> {
}
