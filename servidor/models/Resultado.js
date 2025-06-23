// models/Resultado.js
const mongoose = require('mongoose');

const resultadoSchema = new mongoose.Schema({
  paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  juego: { type: mongoose.Schema.Types.ObjectId, ref: 'Juego', required: true },
  datos: { type: mongoose.Schema.Types.Mixed, required: true },  // permite cualquier estructura de datos
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resultado', resultadoSchema);
