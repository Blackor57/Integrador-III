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
@Table(name = "producto")
public class producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 20, nullable = false)
    private String cod_producto;

    @Column(length = 20, nullable = false)
    private String nombre_producto;

    @Column(length = 50, nullable = false)
    private String descripcion;

    @Column(nullable = false)
    private float precio;

    @ManyToOne
    @JoinColumn(name = "id_subcategoria")
    private subcategoria subcategoria;

}
