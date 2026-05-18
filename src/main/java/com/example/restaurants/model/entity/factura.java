package com.example.restaurants.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "factura")
public class factura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "idpedido")
    private pedido pedido;

    @Column(name = "RUC")
    private char RUC;

    @Column(name = "razonsocial")
    private String razonsocial;

    @Column(name = "direccion", length = 200)
    private String direccion;

    @Column(name = "fechaEmision")
    private Date fechaEmision;

    @Column(name = "subtotal")
    private float subtotal;

    @Column(name = "IGV")
    private float IGV;

    @Column(name = "Total")
    private float Total;
}
