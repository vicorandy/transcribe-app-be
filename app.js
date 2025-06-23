require('express-async-errors');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const express = require('express');
const usersRouter = require('./Components/Users/userRoutes');
const stripeRouter = require('./Components/Stripe/stripeRouter')
const transcribeRouter = require('./Components/Transcribes/transcribeRoute')
const notesRouter = require('./Components/Notes/noteRouter')
const notFoundError = require('./MiddelWare/notFound');
const cors = require('cors')
const path = require('path');


const {USERS_URI} = process.env;

const app = express();

// request body paser
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin:'*', // Allow only your frontend
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],       // Specify allowed methods (if needed)
}));


// swagger documentation
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/transcribe',transcribeRouter);
app.use('/api/v1/notes', notesRouter);
app.use('/api/v1/stripe',stripeRouter);

// Serve static files from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use(notFoundError);

module.exports = app;
