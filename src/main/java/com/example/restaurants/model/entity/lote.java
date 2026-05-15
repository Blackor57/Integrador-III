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

    @Column(name = "cod_lote", length = 50)
    private String codLote;

    @ManyToOne
    @JoinColumn(name = "id_insumo")
    private insumo insumo;

    @Column(name = "fecha_fabricacion")
    private Date fecha_fabricacion;

    @Column(name = "fecha_vencimiento")
    private Date fecha_vencimiento;

    @Column(name = "cantidad_recibido")
    private int cantidad_recibido;

    @Column(name = "cantidad_actual")
    private int cantidad_actual;
}
