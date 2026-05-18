package com.example.restaurants.services;

import com.example.restaurants.model.entity.rol;
import com.example.restaurants.model.entity.usuario;
import com.example.restaurants.repository.IUsuario;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    @Autowired
    private final IUsuario usuarioRepository;

    @Transactional(readOnly =true)
    public List<usuario> listarUsuarios(){
        return usuarioRepository.findAll();
    }

    @Transactional(readOnly = true)
    public usuario obtenerPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @Transactional(readOnly = true)
    public Optional<usuario> buscarPorNombreUsuario(String nombreUsuario) {
        return usuarioRepository.findByUsername(nombreUsuario);
    }

    @Transactional
    public usuario actualizarPerfil(Long id, usuario datosActualizados) {
        usuario usuarioExistente = obtenerPorId(id);

        // Actualizamos solo los datos permitidos (no la contraseña ni el ID)
        usuarioExistente.setNombreCompleto(datosActualizados.getNombreCompleto());
        usuarioExistente.setTelefono(datosActualizados.getTelefono());
        usuarioExistente.setDireccion(datosActualizados.getDireccion());
        usuarioExistente.setEmail(datosActualizados.getEmail());

        return usuarioRepository.save(usuarioExistente);
    }

    @Transactional
    public usuario asignarRol(Long idUsuario, rol nuevoRol) {
        usuario usuarioExistente = obtenerPorId(idUsuario);

        // Agregamos el nuevo rol a la colección existente
        usuarioExistente.getRoles().add(nuevoRol);

        return usuarioRepository.save(usuarioExistente);
    }

    @Transactional
    public void EliminarUsuario(Long id){
        usuario usuarioExistente = obtenerPorId(id);
        usuarioRepository.delete(usuarioExistente);
    }

    /*@Transactional
    public void desactivarUsuario(Long id) {
        usuario usuarioExistente = obtenerPorId(id);
        usuarioExistente.setActivo(false); // Ya no podrá hacer login
        usuarioRepository.save(usuarioExistente);
    }*/
}
