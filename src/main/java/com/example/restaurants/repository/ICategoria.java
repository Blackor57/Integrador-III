package com.example.restaurants.repository;


import com.example.restaurants.model.entity.categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ICategoria extends JpaRepository<categoria,Integer> {

}
