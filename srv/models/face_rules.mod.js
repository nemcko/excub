var db = require('../libs/db');
var ottoman = require('ottoman');

var Model = ottoman.model('face_rules', {
    type: 'string',
    face_id_1: 'string',
    face_id_2: 'string',
    weight: 'number',
    source: 'string',
    graph_group: 'string',
    created: 'string'
}, {
    store: db.couchbaseAdapter,
    index: { /* whatever */}
}); module.exports = Model;