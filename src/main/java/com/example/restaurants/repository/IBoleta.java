package com.example.restaurants.repository;

import com.example.restaurants.model.entity.boleta;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IBoleta extends JpaRepository<boleta,Long> {
    boleta findByID_pedido(Long id_detalle);
    boleta findByDNI(char dni);
}
