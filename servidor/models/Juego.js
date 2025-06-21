// servidor/models/Juego.js
const mongoose = require('mongoose');

const juegoSchema = new mongoose.Schema({
  nombre: String,
  tipo: String,
  dificultad: String,
  descripcion: String
});

module.exports = mongoose.model('Juego', juegoSchema);
