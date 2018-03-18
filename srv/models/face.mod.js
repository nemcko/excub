var db = require('../libs/db');
var ottoman = require('ottoman');

var Model = ottoman.model('face', {
    type: 'string',
    source_id: 'string',
    timecode: 'string',
    person_id: 'string',
    person_id_type: 'string',
    thumbnail_url: 'string',
    status: 'string',
    face_detection: {
        box_original: ['number'],
        box_display: ['number'],
        completed: 'string'
    },
    face_recognition: {
        face_fingerprint: ['number'],
        completed: 'string'
    },
    graph_analysis: {
        graph_group: 'string',
        completed: 'string'
    },
    training: {
        gender: 'string',
        age: 'string',
        race: 'string',
        mood: 'string'
    },
    rules: {
        completed: 'string',
    },
    created: 'string'
}, {
    store: db.couchbaseAdapter,
    index: { /* whatever */}
}); module.exports = Model;