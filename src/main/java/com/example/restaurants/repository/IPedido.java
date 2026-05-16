package com.example.restaurants.repository;


import com.example.restaurants.model.entity.pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IPedido extends JpaRepository<pedido, Integer> {
}
