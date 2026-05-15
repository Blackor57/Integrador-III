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
@Table(name = "inventario")
public class factura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_detalle")
    private detalle_pedido detalle_pedido;

    @Column(name = "RUC")
    private char RUC;

    @Column(name = "razon_social")
    private String razon_social;

    @Column(name = "direccion", length = 200)
    private String direccion;

    @Column(name = "fecha_emision")
    private Date fecha_emision;

    @Column(name = "sub_total")
    private float sub_total;

    @Column(name = "IGV")
    private float IGV;

    @Column(name = "Total")
    private float Total;
}
