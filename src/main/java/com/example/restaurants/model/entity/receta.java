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
@Table(name = "receta")
public class receta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "idinsumo")
    private insumo insumo;

    @ManyToOne
    @JoinColumn(name = "idproducto")
    private producto producto;

    @Column(name = "cantidad")
    private Double cantidad;
}
