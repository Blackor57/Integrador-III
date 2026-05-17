package com.example.restaurants.controller.Auth;

import com.example.restaurants.controller.JWT.JWTService;
import com.example.restaurants.model.entity.rol;
import com.example.restaurants.model.entity.usuario;
import com.example.restaurants.repository.IRol;
import com.example.restaurants.repository.IUsuario;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final IUsuario usuariorepository;
    private final JWTService jwtService;
    private final IRol rolRepository;

    public AuthResponse login(LoginRequest loginRequest) {
        return null;
    }

    public AuthResponse register(RegisterRequest registerRequest) {
        rol defaultRol = rolRepository.findByNombre("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("Error: El Rol por defecto no fue encontrado."));
        usuario user = usuario.builder()
                .username(registerRequest.getUsername())
                .password(registerRequest.getPassword())
                .nombreCompleto(registerRequest.getNombreCompleto())
                .email(registerRequest.getEmail())
                .telefono(registerRequest.getTelefono())
                .direccion(registerRequest.getDireccion())
                .fecRegistro(registerRequest.getFechaRegistro())
                .roles(Collections.singletonList(defaultRol))
                .build();
        usuariorepository.save(user);

        return AuthResponse.builder()
                .token(jwtService.getToken(user))
                .build();
    }
}
