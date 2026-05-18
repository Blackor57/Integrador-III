package com.example.restaurants.services;

import com.example.restaurants.model.entity.detalle_pedido;
import com.example.restaurants.model.entity.mesa;
import com.example.restaurants.model.entity.pedido;
import com.example.restaurants.repository.IDetalle_pedido;
import com.example.restaurants.repository.IMesa;
import com.example.restaurants.repository.IPedido;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PedidoService {

    @Autowired
    private final IPedido pedidoRepository;
    @Autowired
    private final IDetalle_pedido detallePedidoRepository;
    @Autowired
    private final IMesa mesaRepository;

    @Transactional
    public pedido crearPedido(pedido nuevoPedido) {
        // 1. Validar y actualizar la Mesa (si es servicio en salón)
        if ("MESA".equalsIgnoreCase(nuevoPedido.getTipo_servicio()) && nuevoPedido.getMesa() != null) {
            mesa mesaEntity = mesaRepository.findById(nuevoPedido.getMesa().getId())
                    .orElseThrow(() -> new RuntimeException("Mesa no encontrada"));

            if (!"LIBRE".equals(mesaEntity.getEstado())) {
                throw new RuntimeException("La mesa " + mesaEntity.getNombre() + " no está libre.");
            }

            // Ocupamos la mesa
            mesaEntity.setEstado("OCUPADO");
            mesaRepository.save(mesaEntity);
            nuevoPedido.setMesa(mesaEntity);
        }

        nuevoPedido.setFecha_creacion(new Date());
        nuevoPedido.setEstado_pedido("PENDIENTE");

        float totalPedido = 0;

        // 2. Procesar detalles con el nuevo 'Estado_Item'
        if (nuevoPedido.getDetalles() != null) {
            for (detalle_pedido detalle : nuevoPedido.getDetalles()) {
                detalle.setPedido(nuevoPedido);
                detalle.setEstado_item("PENDIENTE"); // Listo para que cocina/bar lo vea

                float subtotalDetalle = detalle.getCantidad() * detalle.getPrecio_unitario();
                detalle.setSubtotal(subtotalDetalle);
                totalPedido += subtotalDetalle;
            }
        }

        nuevoPedido.setSub_total(totalPedido);
        nuevoPedido.setTotal(totalPedido);

        return pedidoRepository.save(nuevoPedido);
    }

    /**
     * Busca un pedido por su ID.
     */
    @Transactional(readOnly = true)
    public pedido obtenerPorId(Long id) {
        // Nota: Si mantienes Integer en tu repositorio, usamos .intValue().
        // Lo ideal en el futuro es cambiar el repositorio a Long.
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado con el ID: " + id));
    }

    /**
     * Devuelve una lista con todos los pedidos del restaurante.
     */
    @Transactional(readOnly = true)
    public List<pedido> listarTodos() {
        return pedidoRepository.findAll();
    }

    /**
     * Filtra los pedidos según su estado (ej: "PENDIENTE", "PAGADO", "CANCELADO").
     */
    @Transactional(readOnly = true)
    public List<pedido> listarPorEstado(String estado) {
        return pedidoRepository.buscarPorEstado(estado);
    }

    /**
     * Obtiene los pedidos asignados a una mesa específica.
     */
    @Transactional(readOnly = true)
    public pedido obtenerPorMesa(Long idMesa) {
        return pedidoRepository.findByMesa_Id(idMesa)
                .orElseThrow(() -> new RuntimeException("No se encontró un pedido activo para la mesa: " + idMesa));
    }

    /**
     * Cambia el estado de un pedido (por ejemplo, de PENDIENTE a PAGADO).
     */
    @Transactional
    public pedido cambiarEstadoPedido(Long idPedido, String nuevoEstado) {
        pedido pedidoExistente = obtenerPorId(idPedido);
        pedidoExistente.setEstado_pedido(nuevoEstado);
        return pedidoRepository.save(pedidoExistente);
    }

    /**
     * Cancela un pedido cambiando su estado.
     */
    @Transactional
    public pedido cancelarPedido(Long idPedido) {
        // 1. Buscamos el pedido en la base de datos
        pedido pedidoExistente = obtenerPorId(idPedido);

        // 2. Cambiamos el estado principal del pedido
        pedidoExistente.setEstado_pedido("CANCELADO");

        // 3. Liberamos la mesa (si es que el pedido es en salón y tiene mesa)
        if (pedidoExistente.getMesa() != null) {
            mesa mesaEntity = pedidoExistente.getMesa();
            mesaEntity.setEstado("LIBRE"); // Volvemos a dejar la mesa disponible
            mesaRepository.save(mesaEntity);
        }

        // 4. Cancelamos todos los ítems para que desaparezcan de la pantalla de la Cocina/Bar
        if (pedidoExistente.getDetalles() != null) {
            for (detalle_pedido detalle : pedidoExistente.getDetalles()) {
                // Solo cancelamos si no ha sido entregado aún
                if (!"ENTREGADO".equals(detalle.getEstado_item())) {
                    detalle.setEstado_item("CANCELADO");
                }
            }
        }
        // 5. Guardamos todos los cambios juntos (el @Transactional asegura que si algo falla, no se guarde nada a medias)
        return pedidoRepository.save(pedidoExistente);
    }

    // ==========================================
    /**
     * Devuelve un reporte de los productos más vendidos usando la query de tu repositorio de detalles.
     */
    @Transactional(readOnly = true)
    public List<Object[]> obtenerProductosMasVendidos() {
        return detallePedidoRepository.productosMasVendidos();
    }
    // METODOS DE REPORTES Y ESTADÍSTICAS

    // ==========================================

    /**
     * Calcula los ingresos totales de todos los pedidos con estado 'PAGADO'.
     */
    @Transactional(readOnly = true)
    public Double obtenerVentasTotales() {
        Double ventas = pedidoRepository.obtenerVentasTotales();
        return ventas != null ? ventas : 0.0;
    }



    /**
     * Obtiene las estadísticas financieras específicas de un producto.
     */
    @Transactional(readOnly = true)
    public String obtenerReporteProducto(Long idProducto) {
        Long cantidad = detallePedidoRepository.cantidadVendidaProducto(idProducto);
        Double monto = detallePedidoRepository.montoGeneradoProducto(idProducto);

        long cantFinal = (cantidad != null) ? cantidad : 0L;
        Double montoFinal = (monto != null) ? monto : 0.0;

        return String.format("Producto ID %d: Unidades vendidas = %d, Total generado = $%s",
                idProducto, cantFinal, montoFinal.toString());
    }


}
