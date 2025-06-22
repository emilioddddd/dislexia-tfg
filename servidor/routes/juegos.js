// servidor/routes/juegos.js
const express = require('express');
const router = express.Router();
const Juego = require('../models/Juego');

router.get('/', async (req, res) => {
  try {
    const juegos = await Juego.find();
    res.json({ juegos });
  } catch (error) {
    console.error('Error al obtener juegos:', error);
    res.status(500).json({ mensaje: 'Error al obtener juegos' });
  }
});

module.exports = router;

