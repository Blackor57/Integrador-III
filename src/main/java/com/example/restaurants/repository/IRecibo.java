package com.example.restaurants.repository;
import com.example.restaurants.model.entity.recibo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IRecibo extends JpaRepository<recibo, Long> {
    List<recibo> findByRUC(String RUC);
    List<recibo> findByDni(String dni);
    recibo findByPedidoId(Long pedidoId);
}