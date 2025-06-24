// servidor/routes/resultados.js
const express = require('express');
const router = express.Router();
const Resultado = require('../models/Resultado');
const Juego = require('../models/Juego');
const { requiereSesion } = require('../middleware/autenticacion');

// POST /api/resultados
router.post('/', async (req, res) => {
  try {
    const { juegoTipo, datos } = req.body;

    if (!juegoTipo || !datos) {
      return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
    }

    const juegoDoc = await Juego.findOne({ tipo: juegoTipo });
    if (!juegoDoc) {
      return res.status(404).json({ mensaje: 'Juego no encontrado' });
    }

    const resultado = new Resultado({
      paciente: req.session?.usuario?.id, // opcional si es público
      juego: juegoDoc._id,
      datos,
      fecha: new Date()
    });

    await resultado.save();
    res.status(201).json({ mensaje: 'Resultado guardado' });

  } catch (error) {
    console.error('Error al guardar resultado:', error);
    res.status(500).json({ mensaje: 'Error al guardar resultado' });
  }
});

// Obtener resultados del paciente autenticado
router.get('/mis-resultados', requiereSesion, async (req, res) => {
  try {
    const resultados = await Resultado.find({ paciente: req.session.usuario.id })
      .populate('juego', 'titulo tipo')
      .sort({ fecha: 1 });

    res.json({ resultados });
  } catch (error) {
    console.error('Error al obtener resultados:', error);
    res.status(500).json({ mensaje: 'Error al obtener resultados' });
  }
});

module.exports = router;
