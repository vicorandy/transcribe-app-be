const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../../db/Sequelize');


require('dotenv');

const User = db.define(
  'users',
  {
    id: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    transcriptionUse : {
      type: Sequelize.STRING,
      allowNull: true
    }
  },
  {
    timestamps: true,  // This enables `createdAt` and `updatedAt` automatically
   
  }

);

db.sync({alter:true}).then(()=>{console.log('User table created successfully')})


// Generating verification code
User.prototype.createVerificationCode = () => {
  const verificationCode =
    Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
  return verificationCode;
};


User.prototype.hasFreeTrial = function () {
  const now = new Date();
  const createdAt = this.createdAt;
  const differenceInMilliseconds = now - createdAt;
  const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
  return differenceInDays < 7;

}

module.exports = User;
