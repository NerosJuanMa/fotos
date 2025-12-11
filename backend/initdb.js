// backend-bazar/initdb.js
import 'dotenv/config';
import pool from './config/db.js';

/**
 * ==========================================
 * SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS
 * ==========================================
 * 
 * PROPÓSITO:
 * Este script crea todas las tablas necesarias para el funcionamiento
 * del sistema de fotos (tienda online de imagenes).
 * 
 * USO:
 * node initdb.js
 * 
 * CARACTERÍSTICAS:
 * - Crea las tablas solo si no existen (CREATE TABLE IF NOT EXISTS)
 * - Establece relaciones entre tablas (FOREIGN KEY)
 * - Define índices para optimizar consultas
 * - Inserta datos de ejemplo para facilitar las pruebas
 * 
 * ESTRUCTURA DE LA BASE DE DATOS:
 * 1. clientes - Usuarios registrados en el sistema
 * 2. categorias - Categorías de fotos
 * 3. Imagenes - Catálogo de fotos (se debe poder agregar nuevas desde el front)
 * 4. pedidos - Cabecera de pedidos de clientes
 * 5. pedidos_fotos - Líneas de pedido (fotos específicas)
 */

/**
 * Función principal que orquesta la creación de todas las tablas
 */
async function crearTablas() {
  try {
    console.log("🚀 Iniciando creación de base de datos...");

    // Crear tablas en orden correcto (respetando dependencias)
    await crearTablaClientes();
    await crearTablaCategorias();    
    await crearTablaImagenes();
    await crearTablaPedidos();
    await crearTablaPedidosImagenes();
    
    // Insertar datos de ejemplo para pruebas
    await insertarDatosDeEjemplo();

    console.log('✅ Base de datos inicializada correctamente.');
    console.log('📊 Las tablas están listas para usar.');
    console.log('🧪 Se han insertado datos de ejemplo para pruebas.');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    process.exit(1);
  }
}

/**
 * ==========================================
 * TABLA: CLIENTES
 * ==========================================
 * 
 * PROPÓSITO: Almacena los usuarios registrados en el sistema
 * 
 * CAMPOS:
 * - id: Identificador único (clave primaria)
 * - nombre: Nombre completo del cliente
 * - email: Dirección de correo (única, usada para login)
 * - password: Contraseña hasheada con bcrypt
 * - creado_en: Fecha de registro del usuario
 */
async function crearTablaClientes() {
  console.log("👤 Creando tabla 'clientes'...");
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL COMMENT 'Nombre completo del cliente',
      email VARCHAR(150) NOT NULL UNIQUE COMMENT 'Email único para login',
      password VARCHAR(255) NOT NULL COMMENT 'Contraseña hasheada con bcrypt',
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de registro',
      
      INDEX idx_email (email) COMMENT 'Índice para optimizar login por email'
    ) ENGINE=InnoDB 
      COMMENT='Usuarios registrados en el sistema'
  `);
  
  console.log("✅ Tabla 'clientes' creada");
}

 // TABLA CATEGORIAS
async function crearTablaCategorias() {
  console.log("👤 Creando tabla 'categorias'...");
  
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categorias (
        id_categoria INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL
      )
    `);
    console.log("✅ Tabla 'categorias' creada");
}

/**
 * ==========================================
 * TABLA: Imagenes
 * ==========================================
 * 
 * PROPÓSITO: Catálogo completo de fotos disponibles
 * 
 * CAMPOS:
 * - id: Identificador único de la foto
 * - nombre: Nombre de la foto
 * - descripcion: Descripción detallada (opcional)
 * - precio: Precio unitario del foto
 * - stock: Cantidad disponible en inventario
 * - categoria: Categoría del foto (id_categoría)
 * - imagen: Archivo jpg
 * - ruta_imagen: URL de la imagen de la foto
 * - activo: Indica si el foto está disponible para venta
 * - creado_en: Fecha de creación de la foto
 */
