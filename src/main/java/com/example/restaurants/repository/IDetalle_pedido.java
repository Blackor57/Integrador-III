package com.example.restaurants.repository;

import com.example.restaurants.model.entity.detalle_pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface IDetalle_pedido extends JpaRepository<detalle_pedido,Long> {
    List<detalle_pedido> findByPedido_Id(Long idPedido);
    List<detalle_pedido> findByArea(String area);
    boolean existsByPedidoId(Long idPedido);
    @Query("""
    SELECT d.producto.id, SUM(d.cantidad)
    FROM detalle_pedido d
    GROUP BY d.producto.id
    ORDER BY SUM(d.cantidad) DESC
    """)
    List<Object[]> productosMasVendidos();

    // CORRECCIÓN JPQL: La clase se llama 'detalle_pedido'
    @Query("""
    SELECT SUM(d.cantidad)
    FROM detalle_pedido d
    WHERE d.producto.id = :idProducto
    """)
    Long cantidadVendidaProducto(@Param("idProducto") Long idProducto);

    // CORRECCIÓN JPQL: La clase se llama 'detalle_pedido'.
    // Además, cambiamos BigDecimal a Double porque tu entidad original
    // usaba un 'float' para el subtotal, y SUM(float) en JPQL devuelve Double.
    @Query("""
    SELECT SUM(d.subtotal)
    FROM detalle_pedido d
    WHERE d.producto.id = :idProducto
    """)
    Double montoGeneradoProducto(@Param("idProducto") Long idProducto);
}
