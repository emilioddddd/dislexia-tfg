const express = require('express');
const router = express.Router();
const requiereRol = require('../middleware/requiereRol');
const Cita = require('../models/Cita');

// Obtener citas del profesional logueado
router.get('/mis-citas', requiereRol('profesional'), async (req, res) => {
  try {
    const citas = await Cita.find({ profesional: req.session.usuario.id })
      .populate('paciente', 'nombre')
      .sort({ fecha: 1 });

    const eventos = citas.map(cita => ({
      title: `${cita.paciente.nombre}`,
      start: cita.fecha
    }));

    res.json({ eventos });
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ mensaje: 'Error al obtener las citas' });
  }
});

// Crear una nueva cita
router.post('/nueva', requiereRol('profesional'), async (req, res) => {
  try {
    const { paciente, fecha, motivo } = req.body;
    console.log('Sesión actual:', req.session);
    console.log('Sesión actual:', req.body);

    const nuevaCita = new Cita({
      paciente,
      profesional: req.session.usuario.id, // ✅ Aquí se añade el profesional
      fecha,
      motivo
    });

    await nuevaCita.save();
    res.json({ mensaje: 'Cita creada correctamente' });

  } catch (error) {
    console.error('Error al crear la cita:', error);
    res.status(500).json({ mensaje: 'Error al crear la cita' });
  }
});


module.exports = router;
