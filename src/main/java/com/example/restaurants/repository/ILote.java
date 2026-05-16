package com.example.restaurants.repository;


import com.example.restaurants.model.entity.lote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ILote extends JpaRepository<lote, Integer> {
}
