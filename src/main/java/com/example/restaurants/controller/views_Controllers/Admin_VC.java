package com.example.restaurants.controller.views_Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class Admin_VC {

    @GetMapping("/inicio")
    public String iAdminInicio() {
        return "Admin_inicio";
    }

    @GetMapping("/pedidos")
    public String irAdmin_pedidos() {
        return "Admin_pedidos";
    }

    @GetMapping("/productos")
    public String irAdmin_productos() {
        return "Admin_productos";
    }

    @GetMapping("/usuario")
    public String irAdmin_Usuario() {
        return "Admin_Usuario";
    }
}
