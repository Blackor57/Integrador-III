package com.example.restaurants.services;

import com.example.restaurants.model.entity.inventario;
import com.example.restaurants.model.entity.lote;
import com.example.restaurants.model.entity.producto;
import com.example.restaurants.model.entity.receta;
import com.example.restaurants.repository.IInventario;
import com.example.restaurants.repository.ILote;
import com.example.restaurants.repository.IProducto;
import com.example.restaurants.repository.IReceta;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoService {

    @Autowired
    private final IProducto productoRepository;
    private final IReceta recetaRepository;
    private final ILote loteRepository;
    private final IInventario inventarioRepository;

    @Transactional
    public producto crearProducto(producto nuevoProducto) {
        // Validación: El precio no puede ser negativo o cero
        if (nuevoProducto.getPrecio() <= 0) {
            throw new IllegalArgumentException("El precio del producto debe ser mayor a 0.");
        }
        nuevoProducto.setDisponible(true);

        // (Opcional) Aquí podrías validar si el cod_producto ya existe llamando a un método del repositorio

        return productoRepository.save(nuevoProducto);
    }

    public boolean verificarDisponibilidad(Long idProducto) {
        List<receta> ingredientes = recetaRepository.findByProductoId(idProducto);

        // Si el producto no tiene receta registrada, asumimos que es de stock infinito (ej: agua de caño) o venta directa
        if (ingredientes.isEmpty()) {
            return true;
        }

        // Revisamos ingrediente por ingrediente
        for (receta r : ingredientes) {
            Integer stockReal = loteRepository.obtenerStockTotalInsumo(r.getInsumo().getId());

            // Si el stock real es menor a lo que pide la receta, el plato se bloquea
            if (stockReal < r.getCantidad()) {
                return false;
            }
        }
        return true; // Si pasó todas las validaciones, hay stock de todo
    }

    /**
     * LISTAR MENÚ: Ahora el menú evalúa el stock antes de mostrarse
     */
    @Transactional(readOnly = true)
    public List<producto> listarTodos() {
        List<producto> menu = productoRepository.findAll();

        // Calculamos la disponibilidad en tiempo real para cada plato
        for (producto p : menu) {
            p.setDisponible(verificarDisponibilidad(p.getId()));
        }

        return menu;
    }

    @Transactional(readOnly = true)
    public producto obtenerPorId(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con el ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<producto> listarPorSubcategoria(Long idSubcategoria) {
        List<producto> menu = productoRepository.findBySubcategoriaId(idSubcategoria);
        for (producto p : menu) {
            p.setDisponible(verificarDisponibilidad(p.getId()));
        }
        return menu;
    }

    @Transactional
    public producto actualizarProducto(Long id, producto productoActualizado) {
        producto productoExistente = obtenerPorId(id);

        // Actualizamos los datos (no actualizamos el código de producto ni el ID)
        productoExistente.setNombreproducto(productoActualizado.getNombreproducto());
        productoExistente.setDescripcion(productoActualizado.getDescripcion());

        if (productoActualizado.getPrecio() > 0) {
            productoExistente.setPrecio(productoActualizado.getPrecio());
        }

        // Si envían una nueva subcategoría, la actualizamos
        if (productoActualizado.getSubcategoria() != null) {
            productoExistente.setSubcategoria(productoActualizado.getSubcategoria());
        }
        return productoRepository.save(productoExistente);
    }

    @Transactional
    public void descontarStock(Long idProducto, int cantidadPedida) {
        // 1. Buscamos qué ingredientes lleva el plato
        List<receta> ingredientes = recetaRepository.findByProductoId(idProducto);

        // 2. Recorremos cada ingrediente (Ej: Carne, Papas, Arroz)
        for (receta r : ingredientes) {
            // CAMBIO 1: Usamos Double porque los insumos se miden en decimales (Ej: 0.250 KG * 2 platos = 0.500 KG)
            Double cantidadNecesaria = r.getCantidad() * cantidadPedida;

            // Traemos los lotes disponibles de ese insumo (¡Asegúrate que tu query los ordene por FechaVencimiento ASC!)
            List<lote> lotes = loteRepository.obtenerLotesDisponibles(r.getInsumo().getId());

            // 3. Empezamos a restar de los lotes más antiguos
            for (lote lote : lotes) {
                if (cantidadNecesaria <= 0) break; // Si ya cubrimos lo necesario, pasamos al siguiente ingrediente

                Double cantidadADescontar = 0.0;

                if (lote.getCantidadactual() >= cantidadNecesaria) {
                    // Si este lote tiene suficiente, le restamos todo lo necesario
                    cantidadADescontar = cantidadNecesaria;
                    lote.setCantidadactual(lote.getCantidadactual() - cantidadNecesaria);
                    cantidadNecesaria = 0.0;
                } else {
                    // Si este lote no alcanza, lo vaciamos por completo
                    cantidadADescontar = lote.getCantidadactual();
                    cantidadNecesaria -= lote.getCantidadactual();
                    lote.setCantidadactual(0.0);
                }

                loteRepository.save(lote);

                // CAMBIO 2: ¡Registramos el movimiento en el historial de inventario!
                if (cantidadADescontar > 0) {
                    inventario movimiento = new inventario();
                    movimiento.setLote(lote);
                    movimiento.setTipo_movimiento("SALIDA");
                    movimiento.setCantidad_movimiento(cantidadADescontar);
                    movimiento.setFecha_registro(new Date());

                    inventarioRepository.save(movimiento);
                }
            }

            // 4. Si después de revisar todos los lotes aún falta ingrediente, bloqueamos la venta
            if (cantidadNecesaria > 0) {
                // Ahora el mensaje de error es mucho más exacto
                throw new RuntimeException("Stock insuficiente para el insumo: "
                        + r.getInsumo().getNombre()
                        + ". Faltan " + cantidadNecesaria);
            }
        }
    }

    @Transactional
    public void devolverStock(Long idProducto, int cantidadDevuelta) {
        List<receta> ingredientes = recetaRepository.findByProductoId(idProducto);

        if (ingredientes.isEmpty()) {
            return; // Si es botella de agua, no hacemos nada
        }

        for (receta r : ingredientes) {
            // CAMBIO 1: Cambiamos a Double para soportar decimales en los insumos
            Double cantidadAReponer = r.getCantidad() * cantidadDevuelta;

            // Buscamos los lotes de este insumo
            List<lote> lotes = loteRepository.obtenerLotesDisponibles(r.getInsumo().getId());

            if (!lotes.isEmpty()) {
                // Le devolvemos el stock al lote que vence más pronto para aprovecharlo
                lote loteSeleccionado = lotes.get(0);
                loteSeleccionado.setCantidadactual(loteSeleccionado.getCantidadactual() + cantidadAReponer);
                loteRepository.save(loteSeleccionado);

                // CAMBIO 2: ¡Registramos el movimiento en el historial de inventario!
                inventario movimiento = new inventario();
                movimiento.setLote(loteSeleccionado);
                movimiento.setTipo_movimiento("DEVOLUCION"); // Etiqueta clave para auditoría
                movimiento.setCantidad_movimiento(cantidadAReponer);
                movimiento.setFecha_registro(new Date());

                inventarioRepository.save(movimiento);

                System.out.println("-> [DEVOLUCIÓN] Se regresaron " + cantidadAReponer + " unidades al lote " + loteSeleccionado.getId());
            } else {
                System.out.println("-> [ALERTA] No se encontró un lote activo para devolver el insumo ID: " + r.getInsumo().getId());
            }
        }
    }

    @Transactional
    public void desactivarProducto(Long id) {
        producto productoExistente = obtenerPorId(id);
        productoExistente.setDisponible(false); // Lo marcamos como no disponible
        productoRepository.save(productoExistente);
    }

    @Transactional
    public void activarProducto(Long id) {
        producto productoExistente = obtenerPorId(id);
        productoExistente.setDisponible(true); // Lo volvemos a activar
        productoRepository.save(productoExistente);
    }
}
