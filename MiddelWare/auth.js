const Stripe = require('../Components/Stripe/stripeModel')
const stripe = require('stripe')(process.env.STRIPE_SECRETE_KEY)
const Users = require('../Components/Users/userModel')


const { jwtVerify, createRemoteJWKSet } =require('jose');

const JWKS = createRemoteJWKSet(new URL('https://auth.deskmayte.com/auth/public-key'));
 
// AUTHORIZING USERS
async function authorization(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer')) {
      res.status(401);
      res.json({ message: 'invalid user token' });
      // throw new Error('invalid user id');
      return
    }
    const token = authHeader.split(' ')[1];
    //  verifying user token
      const { payload } = await jwtVerify(token, JWKS, {
      issuer: 'https://auth.deskmayete.com/',
    });

   
    req.user = payload
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      res.status(401);
      res.json({ message: 'invalid user token' });
    } else {
      res.status(500);
      res.json({ message: 'Something went wrong' });
    }
  }
}

async function hasSubscription(req, res, next) {
  try {
    const { basic, pro } = process.env;
    const { userid: userId } = req.user;

    if (!userId) {
      return res.status(400).json({ message: "You are not authorized to access this resource" });
    }

    const userStripeDetails = await Stripe.findOne({ where: { userId } });
    const user = await Users.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "No user was found associated with that token" });
    }

    if (userStripeDetails) {
      const subscription = await stripe.subscriptions.retrieve(userStripeDetails.subscriptionId);
      

      if (!subscription || !subscription.items.data.length) {
        return res.status(400).json({ message: "Invalid subscription data" });
      }

      // ✅ Current active plan
      const currentPlanId = subscription.items.data[0].price.id;
      let plan = currentPlanId === basic ? "basic" : currentPlanId === pro ? "pro" : "unknown";

      // ✅ Check for pending downgrade
      console.log({subscription})
      if (subscription.pending_update && subscription.pending_update.items) {
        const pendingPlanId = subscription.pending_update.items.data[0].price.id;
        if (pendingPlanId === basic) {
          plan = "pro (Downgrading to basic at next billing cycle)";
        }
      }

      if (subscription.status === "active") {
        req.userSubscription = { plan, subscription: "active" };
        return next();
      } else {
        req.userSubscription = { plan, subscription: "inactive" };
        return next();
      }
    }

    // ✅ Handle trial period
    const stillOnTrialPeriod = user.hasFreeTrial();
    if (stillOnTrialPeriod) {
      req.userSubscription = { plan: "free", subscription: "active" };
      return next();
    }

    // ✅ No subscription found
    req.userSubscription = { plan: "no plan", subscription: "inactive" };
    return next();
  } catch (error) {
    console.error("Subscription Middleware Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}


module.exports = {authorization,hasSubscription};
