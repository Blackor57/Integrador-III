package com.example.restaurants.controller.views_Controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/public")
@RequiredArgsConstructor
public class Public_vc {
    @GetMapping("/inicio")
    public String irAlInicio() {
        return "Index";
    }

    @GetMapping("/carta")
    public String irACarta() {
        return "Carta";
    }

}
