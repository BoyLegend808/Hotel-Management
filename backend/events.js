const EventEmitter = require('events');

class AppEmitter extends EventEmitter {}

// Create a single global instance of the emitter
const appEvents = new AppEmitter();

module.exports = appEvents;
