import app from '../server.js'
const serverless = require('serverless-http');

import dotenv from 'dotenv'
dotenv.config();

module.exports.handler = serverless(app);