const Sequelize = require('sequelize')
const {db} = require('../../db/Sequelize')


const Stripe = db.define(
    'stripe',
    {
         id: {
              type: Sequelize.UUID,
              defaultValue: Sequelize.UUIDV4,
              primaryKey: true,
         },
        customerId : {
            type : Sequelize.STRING,
            allowNull: false
        },
        subscriptionId : {
            type : Sequelize.STRING,
            allowNull: false
        },    
        planType :{
            type : Sequelize.STRING,
            allowNull: false
        },
        userId : {
            type : Sequelize.UUID,
            allowNull : false,
            refrence : {
                model : 'users',
                key : 'id'
            }
        } ,
    }
)

// db.sync().then(()=>{console.log('stripe table created')})

module.exports = Stripe



