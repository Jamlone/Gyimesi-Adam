require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = 8080;

app.use(express.json());


const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


app.get('/', (req, res) => {
    res.json({
        uzenet: 'Kezdő Iskolai REST API fut',
        elerheto_vegpontok: [
            'GET /api/osztalyok',
            'GET /api/osztalyok/:id',
            'GET /api/diakok',
            'GET /api/diakok/:id',
            'POST /api/osztalyok',
            'POST /api/diakok'
        ]
    });
});

app.get('/api/osztalyok', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM osztalyok'
        );

        res.json(rows);

    } catch (error) {

        console.log('TELJES HIBA:');
        console.log(error);

        res.status(500).json({
            hiba: String(error)
        });
    }
});



app.get('/api/osztalyok/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM osztalyok WHERE id = ?',
            [req.params.id]
        );

        res.json(rows);
    } catch (error) {
        res.status(500).json({ hiba: error.message });
    }
});


app.post('/api/osztalyok', async (req, res) => {
    try {
        const { nev, szak, evfolyam } = req.body;

        const [result] = await pool.query(
            'INSERT INTO osztalyok (nev, szak, evfolyam) VALUES (?, ?, ?)',
            [nev, szak, evfolyam]
        );

        res.status(201).json({
            id: result.insertId,
            nev,
            szak,
            evfolyam
        });
    } catch (error) {
        res.status(500).json({ hiba: error.message });
    }
});


app.get('/api/diakok', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                diakok.id,
                diakok.nev,
                diakok.email,
                osztalyok.nev AS osztaly_nev,
                osztalyok.szak,
                osztalyok.evfolyam
            FROM diakok
            INNER JOIN osztalyok
            ON diakok.osztaly_id = osztalyok.id
        `);

        res.json(rows);
    } catch (error) {
        res.status(500).json({ hiba: error.message });
    }
});


app.get('/api/diakok/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                diakok.id,
                diakok.nev,
                diakok.email,
                osztalyok.nev AS osztaly_nev,
                osztalyok.szak,
                osztalyok.evfolyam
            FROM diakok
            INNER JOIN osztalyok
            ON diakok.osztaly_id = osztalyok.id
            WHERE diakok.id = ?
        `, [req.params.id]);

        res.json(rows);
    } catch (error) {
        res.status(500).json({ hiba: error.message });
    }
});


app.post('/api/diakok', async (req, res) => {
    try {
        const { nev, email, osztaly_id } = req.body;

        const [result] = await pool.query(
            'INSERT INTO diakok (nev, email, osztaly_id) VALUES (?, ?, ?)',
            [nev, email, osztaly_id]
        );

        res.status(201).json({
            id: result.insertId,
            nev,
            email,
            osztaly_id
        });
    } catch (error) {
        res.status(500).json({ hiba: error.message });
    }
});




app.listen(port, () => {
    console.log(`Szerver fut: http://localhost:${port}`);
});