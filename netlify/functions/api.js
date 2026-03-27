const serverless = require('serverless-http');
const app = require('../../backend/server');

// Strip the Netlify function path prefix so Express routes match normally.
// Netlify invokes the function at /.netlify/functions/api, and rewrites mean
// requests arrive with paths like /api/home, /api/search, etc., which already
// match the Express router — no prefix stripping required.
module.exports.handler = serverless(app);
