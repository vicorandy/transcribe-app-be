const Sequelize = require('sequelize')
const {db} = require('../../db/Sequelize')

const Audio = db.define(
    'audio',
    {
        userId : {
            type : Sequelize.UUID,
            allowNull : false,
            reference : {
                model : 'users',
                key : 'id'
            }
        },
        url : {
            type : Sequelize.STRING,
            allowNull : false,
        },
        noteId : {
            type : Sequelize.UUID,
            allowNull : false,
            reference : {
                model : 'notes',
                key : 'id'
            }
        }
    }
)

// db.sync().then(()=>console.log('audio table created '))

module.exports = Audio


