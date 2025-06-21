// servidor/models/Usuario.js
const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  rol: { type: String, default: 'paciente' },
  fecha_alta: { type: String, default: () => new Date().toISOString() }
});

module.exports = mongoose.model('Usuario', usuarioSchema);
