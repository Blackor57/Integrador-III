package com.example.restaurants.services;

import com.example.restaurants.model.entity.rol;
import com.example.restaurants.model.entity.usuario;
import com.example.restaurants.repository.IRol;
import com.example.restaurants.repository.IUsuario;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    @Autowired
    private final IUsuario usuarioRepository;

    private final IRol rolRepository;

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

    @Transactional
    public usuario asignarRol(Long idUsuario, Long idRol) {
        // 1. Validar y obtener el usuario existente
        usuario usuarioExistente = obtenerPorId(idUsuario);

        // 2. Validar y obtener el rol que YA existe en la tabla de roles
        rol rolExistente = rolRepository.findById(idRol)
                .orElseThrow(() -> new RuntimeException("El rol con ID " + idRol + " no existe"));

        // 3. Validar que el usuario no tenga ya ese rol asignado para evitar redundancia
        if (usuarioExistente.getRoles().contains(rolExistente)) {
            throw new RuntimeException("El usuario ya tiene asignado este rol");
        }

        // 4. Agregamos el rol a la colección.
        // Al guardar el usuario, JPA insertará automáticamente la fila en 'usuarios_roles'
        usuarioExistente.getRoles().add(rolExistente);

        return usuarioRepository.save(usuarioExistente);
    }


    /*@Transactional
    public void desactivarUsuario(Long id) {
        usuario usuarioExistente = obtenerPorId(id);
        usuarioExistente.setActivo(false); // Ya no podrá hacer login
        usuarioRepository.save(usuarioExistente);
    }*/
}
