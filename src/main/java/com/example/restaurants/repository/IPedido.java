package com.example.restaurants.repository;


import com.example.restaurants.model.entity.pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface IPedido extends JpaRepository<pedido, Integer> {
    Optional<pedido> findByMesa_Id(Long idMesa);
    List<pedido> findByUsuario_Id(Long idUsuario);
    List<pedido> findByEstado(String estadoPedido);
    List<pedido> findByTipoServicio(String tipoServicio);
    boolean existsByMesa_IdAndEstadoPedido(Long idMesa, String estadoPedido);
    @Query("""
        SELECT SUM(p.total)
        FROM Pedido p
        WHERE p.estadoPedido = 'PAGADO'
        """)
    BigDecimal obtenerVentasTotales();

}