async function crearTablaImagenes() {
  console.log("📦 Creando tabla 'imagenes'...");
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS imagenes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      titulo VARCHAR(255) NOT NULL COMMENT 'Nombre de la Imagen',
      descripcion TEXT COMMENT 'Descripción detallada de la imagen',
      precio DECIMAL(10,2) NOT NULL COMMENT 'Precio unitario en euros',
      stock INT DEFAULT 0 COMMENT 'Cantidad disponible en inventario',
      categoria VARCHAR(50) DEFAULT 'General' COMMENT 'Categoría de la imagen',
      categoria_id INT,
      ruta_imagen VARCHAR(512) NOT NULL COMMENT 'URL/ruta de la imagen',
      activo BOOLEAN DEFAULT TRUE COMMENT 'foto disponible para venta',      
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de subida',
      
      FOREIGN KEY (categoria_id) REFERENCES categorias(id_categoria),

      INDEX idx_categoria (categoria) COMMENT 'Índice para filtros por categoría',
      INDEX idx_activo (activo) COMMENT 'Índice para fotos activos',
      INDEX idx_precio (precio) COMMENT 'Índice para ordenación por precio'
    ) ENGINE=InnoDB 
      COMMENT='Catálogo de fotos disponibles en la tienda'
  `);
  
  console.log("✅ Tabla 'imagenes' creada");
}

/**
 * ==========================================
 * TABLA: PEDIDOS
 * ==========================================
 * 
 * PROPÓSITO: Cabecera de pedidos realizados por clientes
 * 
 * CAMPOS:
 * - id: Identificador único del pedido
 * - cliente_id: ID del cliente que realizó el pedido (FK)
 * - estado: Estado actual del pedido en su ciclo de vida
 * - fecha: Fecha y hora de creación del pedido
 * 
 * ESTADOS POSIBLES:
 * - pendiente: Pedido creado pero no procesado
 * - pagado: Pago confirmado
 * - enviado: Pedido en camino al cliente
 * - entregado: Pedido recibido por el cliente
 * - cancelado: Pedido cancelado por algún motivo
 */
async function crearTablaPedidos() {
  console.log("🧾 Creando tabla 'pedidos'...");
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cliente_id INT NOT NULL COMMENT 'ID del cliente que realizó el pedido',
      estado ENUM('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado') 
             DEFAULT 'pendiente' 
             COMMENT 'Estado actual del pedido',
      fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
            COMMENT 'Fecha y hora de creación del pedido',
      
      FOREIGN KEY (cliente_id) REFERENCES clientes(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
        
      INDEX idx_cliente_fecha (cliente_id, fecha DESC) 
        COMMENT 'Índice para consultas de pedidos por cliente',
      INDEX idx_estado (estado) 
        COMMENT 'Índice para filtros por estado'
    ) ENGINE=InnoDB 
      COMMENT='Cabecera de pedidos realizados por clientes'
  `);
  
  console.log("✅ Tabla 'pedidos' creada");
}

/**
 * ==========================================
 * TABLA: PEDIDOS_fotos
 * ==========================================
 * 
 * PROPÓSITO: Líneas de pedido - fotos específicos dentro de cada pedido
 * 
 * CAMPOS:
 * - id: Identificador único de la línea de pedido
 * - pedido_id: ID del pedido al que pertenece esta línea (FK)
 * - imagen_id: ID de la imagen incluido en esta línea (FK)
 * - cantidad: Cantidad de unidades del foto
 * 
 * RELACIÓN:
 * Un pedido puede tener múltiples líneas (fotos diferentes)
 * Cada línea pertenece a un solo pedido
 * Cada línea referencia a un foto específico
 */
