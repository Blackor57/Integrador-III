package com.example.restaurants.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "detalle_pedido")
public class detalle_pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_pedido")
    private pedido pedido;

    @ManyToOne
    @JoinColumn(name = "id_producto")
    private producto producto;

    @Column(name = "precio_unitario")
    private float precio_unitario;

    @Column(name = "cantidad")
    private int cantidad;

    @Column(name = "subtotal")
    private float subtotal;

    @Column(name = "estado_item")
    private String estado_item;

}
