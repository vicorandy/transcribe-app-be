const Transcribe = require('./transcribesModel')
const Note = require('../Notes/notesModel')


const {assemblyaiTranscribeAuido} = require('../assemblyai/assemblyai')


async function  transcibeAudio (req,res){
    try {
        // 
        const {userid :userId} = req.user
        const {date,name,participant} = req.body
        const subscription = req.userSubscription

        //chcecking user subscription
        if(subscription.subscription !== 'active'){
          res.status(400)
          res.json({message:'you subscription is expired please renew'})
          return
        }

        //checking if audio was passed 
        if (!req.file) {
          return res.status(400).json({ message: 'No file uploaded' });
        }
       
        // transcribing audio from assembly ai

        const {transcript,objective,transcriptionSummary,assementAndPlan,clientInstruction} = await assemblyaiTranscribeAuido(req.file.path)

        const transcribe = await Transcribe.create({
          transcript,
          objective,
          transcriptionSummary,
          assementAndPlan,
          clientInstruction
        })

        const note = await Note.create({
          transcribeId : transcribe.id,
          audioFilePath : req.file.path,
          userId,
          date,
          name,
          participant
        })

        res.status(200).json({
          message: 'Transcription was successful',
          transcribe,
          note
        });

      } catch (error) {
        console.error(error.message);

        if(error.message){
          res.status(500).json({ message: error.message });
          return
        }
        res.status(500).json({ message: error.message });      
      }
}


async function  transcibeUploadedAudioandLink (req,res){
  try {
    console.log('running')



      const {userid :userId} = req.user
      const {date,name,participant,link} = req.body
      const subscription = req.userSubscription
      const  fileTypeError = req.fileValidationError
      console.log({fileTypeError})

      if(fileTypeError === 'Invalid file type'){
        res.status(400)
        res.json({'message':'the audio selected is not a supported format'})
        return
      }


      // checking user subscription 
      
      if(subscription.plan !== 'basic' || subscription.plan !== 'pro') {
        res.status(400)
        res.json({message:'please purchare a higher plan to access this feature'})
        return
      }
          
      if(subscription.subscription !== 'active') {
        res.status(400)
        res.json({message :'you do not have an active plan please subscribe to access this feature'})
        return
      }

      //checking if audio was passed 
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      

     
      // transcribing audio from assembly ai

      const {transcript,objective,transcriptionSummary,assementAndPlan,clientInstruction} = await assemblyaiTranscribeAuido(req.file.path)

      const transcribe = await Transcribe.create({
        transcript,
        objective,
        transcriptionSummary,
        assementAndPlan,
        clientInstruction
      })

      const note = await Note.create({
        transcribeId : transcribe.id,
        audioFilePath : req.file.path,
        userId,
        date,
        name,
        participant
      })

      res.status(200).json({
        message: 'Transcription was successful',
        transcribe,
        note
      });

    } catch (error) {
      console.error({error:error.message});

      if(error.message){
        res.status(500).json({ message: error.message });
        return
      }
      res.status(500).json({ message: error.message });      
    }
}


module.exports={transcibeAudio,transcibeUploadedAudioandLink }