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
public class boleta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_detalle")
    private detalle_pedido detalle_pedido;

    @Column(name = "DNI")
    private char dni;

    @Column(name = "nombre")
    private String nombre;

    @Column(name = "fecha_emision")
    private Date fecha_emision;
}
