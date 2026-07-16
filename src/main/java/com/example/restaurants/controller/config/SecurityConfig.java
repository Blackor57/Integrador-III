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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

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
                .cors(withDefaults())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authRequest ->
                                authRequest .requestMatchers( 
                                                "/",
                                                "/**/*.html",
                                                "/**/*.css",
                                                "/**/*.js",
                                                "/**/*.png",
                                                "/**/*.jpg",
                                                "/**/*.ico"
                                        ).permitAll()
                                        .requestMatchers("/auth/**").permitAll()
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
                                            .requestMatchers("/feedback/**").permitAll()
                                            .requestMatchers("/public/**").permitAll()
                                            .requestMatchers("/usuario").hasRole("USER")
                                            .requestMatchers("/admin/**").hasRole("ADMIN")
                                            .requestMatchers("/barman/**").hasRole("BARMAN")
                                            .requestMatchers("/cocina/**").hasRole("COCINA")
                                            .requestMatchers("/caja/**").hasRole("CAJA")
                                            .requestMatchers("/mozo/**").hasRole("MOZO")
                                        .anyRequest().authenticated()
                        )
                .sessionManagement(sessionManagement ->
                        sessionManagement
                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authenticationProvider(authProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Aquí le damos permiso a tu Live Server (y localhost por si acaso)
            configuration.setAllowedOrigins(Arrays.asList("http://127.0.0.1:5500", "http://localhost:5500"));

        // Permitimos todos los métodos HTTP que usarás
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // Permitimos el envío de tokens en las cabeceras
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(true); // Vital para que funcione con JWT

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Aplicamos estas reglas a todos tus endpoints ("/**")
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}
