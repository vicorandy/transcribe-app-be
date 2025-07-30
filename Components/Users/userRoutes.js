const express = require('express');
const  {authorization,hasSubscription} = require('../../MiddelWare/auth')
const {
  getUserInfo,
  ssoCreateUser,

} = require('./userController');

const userRouter = express.Router();

userRouter.route('/sso-create-transcribe-user').post(ssoCreateUser);
userRouter.route('/get-user-info').get(authorization,hasSubscription,getUserInfo)


module.exports = userRouter;
