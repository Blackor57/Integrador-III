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
public class inventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_lote")
    private lote lote;

    @Column(name = "tipo_movimiento")
    private String tipo_movimiento;

    @Column(name = "cantidad_movimiento")
    private String cantidad_movimiento;

    @Column(name = "fecha_registro")
    private Date fecha_registro;
}
