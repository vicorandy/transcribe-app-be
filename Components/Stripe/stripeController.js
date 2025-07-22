const Stripe = require('./stripeModel');
const stripe = require('stripe')(process.env.STRIPE_SECRETE_KEY)
const {basic,pro,baseurl,frontendurl} =process.env

async function createUserSubscription(req,res){
    try {   
        const {plan} = req.body
        const {userid:userId} = req.user

        const userStripeDetails = await Stripe.findOne({where:{userId}})
    
        
        if(userStripeDetails){
            const subscription = await stripe.subscriptions.retrieve(userStripeDetails.subscriptionId)
            console.log({planIs:subscription.status})
            if(subscription.status === 'active') {
                res.status(409)
                res.json({message:'you already have an active subscription'})
                return
            }
        }


     
        let priceId ;
        if(plan == 'pro') priceId = 'price_1QoMk4ABaK3vmfwIHL7R1nhV'
        if(plan === 'basic') priceId = 'price_1QkODVABaK3vmfwIxSktPm2P'
        const session = await stripe.checkout.sessions.create({
             mode:'subscription',
             line_items:[{
                price : priceId,
                quantity : 1
             }],
             success_url : `${baseurl}/api/v1/stripe/success/?session_id={CHECKOUT_SESSION_ID}&userId=${userId}&planType=${plan}`,
             cancel_url : `${frontendurl}/cancel`
            })
            res.status(200)
            res.json({ url: session.url })

    } catch (error) {
        console.log(error)
    }
}


async function onSubscriptionSuccess(req,res){
    const{session_id,planType,userId} = req.query
   const session = await stripe.checkout.sessions.retrieve(session_id)
   const customer = await stripe.customers.retrieve(session.customer);
   const subscription = await stripe.subscriptions.retrieve(session.subscription)
   
   console.log('THIS IS THE DATA YOU NEED ')
   console.log({customer,subscription})

   const userStripeDetails = await Stripe.create({
      userId,
      planType,
      customerId : session.customer,
      subscriptionId :session.subscription,
   })
//    console.log(userStripeDetails)
   res.redirect('http://localhost:3000/dashboard')
//    console.log(session)
}

async function upgradeSubscription(req,res){
    const {userid:userId} = req.user
    const {plan} = req.body
    const userStripeDetails = await Stripe.findOne({where:{userId}})
    const subscription = await stripe.subscriptions.retrieve(userStripeDetails.subscriptionId)
    const customer  = await stripe.customers.retrieve(userStripeDetails.customerId)

    const proPriceId = pro
    const basicPriceId = basic

    if(plan !== 'pro') {
        res.status(400)
        res.json({message:'Bad Request'})
        return
    }

    console.log(basic,subscription.items.data[0].price.id)
    if (subscription.items.data[0].price.id === (plan==='basic' ? basicPriceId:proPriceId)) {
        res.status(409).json({ message: `User is already on the ${plan} plan` });
        return;
    }
    
    const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
        items: [{
            id: subscription.items.data[0].id, // ID of the current subscription item
            price: proPriceId, // New price ID for the 'pro' plan
        }],
        proration_behavior: 'create_prorations', // Prorate the charges
    });

    const invoice = await stripe.invoices.retrieveUpcoming({
        customer: subscription.customer,
        subscription: subscription.id,
    });

    
    userStripeDetails.planType = 'pro'
    userStripeDetails.subscriptionId=updatedSubscription.id

    await userStripeDetails.save()

    res.status(200)
    res.json({message:'success'})
}


async function downgradeSubscription(req, res) {
    try {
        const { userid: userId } = req.user;
        const { plan } = req.body;

        const proPriceId = pro; // Use environment variable or ensure these are correctly defined
        const basicPriceId = basic;

        const userStripeDetails = await Stripe.findOne({ where: { userId } });
        if (!userStripeDetails) {
            return res.status(404).json({ message: "User subscription not found" });
        }

        const subscription = await stripe.subscriptions.retrieve(userStripeDetails.subscriptionId);

        if (plan !== "basic") {
            return res.status(400).json({ message: "Invalid downgrade plan" });
        }

        // Ensure user is not already on the basic plan
        if (subscription.items.data[0].price.id === basicPriceId) {
            return res.status(409).json({ message: "User is already on the basic plan" });
        }

        console.log(subscription.current_period_end)
        

            const oldschedules = await stripe.subscriptionSchedules.list({
            customer: subscription.customer,  // Customer ID
            });


            if(oldschedules){
                res.status(200)
                res.json({message:'you have already scheduled this downgrade'})
            }
                // Schedule downgrade to the Basic plan at the next billing cycle
        const schedule = await stripe.subscriptionSchedules.create({
            customer: subscription.current_period_end,
            start_date: 1787130418,
            end_behavior: 'release',
            phases: [
              {
                items: [
                  {
                    price: pro,
                    quantity: 1,
                  },
                ],
              },
            ],
          });
            
        // Optionally update DB to track scheduled downgrade
        userStripeDetails.scheduledDowngrade = true; // Track that downgrade is scheduled
        await userStripeDetails.save();


        return res.status(200).json({
            message: "Plan downgrade scheduled for the next billing cycle",
            nextBillingDate: new Date(subscription.current_period_end * 1000).toISOString(),
        });
    } catch (error) {
        console.error("Error downgrading subscription:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}








module.exports={createUserSubscription,onSubscriptionSuccess,upgradeSubscription,downgradeSubscription}