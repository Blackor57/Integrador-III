package com.example.restaurants.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "recibo")
public class recibo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fechaEmision", nullable=true)
    @Temporal(TemporalType.TIMESTAMP)
    private Date fechaEmision;

    @OneToOne
    @JoinColumn(name="idpedido", nullable=false)
    private pedido pedido;
    // ===== DATOS FACTURA =====
    @Column(name = "RUC", nullable=true)
    private String RUC;

    @Column(name = "razonsocial" , length = 255, nullable=true)
    private String razonsocial;

    @Column(name = "direccion", length = 200 , nullable=true)
    private String direccion;

    @Column(name = "subtotal", nullable=true)
    private float subtotal;

    @Column(name = "IGV", nullable=true)
    private float IGV;

    @Column(name = "Total", nullable=true)
    private float Total;

    // ===== DATOS BOLETA =====
    @Column(name = "DNI", length = 8, nullable=true)
    private String dni;

    @Column(name = "nombre", nullable=true)
    private String nombre;
}