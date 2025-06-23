const express = require('express');
const { transcibeAudio,transcibeUploadedAudioandLink } = require('./transcribeController');
const {authorization,hasSubscription} = require('../../MiddelWare/auth')

const multer = require('multer');

const transcribeRouter = express.Router();

const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/m4a','audio/x-m4a'];
    console.log(file.mimetype)
    if (!allowedTypes.includes(file.mimetype)) {
        req.fileValidationError = 'Invalid file type'
        // return cb(null, false);
        return cb(null, false);
    }
    cb(null, true);
  },
  // limits: { fileSize: 10 * 1024 * 1024 }, // Example limit of 10MB
});


// POST route for transcribing audio
transcribeRouter
  .route('/transcribe-audio')
  .post(upload.single('file'), authorization, hasSubscription, transcibeAudio);
 
 
 transcribeRouter.route('/transcribe-uploaded-audio-link').post(upload.single('file'),authorization,hasSubscription,transcibeUploadedAudioandLink)
 

module.exports = transcribeRouter;

