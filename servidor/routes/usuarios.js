const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');

// Simulación de base de datos
/*
const usuarios = [
  { id: 1, email: 'profesional@ejemplo.com', password: '1234', rol: 'profesional' },
  { id: 2, email: 'paciente@ejemplo.com', password: 'abcd', rol: 'paciente' }
];
*/
// Ruta POST /api/usuarios/login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    const usuario = usuarios.find(u => u.email === email && u.password === password);

    if (!usuario) {
        return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    res.json({
        mensaje: 'Inicio de sesión correcto',
        usuario: {
            id: usuario.id,
            email: usuario.email,
            rol: usuario.rol
        }
    });
});

// Registro
router.post('/registro', async (req, res) => {
    try {
        const { email, username, password, rol } = req.body;

        // Comprobar si el usuario ya existe
        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ mensaje: 'El usuario ya está registrado' });
        }

        // Crear nuevo usuario
        const nuevoUsuario = new Usuario({
            email,
            username,
            password: await bcrypt.hashSync(password, 10), // Encriptar la contraseña
            rol: rol || 'paciente'  // valor por defecto
        });

        // Guardar el usuario en la base de datos
        await nuevoUsuario.save();
        //usuarios.push(nuevoUsuario);
        res.json({ mensaje: 'Usuario registrado correctamente', usuario: nuevoUsuario });
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        res.status(500).json({ mensaje: 'Error al registrar el usuario' });
    }
});

module.exports = router;
