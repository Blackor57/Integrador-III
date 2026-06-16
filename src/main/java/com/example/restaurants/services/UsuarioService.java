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

    @Transactional
    public usuario quitarRol(Long idUsuario, Long idRol) {
        // 1. Obtener el usuario existente
        usuario usuarioExistente = obtenerPorId(idUsuario);

        // 2. Obtener el rol que se desea remover
        rol rolExistente = rolRepository.findById(idRol)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        // 3. Remover el rol únicamente de la colección del usuario (Al ser unidireccional, JPA se encarga del DELETE en la tabla intermedia)
        if (usuarioExistente.getRoles().contains(rolExistente)) {
            usuarioExistente.getRoles().remove(rolExistente);
        }

        // 4. Guardar los cambios en el repositorio
        return usuarioRepository.save(usuarioExistente);
    }


    @Transactional
    public void desactivarUsuario(Long id) {
        // 1. Obtener el usuario existente
        usuario usuarioExistente = obtenerPorId(id);

        // 2. Buscar el rol restrictivo (ID 7) en la base de datos
        rol rolDesactivado = rolRepository.findById(7L)
                .orElseThrow(() -> new RuntimeException("El rol de desactivación (ID 7) no existe en la base de datos"));

        // 3. Cambiar el estado del usuario para el Login
        usuarioExistente.setActivo(false); // Ya no podrá pasar el filtro de Spring Security

        // 4. Limpiar TODOS los roles actuales de su colección interna
        usuarioExistente.getRoles().clear();

        // 5. Asignar el rol ID 7 automáticamente
        usuarioExistente.getRoles().add(rolDesactivado);

        // 6. Guardar los cambios heredados
        usuarioRepository.save(usuarioExistente);
    }
}
