// app.js
const express = require('express');
const bodyParser = require('body-parser');
const usuarioRoutes = require('./routes/usuarioRoutes');
const authRoutes = require('./routes/authRoutes');
const consultarPlRoutes = require('./routes/consultaPl');
const rotulosPlRoutes = require('./routes/rotulosPl');
const consultarManifiestoRoutes = require('./routes/consultarManifiesto');
const https = require('https');
const fs = require('fs');
require('dotenv').config();

const app = express();
const IP = '0.0.0.0'; // Reemplaza con la dirección IP específica de tu servidor
const PORT = process.env.LOCAL_PORT || 3001;

// Middleware para parsear el cuerpo de las solicitudes en formato JSON
app.use(bodyParser.json());

// Rutas para distintas funcionalidades
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/consultarPl', consultarPlRoutes);
app.use('/api/rotulosPl', rotulosPlRoutes);
app.use('/api/consultarManifiesto', consultarManifiestoRoutes);
app.use('/api/auth', authRoutes);

// ! usar este para el servidor remoto
// Lee los archivos del certificado y la clave privada
const privateKey = fs.readFileSync('/etc/letsencrypt/live/e-control-pl.com/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/e-control-pl.com/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/e-control-pl.com/chain.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate, ca: ca };
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(PORT, IP, () => {
  console.log(`Servidor en ejecución en https://${IP}:${PORT}`);
});

// ? Usar este para el servidor local
// app.listen(app.get("port"), () => {
//   console.log(`Servidor http escuchando en http://localhost:${PORT}`)
// })

