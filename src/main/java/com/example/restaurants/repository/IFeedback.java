package com.example.restaurants.repository;
import com.example.restaurants.model.entity.feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IFeedback  extends JpaRepository<feedback, Long> {
    feedback findByPedidoId(Long pedidoId);
    List<feedback> findByUsuarioId(Long usuarioId);
    // Asegúrate de que el FROM coincida al 100% con el nombre de tu clase (minúscula)
    @Query("SELECT COALESCE(AVG(f.puntuacion), 0.0) FROM feedback f WHERE f.usuario.id = :usuarioId")
    Double obtenerPromedioCalificacion(@Param("usuarioId") Long usuarioId);
}
