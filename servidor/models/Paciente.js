// servidor/models/Paciente.js
const mongoose = require('mongoose');

const pacienteSchema = new mongoose.Schema({
  dni: String,
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  profesional: { type: mongoose.Schema.Types.ObjectId, ref: 'Profesional' }
});

module.exports = mongoose.model('Paciente', pacienteSchema);
