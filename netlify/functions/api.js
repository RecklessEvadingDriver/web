// Polyfill for undici/serverless-http to prevent "File is not defined" error
if (typeof global.File === 'undefined') {
  // Create Blob polyfill if needed
  if (typeof global.Blob === 'undefined') {
    const { Readable } = require('stream');
    global.Blob = class Blob {
      constructor(bits = [], options = {}) {
        this.parts = bits;
        this.type = options.type || '';
        this.size = bits.reduce((acc, part) => {
          return acc + (typeof part === 'string' ? part.length : part.length || 0);
        }, 0);
      }
      async text() {
        return this.parts.map(p => typeof p === 'string' ? p : p.toString()).join('');
      }
      async arrayBuffer() {
        const text = await this.text();
        return Buffer.from(text);
      }
      slice(start, end, contentType) {
        const text = this.parts.map(p => typeof p === 'string' ? p : p.toString()).join('');
        return new global.Blob([text.slice(start, end)], { type: contentType || this.type });
      }
      stream() {
        const text = this.parts.map(p => typeof p === 'string' ? p : p.toString()).join('');
        return Readable.from([text]);
      }
    };
  }

  global.File = class File extends global.Blob {
    constructor(bits, filename, options = {}) {
      super(bits, options);
      this.name = filename;
      this.lastModified = options.lastModified || Date.now();
    }
  };
}

const serverless = require('serverless-http');
const app = require('../../backend/server');

// Netlify serverless function handler
module.exports.handler = serverless(app);
