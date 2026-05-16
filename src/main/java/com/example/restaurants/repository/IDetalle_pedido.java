package com.example.restaurants.repository;

import com.example.restaurants.model.entity.detalle_pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IDetalle_pedido extends JpaRepository<detalle_pedido,Integer> {
}
