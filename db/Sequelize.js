const Sequelize = require('sequelize');
require('dotenv').config();

let db;

if (process.env.DATABASE_URL) {
  // Use DATABASE_URL (e.g., for production like Render or Heroku)
  db = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // allow self-signed certificates
      },
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else {
  // Use local development config
  db = new Sequelize(
    process.env.database ,
    process.env.user ,
    process.env.password ,
    {
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}

// Testing DB connection
function dbConnectionTest() {
  db.authenticate()
    .then(() => console.log('Database connected...'))
    .catch(err => console.error('Unable to connect:', err));
}

module.exports = { db, dbConnectionTest };
