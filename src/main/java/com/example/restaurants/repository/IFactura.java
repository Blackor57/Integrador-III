package com.example.restaurants.repository;

import com.example.restaurants.model.entity.factura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface IFactura extends JpaRepository<factura, Long> {
    factura findByPedido_Id(Long idPedido);
    List<factura> findByRUC(char RUC);
    List<factura> findByFecha_emision(Date fecha);
}
