const express = require('express');
const  {authorization,hasSubscription} = require('../../MiddelWare/auth')
const {
  signUp,
  signIn,
  getUserInfo

} = require('./userController');

const userRouter = express.Router();

userRouter.route('/signup').post(signUp);
userRouter.route('/signin').post(signIn);
userRouter.route('/get-user-info').get(authorization,hasSubscription,getUserInfo)


module.exports = userRouter;
