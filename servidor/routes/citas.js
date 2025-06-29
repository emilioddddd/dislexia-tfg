const express = require('express');
const router = express.Router();
const requiereRol = require('../middleware/requiereRol');
const Cita = require('../models/Cita');
const Juego = require('../models/Juego');
const Resultado = require('../models/Resultado');

// Obtener citas del profesional logueado (para el calendario)
router.get('/mis-citas', requiereRol('profesional'), async (req, res) => {
  try {
    const citas = await Cita.find({ profesional: req.session.usuario.id })
      .populate('paciente', 'nombre')
      .populate('juegos', 'titulo')
      .sort({ fecha: 1 });

    const eventos = citas.map(cita => ({
      title: `${cita.paciente.nombre}`,
      start: cita.fecha,
      juegos: cita.juegos.map(j => ({ titulo: j.titulo })) // Agrega los juegos
    }));

    res.json({ eventos });
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ mensaje: 'Error al obtener las citas' });
  }
});

// Obtener citas del paciente logueado (para el calendario)
router.get('/mis-citas-paciente', requiereRol('paciente'), async (req, res) => {
  try {
    const citas = await Cita.find({ paciente: req.session.usuario.id })
      .populate('juegos')
      .sort({ fecha: 1 });

    const resultados = await Resultado.find({ paciente: req.session.usuario.id });

    const eventos = citas.map(cita => ({
      start: cita.fecha,
      juegos: cita.juegos.map(juego => ({
        titulo: juego.titulo,
        jugado: resultados.some(r => r.juego.toString() === juego._id.toString()),
        ruta: juego.ruta
      }))
    }));

    res.json({ eventos });
  } catch (error) {
    console.error('Error al obtener citas del paciente:', error);
    res.status(500).json({ mensaje: 'Error al obtener citas del paciente' });
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
        horarios[idx].paciente = c.paciente ? {
          _id: c.paciente._id,
          nombre: c.paciente.nombre
        } : null;

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
    const { paciente, fecha, juegos } = req.body;

    const nuevaCita = new Cita({
      paciente,
      profesional: req.session.usuario.id, // ← Cambiado aquí
      fecha: new Date(fecha),
      juegos: juegos || []
    });

    await nuevaCita.save();
    res.status(201).json({ mensaje: 'Cita creada correctamente', cita: nuevaCita });
  } catch (error) {
    console.error('Error al crear la cita:', error);
    res.status(500).json({ mensaje: 'Error al crear la cita.' });
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

// GET /api/citas/:id
router.get('/:id', async (req, res) => {
  try {
    const cita = await Cita.findById(req.params.id).lean();
    if (!cita) {
      return res.status(404).json({ mensaje: 'Cita no encontrada' });
    }
    res.json(cita);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener la cita' });
  }
});

// PUT /api/citas/:id — Actualizar cita
router.put('/:id', async (req, res) => {
  try {
    const { fecha, juegos } = req.body;

    const citaActualizada = await Cita.findByIdAndUpdate(
      req.params.id,
      { fecha, juegos },
      { new: true }
    );

    if (!citaActualizada) {
      return res.status(404).json({ mensaje: 'Cita no encontrada' });
    }

    res.json({ mensaje: 'Cita actualizada', cita: citaActualizada });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al actualizar cita' });
  }
});

// Citas de un paciente por ID (para profesionales)
router.get('/citas-paciente/:idPaciente', requiereRol('profesional'), async (req, res) => {
  try {
    const citas = await Cita.find({ paciente: req.params.idPaciente })
      .populate('juegos')
      .sort({ fecha: 1 });

    const resultados = await Resultado.find({ paciente: req.params.idPaciente });

    const eventos = citas.map(cita => ({
      start: cita.fecha,
      juegos: cita.juegos.map(juego => ({
        titulo: juego.titulo,
        jugado: resultados.some(r => r.juego.toString() === juego._id.toString())
      }))
    }));

    res.json({ eventos });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener citas del paciente' });
  }
});


module.exports = router;
