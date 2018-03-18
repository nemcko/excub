var db = require('../libs/db');
var ottoman = require('ottoman');

var Model = ottoman.model('plate', {
    type: 'string',
    source_id: 'string',
    timecode: 'string',
    car_id: 'string',
    thumbnail_url: 'string',
    plate_detection: {
        box_original: ['number'],
        box_display: ['number']
    },
    plate_recognition: {
        plate_text: 'string',
        probability: 'number',
        completed: 'string'
    },
    status: 'string',
    rules: {
        completed: ['string']
    },
    created: 'string'
}, {
    store: db.couchbaseAdapter,
    index: { /* whatever */}
}); module.exports = Model;