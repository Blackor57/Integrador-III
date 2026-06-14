package com.example.restaurants.repository;

import com.example.restaurants.model.entity.insumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IInsumo extends JpaRepository<insumo, Long> {

}
