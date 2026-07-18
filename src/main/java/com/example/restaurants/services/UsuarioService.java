package com.example.restaurants.services;

import com.example.restaurants.model.entity.rol;
import com.example.restaurants.model.entity.usuario;
import com.example.restaurants.repository.IRol;
import com.example.restaurants.repository.IUsuario;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final IUsuario usuarioRepository;
    private final IRol rolRepository;
    private final PasswordEncoder passwordEncoder;


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

        // 1. Validaciones para no sobreescribir con nulos
        if (datosActualizados.getNombreCompleto() != null) {
            usuarioExistente.setNombreCompleto(datosActualizados.getNombreCompleto());
        }

        if (datosActualizados.getTelefono() != null) {
            usuarioExistente.setTelefono(datosActualizados.getTelefono());
        }

        if (datosActualizados.getDireccion() != null) {
            usuarioExistente.setDireccion(datosActualizados.getDireccion());
        }

        if (datosActualizados.getEmail() != null) {
            usuarioExistente.setEmail(datosActualizados.getEmail());
        }

        // 2. Manejo de la contraseña (Opcional)
        // Si el usuario escribió una contraseña nueva en el formulario, se actualiza
        if (datosActualizados.getPassword() != null && !datosActualizados.getPassword().isEmpty()) {

            // ⚠️ IMPORTANTE: Como vi en tus errores anteriores que usas JWT y Spring Security,
            // seguramente tus contraseñas están encriptadas. Debes usar tu PasswordEncoder aquí.
            // Si tienes inyectado un passwordEncoder en tu servicio, descomenta la línea de abajo y borra la otra:

            // usuarioExistente.setPassword(passwordEncoder.encode(datosActualizados.getPassword()));

            // Si NO usas passwordEncoder o lo manejas de otra forma, usa esta:
            usuarioExistente.setPassword(datosActualizados.getPassword());
        }

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
        usuario usuarioExistente = obtenerPorId(id);
        usuarioExistente.setActivo(false);
        usuarioRepository.save(usuarioExistente);
    }

    @Transactional
    public void activarUsuario(Long id) {
        usuario usuarioExistente = obtenerPorId(id);
        usuarioExistente.setActivo(true);
        usuarioRepository.save(usuarioExistente);
    }

    @Transactional
    public usuario guardarUsuario(usuario nuevoUsuario) {
        nuevoUsuario.setPassword(passwordEncoder.encode(nuevoUsuario.getPassword()));
        nuevoUsuario.setFecRegistro(new Date());
        nuevoUsuario.setActivo(true);
        return usuarioRepository.save(nuevoUsuario);
    }
}
