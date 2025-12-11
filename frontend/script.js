const URL_API = "http://localhost:4000/api";

let estado = {
  usuario: null,    // 👤 {id: 1, nombre: "Juan", email: "juan@email.com"}
  token: null,      // 🔑 "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  carrito: {        // 🛒 {items: [{id:1, nombre:"Producto", precio:10, cantidad:2}], total: 20}
    items: [],
    total: 0
  }
};


// =============================
// 🔐 SESIÓN: LOGIN / REGISTRO
// =============================

/**
 * guardarSesion() - Guarda datos del usuario logueado
 * 
 * @param {string} token - JWT token del backend
 * @param {Object} usuario - Datos del usuario {id, nombre, email}
 * 
 * ¿Qué hace?
 * 1. Guarda en memoria (variable estado)
 * 2. Guarda en localStorage (persistencia entre recargas)
 * 3. Registra en consola para debugging
 * 
 * ¿Por qué localStorage?
 * - Para que el usuario siga logueado al recargar la página
 * - Se mantiene hasta que cierre el navegador o borre datos
 */
function guardarSesion(token, usuario) {
  // Guardar en memoria (desaparece al recargar)
  estado.token = token;
  estado.usuario = usuario;

  // Guardar en localStorage (persiste al recargar)
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(usuario)); // JSON.stringify = objeto → texto

  console.log("💾 Sesión guardada para:", usuario.nombre);
}

/**
 * cerrarSesion() - Limpia toda la información del usuario
 * 
 * ¿Cuándo se ejecuta?
 * - Cuando el usuario hace click en "Cerrar sesión"
 * - Cuando hay un error de sesión corrupta
 * 
 * ¿Qué limpia?
 * - Estado en memoria
 * - localStorage
 * - Carrito de compras
 */
function cerrarSesion() {
  // Limpiar memoria
  estado.token = null;
  estado.usuario = null;
  estado.carrito = { items: [], total: 0 };

  // Limpiar localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("carrito");

  console.log("👋 Sesión cerrada");
  mostrarInterfaz(); // Actualizar la interfaz
}

/**
 * cargarSesionGuardada() - Restaura sesión al recargar página
 * 
 * ¿Cuándo se ejecuta?
 * - Al cargar la página
 * 
 * ¿Qué hace?
 * 1. Busca token y usuario en localStorage
 * 2. Si existen, los restaura en memoria
 * 3. Si hay error (datos corruptos), cierra sesión
 */
function cargarSesionGuardada() {
  const tokenGuardado = localStorage.getItem("token");
  const usuarioGuardado = localStorage.getItem("user");

  // Solo restaurar si AMBOS existen
  if (tokenGuardado && usuarioGuardado) {
    try {
      estado.token = tokenGuardado;
      estado.usuario = JSON.parse(usuarioGuardado); // JSON.parse = texto → objeto
      console.log("👤 Sesión restaurada:", estado.usuario.nombre);
    } catch (err) {
      // Si JSON.parse falla (datos corruptos)
      console.error("❌ Sesión corrupta, limpiando...", err);
      cerrarSesion();
    }
  }
}

/**
 * iniciarSesion() - Autentica usuario con email/password
 * 
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * 
 * ¿Cómo funciona?
 * 1. Envía POST a /api/auth/login con credenciales
 * 2. Si es correcto, guarda sesión y actualiza interfaz
 * 3. Si es incorrecto, muestra error al usuario
 */
async function iniciarSesion(email, password) {
  try {
    const respuesta = await fetch(`${URL_API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }) // Convertir objeto a JSON
    });

    const datos = await respuesta.json();
    console.log("📥 Respuesta login:", respuesta.status, datos);

    if (respuesta.ok) {
      // ✅ Login exitoso
      guardarSesion(datos.token, datos.usuario);
      mostrarInterfaz();
      alert(`Bienvenido, ${datos.usuario.nombre}`);
    } else {
      // ❌ Credenciales incorrectas
      alert(datos.message || "Error al iniciar sesión");
    }
  } catch (error) {
    // ❌ Error de conexión (servidor caído, sin internet, etc.)
    console.error("❌ Error login:", error);
    alert("No se pudo conectar con el servidor");
  }
}

/**
 * registrarUsuario() - Crea cuenta nueva y loguea automáticamente
 * 
 * @param {string} nombre - Nombre completo
 * @param {string} email - Email único
 * @param {string} password - Contraseña
 * 
 * ¿Qué hace?
 * 1. Envía datos a /api/auth/register
 * 2. El backend crea la cuenta Y devuelve token
 * 3. Automáticamente loguea al usuario
 */
async function registrarUsuario(nombre, email, password) {
  try {
    const respuesta = await fetch(`${URL_API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password })
    });

    const datos = await respuesta.json();
    console.log("📥 Respuesta registro:", respuesta.status, datos);

    if (respuesta.ok) {
      // ✅ Registro exitoso + auto-login
      guardarSesion(datos.token, datos.usuario);
      mostrarInterfaz();
      alert(`Cuenta creada. Bienvenido, ${datos.usuario.nombre}`);
    } else {
      // ❌ Error: email ya existe, datos inválidos, etc.
      alert(datos.message || "Error al registrarse");
    }
  } catch (error) {
    console.error("❌ Error registro:", error);
    alert("No se pudo conectar con el servidor");
  }
}

