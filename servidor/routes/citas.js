const express = require('express');
const router = express.Router();
const requiereRol = require('../middleware/requiereRol');
const Cita = require('../models/Cita');

// Obtener citas del profesional logueado (para el calendario)
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

// Obtener todos los bloques de horarios del día y si están ocupados
router.get('/horarios-dia', requiereRol('profesional'), async (req, res) => {
  const { fecha } = req.query;
  if (!fecha) return res.status(400).json({ mensaje: 'Se requiere fecha' });

  const inicio = new Date(`${fecha}T00:00:00`);
  const fin = new Date(`${fecha}T23:59:59`);

  // Crear bloques de 30 minutos desde 09:00 a 17:00
  const horarios = [];
  let cur = new Date(`${fecha}T09:00:00`);
  const finHora = new Date(`${fecha}T17:00:00`);

  while (cur <= finHora) {
    horarios.push({
      hora: cur.toTimeString().slice(0, 5),
      paciente: null,
      _id: null
    });
    cur = new Date(cur.getTime() + 30 * 60000); // +30 minutos
  }

  try {
    const citas = await Cita.find({
      profesional: req.session.usuario.id,
      fecha: { $gte: inicio, $lte: fin }
    }).populate('paciente', 'nombre');

    citas.forEach(c => {
      const horaCita = c.fecha.toTimeString().slice(0, 5);
      const idx = horarios.findIndex(h => h.hora === horaCita);
      if (idx !== -1) {
        horarios[idx].paciente = c.paciente?.nombre || 'Desconocido';
        horarios[idx]._id = c._id;
      }
    });

    res.json({ horarios });
  } catch (err) {
    console.error('Error al obtener horarios:', err);
    res.status(500).json({ mensaje: 'Error al obtener horarios del día' });
  }
});

// Crear una nueva cita si no hay conflicto
router.post('/nueva', requiereRol('profesional'), async (req, res) => {
  try {
    const { paciente, fecha } = req.body;
    const fechaCita = new Date(fecha);

    const existe = await Cita.findOne({
      profesional: req.session.usuario.id,
      fecha: fechaCita
    });

    if (existe) {
      return res.status(400).json({ mensaje: 'Ya hay una cita programada a esa hora.' });
    }

    const nuevaCita = new Cita({
      paciente,
      profesional: req.session.usuario.id,
      fecha: fechaCita
    });

    await nuevaCita.save();
    res.json({ mensaje: 'Cita creada correctamente.' });
  } catch (error) {
    console.error('Error al crear la cita:', error);
    res.status(500).json({ mensaje: 'Error al crear la cita' });
  }
});

// Eliminar una cita por ID (si pertenece al profesional)
router.delete('/:id', requiereRol('profesional'), async (req, res) => {
  try {
    const cita = await Cita.findOneAndDelete({
      _id: req.params.id,
      profesional: req.session.usuario.id
    });

    if (!cita) {
      return res.status(404).json({ mensaje: 'Cita no encontrada o no autorizada' });
    }

    res.json({ mensaje: 'Cita eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar cita:', error);
    res.status(500).json({ mensaje: 'Error al eliminar la cita' });
  }
});

module.exports = router;
