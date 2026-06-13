package com.example.restaurants.services;

import com.example.restaurants.model.entity.detalle_pedido;
import com.example.restaurants.model.entity.pedido;
import com.example.restaurants.repository.IDetalle_pedido;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class Detalle_PedidoService {
    private final IDetalle_pedido detallepedidoRepository;

    @Transactional(readOnly = true)
    public List<detalle_pedido> listarTodos() {
        return detallepedidoRepository.findAll();
    }

    public List<detalle_pedido> obtenerPorArea(String area) {
        return detallepedidoRepository.findByArea(area);
    }
}
