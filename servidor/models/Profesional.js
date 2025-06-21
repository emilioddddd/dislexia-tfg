// servidor/models/Profesional.js
const mongoose = require('mongoose');

const profesionalSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
});

module.exports = mongoose.model('Profesional', profesionalSchema);
