import pool from "../config/db.js";

export async function obtenerImagenes() {
    const [rows] = await pool.query(
    `SELECT id, titulo, descripcion, precio, stock, categoria, categoria_id, ruta_imagen, activo, creado_en
     FROM fotos.imagenes
     WHERE activo = 1
     ORDER BY nombre ASC`
  );
  return rows;
}
