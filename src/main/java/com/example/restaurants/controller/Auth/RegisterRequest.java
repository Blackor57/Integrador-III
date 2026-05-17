package com.example.restaurants.controller.Auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String username;
    private String password;
    private String nombreCompleto;
    private String email;
    private String telefono;
    private String direccion;
    private Date fechaRegistro;
}
