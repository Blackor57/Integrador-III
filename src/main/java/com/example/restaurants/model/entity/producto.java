package com.example.restaurants.model.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    private String codproducto;

    @Column(length = 100, nullable = false)
    private String nombreproducto;

    @Column(length = 200, nullable = false)
    private String descripcion;

    @Transient
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Boolean disponible = true;

    @Column(nullable = false)
    private Float precio;

    @ManyToOne
    @JoinColumn(name = "id_subcategoria")
    private subcategoria subcategoria;

}
