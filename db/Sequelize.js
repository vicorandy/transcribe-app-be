const Sequelize = require('sequelize');
require('dotenv').config();

const { password, user, database ,host} = process.env;

const db = new Sequelize(database, user, password, {
  host,
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: false, // Disable logging
});

// testing db connection
function dbConnectionTest() {
  db.authenticate().then(() => console.log('database connected...'));
}

module.exports = { db, dbConnectionTest };
