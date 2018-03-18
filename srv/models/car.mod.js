var db = require('../libs/db');
var ottoman = require('ottoman');

var Model = ottoman.model('car', {
    type: 'string',
    note: 'string',
    details: {
        owner_first_name: 'string',
        owner_middle_name: 'string',
        owner_last_name: 'string',
        country: 'string',
        plate_number: 'string',
        owner_person_id: 'string'
    },
    source: 'string',
    created: 'string',
    sources: ['string']
}, {
    store: db.couchbaseAdapter,
    index: { /* whatever */}
}); module.exports = Model;