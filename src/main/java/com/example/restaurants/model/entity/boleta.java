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
@Table(name = "boleta")
public class boleta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "idpedido")
    private pedido pedido;

    @Column(name = "DNI")
    private char dni;

    @Column(name = "nombre")
    private String nombre;

    @Column(name = "fechaemision")
    private Date fecha_emision;

}
