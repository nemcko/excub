var db = require('../libs/db');
var ottoman = require('ottoman');

var Model = ottoman.model('Test', {
    type: 'string',
    name: 'string',
    iata: 'string',
    icao: 'string',
    callsign: 'string',
    country: 'string'
}, {
    store: db.couchbaseAdapter,
    index: { /* whatever */}
}); module.exports = Model;