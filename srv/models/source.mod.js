var db = require('../libs/db');
var ottoman = require('ottoman');

var Model = ottoman.model('source', {
    type: 'string',
    name: 'string',
    note: 'string',
    source: {
        source_link: 'string',
        frame_rate: 'string',
        total_frames: 'number',
        source_type: 'string',
        training: 'boolean'
    },
    processing: {
        rancher_configuration: 'string',
        graph_group: 'string',
        filter_mask: 'string',
        skip_frames: 'number'
    },
    output: {
        output_file: 'string',
        output_rtmp: 'string'
    },
    training: {
        key_words: ['string']
    },
    parent: 'string',
    status: 'string',
    created: 'string',
    thumbnail_url: 'string'
}, {
    store: db.couchbaseAdapter,
    index: { /* whatever */}
}); module.exports = Model;