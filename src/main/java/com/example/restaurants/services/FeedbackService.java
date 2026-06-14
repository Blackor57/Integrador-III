package com.example.restaurants.services;

import com.example.restaurants.model.entity.*;
import com.example.restaurants.repository.IFeedback;
import com.example.restaurants.repository.IPedido;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final IFeedback feedbackRepository;
    private final IPedido pedidoRepository;

    @Transactional
    public feedback crearFeedback(Long idPedido, feedback data){
        // 1. Buscar pedido
        pedido pedidobuscado = pedidoRepository.findById(idPedido)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        // 2. Validar que esté en estado PAGADO
        if(pedidobuscado.getEstadopedido() != EstadoPedido.PAGADO){
            throw new RuntimeException("Solo se puede dar feedback a pedidos PAGADOS");
        }

        // 3. Validar que no exista feedback previo
        if(feedbackRepository.findByPedidoId(idPedido) != null){
            throw new RuntimeException("Este pedido ya tiene feedback");
        }

        // 4. Validar puntuación (ahora numérico)
        if(data.getPuntuacion() == null){
            throw new RuntimeException("La puntuación es obligatoria");
        }

        // 5. Obtener usuario desde pedido
        usuario usuario = pedidobuscado.getUsuario();

        // Verificamos que el rol sea estrictamente el de cliente (ajusta "ROLE_USER" al nombre exacto que uses en tu BD)
        boolean esCliente = usuario.getRoles().stream()
                .anyMatch(rol -> "ROLE_USER".equalsIgnoreCase(rol.getNombre()));

        if (!esCliente) {
            throw new RuntimeException("Seguridad: Solo los clientes pueden registrar calificaciones y comentarios.");
        }

        // 6. Guardar feedback
        feedback nuevo = new feedback();
        nuevo.setPedido(pedidobuscado);
        nuevo.setUsuario(usuario);
        nuevo.setPuntuacion(data.getPuntuacion());

        // Si el nombre viene null o vacío, lo autocompletamos con el del usuario
        if(data.getNombre() != null && !data.getNombre().trim().isEmpty()){
            nuevo.setNombre(data.getNombre());
        } else {
            nuevo.setNombre(usuario.getEmail());
        }

        nuevo.setComentario(data.getComentario());
        nuevo.setFecha(new Date());

        return feedbackRepository.save(nuevo);
    }

    @Transactional(readOnly = true)
    public feedback obtenerPorPedido(Long idPedido){
        // Corrección de sintaxis: asignamos a la variable feedbackEncontrado
        feedback feedbackEncontrado = feedbackRepository.findByPedidoId(idPedido);

        if(feedbackEncontrado == null){
            throw new RuntimeException("El pedido no tiene feedback");
        }
        return feedbackEncontrado;
    }

    @Transactional(readOnly = true)
    public List<feedback> obtenerPorUsuario(Long usuarioId){
        List<feedback> lista = feedbackRepository.findByUsuarioId(usuarioId);
        if(lista.isEmpty()){
            throw new RuntimeException("El usuario no tiene feedback registrados");
        }
        return lista;
    }
}