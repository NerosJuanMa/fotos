// routes/fotos.routes.js
import { Router } from 'express';
import * as imagenesController from '../controllers/imagenes.cotroller.js';

const fotosRoutes = Router();

// GET /api/productos
// fotosRoutes.get('/', (req, res) => {
//   res.json({
//     ok: true,
//     mensaje: 'Aquí devolveremos la lista de fotos desde la base de datos'
//   });
// });

//Nos creamos una ruta donde se van a exponer a todos los productos
fotosRoutes.get('/', imagenesController.getImagenes);


export default fotosRoutes;