package com.example.restaurants.services;

import com.example.restaurants.model.entity.mesa;
import com.example.restaurants.repository.IMesa;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MesaService {

    @Autowired
    private final IMesa mesaRepository;

    @Transactional
    public mesa crearMesa(mesa nuevaMesa){
        if (nuevaMesa.getNombre() <= 0) {
            throw new IllegalArgumentException("Debes indicar un número válido para registrar la mesa.");
        }
        nuevaMesa.setEstado("LIBRE");
        return mesaRepository.save(nuevaMesa);
    }

    @Transactional(readOnly = true)
    public List<mesa> listarTodas(){
        return mesaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public mesa obtenerPorId(Long idMesa) {
        // Recuerda usar .intValue() si tu repositorio sigue usando Integer
        return mesaRepository.findById(idMesa)
                .orElseThrow(() -> new RuntimeException("Mesa no encontrada con el ID: " + idMesa));
    }

    @Transactional(readOnly = true)
    public mesa obtenerMesaporNumero(Integer nombre){
        return mesaRepository.findByNombre(nombre)
                .orElseThrow(() -> new RuntimeException("No se encontro ninguna mesa registrada "+nombre));
    }

    @Transactional
    public List<mesa> obtenerMesaporEstado(String estado){
        return mesaRepository.findByEstado(estado);
    }

    @Transactional
    public void eliminarMesa(Long idMesa){
        mesa mesaregistrada = obtenerPorId(idMesa);

        if (!"LIBRE".equals(mesaregistrada.getEstado())){
            throw new RuntimeException("No se puede eliminar mesa si hay gente ocupandola");
        }

        mesaRepository.delete(mesaregistrada);
    }
    @Transactional
    public mesa actualizarEstadoMesa(Long idMesa, String estado) {

        mesa mesaExistente = mesaRepository.findById(idMesa)
                .orElseThrow(() -> new RuntimeException("Mesa no encontrada"));

        mesaExistente.setEstado(estado.toUpperCase());

        return mesaRepository.save(mesaExistente);
    }


}
