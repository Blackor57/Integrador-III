package com.example.restaurants.repository;


import com.example.restaurants.model.entity.pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface IPedido extends JpaRepository<pedido, Long> {

    Optional<pedido> findByMesa_Id(Long idMesa);

    List<pedido> findByUsuario_Id(Long idUsuario);

    @Query("SELECT p FROM pedido p WHERE p.estado_pedido = :estado")
    List<pedido> buscarPorEstado(@Param("estado") String estado);

    @Query("SELECT p FROM pedido p WHERE p.tipo_servicio = :tipo")
    List<pedido> buscarPorTipoServicio(@Param("tipo") String tipo);

    // SOLUCIÓN 3: Query manual para validar existencia evitando que el guion bajo rompa todo
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM pedido p WHERE p.mesa.id = :idMesa AND p.estado_pedido = :estado")
    boolean existePedidoEnMesa(@Param("idMesa") Long idMesa, @Param("estado") String estado);

    // Tu query de ventas (con la corrección de Double para evitar choque con float)
    @Query("""
        SELECT SUM(p.total)
        FROM pedido p
        WHERE p.estado_pedido = 'PAGADO'
        """)
    Double obtenerVentasTotales();

}
