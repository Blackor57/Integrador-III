package com.example.restaurants.repository;


import com.example.restaurants.model.entity.receta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IReceta extends JpaRepository<receta, Integer> {
}
