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
@Table(name = "lote")
public class lote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codlote", length = 50)
    private String codLote;

    @ManyToOne
    @JoinColumn(name = "idinsumo")
    private insumo insumo;

    @Column(name = "fechafabricacion")
    private Date fechafabricacion;

    @Column(name = "FechaVencimiento")
    private Date FechaVencimiento;

    @Column(name = "cantidadrecibido")
    private Integer cantidadrecibido;

    @Column(name = "cantidadactual")
    private Integer cantidadactual;
}
