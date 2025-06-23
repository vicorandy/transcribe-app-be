const http = require('http');
const app = require('./app');
const { dbConnectionTest } = require('./db/Sequelize');
const WebSocket = require('ws');
const AssemblyAIWebSocket = require('ws');
const { AssemblyAI } = require('assemblyai');

const apiKey = process.env.ASSEMBLY_AI_API_KEY;
const PORT = process.env.PORT || 4000;


app.set('port', PORT);
const server = http.createServer(app);



const SAMPLE_RATE = 16_000;
const wss = new WebSocket.Server({ server });

// AssemblyAI client setup
const client = new AssemblyAI({
  apiKey,
});

wss.on('connection', async (ws) => {
  console.log('New client connected');

  // Initialize the AssemblyAI transcriber
  const transcriber = client.realtime.transcriber({
    sampleRate: SAMPLE_RATE,
  });

  let isTranscriberReady = false;

  transcriber.on('open', ({ sessionId }) => {
    console.log(`Session opened with ID: ${sessionId}`);
    isTranscriberReady = true; // Set the transcriber to ready
  });

  transcriber.on('transcript', (transcript) => {
    if (ws.readyState === WebSocket.OPEN) {
      console.log(JSON.stringify(transcript));
      console.log(JSON.stringify(transcript));
      ws.send(JSON.stringify(transcript));
    }
  });

  transcriber.on('error', (error) => {
    console.error('AssemblyAI Error:', error);
  });

  transcriber.on('close', () => {
    console.log('AssemblyAI connection closed');
    isTranscriberReady = false;
  });

  await transcriber.connect();

  ws.on('message', (message) => {
    if (isTranscriberReady) {

      console.log(message);
      // const streamM = transcriber.stream(message);
      // transcriber.sendAudio(message);

      // transcriber.send(message);  // Only send audio once ready
    } else {
      console.log('Transcriber is not ready yet.');
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    if (transcriber) {
      transcriber.close();
    }
  });
});

async function start() {
  try {
    await dbConnectionTest();
    server.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}...`);
    });
  } catch (error) {
    console.error('Error starting server:', error.message);
  }
}

start();
