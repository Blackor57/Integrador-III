package com.example.restaurants.repository;

import com.example.restaurants.model.entity.boleta;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IBoleta extends JpaRepository<boleta,Integer> {
}
