// app.js
const express = require('express');
const bodyParser = require('body-parser');
const usuarioRoutes = require('./routes/usuarioRoutes');
const authRoutes = require('./routes/authRoutes');
const consultarPlRoutes = require('./routes/consultaPl');
const rotulosPlRoutes = require('./routes/rotulosPl');
const https = require('https');
const fs = require('fs');

const app = express();
const IP = '0.0.0.0'; // Reemplaza con la dirección IP específica de tu servidor
const PORT = 3000;

// Middleware para parsear el cuerpo de las solicitudes en formato JSON
app.use(bodyParser.json());

// Rutas para distintas funcionalidades
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/consultarPl', consultarPlRoutes);
app.use('/api/rotulosPl', rotulosPlRoutes);
app.use('/api/auth', authRoutes);

// Lee los archivos del certificado y la clave privada
const privateKey = fs.readFileSync('server.key', 'utf8');
const certificate = fs.readFileSync('server.cert', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Crea un servidor HTTPS
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(PORT, IP, () => {
  console.log(`Servidor en ejecución en https://${IP}:${PORT}`);
});
