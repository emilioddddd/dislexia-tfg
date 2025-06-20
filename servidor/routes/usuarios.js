// servidor/routes/usuarios.js
const express = require('express');
const router = express.Router();

// Simulación de base de datos
const usuarios = [
  { id: 1, email: 'profesional@ejemplo.com', password: '1234', rol: 'profesional' },
  { id: 2, email: 'paciente@ejemplo.com', password: 'abcd', rol: 'paciente' }
];

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

module.exports = router;
