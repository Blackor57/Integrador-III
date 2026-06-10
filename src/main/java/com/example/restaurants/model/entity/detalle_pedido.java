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
    @JoinColumn(name = "idpedido")
    private pedido pedido;

    @ManyToOne
    @JoinColumn(name = "idproducto")
    private producto producto;

    @Column(name = "preciounitario")
    private float precioUnitario;

    @Column(name = "cantidad")
    private Integer cantidad;

    @Column(name = "subtotal")
    private float subtotal;

    @Column(name = "estadoitem")
    private String estadoItem;

}
