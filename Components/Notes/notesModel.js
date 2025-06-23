const Sequelize = require('sequelize')
const {db} = require('../../db/Sequelize')
const { addListener } = require('../../app')
const { types } = require('pg')
const Transcribes = require('../Transcribes/transcribesModel')





const Notes = db.define(
    'notes',
    {

     id: {
              type: Sequelize.UUID,
              defaultValue: Sequelize.UUIDV4,
              primaryKey: true,
        },

        transcribeId : {
            type : Sequelize.UUID,
            refrence : {
                model : 'transcribes',
                key : 'id'
            }
        },
         
        name : {
            type : Sequelize.STRING,
            allowNull: true
        },

        notePreferences : {
            type : Sequelize.JSON,
            allowNull : true
        },

        audioFilePath : {
            type : Sequelize.STRING,
            allowNull : true
        },
        
        userId : {
            type : Sequelize.UUID,
            allowNull : false,
            refrence : {
                model : 'users',
                key : 'id'
            }
        } ,

        participant  : {
            type : Sequelize.TEXT,
            allowNull :true,
        },

        date : {
            type :Sequelize.STRING
        },

        
    }
)

// ✅ Define the association
Notes.belongsTo(Transcribes, {
    foreignKey: 'transcribeId',
    as: 'transcribe', // This sets the alias
});

db.sync().then(()=>{console.log('notes table created')})

module.exports = Notes



