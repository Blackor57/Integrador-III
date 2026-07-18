package com.example.restaurants.services;

import com.example.restaurants.model.entity.*;
import com.example.restaurants.repository.*;
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
    private final IProducto productoRepository;
    private final IUsuario usuarioRepository;
    private final ProductoService productoService;

    @Transactional
    public pedido crearPedido(pedido nuevoPedido) {

        // 1. Validar tipo de servicio
        if (nuevoPedido.getTiposervicio() == null) {
            throw new RuntimeException("El tipo de servicio es obligatorio");
        }

        if (nuevoPedido.getUsuario() == null ||
                nuevoPedido.getUsuario().getId() == null) {

            throw new RuntimeException("Debe especificar un usuario");
        }

        usuario usuarioDB = usuarioRepository
                .findById(nuevoPedido.getUsuario().getId())
                .orElseThrow(() ->
                        new RuntimeException("Usuario no encontrado"));

        nuevoPedido.setUsuario(usuarioDB);

        boolean esCliente = usuarioDB.getRoles().stream()
                .anyMatch(r -> r.getNombre().toUpperCase().contains("USER") ||
                        r.getNombre().toUpperCase().contains("CLIENTE"));

        String tipoServicio;

        // Si es un cliente normal
        if (esCliente) {
            // Forzamos a que el pedido sea PARA LLEVAR, sin importar lo que envíe el frontend
            tipoServicio = "RECOJO";
            nuevoPedido.setTiposervicio(tipoServicio);
        }
        // Si es personal (MOZO, CAJA, ADMIN, etc.)
        else {
            if (nuevoPedido.getTiposervicio() == null) {
                throw new RuntimeException("El tipo de servicio es obligatorio para el personal");
            }
            // Respetamos la decisión del trabajador (SALÓN o PARA LLEVAR)
            tipoServicio = nuevoPedido.getTiposervicio().toUpperCase();
            nuevoPedido.setTiposervicio(tipoServicio); // Aseguramos que se guarde en mayúsculas
        }

        //  CASO 1: SERVICIO EN MESA (PRESENCIAL)
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

        // 🚚 CASO 2: SERVICIO ONLINE / DELIVERY
        else {
            // Nos aseguramos que NO tenga mesa
            nuevoPedido.setMesa(null);
        }

        // 2. DATOS GENERALES DEL PEDIDO
        nuevoPedido.setFechacreacion(new Date());
        nuevoPedido.setEstadopedido(EstadoPedido.PENDIENTE);

        float totalPedido = 0;

        // 3. PROCESAR DETALLES
        if (nuevoPedido.getDetalles() == null || nuevoPedido.getDetalles().isEmpty()) {
            throw new RuntimeException("El pedido debe tener al menos un detalle");
        }

        for (detalle_pedido detalle : nuevoPedido.getDetalles()) {

            if (detalle.getCantidad() <= 0) {
                throw new RuntimeException("Cantidad inválida en el detalle");
            }

            if (detalle.getProducto() == null || detalle.getProducto().getId() == null) {
                throw new RuntimeException("Debe especificar un producto");
            }

            producto productoDB = productoRepository
                    .findById(detalle.getProducto().getId())
                    .orElseThrow(() -> new RuntimeException(
                            "Producto no encontrado: " + detalle.getProducto().getId()));

            if (!productoService.verificarDisponibilidad(productoDB.getId())) {
                throw new RuntimeException("El producto '" + productoDB.getNombreproducto() + "' se encuentra AGOTADO por falta de insumos.");
            }

            productoService.descontarStock(productoDB.getId(), detalle.getCantidad());
            detalle.setProducto(productoDB);
            String area = productoDB
                    .getSubcategoria()
                    .getCategoria()
                    .getRol()
                    .getNombre();

            if ("ROLE_BARMAN".equals(area)) {
                detalle.setArea("BAR");
            } else {
                detalle.setArea("COCINA");
            }

            detalle.setPedido(nuevoPedido);

            Float precioReal = productoDB.getPrecio();

            detalle.setPrecioUnitario(precioReal);

            Float subtotalDetalle = detalle.getCantidad() * precioReal;

            detalle.setSubtotal(subtotalDetalle);

            detalle.setEstadoItem(EstadoItem.EN_PREPARACION);

            totalPedido += subtotalDetalle;
        }
        // 4. TOTALES
        nuevoPedido.setSubtotal(totalPedido);
        nuevoPedido.setTotal(totalPedido);

        return pedidoRepository.save(nuevoPedido);
    }

    @Transactional(readOnly = true)
    public pedido obtenerPorId(Long id) {
        // Nota: Si mantienes Integer en tu repositorio, usamos .intValue().
        // Lo ideal en el futuro es cambiar el repositorio a Long.
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado con el ID: " + id));
    }

    public List<pedido> obtenerPedidosPorUsuario(Long idUsuario) {
        return pedidoRepository.findByUsuarioId(idUsuario);
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
        try {
            // Convertimos el texto (ej. "pagado") a tu Enum oficial (PAGADO)
            EstadoPedido estadoEnum = EstadoPedido.valueOf(estado.toUpperCase());
            return pedidoRepository.buscarPorEstado(estadoEnum);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Estado de pedido inválido. Usa PENDIENTE, PAGADO, CANCELADO, etc.");
        }
    }

    /**
     * Obtiene los pedidos asignados a una mesa específica.
     */
    @Transactional(readOnly = true)
    public pedido obtenerPorMesa(Long idMesa) {
        return pedidoRepository.buscarPedidoActivoPorMesa(idMesa)
                .orElseThrow(() -> new RuntimeException("No se encontró una cuenta activa para cobrar en la mesa: " + idMesa));
    }
    /**
     * Cancela un pedido cambiando su estado.
     */
    @Transactional
    public pedido cancelarPedido(Long idPedido, String motivo) {
        // Validación inicial: Bloqueamos cualquier intento de cancelación sin justificación
        if (motivo == null || motivo.trim().isEmpty()) {
            throw new RuntimeException("Para control de auditoría, es obligatorio proporcionar un motivo de anulación.");
        }

        // 1. Buscamos el pedido en la base de datos
        pedido pedidoExistente = obtenerPorId(idPedido);

        // 2. Cambiamos el estado principal del pedido y registramos la justificación
        pedidoExistente.setEstadopedido(EstadoPedido.CANCELADO);
        pedidoExistente.setMotivoAnulacion(motivo); // <-- Aquí guardamos el porqué

        // 3. Liberamos la mesa (si es que el pedido es en salón y tiene mesa)
        if (pedidoExistente.getMesa() != null) {
            mesa mesaEntity = pedidoExistente.getMesa();
            mesaEntity.setEstado("LIBRE"); // Volvemos a dejar la mesa disponible
            mesaRepository.save(mesaEntity);
        }

        // 4. Cancelamos todos los ítems para que desaparezcan de la pantalla de la Cocina/Bar
        if (pedidoExistente.getDetalles() != null) {
            for (detalle_pedido detalle : pedidoExistente.getDetalles()) {
                String estadoActual = detalle.getEstadoItem().toString();

                // Si el estado es PENDIENTE (el cocinero aún no lo prepara), regresamos la mercadería al almacén
                if ("PENDIENTE".equals(estadoActual)) {
                    productoService.devolverStock(detalle.getProducto().getId(), detalle.getCantidad());
                }
                // Si ya estaba EN_PREPARACION o ENTREGADO, NO se devuelve (se asume como pérdida o merma de restaurante)

                // En cualquier caso, el ítem queda tachado de la cuenta
                if (!"ENTREGADO".equals(estadoActual)) {
                    detalle.setEstadoItem(EstadoItem.CANCELADO);
                }
            }
        }
        // 5. Guardamos todos los cambios juntos (el @Transactional asegura que si algo falla, no se guarde nada a medias)
        return pedidoRepository.save(pedidoExistente);
    }

    @Transactional
    public pedido entregarItem(Long idPedido, Long idDetalle) {
        // 1. Traemos el pedido completo de la base de datos
        pedido pedidoExistente = obtenerPorId(idPedido);

        boolean todosEntregados = true;
        boolean itemEncontrado = false;

        // 2. Recorremos los ítems para encontrar exactamente el que se está entregando
        if (pedidoExistente.getDetalles() != null) {
            for (detalle_pedido detalle : pedidoExistente.getDetalles()) {

                // Si encontramos el producto específico, lo marcamos como ENTREGADO
                if (detalle.getId().equals(idDetalle)) {
                    detalle.setEstadoItem(EstadoItem.ENTREGADO); // Ajusta si usas String en vez de Enum
                    itemEncontrado = true;
                }

                // 3. Auditoría del resto de la orden:
                // Si hay algún ítem que NO esté ENTREGADO y que NO haya sido CANCELADO,
                // significa que la mesa sigue esperando platos.
                if (!"ENTREGADO".equals(detalle.getEstadoItem().toString()) &&
                        !"CANCELADO".equals(detalle.getEstadoItem().toString())) {
                    todosEntregados = false;
                }
            }
        }

        // Validación de seguridad para evitar errores de digitación
        if (!itemEncontrado) {
            throw new RuntimeException("El ítem con ID " + idDetalle + " no pertenece a este pedido o no existe.");
        }

        // 4. Automatización de negocio: Si ya no falta ningún plato, la orden general pasa a ATENDIDO
        if (todosEntregados) {
            pedidoExistente.setEstadopedido(EstadoPedido.ENTREGADO); // Ajusta si usas String
        }

        // 5. Guardamos el impacto en la base de datos
        return pedidoRepository.save(pedidoExistente);
    }

    @Transactional
    public pedido cambiarTipoRecibo(Long idPedido, String nuevoTipo) {
        // 1. Buscamos el pedido
        pedido pedidoExistente = obtenerPorId(idPedido);

        // 2. Control anti-fraude: No se puede cambiar si ya se pagó
        if (pedidoExistente.getEstadopedido() == EstadoPedido.PAGADO) {
            throw new RuntimeException("No se puede cambiar el tipo de comprobante porque la orden ya fue pagada.");
        }

        // 3. Convertimos el texto (String) al formato oficial de tu Enum
        try {
            TipoRecibo tipoEnum = TipoRecibo.valueOf(nuevoTipo.toUpperCase());
            pedidoExistente.setTiporecibo(tipoEnum);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Tipo de recibo inválido. Solo se acepta BOLETA o FACTURA.");
        }

        // 4. Guardamos los cambios
        return pedidoRepository.save(pedidoExistente);
    }

    @Transactional(readOnly = true)
    public List<Object[]> obtenerProductosMasVendidos() {
        return detallePedidoRepository.productosMasVendidos();
    }
    // METODOS DE REPORTES Y ESTADÍSTICAS
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

    @Transactional
    public pedido actualizarPedido(Long id, pedido pedidoActualizado) {
        // 1. Buscamos el pedido existente en la base de datos
        pedido pedidoExistente = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado con ID: " + id));

        // 2. Actualizamos los totales y notas
        pedidoExistente.setSubtotal(pedidoActualizado.getSubtotal());
        pedidoExistente.setTotal(pedidoActualizado.getTotal());

        // Concatenamos las notas si hay nuevas
        if (pedidoActualizado.getNotasespeciales() != null && !pedidoActualizado.getNotasespeciales().isEmpty()) {
            pedidoExistente.setNotasespeciales(pedidoActualizado.getNotasespeciales());
        }

        // 3. Manejo Inteligente de los Detalles (SOLUCIÓN AL ERROR)
        if (pedidoActualizado.getDetalles() != null) {
            for (detalle_pedido detalleEntrante : pedidoActualizado.getDetalles()) {

                // Si el detalle NO tiene ID, significa que es un producto NUEVO
                // que el mozo acaba de agregar al carrito
                if (detalleEntrante.getId() == null) {
                    detalleEntrante.setPedido(pedidoExistente); // Lo amarramos al pedido
                    pedidoExistente.getDetalles().add(detalleEntrante); // Lo agregamos a la BD
                }
                // Si ya tiene ID, significa que es un plato antiguo que ya estaba preparándose,
                // por lo que lo ignoramos y dejamos que siga su curso normal.
            }
        }

        // 4. Guardamos los cambios
        return pedidoRepository.save(pedidoExistente);
    }

    @Transactional
    public detalle_pedido cambiarEstadoDetalle(
            Long idDetalle,
            EstadoItem nuevoEstado) {

        detalle_pedido detalle = detallePedidoRepository.findById(idDetalle)
                .orElseThrow(() -> new RuntimeException("Detalle no encontrado"));

        detalle.setEstadoItem(nuevoEstado);

        return detallePedidoRepository.save(detalle);
    }

    @Transactional(readOnly = true)
    public List<pedido> listarPedidosPorRango(Date inicio, Date fin) {
        // Aseguramos que la fecha fin incluya todo el día
        return pedidoRepository.buscarPedidosPorRango(inicio, fin);
    }

}
