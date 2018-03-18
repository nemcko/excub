var db = require('../libs/db');
var ottoman = require('ottoman');

var Model = ottoman.model('alerts', {
    type: 'string',
    person_id: 'string',
    color: 'string',
    created: 'string'
}, {
    store: db.couchbaseAdapter,
    index: { /* whatever */}
}); module.exports = Model;