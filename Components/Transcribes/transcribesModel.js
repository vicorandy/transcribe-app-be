const Sequelize = require('sequelize')
const {db} = require('../../db/Sequelize')

const Transcribes = db.define(
    'transcribes',
      {
        id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
          },

        assemblyAiId : {
            type : Sequelize.STRING,
            allowNull : true
        },
       transcript : {
            type : Sequelize.TEXT,
            allowNull : false
        },
        objective : {
            type : Sequelize.TEXT,
            allowNull : false
        },
        transcriptionSummary : {
            type : Sequelize.TEXT,
            allowNull : false
        },
        assementAndPlan : {
            type : Sequelize.TEXT,
            allowNull : false
        },
        clientInstruction : {
            type : Sequelize.TEXT,
            allowNull : false
        }

      },
)


// db.sync().then(()=>console.log('transcribe table creatd'))

module.exports = Transcribes