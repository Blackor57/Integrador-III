package com.example.restaurants.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collection;
import java.util.Date;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "usuario", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email")
})
public class usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario", length = 50, nullable = false)
    private String nombre;

    @Column(name = "contraseña", length = 50, nullable = false)
    private String contraseña;

    @Column(name = "Nombre_Completo", length = 10, nullable = false)
    private String Nombre_Completo;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "telefono")
    private int telefono;

    @Column(name = "direccion")
    private String direccion;

    @Column(name = "fec_registro")
    private Date fec_registro;

    @ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinTable(name = "usuarios_roles",
            joinColumns = @JoinColumn(name = "id_usuario", referencedColumnName = "id"),
            inverseJoinColumns = @JoinColumn(name = "id_rol", referencedColumnName = "id"))
    private Collection<rol> roles;

}
