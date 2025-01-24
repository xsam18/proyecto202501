// database/db.js
import pkg from 'pg';
const { Pool } = pkg;

// Configuración de la conexión a la base de datos
const pool = new Pool({
  user: 'postgres',           // Usuario de PostgreSQL (asegúrate de usar tu usuario correcto)
  host: 'localhost',          // Dirección del servidor de la base de datos
  database: 'aerolinea_db',   // Nombre de la base de datos
  password: '123456',         // Contraseña de tu base de datos
  port: 5432,                 // Puerto por defecto para PostgreSQL
});

// Exporta el pool de conexiones para usarlo en otros archivos
export default pool;
