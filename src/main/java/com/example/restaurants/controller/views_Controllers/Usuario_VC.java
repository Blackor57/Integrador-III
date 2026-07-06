package com.example.restaurants.controller.views_Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/usuario")
@RequiredArgsConstructor
public class Usuario_VC {

    @GetMapping("/perfil")
    public String irPerfil() {
        return "perfil";
    }

    @GetMapping("/mesas")
    public String irMesas() {
        return "mesas";
    }

    @GetMapping("/pedido")
    public String irPedidos() {
        return "Pedido";
    }
}
