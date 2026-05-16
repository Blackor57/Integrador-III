package com.example.restaurants.repository;

import com.example.restaurants.model.entity.subcategoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ISubCategoria extends JpaRepository<subcategoria,Integer> {
}
