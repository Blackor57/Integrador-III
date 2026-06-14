package com.example.restaurants.services;

import com.example.restaurants.model.entity.*;
import com.example.restaurants.repository.IMesa;
import com.example.restaurants.repository.IPedido;
import com.example.restaurants.repository.IRecibo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class ReciboService {

    private final IRecibo reciboRepository;
    private final IPedido pedidoRepository;
    private final IMesa mesaRepository;

    @Transactional
    public recibo crearRecibo(Long idPedido, recibo datosRecibo) {

        // 1. Aseguramos que el pedido existe directamente de la base de datos
        pedido pedidoDB = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado con ID: " + idPedido));

        // 2. Validamos que el pedido sepa qué tipo de comprobante necesita
        if (pedidoDB.getTiporecibo() == null) {
            throw new RuntimeException("El pedido no tiene especificado si requiere BOLETA o FACTURA.");
        }

        recibo nuevoRecibo = new recibo();
        nuevoRecibo.setPedido(pedidoDB);
        nuevoRecibo.setFechaEmision(new Date());

        // 3. Cálculos financieros: Asignamos y GUARDAMOS los resultados en la entidad
        float subtotal = pedidoDB.getSubtotal();
        float igv = subtotal * 0.18f;
        float total = subtotal + igv;

        pedidoDB.setTotal(total);
        nuevoRecibo.setSubtotal(subtotal);
        nuevoRecibo.setIGV(igv);
        nuevoRecibo.setTotal(total);

        // 4. Lógica de discriminación usando Enums (seguro contra errores tipográficos)
        if (pedidoDB.getTiporecibo() == TipoRecibo.FACTURA) {

            if (datosRecibo.getRUC() == null || datosRecibo.getRUC().trim().isEmpty()) {
                throw new RuntimeException("Facturación requiere un RUC válido.");
            }
            nuevoRecibo.setRUC(datosRecibo.getRUC());
            nuevoRecibo.setRazonsocial(datosRecibo.getRazonsocial()); // Respetando tu camelCase
            nuevoRecibo.setDireccion(datosRecibo.getDireccion());

        } else if (pedidoDB.getTiporecibo() == TipoRecibo.BOLETA) {

            if (datosRecibo.getDni() == null || datosRecibo.getDni().trim().isEmpty()) {
                throw new RuntimeException("La emisión de Boleta requiere un DNI válido.");
            }
            nuevoRecibo.setDni(datosRecibo.getDni());
            nuevoRecibo.setNombre(datosRecibo.getNombre());

        }

        // 5. Persistencia
        return reciboRepository.save(nuevoRecibo);
    }

    @Transactional
    public recibo generarRecibo(Long pedidoId, recibo datosRecibo) {
        // 1. Buscamos el pedido en la base de datos
        pedido pedidoDB = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado con ID: " + pedidoId));

        // 2. Control de seguridad: Evitar doble cobro
        if (pedidoDB.getEstadopedido() == EstadoPedido.PAGADO) {
            throw new RuntimeException("El pedido ya está pagado.");
        }

        // 3. Generamos y calculamos el recibo usando la lógica que ya armamos arriba
        recibo reciboGenerado = crearRecibo(pedidoId, datosRecibo);

        // 4. Cambiamos el estado de la orden a PAGADO
        pedidoDB.setEstadopedido(EstadoPedido.PAGADO);

        // 5. Liberamos la mesa física pasándole el String "LIBRE"
        mesa mesaEntity = pedidoDB.getMesa();
        if (mesaEntity != null) {
            mesaEntity.setEstado("LIBRE");
            mesaRepository.save(mesaEntity);
        }

        // 6. Persistimos los cambios del pedido
        pedidoRepository.save(pedidoDB);

        return reciboGenerado;
    }
}