package com.example.restaurants.repository;

import com.example.restaurants.model.entity.mesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IMesa extends JpaRepository<mesa,Integer> {

    mesa findByPedido_Id(Integer idPedido);

}
