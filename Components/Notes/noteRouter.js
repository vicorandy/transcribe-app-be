const express = require('express')
const {getUserNotes,editNote,getAudioNotes} = require('./noteController')
const {authorization}  = require('../../MiddelWare/auth')


const notesRouter = express.Router()

notesRouter.route('/get-notes').get(authorization,getUserNotes)
notesRouter.route('/edit-note/:id').post(authorization,editNote)
notesRouter.route('/get-audio').get(authorization,getAudioNotes)



module.exports = notesRouter