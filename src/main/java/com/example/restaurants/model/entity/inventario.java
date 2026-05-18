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
    @JoinColumn(name = "idlote")
    private lote lote;

    @Column(name = "tipomovimiento")
    private String tipo_movimiento;

    @Column(name = "cantidadmovimiento")
    private String cantidad_movimiento;

    @Column(name = "fecharegistro")
    private Date fecha_registro;
}
