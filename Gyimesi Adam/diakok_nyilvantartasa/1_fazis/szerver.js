const express = require('express');
const fs = require ('fs/promises')
const app = express();
const port = 8080;

app.use(express.json());

const fajlNev = './adatok.json';

app.get('/osztalyok', async (req, res) => {
    const adat = await 
    fs.readFile(fajlNev, 'utf8');
    const json = JSON.parse(adat);

    res.json(json.osztalyok);
});

app.post('/osztalyok', async (req, res) => {
    const adat = await fs.readFile (fajlNev, 'utf8');
    const json = JSON.parse(adat);
    const ujOsztaly = {
        id: json.osztalyok.length + 1,
        nev: req.body.nev, 
        szak: req.body.szak,
        evfolyam: req.body.evfolyam
    };
    json.osztalyok.push(ujOsztaly);

    await fs.readFile(fajlNev, JSON.stringify(json, null, 2));
    res.status(201).json(ujOsztaly);
});

app.get('/', (req, res) => {
  res.send('Hello World from Express!');
});

app.post('/osztalyok', (req, res) => {
  console.log(req.body);

  res.status(201).json({
    uzenet: 'Adat fogadva',

    adat: req.body
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
