const Notes = require('./notesModel')
const Transcribes = require('../Transcribes/transcribesModel')
const path = require('path')

async function getUserNotes (req,res) {

    const {userid:userId} = req.user
    
     const notes = await Notes.findAll({
        where:{userId},
        include: {
            model: Transcribes,
            as: 'transcribe',
        },   
    }
   )

    res.status(200)
    res.json({message:'request successful',notes})
}

async function editNote(req,res) {
    try {
    console.log('running')
    const {id} = req.params 
    const {userid:userId} = req.user
    
    const{name,participant,objective,transcriptionSummary,transcript,clientInstruction,assementAndPlan, } = req.body


    if(!id){
        res.status(400)
        res.json({message:'Bad Request'})
        return
    }

    const note = await Notes.findOne({where:{id}})
        if(!note){
        res.status(404)
        res.json({message:'Sorry we could not find your note'})
        return
    }

    const transcibe = await Transcribes.findOne({where:{id:note.transcribeId}})

    if(note.userId !== userId){
        res.status(409)
        res.json({message:'Sorry you can note update this note'})
        return
    }
    
    // updating notes
    if(name) note.name = name
    if(participant) note.participant = participant
    await note.save()

    // updating transcribe
    if(objective) transcibe.objective = objective
    if(transcript) transcibe.transcript = transcript
    if(transcriptionSummary) transcibe.transcriptionSummary = transcriptionSummary
    if(clientInstruction) transcibe.clientInstruction = clientInstruction
    if(assementAndPlan) transcibe.assementAndPlan = assementAndPlan

    await transcibe.save()

    res.status(200)
    res.json({message:'note was updated successfully',note})
} catch (error) {
       console.log(error)   
}


}

async function getAudioNotes(req,res) {

    const {userid:userId} = req.user
    const notes = await Notes.findAll({where:{userId}})
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const audios = notes.map(note => {
        // Create audio object with the complete URL to the audio file
        const audio = {
            ...note.toJSON(), // Ensure the note object is serialized correctly
            audioUrl: `${baseUrl}/${note.audioFilePath}`, // Construct the full audio URL
        };
        return audio;
    });

    console.log(audios)
    
    res.status(200)
    res.json({message:'request successful',notes,audios})

}


module.exports ={getUserNotes,editNote,getAudioNotes}