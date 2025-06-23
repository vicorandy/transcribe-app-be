const { AssemblyAI }  = require('assemblyai')

const client = new AssemblyAI({
    // apiKey: '24e70daff1a647f6ae54e68fc15e4dac' 
    apiKey: '4df65d8ece2f405a8d149806dee475e2' 
  })
  


async function promptQuery (prompt,transcript,client) {

      const { response } = await client.lemur.task({
      transcript_ids: [transcript.id],
      prompt,
      final_model: 'anthropic/claude-3-5-sonnet'
    })

    return response
}


  
 const assemblyaiTranscribeAuido = async (audioFile) => {

  console.log('running')

    const params = {
        audio: audioFile,
        speaker_labels: true,
        iab_categories: true,
      }
  
    const transcript = await client.transcripts.transcribe(params)

    console.log({transcript})
    
    const transcriptionSummary = await promptQuery('Provide a brief summary of the transcript.',transcript,client)
    const objective =  await promptQuery('Provide an objective of the transcript.',transcript,client)
    const assementAndPlan =  await promptQuery('Provide an assement and plan of the transcript.',transcript,client)
    const clientInstruction =  await promptQuery('Provide client instruction of the transcript.',transcript,client)
  
    if (transcript.status === 'error') {
      console.error(`Transcription failed: ${transcript.error}`)
      process.exit(1)
    }
     
    // return {transcript,summary}
    return {transcript: transcript.text ,objective,transcriptionSummary,assementAndPlan,clientInstruction}
  }



  module.exports = {assemblyaiTranscribeAuido}

