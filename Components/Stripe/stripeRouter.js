const express = require('express')
const {createUserSubscription,onSubscriptionSuccess,upgradeSubscription,downgradeSubscription} = require('./stripeController')
const {authorization, hasSubscription} = require('../../MiddelWare/auth')

const stripeRouter = express.Router()
stripeRouter.route('/subscribe').post(authorization,createUserSubscription)
stripeRouter.route('/success').get(onSubscriptionSuccess)
stripeRouter.route('/upgrade').post(authorization,hasSubscription,upgradeSubscription)
stripeRouter.route('/downgrade').post(authorization,hasSubscription,downgradeSubscription)



module.exports = stripeRouter


