const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de la primera base de datos
const pool1 = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Configuración de la segunda base de datos (ORIGIN)
const pool2 = mysql.createPool({
  host: process.env.DB_HOST_ORIGIN,
  user: process.env.DB_USER_ORIGIN,
  password: process.env.DB_PASSWORD_ORIGIN,
  database: process.env.DB_DATABASE_ORIGIN,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testConnection() {
  let connection1, connection2;
  try {
    // Get a connection from the pool for the first database
    connection1 = await pool1.getConnection();
    console.log('Connected to the first database');

    // Perform any additional queries or operations on the first database here

    // Get a connection from the pool for the second database
    connection2 = await pool2.getConnection();
    console.log('Connected to the second database');

    // Perform any additional queries or operations on the second database here

  } catch (error) {
    console.error('Error connecting to the database:', error.message);

  } finally {
    // Release the connections back to their respective pools
    if (connection1) {
      connection1.release();
    }
    if (connection2) {
      connection2.release();
    }
  }
}

// Call the testConnection function to check the connections
testConnection();

module.exports = { pool1, pool2 };
