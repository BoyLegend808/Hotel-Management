// Vercel Serverless Function entry point
// This file re-exports the Express app for Vercel's serverless runtime
const app = require('../server');

module.exports = app;
