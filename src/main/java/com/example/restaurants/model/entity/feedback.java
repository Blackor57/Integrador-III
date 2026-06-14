package com.example.restaurants.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
@Table(name = "feedback")
public class feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "idusuario", nullable=false)
    private usuario usuario;

    @OneToOne
    @JoinColumn(name = "idpedido", nullable= false)
    private pedido pedido;

    // EL CAMBIO ESTRATÉGICO: Puntuación para análisis de datos
    @Min(value = 1, message = "La calificación mínima es 1 estrella")
    @Max(value = 5, message = "La calificación máxima es 5 estrellas")
    @Column(name = "puntuacion", nullable=false)
    private Integer puntuacion;

    @Column(name = "nombre" , length = 255, nullable=true)
    private String nombre;

    @Column(name = "comentario" , nullable=true)
    private String comentario;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "fecha" , nullable=true)
    private Date fecha;
}