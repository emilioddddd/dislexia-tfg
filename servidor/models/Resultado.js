// servidor/models/Resultado.js
const mongoose = require('mongoose');

const resultadoSchema = new mongoose.Schema({
  fecha_resultado: String,
  completado: Boolean,
  juego: { type: mongoose.Schema.Types.ObjectId, ref: 'Juego' },
  paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente' }
});

module.exports = mongoose.model('Resultado', resultadoSchema);
