const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { db } = require('../../db/Sequelize');
const { all } = require('./userRoutes');

require('dotenv');

const User = db.define(
  'users',
  {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
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
    dob : {
      type : Sequelize.STRING,
      allowNull: false,
    },

    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    transcriptionUse : {
      type: Sequelize.STRING,
      allowNull: false
    }
  },
  {
    timestamps: true,  // This enables `createdAt` and `updatedAt` automatically
   
  }

);

// db.sync().then(()=>{console.log('User table created successfully')})



// Hook for hashing passwords
User.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(user.password, salt);
  user.password = hash;
});

// Hook for comparing password
User.prototype.comparePassword = async (password, hash) => {
  const isCorrect = await bcrypt.compare(password, hash);
  return isCorrect;
};

// Creating json web token
User.prototype.createJWT = (user) => {
  const token = jwt.sign(user, process.env.JWT_SECRETE, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  return token;
};

// verifying json web token
User.prototype.verifyJWT = (token) => {
  const payLoad = jwt.verify(token, process.env.JWT_SECRETE);
  return payLoad;
};

// Generating verification code
User.prototype.createVerificationCode = () => {
  const verificationCode =
    Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
  return verificationCode;
};

// creating password hash
User.prototype.hashPassword = async (password) => {
  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

User.prototype.hasFreeTrial = function () {
  const now = new Date();
  const createdAt = this.createdAt;
  const differenceInMilliseconds = now - createdAt;
  const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
  return differenceInDays < 7;

}

module.exports = User;
