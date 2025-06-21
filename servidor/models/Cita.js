// servidor/models/Cita.js
const mongoose = require('mongoose');

const citaSchema = new mongoose.Schema({
  fecha: String,
  hora: String,
  paciente: { type: mongoose.Schema.Types.ObjectId, ref: 'Paciente' },
  profesional: { type: mongoose.Schema.Types.ObjectId, ref: 'Profesional' }
});

module.exports = mongoose.model('Cita', citaSchema);
