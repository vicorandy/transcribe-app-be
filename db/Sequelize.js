const Sequelize = require('sequelize');
require('dotenv').config();

const db = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true, // for Render PostgreSQL
      rejectUnauthorized: false,
    },
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// testing db connection
function dbConnectionTest() {
  db.authenticate().then(() => console.log('database connected...'))
    .catch(err => console.error('Unable to connect:', err));
}

module.exports = { db, dbConnectionTest };