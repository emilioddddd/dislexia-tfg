const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');
const { requiereSesion, requiereRol } = require('../middleware/autenticacion');


// Simulación de base de datos
/*
const usuarios = [
  { id: 1, email: 'profesional@ejemplo.com', password: '1234', rol: 'profesional' },
  { id: 2, email: 'paciente@ejemplo.com', password: 'abcd', rol: 'paciente' }
];
*/

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar al usuario por su email
    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
    }

    // Comparar contraseñas
    const contraseñaCorrecta = await bcrypt.compare(password, usuario.password);

    if (!contraseñaCorrecta) {
      return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
    }

    // Guardar en sesión
    req.session.usuario = {
      id: usuario._id,
      email: usuario.email,
      username: usuario.username,
      rol: usuario.rol
    };

    // Login exitoso: devolver info útil
    res.json({
      mensaje: 'Inicio de sesión correcto',
      usuario: req.session.usuario
    });
  } catch (error) {
    console.error('Error al hacer login:', error);
    res.status(500).json({ mensaje: 'Error al iniciar sesión' });
  }
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

// Obtener perfil del usuario
router.get('/perfil', (req, res) => {
  if (!req.session.usuario) {
    return res.status(401).json({ mensaje: 'No has iniciado sesión' });
  }

  res.json({ mensaje: 'Perfil del usuario', usuario: req.session.usuario });
});

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Solo profesional 
router.get('/panel-profesional', requiereRol('profesional'), (req, res) => {
  res.json({ mensaje: 'Bienvenido al panel profesional', usuario: req.session.usuario });
});

// Solo profesionales pueden acceder
router.get('/mis-pacientes', requiereRol('profesional'), async (req, res) => {
  try {
    const pacientes = await Usuario.find({ rol: 'paciente', profesional: req.session.usuario.id });
    res.json({ pacientes });
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    res.status(500).json({ mensaje: 'Error al obtener la lista de pacientes' });
  }
});

//Registrar un nuevo paciente (solo profesional)
router.post('/registrar-paciente', requiereRol('profesional'), async (req, res) => {
  try {
    const { email, username, password, dni, nombre } = req.body;
    const profesionalId = req.session.usuario.id;

    // Verificar que no exista ya un usuario con ese email
    const existente = await Usuario.findOne({ email });
    if (existente) {
      return res.status(400).json({ mensaje: 'Ya existe un usuario con ese correo' });
    }

    const nuevoPaciente = new Usuario({
      email,
      username,
      password: await bcrypt.hash(password, 10),
      rol: 'paciente',
      dni,
      nombre,
      profesional: profesionalId
    });

    await nuevoPaciente.save();
    res.json({ mensaje: 'Paciente registrado correctamente' });
  } catch (error) {
    console.error('Error al registrar paciente:', error);
    res.status(500).json({ mensaje: 'Error interno al registrar paciente' });
  }
});
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++




// Cerrar sesión
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ mensaje: 'Error al cerrar sesión' });
    res.clearCookie('connect.sid');
    res.json({ mensaje: 'Sesión cerrada correctamente' });
  });
});




module.exports = router;