async function crearTablaPedidosImagenes() {
  console.log("📋 Creando tabla 'pedidos_imagenes'...");
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pedidos_imagenes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      pedido_id INT NOT NULL COMMENT 'ID del pedido padre',
      imagen_id INT NOT NULL COMMENT 'ID de la imagen incluido',
      cantidad INT DEFAULT 1 COMMENT 'Cantidad de unidades de la foto',
      
      FOREIGN KEY (pedido_id) REFERENCES pedidos(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
      FOREIGN KEY (imagen_id) REFERENCES imagenes(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
      
      INDEX idx_pedido (pedido_id) 
        COMMENT 'Índice para consultar líneas de un pedido',
      INDEX idx_imagen (imagen_id) 
        COMMENT 'Índice para estadísticas por foto',
        
      UNIQUE KEY unique_pedido_imagen (pedido_id, imagen_id) 
        COMMENT 'Evita duplicados de la misma imagen en un pedido'
    ) ENGINE=InnoDB 
      COMMENT='Líneas de pedido - imagenes específicas en cada pedido'
  `);
  
  console.log("✅ Tabla 'pedidos_imagenes' creada");
}

/**
 * ==========================================
 * INSERCIÓN DE DATOS DE EJEMPLO
 * ==========================================
 * 
 * PROPÓSITO: Facilitar las pruebas insertando datos realistas
 * 
 * CATEGORÍAS DISPONIBLES:
 * - Ropa: fotos de vestimenta
 * - Electrónicos: Dispositivos y gadgets tecnológicos  
 * - Hogar: Artículos para el hogar y decoración
 */
async function insertarDatosDeEjemplo() {
  console.log("🧪 Insertando datos de ejemplo...");

  try {
    // Limpiar datos existentes para recrear con estructura correcta
    await pool.query('DELETE FROM pedidos_imagenes');
    await pool.query('DELETE FROM pedidos');
    await pool.query('DELETE FROM imagenes');
    await pool.query('DELETE FROM categorias');
    await pool.query('DELETE FROM clientes');

    // Resetear auto_increment
    await pool.query('ALTER TABLE imagenes AUTO_INCREMENT = 1');
    await pool.query('ALTER TABLE categorias AUTO_INCREMENT = 1');
    await pool.query('ALTER TABLE clientes AUTO_INCREMENT = 1');

    console.log("🗑️ Datos anteriores limpiados");

    // Insertar fotos de ejemplo con las 3 categorías
    await pool.query(`
      INSERT INTO imagenes (titulo, descripcion, precio, stock, categoria, ruta_imagen) VALUES 
      ('Pajaro volando', 'Se ven varios pajaros de varios colores', 19.99, 50, 'Naturaleza', 'https://via.placeholder.com/300x300?text=Camiseta'),
      ('perro negro', 'perro negro sentado', 49.99, 30, 'Naturaleza', 'https://via.placeholder.com/300x300?text=Pantalon'),
      ('caballos corriendo', 'caballos corriendo en la playa', 79.99, 20, 'Naturaleza', 'https://via.placeholder.com/300x300?text=Chaqueta'),
      
      ('Cara sonriente', 'se ve a una persona sonriendo', 89.99, 25, 'Varios', 'https://via.placeholder.com/300x300?text=Zapatos'),      
      ('Smartphone XL', 'Teléfono inteligente con pantalla de 6.5 pulgadas', 299.99, 15, 'Varios', 'https://via.placeholder.com/300x300?text=Smartphone'),
      ('Auriculares Bluetooth', 'Auriculares inalámbricos con cancelación de ruido', 89.99, 20, 'Varios', 'https://via.placeholder.com/300x300?text=Auriculares'),
      ('Tablet 10"', 'Tablet con pantalla de alta resolución', 199.99, 18, 'Varios', 'https://via.placeholder.com/300x300?text=Tablet'),
      ('Cargador Inalámbrico', 'Base de carga rápida para dispositivos', 35.99, 40, 'Varios', 'https://via.placeholder.com/300x300?text=Cargador'),
      
      ('Lámpara LED', 'Lámpara de escritorio con regulador de intensidad', 35.00, 25, 'Hogar', 'https://via.placeholder.com/300x300?text=Lampara'),
      ('Cojín Decorativo', 'Cojín suave para sofá en varios colores', 18.50, 30, 'Hogar', 'https://via.placeholder.com/300x300?text=Cojin'),
      ('Espejo de Pared', 'Espejo decorativo para salón', 45.00, 12, 'Hogar', 'https://via.placeholder.com/300x300?text=Espejo'),
      ('Maceta Cerámica', 'Maceta artesanal para plantas de interior', 22.99, 35, 'Hogar', 'https://via.placeholder.com/300x300?text=Maceta')
    `);

    // Insertar un usuario de prueba con password hasheado
    await pool.query(`
      INSERT INTO clientes (nombre, email, password) VALUES 
      ('Usuario Prueba', 'test@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye.JfVK7fCQpNpCPq9QdoW6lQk1K6kMSO')
    `);

    // Insertar categorias de prueba
    await pool.query(`
      INSERT INTO categorias (nombre) VALUES 
      ('General'),
      ('Privada'),
      ('Animales'),
      ('Paisajes')
    `);

    console.log("✅ Datos de ejemplo insertados correctamente");
    console.log("👤 Usuario de prueba creado: test@example.com / 123456");
    console.log("📦 12 fotos creados en 3 categorías: Naturaleza, Varios, Hogar");

  } catch (error) {
    console.error("❌ Error insertando datos de ejemplo:", error.message);
  }
}

// Ejecutar el script
crearTablas();