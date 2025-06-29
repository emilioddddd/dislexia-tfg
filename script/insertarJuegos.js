const mongoose = require('mongoose');
const Juego = require('../servidor/models/Juego');
const dotenv = require('dotenv');
dotenv.config();

console.log('MongoUri', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error de conexión:', err));

const juegos = [
  {
    titulo: 'Sopa de Letras',
    descripcion: 'Encuentra palabras relacionadas con la dislexia.',
    tipo: 'sopa-letras',
    ruta: '/juegos/sopa-letras.html',
    areas: ['velocidad', 'precisión']
  },
  {
    titulo: 'Juego de Memoria',
    descripcion: 'Relaciona pares de palabras visualmente parecidas.',
    tipo: 'memoria',
    ruta: '/juegos/memoria.html',
    areas: ['velocidad', 'precisión']
  },
  {
    titulo: 'Ordenar las letras',
    descripcion: 'Ordena las letras de palabras relacionadas con la dislexia.',
    tipo: 'orden-letras',
    ruta: '/juegos/orden-letras.html',
    areas: ['escritura', 'precisión']
  },
  {
    titulo: 'Ahorcado Adaptado',
    descripcion: 'Adivina palabras letra a letra reforzando ortografía.',
    tipo: 'ahorcado',
    ruta: '/juegos/ahorcado.html',
    areas: ['ortografía', 'proceso fonológico']
  },
  {
    titulo: 'Comprensión Lectora',
    descripcion: 'Lee textos y responde preguntas para evaluar comprensión.',
    tipo: 'comprension',
    ruta: '/juegos/comprension.html',
    areas: ['comprensión']
  },
  {
    titulo: 'Imagen y Palabra',
    descripcion: 'Relaciona imágenes con palabras para mejorar precisión.',
    tipo: 'imagen-palabra',
    ruta: '/juegos/imagen-palabra.html',
    areas: ['precisión', 'comprensión']
  },
  {
    titulo: 'Test Inicial de Dislexia',
    descripcion: 'Evaluación inicial del paciente para establecer su nivel base.',
    tipo: 'test-inicial',
    ruta: '/test-inicial.html',
    areas: ['velocidad', 'precisión', 'comprensión', 'escritura']
  }
];

Juego.insertMany(juegos)
  .then(() => {
    console.log('✅ Juegos insertados correctamente');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Error al insertar juegos:', err);
    mongoose.disconnect();
  });
