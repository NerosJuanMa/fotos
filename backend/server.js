// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import pool from './config/db.js';
import fotosRoutes from './routes/fotos.routes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta raíz de prueba
app.get('/', (req, res) => {
  res.send('API Node + MySQL - FOTOS');
});

// Ruta para probar la conexión con la base de datos
app.get('/api/probar-bbdd', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS fecha');
    res.json({
      ok: true,
      mensaje: 'Conexión correcta con la base de datos',
      fecha: rows[0].fecha
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error al conectar con la base de datos',
      error: error.message
    });
  }
});

// Rutas de la API
app.use('/api/fotos', fotosRoutes);

// Arrancar el servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});