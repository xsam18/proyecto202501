import express from 'express';
import cors from 'cors';
import pool from './database/db.js'; // Conexión a la base de datos

const app = express();

// Configuración de middlewares
app.use(cors());
app.use(express.json()); // Para recibir JSON en las solicitudes

// Ruta para probar la conexión a la base de datos
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            message: 'Conexión exitosa a la base de datos',
            data: result.rows
        });
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
        res.status(500).json({ message: 'Error al conectar con la base de datos' });
    }
});

// Ruta para registrar pasajeros
app.post('/pasajeros', async (req, res) => {
    const { nombre, numero_vuelo, fecha, numero_asiento } = req.body;

    if (!nombre || !numero_vuelo || !fecha || !numero_asiento) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO pasajeros (nombre, numero_vuelo, fecha, numero_asiento) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, numero_vuelo, fecha, numero_asiento]
        );

        res.status(201).json({ message: 'Pasajero registrado con éxito', pasajero: result.rows[0] });
    } catch (error) {
        console.error('Error al registrar el pasajero:', error);
        res.status(500).json({ message: 'Error al registrar el pasajero' });
    }
});

// Ruta para obtener todos los pasajeros
app.get('/pasajeros', async (req, res) => {
    const { nombre, numero_vuelo } = req.query;

    try {
        let query = 'SELECT * FROM pasajeros WHERE 1=1'; // Base de la consulta
        const params = [];

        if (nombre) {
            params.push(`%${nombre}%`); // Agregar parámetro para nombre
            query += ` AND nombre ILIKE $${params.length}`; // Índice dinámico
        }

        if (numero_vuelo) {
            params.push(`%${numero_vuelo}%`); // Agregar parámetro para número de vuelo
            query += ` AND numero_vuelo ILIKE $${params.length}`; // Índice dinámico
        }

        const result = await pool.query(query, params); // Ejecutar consulta con parámetros
        res.json(result.rows);
    } catch (error) {
        console.error('Error al buscar pasajeros:', error);
        res.status(500).json({ message: 'Error al realizar la búsqueda' });
    }
});

// Ruta para eliminar un pasajero por su ID
app.delete('/pasajeros/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM pasajeros WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Pasajero no encontrado.' });
        }

        res.status(200).json({ message: 'Pasajero eliminado con éxito' });
    } catch (error) {
        console.error('Error al eliminar el pasajero:', error);
        res.status(500).json({ message: 'Error al eliminar el pasajero' });
    }
});

// Ruta para actualizar un pasajero por su ID
app.put('/pasajeros/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, numero_vuelo } = req.body;

    if (!nombre || !numero_vuelo) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    try {
        const result = await pool.query(
            'UPDATE pasajeros SET nombre = $1, numero_vuelo = $2 WHERE id = $3 RETURNING *',
            [nombre, numero_vuelo, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Pasajero no encontrado.' });
        }

        res.status(200).json({ message: 'Pasajero actualizado con éxito', pasajero: result.rows[0] });
    } catch (error) {
        console.error('Error al actualizar el pasajero:', error);
        res.status(500).json({ message: 'Error al actualizar el pasajero' });
    }
});

// Puerto de escucha
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
