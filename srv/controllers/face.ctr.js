/**
 * @module Face Controller
 */

'use strict';

/** Module objects. */
var async = require("async")
  , db = require('../libs/db')
  , config = require('../libs/config')
  , crud = require('../libs/crud.js')
  , root = {};

/**
 * Controller class.
 * @class
 */
var Controller = function(obj) {
    root = obj;
};

/*
 * @property {object} Controller.model  - Data model.
 */
Controller.prototype.model = require('../models/face.mod.js');

/*
 * Object type.
 * @method Controller.objectType
 */
Controller.prototype.objectType = function () {
    return 'face';
}

/*
 * Where condition.
 * @method Controller.whereCond
 * @param req {Object} Request object
 */
Controller.prototype.whereCond = function(req) {
    return "type ='face'";
}

/*
 * Assign data fields into model.
 * @method Controller.assignData
 * @param fields {Array} fields of data model
 * @param indata {Array} web request fields
 */
Controller.prototype.assignData = function(fields, indata) {
    fields.type = indata.type;
};

/*
 * List of fields.
 * @method Controller.list
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.read = function(req, res) {
    crud.read(Controller, req, function(err, retval) {
        if (err) return res.status(err).json({ err: err });
        res.status(202).json(retval);
    });
}

/*
 * Create data record.
 * @method Controller.create
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.create = function(req, res) {
    return crud.create(Controller, req, function(err, retval) {
        if (err) return res.status(err).json({ err: err });
        res.status(202).json(retval);
    });
}

/*
 * Update fields data.
 * @method Controller.update
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.update = function(req, res) {
    return crud.update(Controller, req, function(err, retval) {
        if (err) return res.status(err).json({ err: err });
        res.status(202).json('o.k.');
    });
}

/*
 * Delete fields collection.
 * @method Controller.delete
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.delete = function(req, res) {
    return crud.delete(Controller, req, function(err, retval) {
        if (err) return res.status(err).json({ err: err });
        res.status(202).json(retval);
    });
}


/*
 * List of detected faces of source.
 * @method Controller.person5faces
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.sourcefdet = function (req, res) {
    var retval = {
        pageNumber: Math.max(1, parseInt(req.params.page)),
        pageLimit: parseInt(req.params.limit),
        pageCount: 0,
        items: [],
    };
    
    async.series([
        function (callback) {
            db.query("SELECT COUNT(*) FROM `" + config.bucket + "` WHERE type='face' AND source_id='" + req.body.qparam.qparent + "';", function (err, result) {
                if (err) return callback(400, err);
                retval.pageCount = Math.max(1, Math.ceil(result[0].$1 / retval.pageLimit));
                retval.pageNumber = Math.max(1, Math.min(retval.pageNumber, retval.pageCount));
                callback();
            });
        },
        function (callback) {
            db.query("SELECT META(`" + config.bucket + "`).id, source_id, person_id, thumbnail_url FROM `" + config.bucket + "`" +
                " WHERE type='face' AND source_id='" + req.body.qparam.qparent + "' " +
                " OFFSET " + Math.max(0, (isNaN(parseInt(retval.pageNumber))?0:parseInt(retval.pageNumber) - 1)) * retval.pageLimit +
                " LIMIT " + retval.pageLimit +
                "; ",
                function (err, result) {
                if (err) return callback(400, err);
                retval.items = result;
                callback();
            });
        }
    ], function (err, msg) {
        if (err) return res.status(err).json({ err: err });
        res.status(202).json(retval);
    });

}

/*
 * List of all faces of source.
 * @method Controller.sourcefaces
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.sourcefaces = function (req, res) {
    var retval = {
        pageLimit: 2000,
        items: []
    };
    
    db.query("SELECT META(`" + config.bucket + "`).id, source_id, person_id, thumbnail_url FROM `" + config.bucket + "`" +
        " WHERE type='face' AND person_id='" + req.body.qparam.qparent + "'; ",
        function (err, result) {
        if (err) return res.status(err).json({ err: err });
        retval.items = result;
        res.status(202).json(retval);
    });
}

/*
 * List of top 5 faces of person.
 * @method Controller.person5faces
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.person5faces = function (req, res) {
    var retval = {
        pageLimit: 5,
        items: []
    };
    
    db.query("SELECT DISTINCT META(`" + config.bucket + "`).id,source_id,person_id,person_id_type,thumbnail_url FROM `" + config.bucket + "`" +
        " WHERE type='face' AND person_id='" + req.body.qparam.qparent + "' ORDER BY timecode DESC LIMIT " + retval.pageLimit + "; ",
        function (err, result) {
        if (err) return res.status(err).json({ err: err });
        retval.items = result;
        res.status(202).json(retval);
    });
}

/*
 * Get face by person_id and source_id.
 * @method Controller.sourceface
 * @param req {Object} Request object
 * @param res {Object} Response object
 */
Controller.prototype.sourceface = function (req, res) {   
    db.read(req.params.ids, function (err, result) {
        if (err) return res.status(err).json({ err: err });
        result.value['id'] = req.params.ids;
        res.status(202).json(result.value);
    });   
}


/** Export controller. */
module.exports = exports = function(server) {
    return new Controller(server);
}