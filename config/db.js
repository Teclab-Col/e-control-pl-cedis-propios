// config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testConnection() {
  let connection;
  try {
    // Get a connection from the pool
    connection = await pool.getConnection();
    console.log('Connected to the database');

    // Perform any additional queries or operations here

  } catch (error) {
    console.error('Error connecting to the database:', error.message);

  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
    }
  }
}

// Call the testConnection function to check the connection
testConnection();

module.exports = pool;