package com.example.restaurants.repository;

import com.example.restaurants.model.entity.detalle_pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface IDetalle_pedido extends JpaRepository<detalle_pedido,Long> {
    List<detalle_pedido> findByPedido_Id(Long idPedido);
    boolean existsByPedido_Id(Long idPedido);
    @Query("""
    SELECT d.producto.id, SUM(d.cantidad)
    FROM DetallePedido d
    GROUP BY d.producto.id
    ORDER BY SUM(d.cantidad) DESC
    """)
    List<Object[]> productosMasVendidos();
    @Query("""
    SELECT SUM(d.cantidad)
    FROM DetallePedido d
    WHERE d.producto.id = :idProducto
    """)
    Long cantidadVendidaProducto(Long idProducto);
    @Query("""
    SELECT SUM(d.subtotal)
    FROM DetallePedido d
    WHERE d.producto.id = :idProducto
    """)
    BigDecimal montoGeneradoProducto(Long idProducto);
}
