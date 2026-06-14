package com.example.restaurants.repository;
import com.example.restaurants.model.entity.feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IFeedback  extends JpaRepository<feedback, Long> {
    feedback findByPedidoId(Long pedidoId);
    List<feedback> findByUsuarioId(Long usuarioId);
}
