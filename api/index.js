// Polyfill for undici to prevent "File is not defined" error
if (typeof global.File === 'undefined') {
  global.File = class File extends Blob {
    constructor(bits, filename, options = {}) {
      super(bits, options);
      this.name = filename;
      this.lastModified = options.lastModified || Date.now();
    }
  };
}

const app = require('../backend/server');

// Vercel serverless function handler
module.exports = app;
