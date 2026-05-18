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
    @JoinColumn(name = "idusuario")
    private usuario usuario;

    @ManyToOne
    @JoinColumn(name = "idmesa")
    private mesa mesa;

    @Column(name = "fechacreacion")
    private Date fechacreacion;

    @Column(name = "estadopedido")
    private String estadopedido;

    @Column(name = "tiposervicio")
    private String tiposervicio;

    @Column(name = "notasespeciales")
    private String notasespeciales;

    @Column(name = "subtotal")
    private float subtotal;

    @Column(name = "total")
    private float total;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<detalle_pedido> detalles;
}
