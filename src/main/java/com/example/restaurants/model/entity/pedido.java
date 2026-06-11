package com.example.restaurants.model.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
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

    @Enumerated(EnumType.STRING)
    @Column(name = "estadopedido", nullable = false)
    private EstadoPedido estadopedido;

    @Column(name = "tiposervicio",nullable=true, length = 255)
    private String tiposervicio;

    @Column(name = "notasespeciales",nullable=true, length = 255)
    private String notasespeciales;

    @Column(name = "subtotal",nullable=false)
    private Float subtotal;

    @Column(name = "total",nullable=false)
    private Float total;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<detalle_pedido> detalles;
}
