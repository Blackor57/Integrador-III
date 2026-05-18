package com.example.restaurants.services;

import com.example.restaurants.model.entity.producto;
import com.example.restaurants.repository.IProducto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoService {

    @Autowired
    private final IProducto productoRepository;

    @Transactional
    public producto crearProducto(producto nuevoProducto) {
        // Validación: El precio no puede ser negativo o cero
        if (nuevoProducto.getPrecio() <= 0) {
            throw new IllegalArgumentException("El precio del producto debe ser mayor a 0.");
        }

        // (Opcional) Aquí podrías validar si el cod_producto ya existe llamando a un método del repositorio

        return productoRepository.save(nuevoProducto);
    }

    @Transactional(readOnly = true)
    public List<producto> listarTodos() {
        return productoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public producto obtenerPorId(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con el ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<producto> listarPorSubcategoria(Long idSubcategoria) {
        // Asegúrate de corregir el nombre del método en tu IProducto
        return productoRepository.findBySubcategoria_Id(idSubcategoria);
    }

    @Transactional
    public producto actualizarProducto(Long id, producto productoActualizado) {
        producto productoExistente = obtenerPorId(id);

        // Actualizamos los datos (no actualizamos el código de producto ni el ID)
        productoExistente.setNombre_producto(productoActualizado.getNombre_producto());
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


}
