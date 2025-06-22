// models/Juego.js
const mongoose = require('mongoose');

const juegoSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String, required: true },
  tipo: { type: String, required: true },
  ruta: { type: String, required: true }
});

module.exports = mongoose.model('Juego', juegoSchema);


