var db = require('../libs/db');
var ottoman = require('ottoman');

var Model = ottoman.model('person', {
    type: 'string',
    note: 'string',
    details: {
        first_name: 'string',
        middle_name: 'string',
        last_name: 'string',
        gender: 'string',
        birth_date: 'string',
        country: 'string',
        identification_type: 'string',
        identification_number: 'string'
    },
    source: 'string',
    created: 'string',
    source_ids: ['string']
}, {
    store: db.couchbaseAdapter,
    index: { /* whatever */}
}); module.exports = Model;