package com.example.restaurants.services;

import com.example.restaurants.model.entity.pedido;
import com.example.restaurants.model.entity.recibo;
import com.example.restaurants.repository.IRecibo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class ReciboService {

    private final IRecibo reciboRepository;
    
}