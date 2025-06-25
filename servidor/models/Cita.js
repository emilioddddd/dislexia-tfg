const mongoose = require('mongoose');

const citaSchema = new mongoose.Schema({
  paciente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  profesional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  fecha: {
    type: Date,
    required: true
  },
  juegos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Juego' }]

});

module.exports = mongoose.model('Cita', citaSchema);