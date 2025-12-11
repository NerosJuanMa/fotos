import * as imagenesModel from "../models/imagenes.model.js";

/*//CONTROLADOR DE IMAGENES//
// * Funciones para gestión de IMAGENES de FOTOS
 * - Obtener todos las imagenes
 * - Obtener imagenes por ID
*/

export async function getImagenes(req, res) {
  try {
    console.log('📦 Obteniendo imagenes...');
   
    const imagenes = await imagenesModel.obtenerImagenes();
   
    res.status(200).json({
      success: true,
      message: `Se encontraron ${imagenes.length} imagenes`,
      data: imagenes
    });
   
  } catch (error) {
    console.error('❌ Error al obtener imagenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
}
 
