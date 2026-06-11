package com.example.restaurants.model.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
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
    @JsonBackReference
    private pedido pedido;

    @ManyToOne
    @JoinColumn(name = "idproducto")
    private producto producto;

    @Column(name = "preciounitario")
    private Float precioUnitario;

    @Column(name = "cantidad")
    private Integer cantidad;

    @Column(name = "subtotal")
    private Float subtotal;

    @Enumerated(EnumType.STRING)
    @Column(name = "estadoitem")
    private EstadoItem estadoItem;

    @Column(name = "area")
    private String area; // COCINA o BAR

}
