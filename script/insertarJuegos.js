// script/insertarJuegos.js
const mongoose = require('mongoose');
const Juego = require('../servidor/models/Juego');
const dotenv = require('dotenv');
dotenv.config();

// Reemplaza esto por tu URI real de conexión a MongoDB Atlas o local
//const MONGO_URI = 'mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net/tunombrebd';
console.log('MongoUri', process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexión:', err));

const juegos = [
  {
    titulo: 'Sopa de Letras',
    descripcion: 'Encuentra palabras relacionadas con la dislexia.',
    tipo: 'sopa-letras',
    ruta: '/juegos/sopa-letras.html'
  },
  {
    titulo: 'Juego de Memoria',
    descripcion: 'Relaciona pares de palabras visualmente parecidas.',
    tipo: 'memoria',
    ruta: '/juegos/memoria.html'
  }
];

Juego.insertMany(juegos)
  .then(() => {
    console.log('Juegos insertados correctamente');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error al insertar juegos:', err);
    mongoose.disconnect();
  });
