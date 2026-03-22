// ============================================================
// ARCHIVO: base_datos/baseDatos.js
// QUÉ HACE: Configura la base de datos local SQLite
// Es el archivo central de almacenamiento offline
// ============================================================

import * as SQLite from 'expo-sqlite';

// ------------------------------------------------------------
// CONEXIÓN A LA BASE DE DATOS
// El archivo 'asistente.db' se crea automáticamente
// en el dispositivo la primera vez que se ejecuta
// ------------------------------------------------------------
const baseDatos = SQLite.openDatabaseSync('asistente.db');

// ------------------------------------------------------------
// FUNCIÓN: inicializarBaseDatos
// QUÉ HACE: Crea las tablas si no existen
// CUÁNDO SE LLAMA: Al iniciar la app por primera vez
// ------------------------------------------------------------
export const inicializarBaseDatos = () => {

  // Crear tabla si no existe (sin columna hora, para compatibilidad)
  baseDatos.execSync(`
    CREATE TABLE IF NOT EXISTS registros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      objeto TEXT NOT NULL,
      precio REAL NOT NULL,
      tipo TEXT NOT NULL,
      fecha TEXT NOT NULL,
      hora TEXT DEFAULT '',
      texto_original TEXT,
      creado_en TEXT DEFAULT (datetime('now'))
    );
  `);

  // MIGRACIÓN: agregar columna 'hora' si no existe en tabla vieja
  try {
    baseDatos.execSync(`ALTER TABLE registros ADD COLUMN hora TEXT DEFAULT '';`);
  } catch (e) {
    // Si ya existe la columna, el ALTER TABLE falla, y eso está bien
  }

  baseDatos.execSync(`
    CREATE TABLE IF NOT EXISTS dias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha TEXT UNIQUE NOT NULL,
      balance REAL DEFAULT 0,
      estado TEXT DEFAULT 'neutro'
    );
  `);

  console.log('Base de datos inicializada correctamente');
};


// ------------------------------------------------------------
// FUNCIÓN: guardarRegistro
// QUÉ HACE: Inserta un nuevo registro en la tabla 'registros'
// PARÁMETROS:
//   - objeto: qué se compró/ganó (ej: "hamburguesa")
//   - precio: cuánto costó (ej: 8)
//   - tipo: "gasto" o "ingreso"
//   - fecha: en formato YYYY-MM-DD (ej: "2026-03-22")
//   - textoOriginal: la frase que escribió el usuario
// ------------------------------------------------------------
export const guardarRegistro = (objeto, precio, tipo, fecha, textoOriginal) => {
  baseDatos.runSync(
    `INSERT INTO registros (objeto, precio, tipo, fecha, hora, texto_original)
 VALUES (?, ?, ?, ?, ?, ?);`,
[objeto, precio, tipo, fecha, new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }), textoOriginal]

  );

  // Actualizar el resumen del día después de guardar
  actualizarDia(fecha);
};

// ------------------------------------------------------------
// FUNCIÓN: obtenerRegistrosPorFecha
// QUÉ HACE: Devuelve todos los registros de un día específico
// PARÁMETROS:
//   - fecha: en formato YYYY-MM-DD
// ------------------------------------------------------------
export const obtenerRegistrosPorFecha = (fecha) => {
  return baseDatos.getAllSync(
    `SELECT * FROM registros WHERE fecha = ? ORDER BY creado_en DESC;`,
    [fecha]
  );
};

// ------------------------------------------------------------
// FUNCIÓN: obtenerTodosDias
// QUÉ HACE: Devuelve todos los días con su estado
// Lo usa el calendario para pintar los puntos verde/rojo
// ------------------------------------------------------------
export const obtenerTodosDias = () => {
  return baseDatos.getAllSync(
    `SELECT * FROM dias;`
  );
};

// ------------------------------------------------------------
// FUNCIÓN: actualizarDia (función interna)
// QUÉ HACE: Recalcula el balance del día y lo guarda
// Un día es POSITIVO si ingresos > gastos
// Un día es NEGATIVO si gastos > ingresos
// ------------------------------------------------------------
const actualizarDia = (fecha) => {
  // Sumar todos los ingresos del día
  const ingresos = baseDatos.getFirstSync(
    `SELECT COALESCE(SUM(precio), 0) as total FROM registros 
     WHERE fecha = ? AND tipo = 'ingreso';`,
    [fecha]
  );

  // Sumar todos los gastos del día
  const gastos = baseDatos.getFirstSync(
    `SELECT COALESCE(SUM(precio), 0) as total FROM registros 
     WHERE fecha = ? AND tipo = 'gasto';`,
    [fecha]
  );

  // Calcular balance: ingresos menos gastos
  const balance = ingresos.total - gastos.total;

  // Determinar estado del día
  // AQUÍ CAMBIAR LÓGICA: modificar las condiciones si querés
  // que el punto verde/rojo funcione diferente
  const estado = balance > 0 ? 'positivo' : balance < 0 ? 'negativo' : 'neutro';

  // Guardar o actualizar el resumen del día
  baseDatos.runSync(
    `INSERT INTO dias (fecha, balance, estado)
     VALUES (?, ?, ?)
     ON CONFLICT(fecha) DO UPDATE SET balance = ?, estado = ?;`,
    [fecha, balance, estado, balance, estado]
  );
};
// ------------------------------------------------------------
// FUNCIÓN: obtenerResumenMes
// QUÉ HACE: Suma ingresos y gastos de todo un mes
// PARÁMETROS: anio (2026), mes (1-12)
// ------------------------------------------------------------
export const obtenerResumenMes = (anio, mes) => {
  const mesStr = String(mes).padStart(2, '0');
  const patron = `${anio}-${mesStr}-%`;

  const ingresoFila = baseDatos.getFirstSync(
    `SELECT COALESCE(SUM(precio), 0) as total
     FROM registros
     WHERE fecha LIKE ? AND tipo = 'ingreso';`,
    [patron]
  );

  const gastoFila = baseDatos.getFirstSync(
    `SELECT COALESCE(SUM(precio), 0) as total
     FROM registros
     WHERE fecha LIKE ? AND tipo = 'gasto';`,
    [patron]
  );

  const ingresos = ingresoFila?.total || 0;
  const gastos = gastoFila?.total || 0;

  return Promise.resolve({
    ingresos,
    gastos,
    balance: ingresos - gastos,
  });
};
// ------------------------------------------------------------
// FUNCIÓN: borrarRegistro
// QUÉ HACE: Elimina un registro por su ID y recalcula el día
// ------------------------------------------------------------
export const borrarRegistro = (id, fecha) => {
  baseDatos.runSync(`DELETE FROM registros WHERE id = ?;`, [id]);
  actualizarDia(fecha);
};


export default baseDatos;
