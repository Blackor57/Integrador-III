package com.example.restaurants.controller.Auth;

import com.example.restaurants.controller.JWT.JWTService;
import com.example.restaurants.model.entity.rol;
import com.example.restaurants.model.entity.usuario;
import com.example.restaurants.repository.IRol;
import com.example.restaurants.repository.IUsuario;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final IUsuario usuariorepository;
    private final JWTService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final IRol rolRepository;
    private final AuthenticationManager authenticationManager;

    public AuthResponse login(LoginRequest loginRequest) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
        UserDetails user = usuariorepository.findByUsername(loginRequest.getUsername()).orElseThrow();
        String token = jwtService.getToken(user);
        return AuthResponse.builder()
                .token(token)
                .build();
    }

    @Transactional // Buena práctica: asegurar que el insert sea atómico
    public AuthResponse register(RegisterRequest registerRequest) {

        List<rol> rolesAsignar = new ArrayList<>();

        // LÓGICA CONDICIONAL: ¿Viene un ID de rol desde el formulario?
        if (registerRequest.getIdRol() != null) {
            // Si viene un ID (caso Empleado), buscamos ese rol específico en la BD
            rol rolEspecifico = rolRepository.findById(registerRequest.getIdRol())
                    .orElseThrow(() -> new RuntimeException("Error: El Rol especificado no existe."));
            rolesAsignar.add(rolEspecifico);
        } else {
            // Si no viene ID (caso Cliente autorregistrado), buscamos por defecto "ROLE_USER"
            rol defaultRol = rolRepository.findByNombre("ROLE_USER")
                    .orElseThrow(() -> new RuntimeException("Error: El Rol por defecto no fue encontrado."));
            rolesAsignar.add(defaultRol);
        }

        // Construimos el usuario con la lista de roles dinámicamente resuelta
        usuario user = usuario.builder()
                .username(registerRequest.getUsername())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .nombreCompleto(registerRequest.getNombreCompleto())
                .email(registerRequest.getEmail())
                .telefono(registerRequest.getTelefono())
                .direccion(registerRequest.getDireccion())
                .fecRegistro(registerRequest.getFechaRegistro())
                .roles(rolesAsignar)// Asignamos la lista mutable
                .activo(true)
                .build();

        usuariorepository.save(user);

        return AuthResponse.builder()
                .token(jwtService.getToken(user))
                .build();
    }
}
