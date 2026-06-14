package com.example.restaurants.controller.config;

import com.example.restaurants.controller.JWT.JWTAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JWTAuthenticationFilter jwtAuthenticationFilter;
    private final AuthenticationProvider authProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception
    {
        return http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authRequest ->
                                authRequest.requestMatchers("/auth/**").permitAll()
                                        .requestMatchers("/mesa/**").permitAll()
                                        .requestMatchers("/pedido/**").permitAll()
                                        .requestMatchers("/producto/**").permitAll()
                                        .requestMatchers("/categoria/**").permitAll()
                                        .requestMatchers("/rol/**").permitAll()
                                        .requestMatchers("/subcategoria/**").permitAll()
                                        .requestMatchers("/detalle/**").permitAll()
                                        .requestMatchers("/insumo/**").permitAll()
                                        .requestMatchers("/inventario/**").permitAll()
                                        .requestMatchers("/lote/**").permitAll()
                                        .requestMatchers("/recibo/**").permitAll()
                                        .requestMatchers("/reporte/**").permitAll()
                                        .requestMatchers("/receta/**").permitAll()
                                        .anyRequest().authenticated()
                        )
                .sessionManagement(sessionManagement ->
                        sessionManagement
                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authenticationProvider(authProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

}
