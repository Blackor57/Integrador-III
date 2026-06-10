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

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PedidoService {


    private final IPedido pedidoRepository;
    private final IDetalle_pedido detallePedidoRepository;
    private final IMesa mesaRepository;

    @Transactional
    public pedido crearPedido(pedido nuevoPedido) {

        // 1. Validar tipo de servicio
        if (nuevoPedido.getTiposervicio() == null) {
            throw new RuntimeException("El tipo de servicio es obligatorio");
        }

        String tipoServicio = nuevoPedido.getTiposervicio().toUpperCase();

        // ==========================================
        // 🪑 CASO 1: SERVICIO EN MESA (PRESENCIAL)
        // ==========================================
        if ("MESA".equals(tipoServicio)) {

            if (nuevoPedido.getMesa() == null || nuevoPedido.getMesa().getId() == null) {
                throw new RuntimeException("Debe especificar una mesa para pedidos en salón");
            }
            mesa mesaEntity = mesaRepository.findById(nuevoPedido.getMesa().getId())
                    .orElseThrow(() -> new RuntimeException("Mesa no encontrada"));

            if (!"LIBRE".equalsIgnoreCase(mesaEntity.getEstado())) {
                throw new RuntimeException("La mesa " + mesaEntity.getNombre() + " no está libre");
            }

            // Ocupamos la mesa
            mesaEntity.setEstado("OCUPADO");
            mesaRepository.save(mesaEntity);

            nuevoPedido.setMesa(mesaEntity);
        }

        // ==========================================
        // 🚚 CASO 2: SERVICIO ONLINE / DELIVERY
        // ==========================================
        else {
            // Nos aseguramos que NO tenga mesa
            nuevoPedido.setMesa(null);
        }

        // ==========================================
        // 2. DATOS GENERALES DEL PEDIDO
        // ==========================================
        nuevoPedido.setFechacreacion(new Date());
        nuevoPedido.setEstadopedido("PENDIENTE");

        float totalPedido = 0;

        // ==========================================
        // 3. PROCESAR DETALLES
        // ==========================================
        if (nuevoPedido.getDetalles() == null || nuevoPedido.getDetalles().isEmpty()) {
            throw new RuntimeException("El pedido debe tener al menos un detalle");
        }

        for (detalle_pedido detalle : nuevoPedido.getDetalles()) {

            if (detalle.getCantidad() <= 0) {
                throw new RuntimeException("Cantidad inválida en el detalle");
            }

            if (detalle.getPrecioUnitario() <= 0) {
                throw new RuntimeException("Precio inválido en el detalle");
            }

            detalle.setPedido(nuevoPedido);
            detalle.setEstadoItem("PENDIENTE");

            float subtotalDetalle = detalle.getCantidad() * detalle.getPrecioUnitario();
            detalle.setSubtotal(subtotalDetalle);

            totalPedido += subtotalDetalle;
        }

        // ==========================================
        // 4. TOTALES
        // ==========================================
        nuevoPedido.setSubtotal(totalPedido);
        nuevoPedido.setTotal(totalPedido);

        // ==========================================
        // 5. GUARDAR
        // ==========================================
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
        return pedidoRepository.findByMesaId(idMesa)
                .orElseThrow(() -> new RuntimeException("No se encontró un pedido activo para la mesa: " + idMesa));
    }

    /**
     * Cambia el estado de un pedido (por ejemplo, de PENDIENTE a PAGADO).
     */
    @Transactional
    public pedido cambiarEstadoPedido(Long idPedido, String nuevoEstado) {
        pedido pedidoExistente = obtenerPorId(idPedido);
        pedidoExistente.setEstadopedido(nuevoEstado);
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
        pedidoExistente.setEstadopedido("CANCELADO");

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
                if (!"ENTREGADO".equals(detalle.getEstadoItem())) {
                    detalle.setEstadoItem("CANCELADO");
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
