package com.example.restaurants.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "pedido")
public class pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private usuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_mesa")
    private mesa mesa;

    @Column(name = "fecha_creacion")
    private Date fecha_creacion;

    @Column(name = "estado_pedido")
    private String estado_pedido;

    @Column(name = "tipo_servicio")
    private String tipo_servicio;

    @Column(name = "notas_especiales")
    private String notas_especiales;

    @Column(name = "sub_total")
    private float sub_total;

    @Column(name = "total")
    private float total;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<detalle_pedido> detalles;
}
