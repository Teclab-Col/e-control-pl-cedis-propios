// app.js
const express = require('express');
const bodyParser = require('body-parser');
const usuarioRoutes = require('./routes/usuarioRoutes');
const consultarPlRoutes = require('./routes/consultaPl');
const authRoutes = require('./routes/authRoutes');
const https = require('https');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/consultarPl', consultarPlRoutes);
app.use('/api/auth', authRoutes);

// Lee los archivos del certificado y la clave privada
const privateKey = fs.readFileSync('server.key', 'utf8');
const certificate = fs.readFileSync('server.cert', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Crea un servidor HTTPS
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, () => {
  console.log(`Servidor en ejecución en https://localhost:${port}`);
});