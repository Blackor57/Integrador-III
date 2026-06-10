package com.example.restaurants.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "pedido")
public class pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "idusuario",nullable=true)
    private usuario usuario;

    @ManyToOne
    @JoinColumn(name = "idmesa",nullable=true)
    private mesa mesa;

    @Column(name = "fechacreacion",nullable=true)
    private Date fechacreacion;

    @Column(name = "estadopedido",nullable=true, length = 255)
    private String estadopedido;

    @Column(name = "tiposervicio",nullable=true, length = 255)
    private String tiposervicio;

    @Column(name = "notasespeciales",nullable=true, length = 255)
    private String notasespeciales;

    @Column(name = "subtotal",nullable=false)
    private float subtotal;

    @Column(name = "total",nullable=false)
    private float total;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<detalle_pedido> detalles;
}
