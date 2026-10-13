require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());
app.set('json spaces', 2); 

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rock_zenekarok_70s',
  charset: 'utf8mb4',
});

const KOTELEZO_MEZOK = ['nev'];
const OPCIONALIS_MEZOK = [
  'stilus_id',
  'orszag',
  'varos',
  'aktiv_evek',
  'tagok',
  'legsikeresebb_album',
  'kep_url',
];

app.get('/api/zenekar', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM zenekarok');
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
   
    res.status(500).json({ uzenet: 'Szerverhiba', hiba: err.code });
  }
});

app.post('/api/ujzenekar', async (req, res) => {
  const body = req.body || {};

  const hianyzik = KOTELEZO_MEZOK.some(
    (mezo) =>
      body[mezo] === undefined ||
      body[mezo] === null ||
      String(body[mezo]).trim() === ''
  );
  if (hianyzik) {
    return res.status(400).send('Hiányos adatok');
  }

  const mezok = [...KOTELEZO_MEZOK, ...OPCIONALIS_MEZOK];
  const ertekek = mezok.map((m) => (body[m] === undefined ? null : body[m]));

  try {
    const [result] = await pool.query(
      `INSERT INTO zenekarok (${mezok.join(', ')}) VALUES (${mezok
        .map(() => '?')
        .join(', ')})`,
      ertekek
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).send('Hiányos adatok');
    }
    console.error(err);
    res.status(500).json({ uzenet: 'Szerverhiba' });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Szerver fut: http://localhost:${PORT}`));