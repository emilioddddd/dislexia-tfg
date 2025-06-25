// añadirJuego.js
const readline = require('readline');
const mongoose = require('mongoose');
require('dotenv').config();

const Juego = require('../servidor/models/Juego');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conectado a MongoDB');
  iniciarFormulario();
}).catch(err => {
  console.error('Error al conectar a MongoDB:', err);
  process.exit(1);
});

function preguntar(pregunta) {
  return new Promise(resolve => rl.question(pregunta, respuesta => resolve(respuesta)));
}

async function iniciarFormulario() {
  try {
    const titulo = await preguntar('Título del juego: ');
    const descripcion = await preguntar('Descripción del juego: ');
    const tipo = await preguntar('Tipo interno (ej. sopa-letras, ahorcado): ');
    const ruta = await preguntar('Ruta del archivo HTML (ej. /juegos/sopa-letras.html): ');

    const nuevoJuego = new Juego({
      titulo,
      descripcion,
      tipo,
      ruta
    });

    await nuevoJuego.save();
    console.log('\n✅ Juego guardado correctamente en la base de datos.\n');
  } catch (error) {
    console.error('❌ Error al guardar el juego:', error.message);
  } finally {
    rl.close();
    mongoose.disconnect();
  }
}