function mostrarInterfaz() {
  // Buscar elementos del DOM
  const authSection   = document.getElementById("authSection");   // Formularios login/registro
  const authNav       = document.getElementById("authNav");       // Barra superior
  const tiendaSection = document.getElementById("tiendaSection"); // Tienda para usuarios logados 
  const productosMostrar   = document.getElementById("productosMostrar"); // Muestra productos para usuarios NO logados 
  
  const logueado = !!estado.usuario; // nace como null que es false pero no un boolean aqui lo que hace es convertirlo en un boolean

  // 📝 FORMULARIOS LOGIN/REGISTRO
  // Mostrar solo si NO está logueado
  if (authSection) {
    authSection.classList.toggle("hidden", logueado); // toggle = añadir/quitar clase
  }
  if (productosMostrar) {
        productosMostrar.classList.toggle("hidden", logueado);}

  // 🏪 TIENDA para usuarios logados sólo se mostrara si esta logged
  //hidden está definido en style y es una propiedad del contenedor
  if (tiendaSection) {
    tiendaSection.classList.toggle("hidden", !logueado); // !logged = no logado 
    //toggle es un método de classList que añade o quita una clase CSS a un elemento del DOM.
    //con dos parametros significa ejecuta ese estilo segun la condicion


    if (logueado) {
      // Si está logueado, cargar datos de la tienda
      cargarCarrito();        // Restaurar carrito desde localStorage
      cargarProductosTienda(); // Mostrar productos con botón "Comprar"
      
    }
  }

  // 🧭 NAVEGACIÓN SUPERIOR
  if (authNav) {
    if (logueado) {
      // Usuario logueado: mostrar nombre + botón salir
      authNav.innerHTML = `
        <span class="user-name">👤 ${estado.usuario.nombre}</span>
        <button id="logoutButton" class="btn btn-outline">Cerrar sesión</button>
      `;
      // Conectar el botón con la función
      document
        .getElementById("logoutButton")
        .addEventListener("click", cerrarSesion);
    } else {
      // Usuario NO logueado: mensaje informativo
      authNav.innerHTML = `<span>Inicia sesión para comprar</span>`;
       

    }
  }
}
function configurarEventosLogin() {
  // Buscar elementos del DOM
  const loginForm    = document.getElementById("loginFormElement");
  const registerForm = document.getElementById("registerFormElement");
  const showRegister = document.getElementById("showRegister");
  const showLogin    = document.getElementById("showLogin");

  // 📝 FORMULARIO DE LOGIN
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // Evitar que recargue la página
      
      // Obtener valores de los inputs
      const email    = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;
      
      await iniciarSesion(email, password);
      loginForm.reset(); // Limpiar formulario
    });
  }

  // 📝 FORMULARIO DE REGISTRO
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const nombre   = document.getElementById("registerNombre").value;
      const email    = document.getElementById("registerEmail").value;
      const password = document.getElementById("registerPassword").value;
      
      await registrarUsuario(nombre, email, password);
      registerForm.reset();
    });
  }

  // 🔗 LINK "REGÍSTRATE AQUÍ"
  if (showRegister) {
    showRegister.addEventListener("click", (e) => {
      e.preventDefault(); // Evitar que navegue
      
      // Ocultar login, mostrar registro
      document.getElementById("loginForm").classList.add("hidden");
      document.getElementById("registerForm").classList.remove("hidden");
    });
  }

  // 🔗 LINK "INICIA SESIÓN AQUÍ"
  if (showLogin) {
    showLogin.addEventListener("click", (e) => {
      e.preventDefault();
      
      // Ocultar registro, mostrar login
      document.getElementById("registerForm").classList.add("hidden");
      document.getElementById("loginForm").classList.remove("hidden");
    });
  }
}

